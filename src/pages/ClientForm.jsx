import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import '../App.css'

export default function ClientForm({ mode = 'view' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const clients = useDashboardStore((s) => s.clients) || []
  const partners = useDashboardStore((s) => s.partners) || []
  const client = id ? clients.find((c) => c.id === id) : null
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (mounted && id && !client) {
      navigate('/dashboard?tab=clients-vendors&sub=clients', { replace: true })
    }
  }, [mounted, id, client, navigate])

  if (!mounted && id && !client) {
    return (
      <div className="content">
        <section className="panel"><p style={{ padding: '1rem', textAlign: 'center' }}>Loading...</p></section>
      </div>
    )
  }
  if (!client) return null

  const partner = client.partnerId ? partners.find((p) => p.id === client.partnerId) : null
  const title = isView ? 'View Client' : 'Edit Client'
  const desc = isView ? 'Client details (read-only).' : 'Update client details below.'
  const readOnly = isView

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
              <h4 className="form-section-title">| Client Details</h4>
              <div className="form-row form-row-2">
                <label>Client ID <input type="text" readOnly disabled value={client.id} style={{ backgroundColor: '#f5f5f5' }} /></label>
                <label>Partner <input type="text" readOnly disabled value={partner ? `${partner.name} (${client.partnerId})` : client.partnerId || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
              </div>
              <div className="form-row form-row-2">
                <label>Client Name <input type="text" readOnly disabled value={client.companyName || client.clientName || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                <label>Status <input type="text" readOnly disabled value={(client.status || 'Active').toUpperCase()} style={{ backgroundColor: '#f5f5f5' }} /></label>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Contact Details</h4>
              <div className="form-row form-row-3">
                <label>Name <input type="text" readOnly disabled value={client.contactName || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                <label>Email <input type="text" readOnly disabled value={client.email || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                <label>Phone <input type="text" readOnly disabled value={client.phone || '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Login Email IDs</h4>
              <div className="form-row form-row-1">
                <label>Login Email IDs <input type="text" readOnly disabled value={(client.loginEmails && client.loginEmails.length > 0) ? client.loginEmails.join(', ') : '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
              </div>
            </div>
            <div className="form-section-actions">
              {isView && <Link to={`/dashboard/clients/edit/${client.id}`} className="btn-primary" style={{ textDecoration: 'none' }}>Edit</Link>}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
