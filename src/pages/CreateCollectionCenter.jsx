import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import { useToast } from '../context/ToastContext'
import { INDIAN_STATES, CITIES_BY_STATE } from '../data/indiaLocations.js'
import { FaEdit, FaMapMarkedAlt, FaCalendarAlt } from 'react-icons/fa'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function CreateCollectionCenter() {
  const navigate = useNavigate()
  const toast = useToast()
  const {
    vendors = [],
    centers = [],
    addCenter,
    updateCenter
  } = useDashboardStore()
  const [activeTab, setActiveTab] = useState('create')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [showCenterModal, setShowCenterModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState(null)

  // Filters for view tab
  const [vendorFilter, setVendorFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Working hours state - default 9 AM to 6 PM for all days
  const [workingHours, setWorkingHours] = useState(
    DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = { isOpen: true, openTime: '09:00', closeTime: '18:00' }
      return acc
    }, {})
  )

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)

    const centerData = {
      vendorId: fd.get('center_vendorId') || '',
      name: fd.get('center_name') || '',
      state: fd.get('center_state') || '',
      city: fd.get('center_city') || '',
      address: fd.get('center_address') || '',
      slots: Number(fd.get('center_slots')) || 0,
      workingHours: workingHours,
    }

    if (editingCenter) {
      // Update existing center
      updateCenter(editingCenter.id, centerData)
      setEditingCenter(null)
      toast.success('Center updated successfully!')
    } else {
      // Create new center
      addCenter(centerData)
      toast.success('Center created successfully!')
    }

    setActiveTab('view')
    // Reset form
    e.target.reset()
    setSelectedState('')
    setWorkingHours(
      DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = { isOpen: true, openTime: '09:00', closeTime: '18:00' }
        return acc
      }, {})
    )
  }

  const handleEditCenter = (center) => {
    setEditingCenter(center)
    setSelectedState(center.state || '')
    setWorkingHours(center.workingHours || DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = { isOpen: true, openTime: '09:00', closeTime: '18:00' }
      return acc
    }, {}))
    setActiveTab('create')
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingCenter(null)
    setSelectedState('')
    setWorkingHours(
      DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = { isOpen: true, openTime: '09:00', closeTime: '18:00' }
        return acc
      }, {})
    )
    setActiveTab('view')
  }

  const availableCities = selectedState ? (CITIES_BY_STATE[selectedState] || []) : []

  const getVendorName = (vendorId) => vendors.find((v) => v.id === vendorId)?.name || '—'

  // Filter centers based on search and vendor filter
  const filteredCenters = centers.filter(center => {
    const vid = center.vendorId ?? center.partnerId
    const matchesVendor = !vendorFilter || vid === vendorFilter
    const matchesSearch = !searchQuery ||
      center.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.address?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesVendor && matchesSearch
  })

  const handleCenterClick = (center) => {
    setSelectedCenter(center)
    setShowCenterModal(true)
  }

  const closeCenterModal = () => {
    setShowCenterModal(false)
    setSelectedCenter(null)
  }

  const formatTime = (time) => {
    if (!time) return '—'
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <>
      <header className="main-header">
        <h2 className="page-title">Center Management</h2>
        <p className="page-desc">Create new centers or view existing collection centers.</p>
      </header>
      <div className="content">
        <section className="panel">
          {/* Tabs */}
          <div className="panel-tabs">
            <button
              type="button"
              className={`panel-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create Center
            </button>
            <button
              type="button"
              className={`panel-tab ${activeTab === 'view' ? 'active' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              View Centers {centers.length > 0 && `(${centers.length})`}
            </button>
          </div>

          {/* Create/Edit Tab */}
          {activeTab === 'create' && (
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {editingCenter && (
                <div style={{
                  padding: '1rem',
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>✏️ Editing Center:</strong> {editingCenter.name} ({editingCenter.id})
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancel Edit
                  </button>
                </div>
              )}
              <form className="form form-modal" onSubmit={handleSubmit} autoComplete="off">
                <div className="form-section">
                  <div className="form-row form-row-2">
                    <label>Center name <input name="center_name" type="text" placeholder="e.g. Central Hub" defaultValue={editingCenter?.name || ''} required /></label>
                    <label>Vendor <select name="center_vendorId" defaultValue={editingCenter?.vendorId || editingCenter?.partnerId || ''} required><option value="">Select vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}</select></label>
                  </div>
                  <div className="form-row form-row-2">
                    <label>Country <input type="text" value="India" readOnly style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} /></label>
                    <label>State <select name="center_state" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} required><option value="">Select state</option>{INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}</select></label>
                  </div>
                  <div className="form-row form-row-2">
                    <label>City <select name="center_city" defaultValue={editingCenter?.city || ''} required disabled={!selectedState}><option value="">Select city</option>{availableCities.map(city => <option key={city} value={city}>{city}</option>)}</select></label>
                    <label>Slots <input name="center_slots" type="number" placeholder="120" min={1} defaultValue={editingCenter?.slots || ''} required /></label>
                  </div>
                  <div className="form-row form-row-1">
                    <label>Address <input name="center_address" type="text" placeholder="Full address" defaultValue={editingCenter?.address || ''} required /></label>
                  </div>
                </div>

                {/* Working Hours Section */}
                <div className="form-section" style={{ marginTop: '1.5rem' }}>
                  <h3 className="form-section-title">Working Hours | Days of Week</h3>
                  <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                    Configure operating hours for each day of the week. Uncheck days when the center is closed.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {DAYS_OF_WEEK.map(day => (
                      <div
                        key={day}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '140px 80px 1fr 1fr',
                          gap: '1rem',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: workingHours[day].isOpen ? 'white' : '#f5f5f5',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            id={`day-${day}`}
                            checked={workingHours[day].isOpen}
                            onChange={(e) => handleWorkingHoursChange(day, 'isOpen', e.target.checked)}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          />
                          <label
                            htmlFor={`day-${day}`}
                            style={{
                              fontWeight: 600,
                              cursor: 'pointer',
                              color: workingHours[day].isOpen ? 'var(--text)' : '#999'
                            }}
                          >
                            {day}
                          </label>
                        </div>

                        {workingHours[day].isOpen ? (
                          <>
                            <span style={{ fontSize: '0.875rem', color: '#666' }}>Open</span>
                            <div className="enroll-plan-select-wrap" style={{ margin: 0 }}>
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Open Time</label>
                              <input
                                type="time"
                                value={workingHours[day].openTime}
                                onChange={(e) => handleWorkingHoursChange(day, 'openTime', e.target.value)}
                                required
                                style={{ padding: '0.5rem' }}
                              />
                            </div>
                            <div className="enroll-plan-select-wrap" style={{ margin: 0 }}>
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Close Time</label>
                              <input
                                type="time"
                                value={workingHours[day].closeTime}
                                onChange={(e) => handleWorkingHoursChange(day, 'closeTime', e.target.value)}
                                required
                                style={{ padding: '0.5rem' }}
                              />
                            </div>
                          </>
                        ) : (
                          <span style={{ gridColumn: '2 / -1', fontSize: '0.875rem', color: '#999', fontStyle: 'italic' }}>
                            Closed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn-primary">
                    {editingCenter ? 'Update Center' : 'Create Center'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard?tab=partners')}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* View Tab */}
          {activeTab === 'view' && (
            <div>
              {/* Filters */}
              <div className="test-catalog-filters" style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search by center name, city, or address…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  <option value="">All Vendors</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                  ))}
                </select>
              </div>

              {centers.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏢</div>
                  <p>No centers found. Create your first center using the Create Center tab.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Center ID</th>
                        <th>Center Name</th>
                        <th>Vendor</th>
                        <th>State</th>
                        <th>City</th>
                        <th>Address</th>
                        <th>Slots</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCenters.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No centers found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredCenters.map(c => (
                        <tr key={c.id}>
                          <td>
                            <span
                              onClick={() => handleCenterClick(c)}
                              style={{
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontWeight: 600
                              }}
                              title="Click to view details"
                            >
                              {c.id}
                            </span>
                          </td>
                          <td><strong>{c.name}</strong></td>
                          <td>{getVendorName(c.vendorId ?? c.partnerId)}</td>
                          <td>{c.state || '—'}</td>
                          <td>{c.city}</td>
                          <td>{c.address}</td>
                          <td>{c.slots}</td>
                          <td>
                            <button
                              onClick={() => handleEditCenter(c)}
                              className="action-icon"
                              title="Edit center"
                            >
                              <FaEdit />
                            </button>
                            <Link
                              to={`/dashboard/tests/mapping?partnerId=${c.partnerId}&centerId=${c.id}`}
                              className="action-icon"
                              title="Map tests to this center"
                            >
                              <FaMapMarkedAlt />
                            </Link>
                            <Link
                              to={`/dashboard/slots/config?centerId=${c.id}`}
                              className="action-icon"
                              title="Configure slots"
                            >
                              <FaCalendarAlt />
                            </Link>
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Center Details Modal */}
      {showCenterModal && selectedCenter && (
        <div className="modal-overlay" onClick={closeCenterModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Center Details</h3>
              <button className="modal-close" onClick={closeCenterModal}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              {/* Basic Information */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>
                  Basic Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Center ID</div>
                    <div style={{ fontWeight: 600 }}>{selectedCenter.id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Center Name</div>
                    <div style={{ fontWeight: 600 }}>{selectedCenter.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Vendor</div>
                    <div>{getVendorName(selectedCenter.vendorId ?? selectedCenter.partnerId)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Total Slots</div>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedCenter.slots}</div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>
                  Location
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Country</div>
                    <div>India</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>State</div>
                    <div>{selectedCenter.state || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>City</div>
                    <div>{selectedCenter.city}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Address</div>
                    <div>{selectedCenter.address}</div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>
                  Working Hours
                </h4>
                {selectedCenter.workingHours ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {DAYS_OF_WEEK.map(day => {
                      const hours = selectedCenter.workingHours[day]
                      return (
                        <div
                          key={day}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            background: hours?.isOpen ? '#f0f9ff' : '#f5f5f5',
                            borderRadius: '6px',
                            border: `1px solid ${hours?.isOpen ? '#bfdbfe' : '#e5e5e5'}`
                          }}
                        >
                          <span style={{ fontWeight: 600, color: hours?.isOpen ? 'var(--text)' : '#999' }}>
                            {day}
                          </span>
                          {hours?.isOpen ? (
                            <span style={{ color: '#059669', fontWeight: 500 }}>
                              {formatTime(hours.openTime)} - {formatTime(hours.closeTime)}
                            </span>
                          ) : (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>Closed</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    color: '#666'
                  }}>
                    Working hours not configured for this center
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeCenterModal}>Close</button>
              <Link
                to={`/dashboard/tests/mapping?partnerId=${selectedCenter.partnerId}&centerId=${selectedCenter.id}`}
                className="btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaMapMarkedAlt /> Map Tests
              </Link>
              <Link
                to={`/dashboard/slots/config?centerId=${selectedCenter.id}`}
                className="btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaCalendarAlt /> Configure Slots
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
