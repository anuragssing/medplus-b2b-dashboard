import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import '../App.css'

// LocalStorage keys
const STORAGE_KEY_BD_SELECTED_ORG = 'bd-dashboard-selected-org'
const STORAGE_KEY_HR_SUMMARY_CACHE = 'bd-dashboard-hr-summary-cache'
const STORAGE_KEY_BD_SUMMARY_CACHE = 'bd-dashboard-bd-summary-cache'

export default function Summary() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { organizationSummaries, hrUsers, clients, subscriptionRecords, organizationWallets } = useDashboardStore()
  const [selectedClientId, setSelectedClientId] = useState('')

  // Load selected organization from localStorage for BD Admin on mount
  useEffect(() => {
    if (user?.type === 'bd_admin') {
      const savedOrgId = localStorage.getItem(STORAGE_KEY_BD_SELECTED_ORG)
      if (savedOrgId && !location.state?.clientId) {
        setSelectedClientId(savedOrgId)
      }
    }
  }, [user, location.state])

  // Set selectedClientId from location.state if coming from subscription details page
  useEffect(() => {
    if (location.state?.clientId && user?.type === 'bd_admin') {
      setSelectedClientId(location.state.clientId)
    }
  }, [location.state, user])

  // Save selected organization to localStorage when it changes (BD Admin only)
  useEffect(() => {
    if (user?.type === 'bd_admin' && selectedClientId) {
      localStorage.setItem(STORAGE_KEY_BD_SELECTED_ORG, selectedClientId)
    }
  }, [selectedClientId, user])

  // Determine which organization to show
  const organizationData = useMemo(() => {
    if (user?.type === 'hr') {
      // For HR users, find their organization based on email
      const hrUser = hrUsers.find(hr => hr.email === user.email)
      if (hrUser) {
        const orgData = organizationSummaries.find(os => os.clientId === hrUser.clientId)

        // Cache HR user's organization summary in localStorage
        if (orgData) {
          try {
            const cacheData = {
              email: user.email,
              clientId: hrUser.clientId,
              organizationData: orgData,
              timestamp: new Date().toISOString()
            }
            localStorage.setItem(STORAGE_KEY_HR_SUMMARY_CACHE, JSON.stringify(cacheData))
          } catch (error) {
            console.error('Failed to cache HR summary data:', error)
          }
        }

        return orgData
      }
      return null
    } else if (user?.type === 'bd_admin') {
      // For BD Admin, show selected organization
      if (selectedClientId) {
        const orgData = organizationSummaries.find(os => os.clientId === selectedClientId)

        // Cache BD Admin's selected organization summary in localStorage
        if (orgData) {
          try {
            const cacheData = {
              username: user.username,
              clientId: selectedClientId,
              organizationData: orgData,
              timestamp: new Date().toISOString()
            }
            localStorage.setItem(STORAGE_KEY_BD_SUMMARY_CACHE, JSON.stringify(cacheData))
          } catch (error) {
            console.error('Failed to cache BD summary data:', error)
          }
        }

        return orgData
      }
      return null
    }
    return null
  }, [user, hrUsers, organizationSummaries, selectedClientId])

  // Get wallet balance for the selected client
  const walletBalance = useMemo(() => {
    if (!organizationData) return 0
    return organizationWallets[organizationData.clientId] || 0
  }, [organizationData, organizationWallets])

  // Calculate revenue data dynamically from subscription records
  const revenueData = useMemo(() => {
    if (!organizationData) return []

    // Filter subscription records for this organization
    const orgSubscriptions = subscriptionRecords.filter(
      sub => sub.clientId === organizationData.clientId
    )

    // Calculate healthcare totals
    const healthcareRecords = orgSubscriptions.filter(sub => sub.type === 'healthcare')
    const healthcareMrpValue = healthcareRecords.reduce((sum, sub) => sum + (sub.mrpSpends || 0), 0)
    const healthcarePurchaseValue = healthcareRecords.reduce((sum, sub) => sum + (sub.actualSpends || 0), 0)
    const healthcareSavings = healthcareRecords.reduce((sum, sub) => sum + (sub.savings || 0), 0)

    // Calculate pharma totals
    const pharmaRecords = orgSubscriptions.filter(sub => sub.type === 'pharma')
    const pharmaMrpValue = pharmaRecords.reduce((sum, sub) => sum + (sub.mrpSpends || 0), 0)
    const pharmaPurchaseValue = pharmaRecords.reduce((sum, sub) => sum + (sub.actualSpends || 0), 0)
    const pharmaSavings = pharmaRecords.reduce((sum, sub) => sum + (sub.savings || 0), 0)

    const result = []

    // Only add Healthcare if there are healthcare subscriptions
    if (organizationData.healthcareSubscriptions.active > 0 || organizationData.healthcareSubscriptions.serviced > 0) {
      result.push({
        category: 'Healthcare',
        mrpValue: healthcareMrpValue,
        purchaseValue: healthcarePurchaseValue,
        savings: healthcareSavings
      })
    }

    // Only add Pharma if there are pharma subscriptions
    if (organizationData.pharmaSubscriptions.active > 0 || organizationData.pharmaSubscriptions.serviced > 0) {
      result.push({
        category: 'Pharma',
        mrpValue: pharmaMrpValue,
        purchaseValue: pharmaPurchaseValue,
        savings: pharmaSavings
      })
    }

    return result
  }, [organizationData, subscriptionRecords])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleSubscriptionClick = (type, filter = 'all') => {
    if (organizationData) {
      navigate(`/dashboard/subscriptions/${type}`, {
        state: {
          clientId: organizationData.clientId,
          filter: filter // 'all', 'active', 'serviced', 'cancelled'
        }
      })
    }
  }

  return (
    <>
      <header className="main-header">
        <div>
          <h2 className="page-title">Client Summary</h2>
          <p className="page-desc">
            {user?.type === 'hr'
              ? 'View your client\'s subscription and usage metrics'
              : 'Select a client to view detailed summary'}
          </p>
        </div>
      </header>

      <div className="content">
        {/* Client Selector for BD Admin */}
        {user?.type === 'bd_admin' && (
          <section className="panel" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flex: 1 }}>
                <div style={{ flex: 1, maxWidth: '400px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Select Client
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    autoComplete="off"
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      fontSize: '0.9375rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                    }}
                  >
                    <option value="">-- Select a client --</option>
                    {clients.filter(client => (client.companyName || client.clientName) && (client.companyName || client.clientName).trim()).map(client => (
                      <option key={client.id} value={client.id}>
                        {client.companyName || client.clientName}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedClientId && (
                  <button
                    onClick={() => walletBalance > 0 && navigate('/dashboard/enroll-employee', { state: { clientId: selectedClientId } })}
                    disabled={walletBalance <= 0}
                    style={{
                      padding: '0.625rem 1.25rem',
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: walletBalance <= 0 ? '#666' : 'white',
                      background: walletBalance <= 0 ? '#e0e0e0' : 'var(--accent)',
                      border: walletBalance <= 0 ? '1px solid #bbb' : 'none',
                      borderRadius: '6px',
                      cursor: walletBalance <= 0 ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => walletBalance > 0 && (e.currentTarget.style.background = '#a00027')}
                    onMouseLeave={(e) => walletBalance > 0 && (e.currentTarget.style.background = 'var(--accent)')}
                  >
                    Enroll Employee
                  </button>
                )}
              </div>
              {selectedClientId && (
                <div style={{ textAlign: 'right' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Usable Amount
                  </label>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#10b981',
                    padding: '0.5rem 0',
                  }}>
                    {formatCurrency(walletBalance)}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Usable Amount for HR Users */}
        {user?.type === 'hr' && organizationData && (
          <section className="panel" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flex: 1 }}>
                <div style={{ flex: 1, maxWidth: '400px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Organization
                  </label>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    padding: '0.5rem 0',
                  }}>
                    <strong>{organizationData.companyName || organizationData.clientName}</strong>
                  </div>
                </div>
                <button
                  onClick={() => walletBalance > 0 && navigate('/dashboard/enroll-employee', { state: { clientId: organizationData.clientId } })}
                  disabled={walletBalance <= 0}
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: walletBalance <= 0 ? '#666' : 'white',
                    background: walletBalance <= 0 ? '#e0e0e0' : 'var(--accent)',
                    border: walletBalance <= 0 ? '1px solid #bbb' : 'none',
                    borderRadius: '6px',
                    cursor: walletBalance <= 0 ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => walletBalance > 0 && (e.currentTarget.style.background = '#a00027')}
                  onMouseLeave={(e) => walletBalance > 0 && (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Enroll Employee
                </button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Usable Amount
                </label>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#10b981',
                  padding: '0.5rem 0',
                }}>
                  {formatCurrency(walletBalance)}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Summary Data Display */}
        {organizationData ? (
          <>
            {/* Healthcare Subscription Metrics - Only show if active count > 0 */}
            {organizationData.healthcareSubscriptions.active > 0 && (
              <section className="panel" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', padding: '0 1rem', paddingTop: '1rem' }}>
                  Healthcare Subscription & Usage
                </h3>
                <div className="overview-kpis" style={{ padding: '0 1rem 1rem' }}>
                  {/* Active Subscriptions - Clickable if count > 0 */}
                  <div
                    className="kpi-card"
                    style={{
                      cursor: organizationData.healthcareSubscriptions.active > 0 ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => organizationData.healthcareSubscriptions.active > 0 && handleSubscriptionClick('healthcare', 'active')}
                    onMouseEnter={(e) => {
                      if (organizationData.healthcareSubscriptions.active > 0) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <span className="kpi-value">{organizationData.healthcareSubscriptions.active}</span>
                    <span className="kpi-label">Active Subscriptions</span>
                  </div>

                  {/* Active Members - NOT Clickable */}
                  <div className="kpi-card">
                    <span className="kpi-value">{organizationData.healthcareSubscriptions.activeMembers}</span>
                    <span className="kpi-label">Active Members</span>
                  </div>

                  {/* Serviced Subscriptions - Clickable if count > 0 */}
                  <div
                    className="kpi-card"
                    style={{
                      cursor: organizationData.healthcareSubscriptions.serviced > 0 ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => organizationData.healthcareSubscriptions.serviced > 0 && handleSubscriptionClick('healthcare', 'serviced')}
                    onMouseEnter={(e) => {
                      if (organizationData.healthcareSubscriptions.serviced > 0) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <span className="kpi-value">{organizationData.healthcareSubscriptions.serviced}</span>
                    <span className="kpi-label">Serviced Subscriptions</span>
                  </div>

                  {/* Serviced Members - NOT Clickable */}
                  <div className="kpi-card">
                    <span className="kpi-value">{organizationData.healthcareSubscriptions.servicedMembers || 0}</span>
                    <span className="kpi-label">Serviced Members</span>
                  </div>

                  {/* Cancelled Subscriptions - Clickable if count > 0 */}
                  <div
                    className="kpi-card"
                    style={{
                      cursor: organizationData.healthcareSubscriptions.cancelled > 0 ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => organizationData.healthcareSubscriptions.cancelled > 0 && handleSubscriptionClick('healthcare', 'cancelled')}
                    onMouseEnter={(e) => {
                      if (organizationData.healthcareSubscriptions.cancelled > 0) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <span className="kpi-value">{organizationData.healthcareSubscriptions.cancelled}</span>
                    <span className="kpi-label">Cancelled Subs</span>
                  </div>
                </div>
              </section>
            )}

            {/* Pharma Subscription Metrics - Only show if active count > 0 */}
            {organizationData.pharmaSubscriptions.active > 0 && (
              <section className="panel" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', padding: '0 1rem', paddingTop: '1rem' }}>
                  Pharma Subscription & Usage
                </h3>
                <div className="overview-kpis" style={{ padding: '0 1rem 1rem' }}>
                  {/* Active Subscriptions - Clickable if count > 0 */}
                  <div
                    className="kpi-card"
                    style={{
                      cursor: organizationData.pharmaSubscriptions.active > 0 ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => organizationData.pharmaSubscriptions.active > 0 && handleSubscriptionClick('pharma', 'active')}
                    onMouseEnter={(e) => {
                      if (organizationData.pharmaSubscriptions.active > 0) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <span className="kpi-value">{organizationData.pharmaSubscriptions.active}</span>
                    <span className="kpi-label">Active Subscriptions</span>
                  </div>

                  {/* Serviced Subscriptions - Clickable if count > 0 */}
                  <div
                    className="kpi-card"
                    style={{
                      cursor: organizationData.pharmaSubscriptions.serviced > 0 ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => organizationData.pharmaSubscriptions.serviced > 0 && handleSubscriptionClick('pharma', 'serviced')}
                    onMouseEnter={(e) => {
                      if (organizationData.pharmaSubscriptions.serviced > 0) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <span className="kpi-value">{organizationData.pharmaSubscriptions.serviced}</span>
                    <span className="kpi-label">Serviced Subscriptions</span>
                  </div>

                  {/* Cancelled Subscriptions - Clickable if count > 0 */}
                  <div
                    className="kpi-card"
                    style={{
                      cursor: organizationData.pharmaSubscriptions.cancelled > 0 ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => organizationData.pharmaSubscriptions.cancelled > 0 && handleSubscriptionClick('pharma', 'cancelled')}
                    onMouseEnter={(e) => {
                      if (organizationData.pharmaSubscriptions.cancelled > 0) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <span className="kpi-value">{organizationData.pharmaSubscriptions.cancelled}</span>
                    <span className="kpi-label">Cancelled Subs</span>
                  </div>
                </div>
              </section>
            )}

            {/* Revenue & Savings Table - Dynamic calculation from subscription records */}
            {revenueData.length > 0 && (
              <section className="panel">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', padding: '0 1rem', paddingTop: '1rem' }}>
                  Revenue & Savings
                </h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>MRP Value</th>
                        <th>Purchase Value</th>
                        <th>Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((item, index) => (
                        <tr key={index}>
                          <td><strong>{item.category}</strong></td>
                          <td>{formatCurrency(item.mrpValue)}</td>
                          <td>{formatCurrency(item.purchaseValue)}</td>
                          <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                            {formatCurrency(item.savings)}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 600 }}>
                        <td><strong>Total</strong></td>
                        <td>
                          {formatCurrency(revenueData.reduce((sum, item) => sum + item.mrpValue, 0))}
                        </td>
                        <td>
                          {formatCurrency(revenueData.reduce((sum, item) => sum + item.purchaseValue, 0))}
                        </td>
                        <td style={{ color: 'var(--success)' }}>
                          {formatCurrency(revenueData.reduce((sum, item) => sum + item.savings, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="panel">
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
              {user?.type === 'bd_admin' ? (
                <p>Please select an organization to view summary</p>
              ) : (
                <p>No organization data available for your account</p>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
