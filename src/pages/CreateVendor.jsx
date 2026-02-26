import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import '../App.css'

const VENDOR_TYPES = [
  { value: 'processing_vendor', label: 'Processing vendor' },
  { value: 'collection_vendor', label: 'Collection vendor' },
  { value: 'diagnostic_vendor', label: 'Diagnostic vendor' },
]
const MAX_LOGIN_EMAILS = 20
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_LENGTH = 10
const isValidPhone = (value) => /^\d{10}$/.test((value || '').trim())

export default function CreateVendor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const pathname = location.pathname || ''
  const isView = pathname.includes('/view/')
  const isEdit = pathname.includes('/edit/')
  const isCreate = !id

  const { partners = [], vendors = [], addVendor, updateVendor } = useDashboardStore()
  const thirdPartyPartners = partners.filter((p) => p.partnerType === 'third_party_partner')
  const vendor = id ? (vendors || []).find((v) => v.id === id) : null
  // One vendor per partner: in create mode only show partners that don't already have a vendor
  const partnersWithVendor = (vendors || []).map((v) => v.partnerId)
  const availablePartnersForVendor = isCreate
    ? thirdPartyPartners.filter((p) => !partnersWithVendor.includes(p.id))
    : thirdPartyPartners

  const [partnerId, setPartnerId] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [vendorType, setVendorType] = useState('')
  const [status, setStatus] = useState('active')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [loginEmailInput, setLoginEmailInput] = useState('')
  const [loginEmails, setLoginEmails] = useState([])
  const [loginEmailError, setLoginEmailError] = useState('')

  useEffect(() => {
    if (vendor) {
      setPartnerId(vendor.partnerId || '')
      setVendorName(vendor.name || '')
      setVendorType(vendor.type || '')
      setStatus((vendor.status || 'active').toLowerCase())
      setContactName(vendor.contactName || '')
      setContactEmail(vendor.email || '')
      setContactPhone(vendor.phone || '')
      setLoginEmails(Array.isArray(vendor.loginEmails) ? [...vendor.loginEmails] : [])
    }
  }, [vendor?.id])

  useEffect(() => {
    if ((isView || isEdit) && id && !vendor) {
      navigate('/dashboard?tab=clients-vendors&sub=vendors', { replace: true })
    }
  }, [id, vendor, isView, isEdit, navigate])

  const selectedPartner = partnerId ? thirdPartyPartners.find((p) => p.id === partnerId) : null
  const partnerAddress = selectedPartner?.addresses?.find((a) => a.isPrimary) || selectedPartner?.addresses?.[0] || null

  useEffect(() => {
    if (isCreate && selectedPartner) {
      setVendorName(selectedPartner.name || '')
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
      const nameNormEdit = (vendorName || '').trim().toLowerCase()
      const duplicateEdit = (vendors || []).some((v) => v.type === vendorType && v.id !== id && (v.name || '').trim().toLowerCase() === nameNormEdit)
      if (duplicateEdit) {
        alert('Another vendor of the same type already has this name. Each vendor of the same type must have a unique name.')
        return
      }
      updateVendor(id, {
        status: status === 'inactive' ? 'inactive' : 'active',
        contactName: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        loginEmails: [...loginEmails],
      })
      navigate('/dashboard?tab=clients-vendors&sub=vendors', { replace: true })
      return
    }
    if (!partnerId) {
      alert('Please select a partner.')
      return
    }
    if (partnersWithVendor.includes(partnerId)) {
      alert('This partner already has a vendor. Each partner can have only one vendor.')
      return
    }
    if (!(vendorName && vendorName.trim())) {
      alert('Vendor Name is mandatory.')
      return
    }
    if (!vendorType) {
      alert('Please select Vendor Type.')
      return
    }
    const nameNorm = (vendorName || '').trim().toLowerCase()
    const duplicateSameType = (vendors || []).some((v) => v.type === vendorType && v.id !== id && (v.name || '').trim().toLowerCase() === nameNorm)
    if (duplicateSameType) {
      alert('Another vendor of the same type already has this name. Each vendor of the same type must have a unique name.')
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
    addVendor({
      partnerId,
      name: vendorName.trim(),
      type: vendorType,
      status: 'active',
      contactName: contactName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      loginEmails: [...loginEmails],
    })
    navigate('/dashboard?tab=clients-vendors&sub=vendors', { replace: true })
  }

  const readOnlyAll = isView
  const readOnlyPartnerAndName = isEdit
  const backLink = '/dashboard?tab=clients-vendors&sub=vendors'
  const title = isView ? 'View Vendor' : isEdit ? 'Edit Vendor' : 'Create Vendor'
  const desc = isView ? 'Vendor details (read-only).' : isEdit ? 'Update vendor details below. Partner and Vendor Name cannot be changed.' : 'Create a vendor by selecting a Third Party Partner. Contact details are mandatory.'

  if ((isView || isEdit) && id && !vendor) {
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
              <h4 className="form-section-title">| Vendor Details</h4>
              <div className="form-row form-row-2">
                <label>Partner * <select name="partner_id" required value={partnerId} onChange={(e) => setPartnerId(e.target.value)} disabled={readOnlyAll || readOnlyPartnerAndName}>
                  <option value="">Select Third Party Partner...</option>
                  {availablePartnersForVendor.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select></label>
                <label>Vendor Name * <input name="vendor_name" type="text" required value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Vendor name" readOnly={readOnlyAll || readOnlyPartnerAndName} disabled={readOnlyAll || readOnlyPartnerAndName} style={(readOnlyAll || readOnlyPartnerAndName) ? { backgroundColor: '#f5f5f5' } : undefined} /></label>
              </div>
              {isCreate && availablePartnersForVendor.length === 0 && (
                <p className="form-hint" style={{ color: 'var(--bs-warning)', marginBottom: '0.5rem' }}>No partners available. Each partner can have only one vendor; all third party partners already have a vendor.</p>
              )}
              <div className="form-row form-row-2">
                <label>Type * <select name="vendor_type" required value={vendorType} onChange={(e) => setVendorType(e.target.value)} disabled={readOnlyAll || isEdit}>
                  <option value="">Select type...</option>
                  {VENDOR_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select></label>
                <label>Status {isCreate ? <input type="text" readOnly value="Active" style={{ backgroundColor: '#f5f5f5' }} /> : <select name="vendor_status" value={status} onChange={(e) => setStatus(e.target.value)} disabled={readOnlyAll}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>}</label>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Contact Details</h4>
              <div className="form-row form-row-3">
                <label>Name * <input name="contact_name" type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact person" readOnly={readOnlyAll} disabled={readOnlyAll} style={readOnlyAll ? { backgroundColor: '#f5f5f5' } : undefined} /></label>
                <label>Email ID * <input name="contact_email" type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com" readOnly={readOnlyAll} disabled={readOnlyAll} style={readOnlyAll ? { backgroundColor: '#f5f5f5' } : undefined} /></label>
                <label>Phone Number * <input name="contact_phone" type="tel" inputMode="numeric" maxLength={PHONE_LENGTH} required value={contactPhone} onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, PHONE_LENGTH))} placeholder="10-digit number" readOnly={readOnlyAll} disabled={readOnlyAll} style={readOnlyAll ? { backgroundColor: '#f5f5f5' } : undefined} /></label>
              </div>
            </div>
            {selectedPartner && (
              <div className="form-section">
                <h4 className="form-section-title">| Partner Address</h4>
                <div className="form-row form-row-2">
                  <label>Address label <input type="text" readOnly disabled value={partnerAddress?.addressLabel ?? '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                  <label>Address <input type="text" readOnly disabled value={partnerAddress?.address ?? '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                </div>
                <div className="form-row form-row-3">
                  <label>City <input type="text" readOnly disabled value={partnerAddress?.city ?? '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                  <label>State <input type="text" readOnly disabled value={partnerAddress?.state ?? '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                  <label>Pincode <input type="text" readOnly disabled value={partnerAddress?.pincode ?? '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                </div>
                <div className="form-row form-row-2">
                  <label>Country <input type="text" readOnly disabled value={partnerAddress?.country ?? '—'} style={{ backgroundColor: '#f5f5f5' }} /></label>
                </div>
              </div>
            )}
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
                {isCreate && <button type="submit" className="btn-primary">Create Vendor</button>}
                {isEdit && <button type="submit" className="btn-primary">Update</button>}
              </div>
            )}
          </form>
        </section>
      </div>
    </>
  )
}
