import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboardStore } from '../store/dashboardStore.jsx'

export default function CreatePackage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { clients = [], partners = [], addPackage } = useDashboardStore()
  const isAdmin = user?.type === 'bd_admin'
  const [selectedClientId, setSelectedClientId] = useState('')
  const selectedClient = selectedClientId ? clients.find((c) => c.id === selectedClientId) : null
  const orgForPackage = selectedClient ? partners.find((p) => p.id === selectedClient.partnerId) : null

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const amount = fd.get('package_amount')
    addPackage({
      clientId: fd.get('package_organization') || '',
      name: fd.get('package_name') || '',
      tests: Number(fd.get('package_tests')) || 0,
      price: amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '—',
      validMonths: Number(fd.get('package_validMonths')) || 12,
    })
    navigate('/dashboard?tab=package', { replace: true })
  }

  return (
    <>
      <header className="main-header">
        <h2 className="page-title">Package Registration</h2>
        {isAdmin && (
          <p className="page-desc" style={{ marginBottom: '0.25rem' }}>
            Client: {selectedClient ? `${selectedClient.companyName || selectedClient.clientName} (ID: ${selectedClient.id})` : 'Select client from dropdown below.'}
          </p>
        )}
        <p className="page-desc">Fill in the details below to configure a new test package.</p>
      </header>
      <div className="content">
        <section className="panel">
          <form className="form form-modal" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-section">
              <h4 className="form-section-title form-section-title-accent">Package Details</h4>
              <div className="form-row form-row-2">
                <label>Client <select name="package_organization" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}><option value="">Select client</option>{clients.filter(c => (c.companyName || c.clientName) && (c.companyName || c.clientName).trim()).map(c => <option key={c.id} value={c.id}>{c.companyName || c.clientName}</option>)}</select></label>
                <label>Package Name <input name="package_name" type="text" placeholder="e.g. Executive Health Checkup" /></label>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title form-section-title-accent">Test Configuration</h4>
              <div className="form-row form-row-1">
                <label>Select Tests / Count <input name="package_tests" type="number" placeholder="Number of tests" min={0} /></label>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title form-section-title-accent">Package Summary</h4>
              <p className="modal-subtitle" style={{ marginTop: 0 }}>Review the package details and set the final pricing.</p>
              <div className="form-row form-row-2">
                <label>Total Package Amount (₹) <input name="package_amount" type="number" placeholder="0" min={0} step={1} /></label>
                <label>Valid (months) <input name="package_validMonths" type="number" placeholder="12" min={1} defaultValue={12} /></label>
              </div>
            </div>
            <div className="form-section-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <Link to="/dashboard?tab=package" className="btn-secondary" style={{ textDecoration: 'none' }}>Reset</Link>
              <button type="submit" className="btn-primary btn-primary-red">Create Package</button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}
