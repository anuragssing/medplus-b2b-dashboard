import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import { FaEdit, FaEye, FaPlusCircle } from 'react-icons/fa'
import '../App.css'

const VENDOR_TYPE_LABELS = {
  processing_vendor: 'Processing vendor',
  collection_vendor: 'Collection vendor',
  diagnostic_vendor: 'Diagnostic vendor',
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const clientsVendorsSubTab = searchParams.get('sub') || 'clients' // 'clients' | 'vendors'

  const [partnersPage, setPartnersPage] = useState(1)
  const [partnersPageSize, setPartnersPageSize] = useState(25)

  const { partners = [], vendors = [], clients = [], benefits = [], packages = [] } = useDashboardStore()
  const organizations = partners.filter((p) => p.partnerType === 'organization')
  const comboBenefits = useMemo(() => (benefits || []).filter((b) => b.type === 'combo'), [benefits])
  const getClientName = (id) => clients.find(c => c.id === id)?.companyName || clients.find(c => c.id === id)?.clientName || '—'
  const getClientIdForPartner = (partnerId) => (clients || []).find((c) => c.partnerId === partnerId)?.id ?? null

  const partnersPaged = useMemo(() => {
    const start = (partnersPage - 1) * partnersPageSize
    return partners.slice(start, start + partnersPageSize)
  }, [partners, partnersPage, partnersPageSize])

  const partnersTotalPages = Math.max(1, Math.ceil(partners.length / partnersPageSize))

  const setClientsVendorsSubTab = (sub) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      p.set('sub', sub)
      return p
    })
  }

  return (
    <>
      <header className="main-header">
          <h2 className="page-title">
            {activeTab === 'overview' && 'Overview (Command Centre)'}
            {activeTab === 'organizations' && 'Manage Organizations'}
            {activeTab === 'benefit' && 'Benefit'}
            {activeTab === 'package' && 'Package'}
            {activeTab === 'partners' && 'Manage Partners'}
            {activeTab === 'clients-vendors' && 'Manage Clients & Vendors'}
          </h2>
          <p className="page-desc">
            {activeTab === 'overview' && 'Real-time snapshot of the B2B business'}
            {activeTab === 'organizations' && 'Organizations are partners with type Organization. Create opens partner creation.'}
            {activeTab === 'benefit' && 'Benefit plans and configuration'}
            {activeTab === 'package' && 'Test packages and pricing'}
            {activeTab === 'partners' && 'Onboard and manage service partners'}
            {activeTab === 'clients-vendors' && 'View and manage clients (organizations) and vendors. Use Create Client or Create Vendor to add new entries.'}
          </p>
        </header>

        <div className="content">
          {activeTab === 'overview' && (
            <section className="overview-kpis">
              <div className="kpi-card"><span className="kpi-value">{clients.length}</span><span className="kpi-label">Active Client Organizations</span></div>
              <div className="kpi-card"><span className="kpi-value">{packages.length}</span><span className="kpi-label">Active Plans / Packages</span></div>
              <div className="kpi-card"><span className="kpi-value">{partners.filter(p => p.status === 'active').length}</span><span className="kpi-label">Active Partners</span></div>
              <div className="kpi-card"><span className="kpi-value">0</span><span className="kpi-label">Pending Approvals</span></div>
              <div className="kpi-card"><span className="kpi-value">0</span><span className="kpi-label">Pending Offline Payments</span></div>
              <div className="kpi-card"><span className="kpi-value">0</span><span className="kpi-label">Open Grievances</span></div>
            </section>
          )}

          {activeTab === 'organizations' && (
            <section className="panel">
              <div className="panel-actions">
                <Link to="/dashboard/partners/create" className="btn-primary" style={{ textDecoration: 'none' }}>+ Create</Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Organization ID</th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>HR Email IDs</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.contact}</td>
                        <td>{(p.hrEmails || []).length ? (p.hrEmails || []).join(', ') : '—'}</td>
                        <td><span className={`badge ${p.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{p.status?.toUpperCase()}</span></td>
                        <td>
                          <Link to={`/dashboard/partners/view/${p.id}`} className="action-icon" title="View" aria-label="View"><FaEye /></Link>
                          <Link to={`/dashboard/partners/edit/${p.id}`} className="action-icon" title="Edit" aria-label="Edit"><FaEdit /></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'benefit' && (
            <section className="panel">
              <div className="panel-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/dashboard/benefit/create" className="btn-primary" style={{ textDecoration: 'none' }}>+ Create Benefit</Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Organization</th>
                      <th>Type</th>
                      <th>Loyalty</th>
                      <th>Payment Type</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comboBenefits.map((b) => (
                      <tr key={b.id}>
                        <td><strong>{b.id}</strong></td>
                        <td><strong>{b.name}</strong></td>
                        <td>{getClientName(b.clientId)}</td>
                        <td>Combo</td>
                        <td>{b.loyalty || '—'}</td>
                        <td>{b.paymentType === 'employee_co_pay' ? 'Employee Co Pay' : b.paymentType === 'employer_co_pay' ? 'Employer Co Pay' : b.paymentType || '—'}</td>
                        <td><span className={`badge ${(b.status || '').toLowerCase() === 'active' ? 'badge-active' : 'badge-inactive'}`}>{b.status?.toUpperCase()}</span></td>
                        <td>{b.startDate || '—'}</td>
                        <td>{b.endDate || '—'}</td>
                        <td>
                          <Link to={`/dashboard/benefit/view/${b.id}`} className="action-icon" title="View" aria-label="View"><FaEye /></Link>
                          <Link to={`/dashboard/benefit/edit/${b.id}`} className="action-icon" title="Edit" aria-label="Edit"><FaEdit /></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'package' && (
            <section className="panel">
              <div className="panel-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/dashboard/package/create" className="btn-primary" style={{ textDecoration: 'none' }}>+ Create Package</Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Package</th>
                      <th>Client</th>
                      <th>Tests</th>
                      <th>Price</th>
                      <th>Valid (months)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(pk => (
                      <tr key={pk.id}>
                        <td><strong>{pk.name}</strong></td>
                        <td>{getClientName(pk.clientId)}</td>
                        <td>{pk.tests}</td>
                        <td>{pk.price}</td>
                        <td>{pk.validMonths}</td>
                        <td>
                          <Link to={`/dashboard/package/view/${pk.id}`} className="action-icon" title="View" aria-label="View"><FaEye /></Link>
                          <Link to={`/dashboard/package/edit/${pk.id}`} className="action-icon" title="Edit" aria-label="Edit"><FaEdit /></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'clients-vendors' && (
            <section className="panel">
              <div className="panel-tabs request-dashboard-main-tabs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex' }}>
                  <button type="button" className={`panel-tab ${clientsVendorsSubTab === 'clients' ? 'active' : ''}`} onClick={() => setClientsVendorsSubTab('clients')}>Clients</button>
                  <button type="button" className={`panel-tab ${clientsVendorsSubTab === 'vendors' ? 'active' : ''}`} onClick={() => setClientsVendorsSubTab('vendors')}>Vendors</button>
                </div>
                {clientsVendorsSubTab === 'clients' ? (
                  <Link to="/dashboard/clients/create" className="btn-primary" style={{ textDecoration: 'none' }}>+ Create Client</Link>
                ) : (
                  <Link to="/dashboard/vendors/create" className="btn-primary" style={{ textDecoration: 'none' }}>+ Create Vendor</Link>
                )}
              </div>
              {clientsVendorsSubTab === 'clients' && (
                <div className="table-wrap">
                  <table className="request-table">
                    <thead>
                      <tr>
                        <th>Client ID</th>
                        <th>Client Name</th>
                        <th>Contact</th>
                        <th>Login Emails</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.length === 0 ? (
                        <tr><td colSpan="6" className="request-table-empty">No clients found. Use Create Client to add one.</td></tr>
                      ) : (
                        clients.map((c) => (
                          <tr key={c.id}>
                            <td>{c.id}</td>
                            <td><strong>{c.companyName || c.clientName || '—'}</strong></td>
                            <td>{c.contactName ? `${c.contactName}${c.email ? `, ${c.email}` : ''}${c.phone ? `, ${c.phone}` : ''}` : (c.email || c.phone || '—')}</td>
                            <td>{(c.loginEmails && c.loginEmails.length > 0) ? c.loginEmails.join(', ') : '—'}</td>
                            <td><span className={`badge ${(c.status || '').toLowerCase() === 'active' ? 'badge-active' : 'badge-inactive'}`}>{(c.status || 'Active').toUpperCase()}</span></td>
                            <td>
                              <Link to={`/dashboard/clients/view/${c.id}`} className="action-icon" title="View" aria-label="View"><FaEye /></Link>
                              <Link to={`/dashboard/clients/edit/${c.id}`} className="action-icon" title="Edit" aria-label="Edit"><FaEdit /></Link>
                              <Link to="/dashboard/benefit/create" state={{ clientId: c.id }} className="action-icon" title="Create Benefits" aria-label="Create Benefits"><FaPlusCircle /></Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {clientsVendorsSubTab === 'vendors' && (
                <div className="table-wrap">
                  <table className="request-table">
                    <thead>
                      <tr>
                        <th>Vendor ID</th>
                        <th>Vendor Name</th>
                        <th>Type</th>
                        <th>Contact</th>
                        <th>Login Emails</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.length === 0 ? (
                        <tr><td colSpan="7" className="request-table-empty">No vendors found. Use Create Vendor to add one.</td></tr>
                      ) : (
                        vendors.map((v) => (
                          <tr key={v.id}>
                            <td>{v.id}</td>
                            <td><strong>{v.name || '—'}</strong></td>
                            <td>{VENDOR_TYPE_LABELS[v.type] || v.type || '—'}</td>
                            <td>{v.contactName ? `${v.contactName}${v.email ? `, ${v.email}` : ''}${v.phone ? `, ${v.phone}` : ''}` : (v.email || v.phone || '—')}</td>
                            <td>{(v.loginEmails && v.loginEmails.length > 0) ? v.loginEmails.join(', ') : '—'}</td>
                            <td><span className={`badge ${(v.status || '').toLowerCase() === 'active' ? 'badge-active' : 'badge-inactive'}`}>{(v.status || 'Active').toUpperCase()}</span></td>
                            <td>
                              <Link to={`/dashboard/vendors/view/${v.id}`} className="action-icon" title="View" aria-label="View"><FaEye /></Link>
                              <Link to={`/dashboard/vendors/edit/${v.id}`} className="action-icon" title="Edit" aria-label="Edit"><FaEdit /></Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
    </>
  )
}
