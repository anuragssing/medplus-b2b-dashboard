import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import '../App.css'

const MAX_LOGIN_EMAILS = 20
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_LENGTH = 10
const isValidPhone = (value) => /^\d{10}$/.test((value || '').trim())

export default function CreateClient() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const pathname = location.pathname || ''
  const isView = pathname.includes('/view/')
  const isEdit = pathname.includes('/edit/')
  const isCreate = !id

  const { partners = [], clients = [], addClient, updateClient } = useDashboardStore()
  const organizationPartners = partners.filter((p) => p.partnerType === 'organization')
  const client = id ? (clients || []).find((c) => c.id === id) : null
  // One partner can have multiple clients: show all organization partners in the dropdown
  const organizationPartnersAvailable = organizationPartners

  const [partnerId, setPartnerId] = useState('')
  const [clientName, setClientName] = useState('')
  const [status, setStatus] = useState('active')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [loginEmailInput, setLoginEmailInput] = useState('')
  const [loginEmails, setLoginEmails] = useState([])
  const [loginEmailError, setLoginEmailError] = useState('')

  useEffect(() => {
    if (client) {
      setPartnerId(client.partnerId || '')
      setClientName(client.companyName || client.clientName || '')
      setStatus((client.status || 'active').toLowerCase())
      setContactName(client.contactName || '')
      setContactEmail(client.email || '')
      setContactPhone(client.phone || '')
      setLoginEmails(Array.isArray(client.loginEmails) ? [...client.loginEmails] : [])
    }
  }, [client?.id])

  useEffect(() => {
    if ((isView || isEdit) && id && !client) {
      navigate('/dashboard?tab=clients-vendors&sub=clients', { replace: true })
    }
  }, [id, client, isView, isEdit, navigate])

  const selectedPartner = partnerId ? organizationPartners.find((p) => p.id === partnerId) : null

  useEffect(() => {
    if (isCreate && selectedPartner) {
      setClientName(selectedPartner.name || '')
      const c = (selectedPartner.contact || '').trim()
      if (EMAIL_REGEX.test(c)) {
        setContactEmail(c)
        setContactName('')
      } else if (c) {
        setContactName(c)
        if (!contactEmail) setContactEmail('')
      }
      if (selectedPartner.phone) setContactPhone(selectedPartner.phone)
    }
  }, [isCreate, selectedPartner?.id])

  const handleAddLoginEmail = () => {
    setLoginEmailError('')
    const email = (loginEmailInput || '').trim().toLowerCase()
    if (!email) {
      setLoginEmailError('Please enter an email address.')
      return
    }
    if (!EMAIL_REGEX.test(email)) {
      setLoginEmailError('Please enter a valid email format.')
      return
    }
    if (loginEmails.includes(email)) {
      setLoginEmailError('This email is already added.')
      return
    }
    if (loginEmails.length >= MAX_LOGIN_EMAILS) {
      setLoginEmailError(`Maximum ${MAX_LOGIN_EMAILS} login emails allowed.`)
      return
    }
    setLoginEmails((prev) => [...prev, email])
    setLoginEmailInput('')
  }

  const handleRemoveLoginEmail = (index) => {
    setLoginEmails((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isEdit && id) {
      if (!(contactName && contactEmail && contactPhone)) {
        alert('Contact details (Name, Email, Phone) are mandatory.')
        return
      }
      if (!isValidPhone(contactPhone)) {
        alert('Phone Number must be numeric and exactly 10 digits.')
        return
      }
      updateClient(id, {
        status: status === 'inactive' ? 'inactive' : 'active',
        contactName: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        loginEmails: [...loginEmails],
      })
      navigate('/dashboard?tab=clients-vendors&sub=clients', { replace: true })
      return
    }
    if (!partnerId) {
      alert('Please select a partner.')
      return
    }
    if (!(clientName && clientName.trim())) {
      alert('Client Name is mandatory.')
      return
    }
    const nameNorm = (clientName || '').trim().toLowerCase()
    const duplicateNameSamePartner = (clients || []).some((c) => c.partnerId === partnerId && (c.companyName || c.clientName || '').trim().toLowerCase() === nameNorm)
    if (duplicateNameSamePartner) {
      alert('This partner already has a client with the same name. Client names must be unique per partner.')
      return
    }
    if (!(contactName && contactEmail && contactPhone)) {
      alert('Contact details (Name, Email, Phone) are mandatory.')
      return
    }
    if (!isValidPhone(contactPhone)) {
      alert('Phone Number must be numeric and exactly 10 digits.')
      return
    }
    addClient({
      partnerId,
      companyName: clientName,
      clientName: clientName,
      status: 'active',
      contactName: contactName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      loginEmails: [...loginEmails],
    })
    navigate('/dashboard?tab=clients-vendors&sub=clients', { replace: true })
  }

  const readOnlyAll = isView
  const readOnlyPartnerAndName = isEdit
  const backLink = '/dashboard?tab=clients-vendors&sub=clients'
  const title = isView ? 'View Client' : isEdit ? 'Edit Client' : 'Create Client'
  const desc = isView ? 'Client details (read-only).' : isEdit ? 'Update client details below. Partner and Client Name cannot be changed.' : 'Create a client (organization) by selecting an organization partner. Contact details can be auto-imported from the partner.'

  if ((isView || isEdit) && id && !client) {
    return (
      <div className="content">
        <section className="panel"><p style={{ padding: '1rem', textAlign: 'center' }}>Loading...</p></section>
      </div>
    )
  }

  return (
    <>
      <header className="main-header">
        {(isView || isEdit) && (
          <Link to={backLink} className="back-to-dashboard" style={{ display: 'inline-block', marginBottom: '0.5rem', textDecoration: 'none', color: 'var(--text-muted, #666)', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
        )}
        <h2 className="page-title">{title}</h2>
        <p className="page-desc">{desc}</p>
      </header>
      <div className="content">
        <section className="panel">
          <form className="form form-modal form-partner" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-section">
              <h4 className="form-section-title">| Client Details</h4>
              <div className="form-row form-row-2">
                <label>Partner * <select name="partner_id" required value={partnerId} onChange={(e) => setPartnerId(e.target.value)} disabled={readOnlyAll || readOnlyPartnerAndName}>
                  <option value="">Select Organization Partner...</option>
                  {(isCreate ? organizationPartnersAvailable : organizationPartners).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select></label>
                <label>Client Name * <input name="client_name" type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Same as partner name" readOnly={readOnlyAll || readOnlyPartnerAndName} disabled={readOnlyAll || readOnlyPartnerAndName} style={(readOnlyAll || readOnlyPartnerAndName) ? { backgroundColor: '#f5f5f5' } : undefined} /></label>
              </div>
              <div className="form-row form-row-2">
                <label>Status {isCreate ? <input type="text" readOnly value="Active" style={{ backgroundColor: '#f5f5f5' }} /> : <select name="client_status" value={status} onChange={(e) => setStatus(e.target.value)} disabled={readOnlyAll}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>}</label>
                <label />
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Contact Details</h4>
              {isCreate && <p className="form-hint" style={{ marginBottom: '0.75rem' }}>Auto-imported from partner if available. Please confirm or edit.</p>}
              <div className="form-row form-row-3">
                <label>Name * <input name="contact_name" type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact person" readOnly={readOnlyAll} disabled={readOnlyAll} style={readOnlyAll ? { backgroundColor: '#f5f5f5' } : undefined} /></label>
                <label>Email ID * <input name="contact_email" type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com" readOnly={readOnlyAll} disabled={readOnlyAll} style={readOnlyAll ? { backgroundColor: '#f5f5f5' } : undefined} /></label>
                <label>Phone Number * <input name="contact_phone" type="tel" inputMode="numeric" maxLength={PHONE_LENGTH} required value={contactPhone} onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, PHONE_LENGTH))} placeholder="10-digit number" readOnly={readOnlyAll} disabled={readOnlyAll} style={readOnlyAll ? { backgroundColor: '#f5f5f5' } : undefined} /></label>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Login Email IDs</h4>
              <div className="login-email-add-row">
                <label>Email <input type="email" value={loginEmailInput} onChange={(e) => { setLoginEmailInput(e.target.value); setLoginEmailError('') }} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLoginEmail())} placeholder="Add login email" readOnly={readOnlyAll} disabled={readOnlyAll} style={readOnlyAll ? { backgroundColor: '#f5f5f5' } : undefined} /></label>
                {!readOnlyAll && <button type="button" className="btn-add" onClick={handleAddLoginEmail}>Add</button>}
              </div>
              {loginEmailError && <p className="form-hint" style={{ color: 'var(--bs-danger)', marginBottom: '0.5rem' }}>{loginEmailError}</p>}
              {loginEmails.length > 0 && (
                <div className="table-wrap" style={{ marginTop: '0.75rem' }}>
                  <table className="request-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Email</th>
                        {!readOnlyAll && <th style={{ width: '120px' }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loginEmails.map((email, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{email}</td>
                          {!readOnlyAll && (
                            <td>
                              <button type="button" className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} onClick={() => handleRemoveLoginEmail(i)}>Delete</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {!readOnlyAll && (
              <div className="form-section-actions" style={{ justifyContent: 'flex-end' }}>
                {isCreate && <button type="submit" className="btn-primary">Create Client</button>}
                {isEdit && <button type="submit" className="btn-primary">Update</button>}
              </div>
            )}
          </form>
        </section>
      </div>
    </>
  )
}
