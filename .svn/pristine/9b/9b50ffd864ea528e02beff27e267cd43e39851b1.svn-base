import React, { useState } from 'react'
import { useDashboardStore } from '../store/dashboardStore'
import { INDIAN_STATES, CITIES_BY_STATE } from '../data/indiaLocations'

export default function CityCatalogue() {
  const {
    cityCatalogues,
    cityCatalogueTestMappings,
    partners,
  } = useDashboardStore()

  const [activeTab, setActiveTab] = useState('catalogues')

  // Filters for view tab
  const [stateFilter, setStateFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Filters for mappings tab
  const [mappingsStateFilter, setMappingsStateFilter] = useState('')
  const [mappingsCityFilter, setMappingsCityFilter] = useState('')

  const availableCitiesForMappingsFilter = mappingsStateFilter ? (CITIES_BY_STATE[mappingsStateFilter] || []) : []

  const getPartnerName = (partnerId) => partners.find((p) => p.id === partnerId)?.name || '—'
  const getCatalogueName = (catalogueId) => cityCatalogues.find((c) => c.id === catalogueId)?.name || '—'

  // Get test count for each catalogue
  const getCatalogueTestCount = (catalogueId) => {
    return cityCatalogueTestMappings.filter((m) => m.catalogueId === catalogueId).length
  }

  // Filter test mappings based on state and city filters
  const filteredTestMappings = cityCatalogueTestMappings.filter((m) => {
    const catalogue = cityCatalogues.find((c) => c.id === m.catalogueId)
    if (!catalogue) return false
    if (mappingsStateFilter && catalogue.state !== mappingsStateFilter) return false
    if (mappingsCityFilter && catalogue.city !== mappingsCityFilter) return false
    return true
  })

  // Filter catalogues based on search and state filter
  const filteredCatalogues = cityCatalogues.filter(catalogue => {
    const matchesState = !stateFilter || catalogue.state === stateFilter
    const matchesSearch = !searchQuery ||
      catalogue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalogue.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalogue.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesState && matchesSearch
  })

  return (
    <>
      <header className="main-header">
        <h2 className="page-title">City Catalogues (Auto-Generated)</h2>
        <p className="page-desc">
          📋 City catalogues are automatically created when tests are mapped to collection centers.
          View and monitor auto-generated catalogues and test mappings below.
        </p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="panel-tabs">
            <button className={`panel-tab ${activeTab === 'catalogues' ? 'active' : ''}`} onClick={() => setActiveTab('catalogues')}>
              View Catalogues {cityCatalogues?.length ? <span className="tab-badge">{cityCatalogues.length}</span> : null}
            </button>
            <button className={`panel-tab ${activeTab === 'mappings' ? 'active' : ''}`} onClick={() => setActiveTab('mappings')}>
              Test Mappings {cityCatalogueTestMappings?.length ? <span className="tab-badge">{cityCatalogueTestMappings.length}</span> : null}
            </button>
          </div>

          {/* Tab 1: View Catalogues */}
          {activeTab === 'catalogues' && (
            <div className="panel-body">
              {/* Info Banner */}
              <div style={{
                padding: '1rem',
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '0.5rem' }}>
                  🤖 Automated City Catalogues
                </div>
                <div style={{ fontSize: '0.9rem', color: '#075985' }}>
                  City catalogues are automatically created when you map tests to collection centers.
                  Each city gets its own catalogue, and tests are automatically added to the appropriate catalogue based on the center's location.
                </div>
              </div>
              {/* Filters */}
              <div className="test-catalog-filters" style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search by catalogue name, city, or description…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {cityCatalogues.length === 0 ? (
                <div className="test-catalog-empty">
                  <span>📚</span>
                  <p>No city catalogues found. Map tests to collection centers to auto-generate catalogues.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Catalogue Name</th>
                        <th>State</th>
                        <th>City</th>
                        <th>Description</th>
                        <th>Test Count</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCatalogues.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No catalogues found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredCatalogues.map((c) => {
                          const isAutoGenerated = c.id.startsWith('ctlg_auto_')
                          return (
                            <tr key={c.id}>
                              <td>
                                <strong>{c.name}</strong>
                                {isAutoGenerated && (
                                  <span style={{
                                    marginLeft: '0.5rem',
                                    fontSize: '0.75rem',
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '4px',
                                    fontWeight: 600
                                  }}>
                                    🤖 AUTO
                                  </span>
                                )}
                              </td>
                              <td>{c.state}</td>
                              <td>{c.city}</td>
                              <td style={{ fontSize: '0.85rem', color: '#666' }}>{c.description || '—'}</td>
                              <td>
                                <span style={{
                                  fontWeight: 600,
                                  color: 'var(--primary)',
                                  background: '#fef2f2',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px'
                                }}>
                                  {getCatalogueTestCount(c.id)} tests
                                </span>
                              </td>
                              <td>
                                <span className={`status-badge ${c.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                                  {c.status?.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.82rem', color: '#666' }}>
                                {isAutoGenerated ? '🤖 Auto-generated' : '👤 Manual'}
                              </td>
                              <td style={{ fontSize: '0.82rem', color: '#666' }}>
                                {new Date(c.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Test Mappings */}
          {activeTab === 'mappings' && (
            <div className="panel-body">
              {/* Info Banner */}
              <div style={{
                padding: '1rem',
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '0.5rem' }}>
                  🤖 Automated Test Mappings
                </div>
                <div style={{ fontSize: '0.9rem', color: '#075985' }}>
                  Test mappings are automatically created when you upload tests to collection centers.
                  Tests are automatically added to the city catalogue based on the center's location.
                </div>
              </div>

              {cityCatalogueTestMappings.length === 0 ? (
                <div className="test-catalog-empty">
                  <span>🗂</span>
                  <p>No test mappings found. Map tests to collection centers to auto-generate mappings.</p>
                </div>
              ) : (
                <>
                  {/* Filters for Test Mappings */}
                  <div className="test-catalog-filters" style={{ marginBottom: '1rem' }}>
                    <select
                      value={mappingsStateFilter}
                      onChange={(e) => {
                        setMappingsStateFilter(e.target.value)
                        setMappingsCityFilter('') // Reset city filter when state changes
                      }}
                      style={{ minWidth: '220px' }}
                    >
                      <option value="">All States</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>

                    <select
                      value={mappingsCityFilter}
                      onChange={(e) => setMappingsCityFilter(e.target.value)}
                      disabled={!mappingsStateFilter}
                      style={{ minWidth: '220px' }}
                    >
                      <option value="">All Cities</option>
                      {availableCitiesForMappingsFilter.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>

                    {(mappingsStateFilter || mappingsCityFilter) && (
                      <button
                        onClick={() => {
                          setMappingsStateFilter('')
                          setMappingsCityFilter('')
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        Clear Filters
                      </button>
                    )}

                    <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#666' }}>
                      Showing {filteredTestMappings.length} of {cityCatalogueTestMappings.length} mappings
                    </div>
                  </div>

                  <div className="table-wrap">
                    <table className="test-preview-table">
                      <thead>
                        <tr>
                          <th>Test Code</th>
                          <th>Test Name</th>
                          <th>Category</th>
                          <th>Partner</th>
                          <th>Catalogue</th>
                          <th>City</th>
                          <th>State</th>
                          <th>Source</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTestMappings.length === 0 ? (
                          <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                              No test mappings found for the selected filters.
                            </td>
                          </tr>
                        ) : (
                          filteredTestMappings.map((m) => {
                            const catalogue = cityCatalogues.find((c) => c.id === m.catalogueId)
                            const isAutoGenerated = m.id.startsWith('ctm_auto_')
                            return (
                              <tr key={m.id}>
                                <td><span className="test-code-badge">{m.testCode}</span></td>
                                <td>{m.testName}</td>
                                <td>{m.category}</td>
                                <td style={{ fontSize: '0.82rem', color: '#555' }}>{getPartnerName(m.partnerId)}</td>
                                <td style={{ fontSize: '0.85rem' }}>
                                  {getCatalogueName(m.catalogueId)}
                                </td>
                                <td style={{ fontSize: '0.85rem', color: '#555' }}>
                                  {catalogue?.city || '—'}
                                </td>
                                <td style={{ fontSize: '0.85rem', color: '#555' }}>
                                  {catalogue?.state || '—'}
                                </td>
                                <td style={{ fontSize: '0.82rem', color: '#666' }}>
                                  {isAutoGenerated ? '🤖 Auto-generated' : '👤 Manual'}
                                </td>
                                <td>
                                  <span className={`status-badge ${m.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                                    {m.status?.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

