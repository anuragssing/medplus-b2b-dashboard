import { useState, useRef, useMemo } from 'react'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import { useToast } from '../context/ToastContext'
import { FaEdit } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { getPartnerLabel, getPartnerTypeLabel } from '../utils/partnerUtils.js'
import '../App.css'

const PARTNER_TYPES_WITH_TESTS = ['diagnostic', 'collection_center', 'processing_center']

const ITEM_TYPES = [
  { value: 'test', label: 'Test' },
  { value: 'profile', label: 'Profile' }
]

const GENDER_OPTIONS = [
  { value: 'both', label: 'Both' },
  { value: 'male', label: 'Male Only' },
  { value: 'female', label: 'Female Only' }
]

const TEMPLATE_HEADERS = [
  'Type (test/profile)', 'Name', 'Category', 'Parameters (comma separated)',
  'MRP (₹)', 'Partner Price (₹)', 'TAT', 'Sample Type', 'Home Collection (Yes/No)',
  'Form Type', 'Gender (both/male/female)', 'Included Items (comma separated codes)', 'Status (active/inactive)',
]

export default function CreateTest() {
  const { partners = [], tests = [], formTypes = [], addTests, updateTest } = useDashboardStore()
  const toast = useToast()
  const eligiblePartners = partners.filter((p) => PARTNER_TYPES_WITH_TESTS.includes(p.partnerType))

  const [activeTab, setActiveTab] = useState('upload')
  const [selectedPartnerId, setSelectedPartnerId] = useState(eligiblePartners[0]?.id || '')
  const [catalogPartnerFilter, setCatalogPartnerFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dropdownHighlight, setDropdownHighlight] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [editingTest, setEditingTest] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const fileInputRef = useRef(null)

  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

  const selectedPartner = eligiblePartners.find((p) => p.id === selectedPartnerId)

  const handlePartnerChange = (e) => {
    setSelectedPartnerId(e.target.value)
    setDropdownHighlight(true)
    setTimeout(() => setDropdownHighlight(false), 500)
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ['test', 'Complete Blood Count', 'Haematology', 'Hemoglobin, WBC, RBC', 600, 450, '6 hours', 'Blood', 'Yes', 'PATHOLOGY', 'both', '', 'active'],
      ['test', 'Lipid Profile', 'Biochemistry', 'Total Cholesterol, HDL, LDL', 900, 700, '12 hours', 'Blood', 'Yes', 'PATHOLOGY', 'both', '', 'active'],
      ['test', 'PSA Test', 'Oncology', 'Prostate Specific Antigen', 1200, 950, '24 hours', 'Blood', 'Yes', 'PATHOLOGY', 'male', '', 'active'],
      ['test', 'Pap Smear', 'Gynecology', 'Cervical Cancer Screening', 800, 600, '48 hours', 'Cervical Cells', 'No', 'PATHOLOGY', 'female', '', 'active'],
      ['profile', 'Health Checkup Basic', 'Preventive', 'Comprehensive basic health screening', 2500, 2000, '24 hours', 'Blood', 'Yes', 'PATHOLOGY', 'both', 'TEST-p2-001,TEST-p2-002', 'active'],
      ['profile', 'Men\'s Health Package', 'Preventive', 'Complete health screening for men', 3500, 2800, '24 hours', 'Blood', 'Yes', 'PATHOLOGY', 'male', 'TEST-p2-001,TEST-p2-002,TEST-p2-003', 'active'],
      ['profile', 'Women\'s Health Package', 'Preventive', 'Complete health screening for women', 3500, 2800, '48 hours', 'Blood', 'Yes', 'PATHOLOGY', 'female', 'TEST-p2-001,TEST-p2-002,TEST-p2-004', 'active'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Tests & Profiles Template')
    XLSX.writeFile(wb, 'test_profile_upload_template.xlsx')
  }

  const parseExcel = (f) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
        const parsed = rows
          .slice(1)
          .filter((row) => row.length >= 4 && row[0])
          .map((row) => {
            const itemType = String(row[0] || 'test').trim().toLowerCase()
            const formTypeValue = String(row[9] || '').trim()
            const isValidFormType = formTypes.length === 0 || formTypes.includes(formTypeValue) || formTypeValue === ''
            const genderValue = String(row[10] || 'both').trim().toLowerCase()
            const includedItems = String(row[11] || '').trim()

            return {
              type: itemType === 'profile' ? 'profile' : 'test',
              testName: String(row[1] || '').trim(),
              category: String(row[2] || '').trim(),
              parameters: String(row[3] || '').trim(),
              mrp: Number(row[4]) || 0,
              price: Number(row[5]) || 0,
              tat: String(row[6] || '').trim(),
              sampleType: String(row[7] || '').trim(),
              homeCollection: String(row[8] || '').toLowerCase() === 'yes',
              formType: formTypeValue,
              gender: ['both', 'male', 'female'].includes(genderValue) ? genderValue : 'both',
              composition: includedItems ? includedItems.split(',').map(code => code.trim()).filter(Boolean) : [],
              status: String(row[12] || 'active').trim().toLowerCase(),
              hasInvalidFormType: !isValidFormType,
            }
          })
        setPreviewData(parsed)
      } catch {
        setPreviewData([])
      }
    }
    reader.readAsArrayBuffer(f)
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null)
    setPreviewData(null)
    setUploadSuccess(false)
    if (f) parseExcel(f)
  }

  const handleUpload = () => {
    if (!file || !selectedPartnerId || !previewData?.length) return

    // Filter out rows with invalid form types
    const validRows = previewData.filter(row => !row.hasInvalidFormType)

    if (validRows.length === 0) {
      return // Don't upload if all rows have invalid form types
    }

    const timestamp = Date.now()
    const newTests = validRows.map((row, i) => {
      const { hasInvalidFormType, ...testData } = row // Remove validation flag

      // Auto-generate test code based on partner ID, type, and timestamp
      const prefix = row.type === 'profile' ? 'PROFILE' : 'TEST'
      const testCode = `${prefix}-${selectedPartnerId}-${timestamp}-${i}`

      return {
        ...testData,
        testCode, // Auto-generated test code
        id: (row.type === 'profile' ? 'prof' : 't') + timestamp + i,
        partnerId: selectedPartnerId,
        // type, gender, composition, and status are already in row from Excel parsing
      }
    })
    addTests(newTests)
    setFile(null)
    setPreviewData(null)
    setUploadSuccess(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setActiveTab('catalog')

    const testCount = newTests.filter(t => t.type === 'test').length
    const profileCount = newTests.filter(t => t.type === 'profile').length
    toast.success(`Successfully uploaded ${testCount} test(s) and ${profileCount} profile(s)!`)
  }

  const handleClear = () => {
    setFile(null)
    setPreviewData(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleEditTest = (test) => {
    setEditingTest(test)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingTest(null)
  }

  const handleUpdateTest = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    const updates = {
      formType: formData.get('formType'),
      mrp: parseFloat(formData.get('mrp')),
      price: parseFloat(formData.get('price')),
      status: formData.get('status')
    }

    updateTest(editingTest.id, updates)
    toast.success('Test updated successfully!')
    handleCloseEditModal()
  }

  const catalogTests = useMemo(() => {
    let result = tests || []
    if (catalogPartnerFilter) result = result.filter((t) => t.partnerId === catalogPartnerFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.testName?.toLowerCase().includes(q) ||
          t.testCode?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      )
    }
    // Reset to page 1 when filters change
    setCurrentPage(1)
    return result
  }, [tests, catalogPartnerFilter, searchQuery])

  const paginatedTests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return catalogTests.slice(startIndex, startIndex + pageSize)
  }, [catalogTests, currentPage, pageSize])

  const totalPages = Math.ceil(catalogTests.length / pageSize)

  const getPartnerName = (partnerId) => partners.find((p) => p.id === partnerId)?.name || '—'

  const existingCount = (tests || []).filter((t) => t.partnerId === selectedPartnerId).length

  const exportCatalogToExcel = () => {
    if (catalogTests.length === 0) return

    const exportData = catalogTests.map((t) => ({
      'Type': t.type === 'profile' ? 'Profile' : 'Test',
      'Code': t.testCode,
      'Name': t.testName,
      'Category': t.category,
      'Gender': t.gender === 'male' ? 'Male' : t.gender === 'female' ? 'Female' : 'Both',
      'Parameters': t.parameters,
      'MRP (₹)': t.mrp,
      'Partner Price (₹)': t.price,
      'TAT': t.tat,
      'Sample Type': t.sampleType,
      'Home Collection': t.homeCollection ? 'Yes' : 'No',
      'Form Type': t.formType || '—',
      'Composition': t.type === 'profile' && t.composition?.length > 0 ? t.composition.join(', ') : '—',
      'Partner': getPartnerName(t.partnerId),
      'Status': t.status,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    ws['!cols'] = [
      { wch: 12 }, // Type
      { wch: 25 }, // Code
      { wch: 35 }, // Name
      { wch: 18 }, // Category
      { wch: 12 }, // Gender
      { wch: 40 }, // Parameters
      { wch: 12 }, // MRP
      { wch: 15 }, // Partner Price
      { wch: 12 }, // TAT
      { wch: 15 }, // Sample Type
      { wch: 18 }, // Home Collection
      { wch: 18 }, // Form Type
      { wch: 30 }, // Composition
      { wch: 25 }, // Partner
      { wch: 12 }, // Status
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Test & Profile Catalog')

    const fileName = `test_profile_catalog_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  return (
    <>
      <header className="main-header">
        <h2 className="page-title">Test & Profile Creation</h2>
        <p className="page-desc">
          Upload and manage diagnostic tests and profiles for partners. Tests are individual diagnostic procedures, while Profiles are packages containing multiple tests or other profiles. Supports gender-specific targeting (Male/Female/Both). Eligible partner types: Diagnostic, Collection Center, and Processing Center.
        </p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="panel-tabs">
            <button
              type="button"
              className={`panel-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => { setActiveTab('upload'); setUploadSuccess(false) }}
            >
              Upload Tests & Profiles
            </button>
            <button
              type="button"
              className={`panel-tab ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              Catalog {tests.length > 0 && `(${tests.filter(t => t.type !== 'profile').length} Tests, ${tests.filter(t => t.type === 'profile').length} Profiles)`}
            </button>
          </div>

          {/* ── Upload Tests Tab ── */}
          {activeTab === 'upload' && (
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {uploadSuccess && (
                <div className="test-upload-success">
                  ✓ Tests uploaded successfully! Existing tests (same Test Code + Partner) have been updated. View them in the Test Catalog tab.
                </div>
              )}

              {/* Select Partner */}
              <div className="form-section">
                <h3 className="form-section-title">Partner Selection</h3>
                <div className="enroll-plan-select-wrap">
                  <label>Partner</label>
                  <select
                    value={selectedPartnerId}
                    onChange={handlePartnerChange}
                    className={dropdownHighlight ? 'dropdown-highlight' : ''}
                  >
                    {eligiblePartners.map((p) => (
                      <option key={p.id} value={p.id}>{getPartnerLabel(p)}</option>
                    ))}
                    {eligiblePartners.length === 0 && <option value="">No eligible partners configured</option>}
                  </select>
                </div>
                {selectedPartner && (
                  <div
                    key={selectedPartner.id}
                    className="enroll-plan-card animate-card-change"
                  >
                    <h4>
                      {selectedPartner.name}
                      <span className="price-calc-badge" style={{ marginLeft: '0.5rem', textTransform: 'capitalize' }}>
                        {getPartnerTypeLabel(selectedPartner.partnerType)}
                      </span>
                    </h4>
                    <ul className="enroll-plan-bullets">
                      <li>Contact: {selectedPartner.contact}</li>
                      <li>Status: {selectedPartner.status}</li>
                      <li>Tests already uploaded: {existingCount}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Upload File */}
              <div className="form-section">
                <div className="enroll-header-actions">
                  <h3 className="form-section-title" style={{ marginBottom: 0 }}>Upload Excel File</h3>
                  <button type="button" className="btn-secondary" onClick={downloadTemplate}>⬇ Download Template</button>
                </div>
                <p className="page-desc" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                  Download the template, fill in test details, then upload. Supported: <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong>
                  <br />
                  <strong>Note:</strong> Test codes will be auto-generated during upload. If a test with the same Test Code already exists for this partner, it will be updated with new values.
                </p>
                <div
                  className={`enroll-upload-zone ${file ? 'has-file' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                  <span style={{ fontSize: '2rem' }}>📁</span>
                  <span style={{ fontSize: '1rem', fontWeight: 500 }}>Click to Browse File</span>
                  <span className="enroll-upload-hint">Supported: .xlsx, .xls, .csv</span>
                  {file && (
                    <span style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500 }}>
                      📎 {file.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview */}
              {previewData && (
                <div className="form-section">
                  <h3 className="form-section-title">
                    Preview {previewData.length > 0 ? `| ${previewData.filter(r => r.type === 'test').length} test(s), ${previewData.filter(r => r.type === 'profile').length} profile(s)` : '| No valid rows found'}
                  </h3>
                  {previewData.length === 0 ? (
                    <div style={{ padding: '1.5rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '8px', color: '#92400e', fontSize: '0.875rem' }}>
                      ⚠ No valid rows found in the file. Please check the format and try again, or download the template.
                    </div>
                  ) : (
                    <>
                      {/* Validation Warning */}
                      {previewData.some(row => row.hasInvalidFormType) && (
                        <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                          <strong>⚠ Invalid Form Types Detected:</strong> {previewData.filter(row => row.hasInvalidFormType).length} row(s) have invalid form types and will be skipped during upload.
                          <br />
                          <strong>Valid Form Types:</strong> {formTypes.join(', ')}
                        </div>
                      )}
                      <div className="table-wrap test-preview-table">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Type</th>
                              <th>Code (Auto-gen)</th>
                              <th>Name</th>
                              <th>Category</th>
                              <th>Gender</th>
                              <th>MRP (₹)</th>
                              <th>Price (₹)</th>
                              <th>TAT</th>
                              <th>Form Type</th>
                              <th>Composition</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.slice(0, 10).map((row, i) => (
                              <tr key={i} style={row.hasInvalidFormType ? { background: '#fef2f2' } : {}}>
                                <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                <td>
                                  <span className={`status-badge ${row.type === 'profile' ? 'status-pending' : 'status-active'}`} style={{ fontSize: '0.7rem' }}>
                                    {row.type === 'profile' ? '📦 PROFILE' : '🧪 TEST'}
                                  </span>
                                </td>
                                <td><code className="test-code-badge" style={{ fontSize: '0.7rem', opacity: 0.7 }}>Auto-gen</code></td>
                                <td style={{ fontWeight: 500 }}>{row.testName}</td>
                                <td>{row.category}</td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: row.gender === 'male' ? '#dbeafe' : row.gender === 'female' ? '#fce7f3' : '#f3f4f6', color: row.gender === 'male' ? '#1e40af' : row.gender === 'female' ? '#9f1239' : '#374151' }}>
                                    {row.gender === 'male' ? '♂ Male' : row.gender === 'female' ? '♀ Female' : '⚥ Both'}
                                  </span>
                                </td>
                                <td style={{ color: 'var(--muted)', textDecoration: 'line-through' }}>₹{row.mrp}</td>
                                <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{row.price}</td>
                                <td>{row.tat}</td>
                                <td style={row.hasInvalidFormType ? { background: '#fee2e2', color: '#991b1b', fontWeight: 600 } : {}}>
                                  {row.formType || '—'}
                                  {row.hasInvalidFormType && ' ⚠'}
                                </td>
                                <td style={{ fontSize: '0.75rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {row.type === 'profile' && row.composition?.length > 0 ? (
                                    <span title={row.composition.join(', ')}>{row.composition.length} item(s)</span>
                                  ) : '—'}
                                </td>
                                <td>
                                  <span className={`status-badge ${row.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                                    {row.status?.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {previewData.length > 10 && (
                          <div className="test-preview-more">
                            +{previewData.length - 10} more items will be uploaded
                          </div>
                        )}
                      </div>
                      <div className="enroll-actions-row">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={handleUpload}
                          disabled={previewData.filter(row => !row.hasInvalidFormType).length === 0}
                        >
                          Upload {previewData.filter(row => !row.hasInvalidFormType).length} Item{previewData.filter(row => !row.hasInvalidFormType).length !== 1 ? 's' : ''}
                        </button>
                        <button type="button" className="btn-secondary" onClick={handleClear}>Clear</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Test Catalog Tab ── */}
          {activeTab === 'catalog' && (
            <div>
              {/* Filter bar */}
              <div className="test-catalog-filters">
                <input
                  type="text"
                  placeholder="Search by test name, code or category…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <select
                  value={catalogPartnerFilter}
                  onChange={(e) => setCatalogPartnerFilter(e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  <option value="">All Partners</option>
                  {eligiblePartners.map((p) => (
                    <option key={p.id} value={p.id}>{getPartnerLabel(p)}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={exportCatalogToExcel}
                  disabled={catalogTests.length === 0}
                  title="Export catalog to Excel"
                >
                  📊 Export to Excel
                </button>
              </div>

              {/* Stats bar */}
              <div className="test-catalog-stats">
                <div className="test-stat-item">
                  <span className="test-stat-label">🧪 Tests</span>
                  <span className="test-stat-value">{catalogTests.filter(t => t.type !== 'profile').length}</span>
                </div>
                <div className="test-stat-item">
                  <span className="test-stat-label">📦 Profiles</span>
                  <span className="test-stat-value">{catalogTests.filter(t => t.type === 'profile').length}</span>
                </div>
                <div className="test-stat-item">
                  <span className="test-stat-label">Avg Price</span>
                  <span className="test-stat-value">
                    {catalogTests.length
                      ? '₹' + Math.round(catalogTests.reduce((s, t) => s + (t.price || 0), 0) / catalogTests.length)
                      : '—'}
                  </span>
                </div>
                <div className="test-stat-item">
                  <span className="test-stat-label">Partners</span>
                  <span className="test-stat-value">{new Set(catalogTests.map((t) => t.partnerId)).size}</span>
                </div>
              </div>

              {/* Table or empty state */}
              {catalogTests.length === 0 ? (
                <div className="test-catalog-empty">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔬</div>
                  <p>No tests found. {searchQuery || catalogPartnerFilter ? 'Try adjusting your filters.' : 'Upload tests using the Upload Tests tab.'}</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Gender</th>
                        <th>MRP</th>
                        <th>Price</th>
                        <th>TAT</th>
                        <th>Form Type</th>
                        <th>Composition</th>
                        <th>Partner</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTests.map((test) => (
                        <tr key={test.id}>
                          <td>
                            <span className={`status-badge ${test.type === 'profile' ? 'status-pending' : 'status-active'}`} style={{ fontSize: '0.7rem' }}>
                              {test.type === 'profile' ? '📦' : '🧪'}
                            </span>
                          </td>
                          <td><code className="test-code-badge">{test.testCode}</code></td>
                          <td style={{ fontWeight: 500 }}>{test.testName}</td>
                          <td>{test.category}</td>
                          <td>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: (test.gender === 'male') ? '#dbeafe' : (test.gender === 'female') ? '#fce7f3' : '#f3f4f6', color: (test.gender === 'male') ? '#1e40af' : (test.gender === 'female') ? '#9f1239' : '#374151' }}>
                              {test.gender === 'male' ? '♂' : test.gender === 'female' ? '♀' : '⚥'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--muted)', textDecoration: 'line-through' }}>₹{test.mrp}</td>
                          <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{test.price}</td>
                          <td>{test.tat}</td>
                          <td>{test.formType || '—'}</td>
                          <td style={{ fontSize: '0.75rem' }}>
                            {test.type === 'profile' && test.composition?.length > 0 ? (
                              <span title={test.composition.join(', ')}>{test.composition.length} item(s)</span>
                            ) : '—'}
                          </td>
                          <td>{getPartnerName(test.partnerId)}</td>
                          <td>
                            <span className={`badge ${test.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                              {test.status?.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleEditTest(test)}
                              className="action-icon"
                              title={`Edit ${test.type === 'profile' ? 'profile' : 'test'}`}
                            >
                              <FaEdit />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {catalogTests.length > 0 && (
                <div className="pagination-controls">
                  <div className="pagination-info">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, catalogTests.length)} of {catalogTests.length} tests
                  </div>
                  <div className="pagination-buttons">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                      title="First page"
                    >
                      ⏮
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                      title="Previous page"
                    >
                      ◀
                    </button>
                    <span className="pagination-current">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                      title="Next page"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                      title="Last page"
                    >
                      ⏭
                    </button>
                  </div>
                  <div className="pagination-size">
                    <label>
                      Show:
                      <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                        {PAGE_SIZE_OPTIONS.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Edit Test Modal */}
      {showEditModal && editingTest && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Test</h3>
              <button className="modal-close" onClick={handleCloseEditModal}>×</button>
            </div>
            <form onSubmit={handleUpdateTest}>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                {/* Test Info (Read-only) */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Test Code</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)' }}>{editingTest.testCode}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.75rem', marginBottom: '0.5rem' }}>Test Name</div>
                  <div style={{ fontWeight: 500 }}>{editingTest.testName}</div>
                </div>

                {/* Editable Fields */}
                <div className="enroll-plan-select-wrap">
                  <label>Form Type *</label>
                  <select name="formType" defaultValue={editingTest.formType || ''} required>
                    <option value="">-- Select Form Type --</option>
                    {formTypes.map((ft) => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                </div>

                <div className="enroll-plan-select-wrap">
                  <label>MRP (₹) *</label>
                  <input
                    type="number"
                    name="mrp"
                    defaultValue={editingTest.mrp}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="enroll-plan-select-wrap">
                  <label>Partner Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingTest.price}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="enroll-plan-select-wrap">
                  <label>Status *</label>
                  <select name="status" defaultValue={editingTest.status || 'active'} required>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

