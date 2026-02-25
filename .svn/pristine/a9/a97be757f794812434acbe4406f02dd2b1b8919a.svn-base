import { useState, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useAuth } from '../context/AuthContext'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import '../App.css'

const ACCEPT_FILES = '.xlsx,.xls'

export default function EnrollEmployee() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { benefits = [], clients = [], partners = [], addBenefitRequest } = useDashboardStore()
  const isAdmin = user?.type === 'bd_admin'

  // For HR users, use their organizationId; for BD Admin, use clientId from location.state
  const organizationId = user?.type === 'hr' ? user?.organizationId : null
  const effectiveClientId = isAdmin ? location.state?.clientId : null

  const orgClientIds = useMemo(() => {
    // If BD Admin with clientId from location.state, filter by that specific client
    if (effectiveClientId) {
      return [effectiveClientId]
    }
    // If HR user, filter by their organization's clients
    if (organizationId) {
      return (clients || []).filter((c) => c.partnerId === organizationId).map((c) => c.id)
    }
    return null
  }, [effectiveClientId, organizationId, clients])

  const allBenefits = benefits.filter((b) => b.status === 'Active' || b.status === 'active')
  const activeBenefitsRaw = (effectiveClientId || organizationId) && orgClientIds
    ? allBenefits.filter((b) => orgClientIds.includes(b.clientId))
    : allBenefits
  const activeBenefits = activeBenefitsRaw.filter((b) => b.type === 'combo')

  const [subTab, setSubTab] = useState('new') // 'new' | 'addon'
  const [selectedBenefitId, setSelectedBenefitId] = useState(activeBenefits[0]?.id || '')
  const [file, setFile] = useState(null)
  const [noteOpen, setNoteOpen] = useState(false)
  const fileInputRef = useRef(null)

  const selectedBenefit = activeBenefits.find((b) => b.id === selectedBenefitId) || activeBenefits[0]
  const getClientName = (id) => clients.find((c) => c.id === id)?.companyName || '—'
  const selectedClient = selectedBenefit ? clients.find((c) => c.id === selectedBenefit.clientId) : null
  const orgForEnroll = selectedClient ? partners.find((p) => p.id === selectedClient.partnerId) : null

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null)
  }

  const getBenefitPrices = (b) => {
    if (!b) return { primaryPrice: 0, addonPrice: 0 }
    return {
      primaryPrice: Number(b.primaryPrice) || 0,
      addonPrice: Number(b.addOnPrice) || 0,
    }
  }

  const parseExcelAndComputePrice = (arrayBuffer, isNewSubscription, benefit) => {
    const wb = XLSX.read(arrayBuffer, { type: 'array' })
    const firstSheet = wb.SheetNames[0]
    if (!firstSheet) return { totalPrice: 0, groups: [] }
    const sheet = wb.Sheets[firstSheet]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    if (!rows.length) return { totalPrice: 0, groups: [] }
    const headers = (rows[0] || []).map((h) => String(h || '').trim())
    const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell != null && String(cell).trim() !== ''))

    const col = (name) => {
      const i = headers.findIndex((h) => String(h).toLowerCase() === String(name).toLowerCase())
      return i >= 0 ? i : -1
    }
    const emailCol = col('Corporate Email Id')
    const isPrimaryCol = col('Is Primary')
    const { primaryPrice, addonPrice } = getBenefitPrices(benefit)

    if (isNewSubscription && emailCol >= 0) {
      const groups = {}
      dataRows.forEach((row) => {
        const email = String(row[emailCol] ?? '').trim()
        if (!email) return
        if (!groups[email]) groups[email] = []
        groups[email].push(row)
      })
      let totalPrice = 0
      const groupSummary = Object.entries(groups).map(([email, members]) => {
        let primaryCount = 0
        let addonCount = 0
        if (isPrimaryCol >= 0) {
          members.forEach((row) => {
            const v = String(row[isPrimaryCol] ?? '').trim().toLowerCase()
            if (v === 'yes' || v === '1' || v === 'primary' || v === 'true' || v === 'y') primaryCount += 1
            else addonCount += 1
          })
        } else {
          primaryCount = 1
          addonCount = Math.max(0, members.length - 1)
        }
        const estimated = primaryCount * primaryPrice + addonCount * addonPrice
        totalPrice += estimated
        return { email, primaryCount, addonCount, estimated, members: members.length }
      })
      return { totalPrice, groups: groupSummary }
    }

    if (!isNewSubscription) {
      const addonCount = dataRows.length
      const totalPrice = addonCount * addonPrice
      return { totalPrice, groups: [{ addonCount, totalPrice }] }
    }

    return { totalPrice: 0, groups: [] }
  }

  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
  }

  const handleUpload = () => {
    const benefit = subTab === 'new' ? selectedBenefit : (activeBenefits.find((b) => b.id === selectedBenefitId) || activeBenefits[0])
    if (!file || !benefit) return
    const orgId = organizationId || (clients.find((c) => c.id === benefit.clientId)?.partnerId)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (!result || !(result instanceof ArrayBuffer)) {
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      const isNewSubscription = subTab === 'new'
      const { totalPrice } = parseExcelAndComputePrice(result, isNewSubscription, benefit)
      const base64 = arrayBufferToBase64(result)
      const mime = file.name && file.name.toLowerCase().endsWith('.xls') ? 'application/vnd.ms-excel' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const uploadedDocumentContent = `data:${mime};base64,${base64}`
      addBenefitRequest({
        planId: benefit.id,
        planName: benefit.name,
        totalPrice,
        uploadedDocumentName: file.name,
        uploadedDocumentContent,
        ...(orgId ? { organizationId: orgId } : {}),
      })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      navigate('/dashboard/request-dashboard')
    }
    reader.readAsArrayBuffer(file)
  }

  const NEW_SUBSCRIPTION_HEADERS = [
    'Slot ID',
    'Health Care Subscription Code',
    'Pharmacy Subscription Code',
    'Corporate Email Id',
    'Member Full Name',
    'Date Of Birth',
    'Gender',
    'Contact Number',
    'Employee ID',
    'Designation',
    'Photo Id Type',
    'Photo Id Number',
    'Relationship',
    'Is Primary',
    'State Code',
    'Action',
  ]

  const ADDON_SUBSCRIPTION_HEADERS = [
    'Health Care Subscription Code',
    'Member Full Name',
    'Date Of Birth',
    'Gender',
    'Contact Number',
    'Photo Id Type',
    'Photo Id Number',
    'Relationship',
  ]

  const downloadTemplate = () => {
    const headers = subTab === 'new'
      ? [NEW_SUBSCRIPTION_HEADERS]
      : [ADDON_SUBSCRIPTION_HEADERS]
    const ws = XLSX.utils.aoa_to_sheet(headers)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, subTab === 'new' ? 'New Subscription' : 'Add on Subscription')
    const fileName = subTab === 'new' ? 'new_subscription_template.xlsx' : 'addon_subscription_template.xlsx'
    XLSX.writeFile(wb, fileName)
  }

  const title = subTab === 'new' ? 'Select the Corporate benefit to Upload the Employee Excel' : 'Upload the Add-on Subscription Excel'
  const uploadTitle = subTab === 'new' ? 'Upload New Subscription' : 'Upload Add-on Subscription'

  return (
    <>
      <header className="main-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="page-title">Enroll Employee</h2>
            {isAdmin && (
              <p className="page-desc" style={{ marginBottom: '0.25rem' }}>
                Organization: {orgForEnroll ? <><strong>{orgForEnroll.name}</strong> (Partner ID: {orgForEnroll.id})</> : 'Select a plan to see organization.'}
              </p>
            )}
            <p className="page-desc">
              {organizationId ? 'Plans for your organization. ' : ''}
              Select a benefit and upload employee or add-on member data via Excel (.xlsx).
            </p>
          </div>
          <button onClick={() => navigate('/dashboard/summary')} style={{
            padding: '0.625rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: 'var(--text)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--border)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg)'
          }}>
            ← Back
          </button>
        </div>
      </header>
      <div className="content">
        <section className="panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
            <div className="panel-tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
              <button type="button" className={`panel-tab ${subTab === 'new' ? 'active' : ''}`} onClick={() => setSubTab('new')}>New Subscription</button>
              <button type="button" className={`panel-tab ${subTab === 'addon' ? 'active' : ''}`} onClick={() => setSubTab('addon')}>Enroll Add-on Members</button>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={downloadTemplate}
              style={{ margin: '0.5rem 1rem' }}
            >
              Download {subTab === 'new' ? 'New Subscription' : 'Add-on'} Template
            </button>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <h3 className="page-title" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{title}</h3>

            {subTab === 'new' && (
              <>
                <div className="enroll-plan-select-wrap">
                  <label>Benefit</label>
                  <select value={selectedBenefitId} onChange={(e) => setSelectedBenefitId(e.target.value)} autoComplete="off">
                    {activeBenefits.map((b) => (
                      <option key={b.id} value={b.id}>{getClientName(b.clientId)} – {b.name}</option>
                    ))}
                    {activeBenefits.length === 0 && <option value="">No benefits configured</option>}
                  </select>
                </div>

                {selectedBenefit && (
                  <div className="enroll-plan-card">
                    <h4>{selectedBenefit.name} <span className="price-calc-badge">{selectedBenefit.type === 'pharma' ? 'Pharmacy' : selectedBenefit.type === 'health_care' ? 'Health care' : 'Combo'}</span></h4>
                    <ul className="enroll-plan-bullets">
                      {(selectedBenefit.description || 'No description.')
                        .split(/[.;]\s*/)
                        .filter(Boolean)
                        .map((t, i) => (
                          <li key={i}>✓ {t.trim()}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <h4 className="form-section-title" style={{ marginBottom: '1rem' }}>{uploadTitle}</h4>

            <div
              className={`enroll-upload-zone ${file ? 'has-file' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                padding: '2.5rem 2rem',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_FILES}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {/* File icon */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: file ? 'var(--accent)' : '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={file ? 'white' : 'var(--accent)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              </div>

              {/* File name or prompt */}
              {file ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    marginBottom: '0.25rem',
                  }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.25rem' }}>
                    Click to browse or drag and drop
                  </div>
                  <div className="enroll-upload-hint">Supported Files: .xlsx, .xls</div>
                </div>
              )}

              {/* Browse button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                style={{
                  padding: '0.625rem 1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'var(--accent)',
                  background: 'white',
                  border: '2px solid var(--accent)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.color = 'var(--accent)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                📁 {file ? 'Change File' : 'Browse Files'}
              </button>
            </div>

            <div className="enroll-actions-row" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file}
                style={{
                  padding: '0.75rem 2.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'white',
                  background: !file ? '#ccc' : 'linear-gradient(135deg, var(--accent) 0%, #a00027 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !file ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: !file ? 'none' : '0 4px 12px rgba(200, 0, 50, 0.3)',
                  opacity: !file ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (file) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(200, 0, 50, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (file) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 0, 50, 0.3)'
                  }
                }}
              >
                🚀 Upload File
              </button>
            </div>

            <div className="enroll-note">
              <button type="button" className="enroll-note-header" onClick={() => setNoteOpen(!noteOpen)} aria-expanded={noteOpen}>
                Note
                <span>{noteOpen ? '▴' : '▾'}</span>
              </button>
              {noteOpen && (
                <div className="enroll-note-body">
                  {subTab === 'new' ? (
                    <>Use the New Subscription template with columns: Health Care Subscription Code, Pharmacy Subscription Code, Corporate Email Id, Member Full Name, Date Of Birth, Gender, Contact Number, Employee ID, Designation, Photo Id Type, Photo Id Number, Relationship, Is Primary, State Code, Action. Download the template (.xlsx) and fill in the data before uploading.</>
                  ) : (
                    <>Use the Add-on Subscription template with columns: Health Care Subscription Code, Member Full Name, Date Of Birth, Gender, Contact Number, Photo Id Type, Photo Id Number, Relationship. Download the template (.xlsx) and fill in add-on member details; link to primary via Health Care Subscription Code.</>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
