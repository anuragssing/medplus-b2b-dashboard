import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import '../App.css'

export default function SubscriptionDetail() {
  const { subscriptionId } = useParams()
  const navigate = useNavigate()
  const { subscriptionRecords, clients, subscriptionMembers } = useDashboardStore()

  // Find the subscription record
  const subscription = useMemo(() => {
    return subscriptionRecords.find(sub => sub.subscriptionId === subscriptionId)
  }, [subscriptionRecords, subscriptionId])

  // Get organization name
  const organizationName = useMemo(() => {
    if (subscription?.clientId) {
      const client = clients.find(c => c.id === subscription.clientId)
      return client?.companyName || 'Unknown'
    }
    return 'Unknown'
  }, [subscription, clients])

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`
  }

  // Get members for this subscription
  const members = useMemo(() => {
    if (!subscription || !subscriptionMembers) return []
    return subscriptionMembers.filter(member => member.subscriptionId === subscription.subscriptionId)
  }, [subscription, subscriptionMembers])

  if (!subscription) {
    return (
      <div className="page">
        <header className="page-header">
          <h2>Subscription Not Found</h2>
        </header>
        <div className="content">
          <p>The subscription with ID {subscriptionId} was not found.</p>
          <button onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="main-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Subscription Details - {subscription.subscriptionId}</h2>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="content">
        {/* Subscription Information Grid */}
        <section className="panel" style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            padding: '1rem'
          }}>
            {/* Row 1 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Organization
              </label>
              <div style={{ fontWeight: 600 }}>{organizationName}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Customer Name
              </label>
              <div style={{ fontWeight: 600 }}>{subscription.customer}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Mobile
              </label>
              <div style={{ fontWeight: 600 }}>{subscription.mobileNo}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Plan
              </label>
              <div style={{ fontWeight: 600 }}>{subscription.planName || '-'}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Status
              </label>
              <div>
                <span className={`badge ${subscription.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                  {subscription.status}
                </span>
              </div>
            </div>

            {/* Row 2 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Created On
              </label>
              <div style={{ fontWeight: 600 }}>{formatDate(subscription.createdOn)}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Active On
              </label>
              <div style={{ fontWeight: 600 }}>{formatDate(subscription.activedOn)}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Expiry Date
              </label>
              <div style={{ fontWeight: 600 }}>{formatDate(subscription.expiryDate)}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Total Members
              </label>
              <div style={{ fontWeight: 600 }}>{subscription.members || 1}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Total MRP Spends
              </label>
              <div style={{ fontWeight: 600 }}>{formatCurrency(subscription.mrpSpends)}</div>
            </div>

            {/* Row 3 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Actual Spends
              </label>
              <div style={{ fontWeight: 600 }}>{formatCurrency(subscription.actualSpends)}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Membership Savings
              </label>
              <div style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(subscription.savings)}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Credit Used
              </label>
              <div style={{ fontWeight: 600 }}>{subscription.mrpUsed || 0}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Credit Balance
              </label>
              <div style={{ fontWeight: 600 }}>{subscription.mrpBalance || 0}</div>
            </div>
          </div>
        </section>

        {/* Member Details Table */}
        <section className="panel">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0', padding: '1rem 1rem 0 1rem' }}>
            Member Details
          </h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Is Primary?</th>
                  <th>Added On</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? (
                  members.map((member, index) => (
                    <tr key={index}>
                      <td>{member.name}</td>
                      <td>
                        {member.isPrimary ? (
                          <span className="badge badge-active">Yes</span>
                        ) : (
                          <span className="badge badge-inactive">No</span>
                        )}
                      </td>
                      <td>{formatDate(member.addedOn)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      No member details available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}


