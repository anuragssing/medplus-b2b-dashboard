import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import '../App.css'

const VENDOR_TYPE_LABELS = {
  processing_vendor: 'Processing vendor',
  collection_vendor: 'Collection vendor',
  diagnostic_vendor: 'Diagnostic vendor',
}

export default function VendorForm({ mode = 'view' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const vendors = useDashboardStore((s) => s.vendors) || []
  const partners = useDashboardStore((s) => s.partners) || []
  const vendor = id ? vendors.find((v) => v.id === id) : null
  const isView = mode === 'view'

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (mounted && id && !vendor) {
      navigate('/dashboard?tab=clients-vendors&sub=vendors', { replace: true })
    }
  }, [mounted, id, vendor, navigate])

  if (!mounted && id && !vendor) {
    return (
      <div className="content">
        <section className="panel"><p style={{ padding: '1rem', textAlign: 'center' }}>Loading...</p></section>
      </div>
    )
  }
  if (!vendor) return null

  const partner = vendor.partnerId ? partners.find((p) => p.id === vendor.partnerId) : null
  const title = isView ? 'View Vendor' : 'Edit Vendor'
  const desc = isView ? 'Vendor details (read-only).' : 'Update vendor details below.'

  return (
    <>
      <header className="main-header">
        <h2 className="page-title">{title}</h2>
        <p className="page-desc">{desc}</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="form form-modal form-partner">
            <div className="form-section">
              <h4 className="form-section-title">| Vendor Details</h4>
              <div className="form-row form-row-2">
                <label>Vendor ID <input type="text" readOnly disabled value={vendor.id} style={{ backgroundColor: '#f5f5f5' }} /></label>
                <label>Partner <input type="text" readOnly disabled value={partner ? `${partner.name} (${vendor.partnerId})` : vendor.partnerId || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
              </div>
              <div className="form-row form-row-2">
                <label>Vendor Name <input type="text" readOnly disabled value={vendor.name || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                <label>Type <input type="text" readOnly disabled value={VENDOR_TYPE_LABELS[vendor.type] || vendor.type || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
              </div>
              <div className="form-row form-row-2">
                <label>Status <input type="text" readOnly disabled value={(vendor.status || 'Active').toUpperCase()} style={{ backgroundColor: '#f5f5f5' }} /></label>
                <label />
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Contact Details</h4>
              <div className="form-row form-row-3">
                <label>Name <input type="text" readOnly disabled value={vendor.contactName || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                <label>Email <input type="text" readOnly disabled value={vendor.email || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                <label>Phone <input type="text" readOnly disabled value={vendor.phone || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Login Email IDs</h4>
              <div className="form-row form-row-1">
                <label>Login Email IDs <input type="text" readOnly disabled value={(vendor.loginEmails && vendor.loginEmails.length > 0) ? vendor.loginEmails.join(', ') : '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
              </div>
            </div>
            <div className="form-section-actions">
              {isView && <Link to={`/dashboard/vendors/edit/${vendor.id}`} className="btn-primary" style={{ textDecoration: 'none' }}>Edit</Link>}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
