import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import { INDIAN_STATES, CITIES_BY_STATE } from '../data/indiaLocations.js'

const PARTNER_TYPES = [
  { value: 'organization', label: 'Organization Partner' },
  { value: 'third_party_partner', label: 'Third Party Partner' },
]
const MAX_HR_EMAILS = 20
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_MAX_LENGTH = 10
// Indian PAN: 5 letters, 4 digits, 1 letter (e.g. AABCM1234F)
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/

const STATE_CITIES = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Boduppal'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai', 'Thane'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Malappuram', 'Kannur', 'Kasaragod'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
}
const STATES = Object.keys(STATE_CITIES).sort()

export default function CreatePartner() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const mode = location.pathname.includes('/view/') ? 'view' : location.pathname.includes('/edit/') ? 'edit' : 'create'
  const partners = useDashboardStore((s) => s.partners) || []
  const addPartner = useDashboardStore((s) => s.addPartner)
  const updatePartner = useDashboardStore((s) => s.updatePartner)
  const [partnerPhone, setPartnerPhone] = useState('')
  const [partnerEmail, setPartnerEmail] = useState('')
  const [partnerPan, setPartnerPan] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [panError, setPanError] = useState('')
  const [selectedAddressType, setSelectedAddressType] = useState('primary')
  const [partnerType, setPartnerType] = useState('')
  const [hrEmails, setHrEmails] = useState([])
  const [hrEmailInput, setHrEmailInput] = useState('')
  const [hrEmailError, setHrEmailError] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [addressType, setAddressType] = useState('OFFICE')
  const [addressLabel, setAddressLabel] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [country, setCountry] = useState('India')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const citiesForState = STATE_CITIES[state] || []
  const cityOptions = city && !citiesForState.includes(city) ? [city, ...citiesForState] : citiesForState
  const [dlNumber, setDlNumber] = useState('')
  const [dlNumberExpiry, setDlNumberExpiry] = useState('')
  const [fssai, setFssai] = useState('')
  const [fssaiExpiry, setFssaiExpiry] = useState('')
  const [addressList, setAddressList] = useState([])
  const [editingAddressIndex, setEditingAddressIndex] = useState(null)
  const [addressFieldErrors, setAddressFieldErrors] = useState({})
  const [contactErrors, setContactErrors] = useState({})
  const [addressRequiredError, setAddressRequiredError] = useState(false)
  const [agreementFiles, setAgreementFiles] = useState([]) // each item: { file, previewUrl } (previewUrl for images only)
  const agreementInputRef = useRef(null)
  const agreementFilesRef = useRef(agreementFiles)
  agreementFilesRef.current = agreementFiles

  const isView = mode === 'view'
  const isEdit = mode === 'edit'
  const partner = id ? partners.find((p) => p.id === id) : null

  useEffect(() => {
    if (partner) {
      setPartnerType(partner.partnerType || '')
      setHrEmails(Array.isArray(partner.hrEmails) ? [...partner.hrEmails] : [])
      if (partner.pan != null && partner.pan !== '') setPartnerPan(String(partner.pan).toUpperCase().slice(0, 10))
      if (partner.phone != null && String(partner.phone).trim() !== '') setPartnerPhone(String(partner.phone).replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH))
      const c = (partner.contact || '').trim()
      if (c) {
        if (EMAIL_REGEX.test(c)) setPartnerEmail(c)
        else if (!(partner.phone != null && String(partner.phone).trim() !== '')) setPartnerPhone(c.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH))
      }
      setAddressList(Array.isArray(partner.addresses) && partner.addresses.length > 0 ? [...partner.addresses] : [])
      // Load persisted agreement documents so they show when viewing/editing
      const docs = Array.isArray(partner.agreementDocuments) ? partner.agreementDocuments : []
      setAgreementFiles(docs.map((d) => ({
        file: null,
        previewUrl: d.dataUrl || null,
        name: d.name,
        type: d.type || (d.name && /\.pdf$/i.test(d.name) ? 'application/pdf' : ''),
      })))
    } else {
      setAgreementFiles([])
    }
  }, [partner?.id])

  useEffect(() => {
    if ((isView || isEdit) && id && !partner) {
      navigate('/dashboard?tab=partners', { replace: true })
    }
  }, [id, partner, isView, isEdit, navigate])

  const handleAddHrEmail = () => {
    setHrEmailError('')
    const email = (hrEmailInput || '').trim().toLowerCase()
    if (!email) {
      setHrEmailError('Please enter an email address.')
      return
    }
    if (!EMAIL_REGEX.test(email)) {
      setHrEmailError('Please enter a valid email format (e.g. hr@company.com).')
      return
    }
    if (hrEmails.includes(email)) {
      setHrEmailError('This email is already added.')
      return
    }
    if (hrEmails.length >= MAX_HR_EMAILS) {
      setHrEmailError(`Maximum ${MAX_HR_EMAILS} HR emails allowed.`)
      return
    }
    setHrEmails((prev) => [...prev, email])
    setHrEmailInput('')
  }

  const fileToStoredDoc = (item) => {
    if (item.file) return null
    return {
      name: item.name || 'File',
      type: item.type || '',
      dataUrl: item.previewUrl && item.previewUrl.startsWith('data:') ? item.previewUrl : undefined,
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const contactName = (fd.get('partner_contactName') || '').trim()
    const cErrors = {}
    if (!contactName) cErrors.contactName = true
    const phoneTrim = (partnerPhone || '').trim()
    if (!phoneTrim) cErrors.contactPhone = true
    if (phoneTrim && phoneTrim.length !== PHONE_MAX_LENGTH) {
      setPhoneError('Phone must be exactly 10 digits.')
      setContactErrors(cErrors)
      return
    }
    setPhoneError('')
    if (!(partnerEmail || '').trim()) cErrors.contactEmail = true
    if (Object.keys(cErrors).length > 0) {
      setContactErrors(cErrors)
      return
    }
    const panTrim = (partnerPan || '').trim()
    if (panTrim && !PAN_REGEX.test(panTrim)) {
      setPanError('Invalid PAN. Format: 5 letters, 4 digits, 1 letter (e.g. AABCM1234F).')
      return
    }
    setPanError('')
    if (addressList.length === 0) {
      setAddressRequiredError(true)
      return
    }
    setContactErrors({})
    setAddressRequiredError(false)
    const contact = partnerEmail || partnerPhone || contactName || '—'
    const type = fd.get('partner_type') || 'organization'
    const collectedHrEmails = type === 'organization' ? hrEmails.filter(Boolean).slice(0, MAX_HR_EMAILS) : []

    const persistedDocs = agreementFiles.filter((i) => !i.file).map(fileToStoredDoc).filter(Boolean)
    const newFiles = agreementFiles.filter((i) => i.file)
    const readNewDocs = await Promise.all(
      newFiles.map((item) => {
        const file = item.file
        const isImage = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file?.type || '')
        if (isImage) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result })
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        }
        return Promise.resolve({ name: file.name, type: file.type || 'application/pdf', dataUrl: undefined })
      })
    )
    const agreementDocuments = [...persistedDocs, ...readNewDocs]

    const payload = {
      name: fd.get('partner_name') || '',
      partnerType: type,
      contact,
      phone: (partnerPhone || '').trim().slice(0, PHONE_MAX_LENGTH) || undefined,
      status: fd.get('partner_status') || 'active',
      addresses: [...addressList],
      ...(panTrim ? { pan: panTrim } : {}),
      ...(type === 'organization' ? { hrEmails: collectedHrEmails } : {}),
      ...(agreementDocuments.length > 0 ? { agreementDocuments } : {}),
    }
    if (isEdit && id) {
      updatePartner(id, payload)
      navigate('/dashboard?tab=partners', { replace: true })
    } else {
      addPartner(payload)
      navigate('/dashboard?tab=partners', { replace: true })
    }
  }

  const isImageType = (file) => /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file?.type || '')

  const handleAgreementFileChange = (e) => {
    const files = e.target.files
    if (!files?.length) return
    const next = Array.from(files).slice(0, 10).map((file) => {
      const previewUrl = isImageType(file) ? URL.createObjectURL(file) : null
      return { file, previewUrl }
    })
    setAgreementFiles((prev) => [...prev, ...next].slice(0, 10))
    e.target.value = ''
  }

  const removeAgreementFile = (index) => {
    setAgreementFiles((prev) => {
      const item = prev[index]
      if (item?.previewUrl && item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  useEffect(() => {
    return () => {
      (agreementFilesRef.current || []).forEach((item) => {
        if (item?.previewUrl && item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

  const backLink = isView || isEdit ? '/dashboard?tab=partners' : '/dashboard?tab=partners'
  const title = isView ? 'View Partner' : isEdit ? 'Edit Partner' : 'Partner Creation'
  const desc = isView ? 'Partner details (read-only).' : isEdit ? 'Update partner details below.' : 'Fill in the details below to register as a new partner.'
  const readOnly = isView

  const abbr = (str, len = 2) => (str || '').trim().toUpperCase().slice(0, len)
  const cityAbbr = (c) => (c || '').trim().length >= 3 ? (c || '').trim().toUpperCase().slice(0, 3) : (c || '').trim().toUpperCase()
  const formatAddressLine = (addr) => {
    if (!addr || !addr.address) return '—'
    const st = addr.pincode ? `${abbr(addr.state, 2)} - ${addr.pincode}` : abbr(addr.state, 2)
    return [addr.address, cityAbbr(addr.city), st, abbr(addr.country, 2)].filter(Boolean).join(', ')
  }
  const statePincode = pincode ? `${abbr(state, 2)} - ${pincode}` : abbr(state, 2)
  const formattedAddress = [address, cityAbbr(city), statePincode, abbr(country, 2)].filter(Boolean).join(', ')

  const handleStateChange = (newState) => {
    setState(newState)
    const cities = STATE_CITIES[newState] || []
    setCity(cities.includes(city) ? city : (cities[0] || ''))
  }

  const clearAddressFieldError = (field) => {
    setAddressFieldErrors((prev) => ({ ...prev, [field]: false }))
  }

  const handleAddressReset = () => {
    setAddressType('OFFICE')
    setAddressLabel('')
    setAddress('')
    setPincode('')
    setCountry('India')
    setState('')
    setCity('')
    setDlNumber('')
    setDlNumberExpiry('')
    setFssai('')
    setFssaiExpiry('')
    setEditingAddressIndex(null)
    setAddressFieldErrors({})
  }

  const getFormAddress = () => ({
    id: editingAddressIndex !== null ? addressList[editingAddressIndex]?.id : Date.now(),
    addressType: addressType || 'OFFICE',
    addressLabel,
    address,
    pincode,
    country,
    state,
    city,
    dlNumber,
    dlNumberExpiry,
    fssai,
    fssaiExpiry,
    isPrimary: addressList.length === 0,
  })

  const mandatoryAddressFields = ['addressType', 'addressLabel', 'address', 'pincode', 'country', 'state', 'city']
  const getAddressFieldValues = () => ({ addressType, addressLabel, address, pincode, country, state, city })

  const handleAddressAdd = () => {
    const values = getAddressFieldValues()
    const errors = {}
    mandatoryAddressFields.forEach((field) => {
      const val = values[field]
      if (field === 'addressType' && !(addressType || '').trim()) errors.addressType = true
      else if (field === 'addressLabel' && !(addressLabel || '').trim()) errors.addressLabel = true
      else if (field === 'address' && !(address || '').trim()) errors.address = true
      else if (field === 'pincode' && !(pincode || '').trim()) errors.pincode = true
      else if (field === 'country' && !(country || '').trim()) errors.country = true
      else if (field === 'state' && !(state || '').trim()) errors.state = true
      else if (field === 'city' && !(city || '').trim()) errors.city = true
    })
    if (Object.keys(errors).length > 0) {
      setAddressFieldErrors((prev) => ({ ...prev, ...errors }))
      return
    }
    setAddressFieldErrors({})
    setAddressRequiredError(false)
    const item = getFormAddress()
    if (editingAddressIndex !== null) {
      const wasPrimary = addressList[editingAddressIndex]?.isPrimary
      setAddressList((prev) => prev.map((a, i) => (i === editingAddressIndex ? { ...item, isPrimary: wasPrimary } : a)))
      setEditingAddressIndex(null)
    } else {
      setAddressList((prev) => (prev.length === 0 ? [{ ...item, isPrimary: true }] : [...prev, { ...item, isPrimary: false }]))
    }
    handleAddressReset()
  }

  const handleSetPrimary = (index) => {
    setAddressList((prev) => prev.map((a, i) => ({ ...a, isPrimary: i === index })))
  }

  const handleDeleteAddress = (index) => {
    const wasPrimary = addressList[index]?.isPrimary
    setAddressList((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (wasPrimary && next.length > 0) next[0].isPrimary = true
      return next
    })
    if (editingAddressIndex === index) handleAddressReset()
    else if (editingAddressIndex != null && index < editingAddressIndex) setEditingAddressIndex((i) => i - 1)
  }

  const handleEditAddress = (index) => {
    const a = addressList[index]
    if (!a) return
    setAddressType(a.addressType || 'OFFICE')
    setAddressLabel(a.addressLabel || '')
    setAddress(a.address || '')
    setPincode(a.pincode || '')
    setCountry(a.country || 'India')
    setState(a.state || '')
    setCity(a.city || '')
    setDlNumber(a.dlNumber || '')
    setDlNumberExpiry(a.dlNumberExpiry || '')
    setFssai(a.fssai || '')
    setFssaiExpiry(a.fssaiExpiry || '')
    setEditingAddressIndex(index)
  }

  return (
    <>
      <header className="main-header">
        <Link to={backLink} className="back-to-dashboard" style={{ display: 'inline-block', marginBottom: '0.5rem', textDecoration: 'none', color: 'var(--text-muted, #666)', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
        <h2 className="page-title">{title}</h2>
        <p className="page-desc">{desc}</p>
      </header>
      <div className="content">
        <section className="panel">
          <form className="form form-modal form-partner" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-section">
              <h4 className="form-section-title">| Partner Type</h4>
              <div className="form-row form-row-3">
                <label>Partner Type * <select name="partner_type" required disabled={readOnly} value={partnerType || partner?.partnerType || ''} onChange={(e) => setPartnerType(e.target.value)}>
                  <option value="">Select Partner Type...</option>
                  {PARTNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select></label>
                <label />
                <label />
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Partner Details</h4>
              {(isView || isEdit) && (
                <div className="form-row form-row-3">
                  <label>Partner Code <input type="text" placeholder="Auto-generated" readOnly disabled /></label>
                  <label>Partner Id <input type="text" placeholder="Auto-generated" value={partner?.id ?? ''} readOnly disabled /></label>
                  <label />
                </div>
              )}
              <div className="form-row form-row-3">
                <label>GST Type <select disabled={readOnly}><option value="">Select</option><option>Register</option><option>Unregister</option></select></label>
                <label>GSTIN NO <input type="text" placeholder="e.g. 36AAQFM1085K1ZT" readOnly={readOnly} /></label>
                <label>GSTIN State Code <input type="text" placeholder="e.g. 36" readOnly={readOnly} /></label>
              </div>
              <div className="form-row form-row-3">
                <label>Status <select name="partner_status" disabled={readOnly} defaultValue={partner?.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select></label>
                <label>Name * <input name="partner_name" type="text" placeholder="Partner name" required readOnly={readOnly} defaultValue={partner?.name} /></label>
                <label>PAN Number * <input type="text" name="partner_pan" placeholder="e.g. AABCM1234F" maxLength={10} value={partnerPan} onChange={(e) => { const v = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10); setPartnerPan(v); setPanError('') }} readOnly={readOnly} required={!readOnly} className={panError ? 'input-error' : ''} aria-invalid={!!panError} />{panError && <span className="field-mandatory-msg">{panError}</span>}</label>
              </div>
              <div className="form-row form-row-3">
                <label>MSME Type <input type="text" placeholder="Optional" readOnly={readOnly} /></label>
                <label>MSME Category <input type="text" placeholder="Optional" readOnly={readOnly} /></label>
                <label />
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Contact Details</h4>
              <div className="form-row form-row-3">
                <label>Name * <input name="partner_contactName" type="text" placeholder="Contact person name" readOnly={readOnly} defaultValue={partner?.contact} className={contactErrors.contactName ? 'input-error' : ''} onChange={() => setContactErrors((p) => ({ ...p, contactName: false }))} />{contactErrors.contactName && <span className="field-mandatory-msg">Mandatory</span>}</label>
                <label>Phone Number * <input type="tel" name="partner_phone" inputMode="numeric" placeholder="10-digit mobile" maxLength={PHONE_MAX_LENGTH} value={partnerPhone} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH); setPartnerPhone(v); setPhoneError(''); setContactErrors((p) => ({ ...p, contactPhone: false })) }} readOnly={readOnly} disabled={readOnly} className={contactErrors.contactPhone || phoneError ? 'input-error' : ''} />{(contactErrors.contactPhone && <span className="field-mandatory-msg">Mandatory</span>) || (phoneError && <span className="field-mandatory-msg">{phoneError}</span>)}</label>
                <label>Email ID * <input type="email" name="partner_email" placeholder="email@example.com" value={partnerEmail} onChange={(e) => { setPartnerEmail(e.target.value); setContactErrors((p) => ({ ...p, contactEmail: false })) }} readOnly={readOnly} disabled={readOnly} className={contactErrors.contactEmail ? 'input-error' : ''} />{contactErrors.contactEmail && <span className="field-mandatory-msg">Mandatory</span>}</label>
              </div>
              <div className="form-row form-row-3">
                <label>Fax Number <input type="text" placeholder="Optional" readOnly={readOnly} /></label>
                <label />
                <label />
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">| Business Address Details</h4>
              <div className="form-row form-row-4">
                <label>Address Type (Eg:Home, Office etc.,) * <input type="text" placeholder="Eg:Home, Office etc.," value={addressType} onChange={(e) => { setAddressType(e.target.value); clearAddressFieldError('addressType') }} readOnly={readOnly} className={addressFieldErrors.addressType ? 'input-error' : ''} />{addressFieldErrors.addressType && <span className="field-mandatory-msg">Mandatory</span>}</label>
                <label>Address Label * <input type="text" placeholder="Address Label" value={addressLabel} onChange={(e) => { setAddressLabel(e.target.value); clearAddressFieldError('addressLabel') }} readOnly={readOnly} className={addressFieldErrors.addressLabel ? 'input-error' : ''} />{addressFieldErrors.addressLabel && <span className="field-mandatory-msg">Mandatory</span>}</label>
                <label>Address * <input type="text" placeholder="Full address" value={address} onChange={(e) => { setAddress(e.target.value); clearAddressFieldError('address') }} readOnly={readOnly} className={addressFieldErrors.address ? 'input-error' : ''} />{addressFieldErrors.address && <span className="field-mandatory-msg">Mandatory</span>}</label>
                <label>Pincode * <input type="text" inputMode="numeric" placeholder="e.g. 506003" maxLength={6} value={pincode} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setPincode(v); clearAddressFieldError('pincode') }} readOnly={readOnly} className={addressFieldErrors.pincode ? 'input-error' : ''} />{addressFieldErrors.pincode && <span className="field-mandatory-msg">Mandatory</span>}</label>
              </div>
              <div className="form-row form-row-3">
                <label>Country * <select value={country} onChange={(e) => { setCountry(e.target.value); clearAddressFieldError('country') }} readOnly={readOnly} disabled={readOnly} style={{ pointerEvents: readOnly ? 'none' : 'auto' }} className={addressFieldErrors.country ? 'input-error' : ''}><option value="India">India</option></select>{addressFieldErrors.country && <span className="field-mandatory-msg">Mandatory</span>}</label>
                <label>State * <select value={state} onChange={(e) => { handleStateChange(e.target.value); clearAddressFieldError('state') }} disabled={readOnly} className={addressFieldErrors.state ? 'input-error' : ''}><option value="">Select state</option>{STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select>{addressFieldErrors.state && <span className="field-mandatory-msg">Mandatory</span>}</label>
                <label>City * <select value={city} onChange={(e) => { setCity(e.target.value); clearAddressFieldError('city') }} disabled={readOnly} className={addressFieldErrors.city ? 'input-error' : ''}><option value="">Select city</option>{cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}</select>{addressFieldErrors.city && <span className="field-mandatory-msg">Mandatory</span>}</label>
              </div>
              <div className="form-row form-row-4">
                <label>DL Number <input type="text" placeholder="DL Number" value={dlNumber} onChange={(e) => setDlNumber(e.target.value)} readOnly={readOnly} /></label>
                <label>DL Number Expiry <input type="text" placeholder="dd / mm / yyyy" value={dlNumberExpiry} onChange={(e) => setDlNumberExpiry(e.target.value)} readOnly={readOnly} /></label>
                <label>FSSAI <input type="text" placeholder="FSSAI" value={fssai} onChange={(e) => setFssai(e.target.value)} readOnly={readOnly} /></label>
                <label>FSSAI Expiry <input type="text" placeholder="dd / mm / yyyy" value={fssaiExpiry} onChange={(e) => setFssaiExpiry(e.target.value)} readOnly={readOnly} /></label>
              </div>
              <div className="form-row" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {!readOnly && <button type="button" className="btn-add btn-add--teal" onClick={handleAddressAdd}>{editingAddressIndex !== null ? 'Update' : 'Add'}</button>}
                {!readOnly && <button type="button" className="btn-secondary" onClick={handleAddressReset}>Reset</button>}
              </div>
              <div className="selected-address-section">
                <h5>Selected Address</h5>
                {addressRequiredError && <p className="field-mandatory-msg" style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>At least one address is required for partner creation.</p>}
                {addressList.length === 0 ? (
                  <p className="address-empty-hint">No address added. Fill the fields above and click Add.</p>
                ) : (
                  <div className="address-cards">
                    {addressList.map((addr, index) => (
                      <div key={addr.id} className={`address-card ${addr.isPrimary ? 'address-card--primary' : ''}`}>
                        <div className="address-tags">
                          {addr.isPrimary && <span className="address-tag address-tag--primary">Primary Address</span>}
                          <span className="address-tag address-tag--type">{(addr.addressType || 'Office').toUpperCase()}</span>
                        </div>
                        <dl className="address-card-details">
                          <dt>Address Type</dt><dd>{addr.addressType || '—'}</dd>
                          <dt>Address Label</dt><dd>{addr.addressLabel || '—'}</dd>
                          <dt>Address</dt><dd>{addr.address || '—'}</dd>
                          <dt>Pincode</dt><dd>{addr.pincode || '—'}</dd>
                          <dt>Country</dt><dd>{addr.country || '—'}</dd>
                          <dt>State</dt><dd>{addr.state || '—'}</dd>
                          <dt>City</dt><dd>{addr.city || '—'}</dd>
                        </dl>
                        {!readOnly && (
                          <div className="address-card-footer">
                            <button type="button" className="btn-link" onClick={() => handleEditAddress(index)}>Edit</button>
                            {!addr.isPrimary && (
                              <>
                                <button type="button" className="btn-link" onClick={() => handleSetPrimary(index)}>Set as Primary Address</button>
                                <button type="button" className="btn-link btn-link--danger" onClick={() => handleDeleteAddress(index)}>Delete</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {((partnerType || partner?.partnerType) === 'organization') && (
              <div className="form-section">
                <h4 className="form-section-title">| HR Email IDs (for OTP login)</h4>
                <p className="form-hint" style={{ marginBottom: '0.75rem' }}>Add HR emails. These users can sign in with email + OTP and see data for this organization.</p>
                <div className="form-row form-row-1" style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="hr@company.com"
                      value={hrEmailInput}
                      onChange={(e) => { setHrEmailInput(e.target.value); setHrEmailError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHrEmail())}
                      readOnly={readOnly}
                      autoComplete="off"
                      style={{ flex: '1', minWidth: '200px' }}
                    />
                    {!readOnly && (
                      <button type="button" className="btn-add" onClick={handleAddHrEmail}>Add Email</button>
                    )}
                  </label>
                </div>
                {hrEmailError && <p className="form-hint" style={{ color: 'var(--error, #c00)', marginBottom: '0.5rem' }}>{hrEmailError}</p>}
                {hrEmails.length > 0 && (
                  <div className="table-wrap" style={{ marginTop: '0.75rem' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Email</th>
                          {!readOnly && <th style={{ width: '80px' }}>Action</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {hrEmails.map((email, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{email}</td>
                            {!readOnly && (
                              <td>
                                <button type="button" className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} onClick={() => setHrEmails((prev) => prev.filter((_, j) => j !== i))}>Remove</button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            <div className="form-section">
              <h4 className="form-section-title">| Agreement Documents</h4>
              <div className="upload-actions">
                <input ref={agreementInputRef} type="file" accept=".jpg,.jpeg,.pdf,.png" multiple style={{ display: 'none' }} onChange={handleAgreementFileChange} />
                <button type="button" className="btn-browse-primary" disabled={readOnly} onClick={() => agreementInputRef.current?.click()}>
                  📁 Browse Files
                </button>
              </div>
              <p className="upload-supported">Supported Files: .jpg, .jpeg, .pdf, .png</p>
              {agreementFiles.length > 0 && (
                <ul className="uploaded-files-list" style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {agreementFiles.map((item, i) => {
                    const file = item.file
                    const displayName = item.name || file?.name || 'File'
                    const mime = (item.type || file?.type || '').toLowerCase()
                    const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(displayName)
                    return (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa' }}>
                        {item.previewUrl ? (
                          <img src={item.previewUrl} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '4px' }} />
                        ) : isPdf ? (
                          <div style={{ width: 48, height: 48, background: '#e53935', color: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600 }}>PDF</div>
                        ) : null}
                        <span style={{ flex: 1, minWidth: 0, fontSize: '0.875rem' }} title={displayName}>{displayName}</span>
                        {!readOnly && <button type="button" className="btn-link btn-link--danger" style={{ flexShrink: 0 }} onClick={() => removeAgreementFile(i)}>Remove</button>}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
            <div className="form-section-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Link to={backLink} className="btn-secondary" style={{ textDecoration: 'none' }}>Cancel</Link>
              {!readOnly && <button type="submit" className="btn-primary">{isEdit ? 'Update Partner' : 'Create Partner'}</button>}
            </div>
          </form>
        </section>
      </div>
    </>
  )
}
