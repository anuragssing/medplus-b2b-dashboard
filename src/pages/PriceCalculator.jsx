import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboardStore } from '../store/dashboardStore.jsx'
import '../App.css'

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default function PriceCalculator() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { benefits = [], clients = [], addTopUpRequest, organizationWallets = {} } = useDashboardStore()
  const organizationId = user?.type === 'hr' ? user?.organizationId : null
  const walletBalance = organizationId ? (Number(organizationWallets[organizationId]) || 0) : 0
  const orgClientIds = useMemo(() => {
    if (!organizationId) return null
    return (clients || []).filter((c) => c.partnerId === organizationId).map((c) => c.id)
  }, [organizationId, clients])
  const allBenefits = benefits.filter((b) => b.status === 'Active' || b.status === 'active')
  const activeBenefitsRaw = organizationId && orgClientIds
    ? allBenefits.filter((b) => orgClientIds.includes(b.clientId))
    : allBenefits
  const activeBenefits = useMemo(() => {
    return activeBenefitsRaw.filter((b) => b.type === 'combo' && b.comboPharmaBenefitId && b.comboHealthCareBenefitId)
  }, [activeBenefitsRaw])

  const getBenefitMemberConfig = (b, allBenefitsFromStore = benefits) => {
    if (b.type === 'pharma') {
      const config = Array.isArray(b.priceConfiguration) ? b.priceConfiguration : []
      const primaryRow = config.find((p) => p.type === 'primary')
      return {
        hasPrimary: true,
        hasFreeAddon: false,
        hasPriceAddon: false,
        primaryPrice: primaryRow != null ? Number(primaryRow.price) || 0 : Number(b.primaryPrice) || 0,
        addonPrice: 0,
        freeAddonMin: null,
        freeAddonMax: null,
        priceAddonMin: null,
        priceAddonMax: null,
      }
    }
    if (b.type === 'combo') {
      const list = allBenefitsFromStore || []
      const pharma = list.find((x) => x.id === b.comboPharmaBenefitId)
      const healthCare = list.find((x) => x.id === b.comboHealthCareBenefitId)
      const hcConfig = healthCare ? getBenefitMemberConfig(healthCare, list) : { hasPrimary: false, hasFreeAddon: false, hasPriceAddon: false, primaryPrice: 0, addonPrice: 0, freeAddonMin: null, freeAddonMax: null, priceAddonMin: null, priceAddonMax: null }
      const pharmaPrimary = Number(pharma?.primaryPrice) || 0
      return {
        hasPrimary: hcConfig.hasPrimary,
        hasFreeAddon: hcConfig.hasFreeAddon,
        hasPriceAddon: hcConfig.hasPriceAddon,
        primaryPrice: hcConfig.primaryPrice + pharmaPrimary,
        addonPrice: hcConfig.addonPrice,
        freeAddonMin: hcConfig.freeAddonMin,
        freeAddonMax: hcConfig.freeAddonMax,
        priceAddonMin: hcConfig.priceAddonMin,
        priceAddonMax: hcConfig.priceAddonMax,
      }
    }
    const config = Array.isArray(b.priceConfiguration) ? b.priceConfiguration : []
    const primaryRow = config.find((p) => p.type === 'primary')
    const freeAddonRow = config.find((p) => p.type === 'free_addon')
    const addonRow = config.find((p) => p.type === 'addon')
    return {
      hasPrimary: !!primaryRow,
      hasFreeAddon: !!freeAddonRow,
      hasPriceAddon: !!addonRow,
      primaryPrice: primaryRow != null ? Number(primaryRow.price) || 0 : Number(b.primaryPrice) || 0,
      addonPrice: addonRow != null ? Number(addonRow.price) || 0 : Number(b.addOnPrice) || 0,
      freeAddonMin: freeAddonRow?.minMembers != null ? Number(freeAddonRow.minMembers) : null,
      freeAddonMax: freeAddonRow?.maxMembers != null ? Number(freeAddonRow.maxMembers) : null,
      priceAddonMin: addonRow?.minMembers != null ? Number(addonRow.minMembers) : null,
      priceAddonMax: addonRow?.maxMembers != null ? Number(addonRow.maxMembers) : null,
    }
  }

  const [selectedBenefitId, setSelectedBenefitId] = useState(activeBenefits[0]?.id || '')
  const [formPrimary, setFormPrimary] = useState(0)
  const [formPriceAddon, setFormPriceAddon] = useState(0)
  const [summaryRows, setSummaryRows] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)

  const selectedBenefit = selectedBenefitId ? (activeBenefits.find((b) => b.id === selectedBenefitId) || null) : null
  const cfg = useMemo(() => selectedBenefit ? getBenefitMemberConfig(selectedBenefit) : null, [selectedBenefit, benefits])

  const totalPrimary = summaryRows.reduce((s, r) => s + r.primaryCount, 0)
  const totalFreeAddon = summaryRows.reduce((s, r) => s + r.freeAddonCount, 0)
  const totalPriceAddon = summaryRows.reduce((s, r) => s + r.priceAddonCount, 0)
  const recommendedTopUp = summaryRows.reduce((s, r) => s + r.estimated, 0)

  const getBenefitTypeLabel = (b) => {
    if (!b || !b.type) return '—'
    if (b.type === 'combo') return 'Combo'
    if (b.type === 'pharma') return 'Pharma'
    if (b.type === 'health_care') return 'Health Care'
    return b.type
  }

  const handleAddOrUpdate = () => {
    if (!selectedBenefit || !cfg) return
    const primary = Math.max(0, Number(formPrimary) || 0)
    const priceAddon = Math.max(0, Number(formPriceAddon) || 0)
    const estimated = (cfg.hasPrimary ? primary * cfg.primaryPrice : 0) + (cfg.hasPriceAddon ? priceAddon * cfg.addonPrice : 0)
    const row = {
      benefitId: selectedBenefit.id,
      benefitName: selectedBenefit.name,
      primaryCount: primary,
      freeAddonCount: 0,
      priceAddonCount: priceAddon,
      estimated,
      memberConfig: cfg,
    }
    if (editingIndex !== null) {
      setSummaryRows((prev) => prev.map((r, i) => (i === editingIndex ? row : r)))
      setEditingIndex(null)
    } else {
      setSummaryRows((prev) => {
        const existingIndex = prev.findIndex((r) => r.benefitId === selectedBenefit.id)
        if (existingIndex >= 0) {
          return prev.map((r, i) => (i === existingIndex ? row : r))
        }
        return [...prev, row]
      })
    }
    setFormPrimary(0)
    setFormPriceAddon(0)
  }

  const handleEdit = (index) => {
    const row = summaryRows[index]
    if (!row) return
    setSelectedBenefitId(row.benefitId)
    setFormPrimary(row.primaryCount)
    setFormPriceAddon(row.priceAddonCount)
    setEditingIndex(index)
  }

  const handleDelete = (index) => {
    setSummaryRows((prev) => prev.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
      setFormPrimary(0)
      setFormPriceAddon(0)
    } else if (editingIndex != null && index < editingIndex) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const handleProceed = () => {
    const memberDetails = summaryRows.map((r) => ({
      planName: r.benefitName,
      primaryCount: r.primaryCount,
      freeAddonCount: r.freeAddonCount,
      addonCount: r.priceAddonCount,
    }))
    const totalMembers = totalPrimary + totalFreeAddon + totalPriceAddon
    addTopUpRequest({
      totalMembers,
      estimatedPrice: recommendedTopUp,
      memberDetails,
      ...(organizationId ? { organizationId } : {}),
    })
    navigate('/dashboard/request-dashboard')
  }

  return (
    <>
      <header className="main-header">
        <h2 className="page-title">Dashboard / Membership Price Calculator</h2>
      </header>
      <div className="content price-calculator-page">
        <section className="price-calculator-summary-bar">
          <div className="price-calc-kpi">
            <span className="price-calc-kpi-label">Total Employee Count</span>
            <span className="price-calc-kpi-value">{totalPrimary}</span>
          </div>
          <div className="price-calc-kpi">
            <span className="price-calc-kpi-label">Total Add on Count</span>
            <span className="price-calc-kpi-value">{totalFreeAddon + totalPriceAddon}</span>
          </div>
          <div className="price-calc-kpi">
            <span className="price-calc-kpi-label">Recommended Top-Up Amount</span>
            <span className="price-calc-kpi-value">{formatPrice(recommendedTopUp)}</span>
          </div>
          <div className="price-calc-kpi">
            <span className="price-calc-kpi-label">Wallet Balance</span>
            <span className="price-calc-kpi-value">{formatPrice(walletBalance)}</span>
          </div>
        </section>

        <div className="price-calc-two-column">
          <section className="panel price-calc-left-panel">
            <h4 className="form-section-title">Benefit Selection</h4>
            <div className="form-row form-row-1" style={{ marginBottom: '1rem' }}>
              <label>
                Select Benefit
                <select
                  value={selectedBenefitId}
                  onChange={(e) => {
                    setSelectedBenefitId(e.target.value)
                    if (editingIndex === null) {
                      setFormPrimary(0)
                      setFormPriceAddon(0)
                    }
                  }}
                  className="form-select"
                  autoComplete="off"
                >
                  <option value="">-- Select a benefit --</option>
                  {activeBenefits.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <h4 className="form-section-title">Benefit Details</h4>
            {selectedBenefit && cfg && (
              <>
                <div className="price-calc-benefit-info">
                  <div className="price-calc-benefit-meta">
                    <span className="price-calc-benefit-type-label">Type</span>
                    <span className={`price-calc-type-badge ${selectedBenefit.type === 'combo' ? 'price-calc-type-badge--combo' : ''}`}>
                      {getBenefitTypeLabel(selectedBenefit)}
                    </span>
                  </div>
                  {selectedBenefit.description && (
                    <div className="price-calc-benefit-description">
                      <span className="price-calc-benefit-desc-label">Description</span>
                      <p className="price-calc-benefit-desc-text">{selectedBenefit.description}</p>
                    </div>
                  )}
                </div>
                <div className="price-calc-detail-fields">
                  {cfg.hasPrimary && (
                    <label className="price-calc-input-label">
                      Employee count @ {formatPrice(cfg.primaryPrice)}
                      <input
                        type="number"
                        min={0}
                        value={formPrimary === 0 ? '' : formPrimary}
                        onChange={(e) => setFormPrimary(e.target.value)}
                        placeholder="0"
                        autoComplete="off"
                        className="price-calc-input"
                      />
                    </label>
                  )}
                  {cfg.hasPriceAddon && (
                    <label className="price-calc-input-label">
                      {cfg.priceAddonMin != null || cfg.priceAddonMax != null
                        ? `Add-on members (min ${cfg.priceAddonMin ?? '—'}, max ${cfg.priceAddonMax ?? '—'}) @ ${formatPrice(cfg.addonPrice)} per member`
                        : `Add-on members @ ${formatPrice(cfg.addonPrice)} per member`}
                      <input
                        type="number"
                        min={cfg.priceAddonMin ?? 0}
                        max={cfg.priceAddonMax ?? undefined}
                        value={formPriceAddon === 0 ? '' : formPriceAddon}
                        onChange={(e) => setFormPriceAddon(e.target.value)}
                        placeholder="0"
                        autoComplete="off"
                        className="price-calc-input"
                      />
                    </label>
                  )}
                </div>
                <div className="form-actions" style={{ marginTop: '1rem' }}>
                  <button type="button" className="btn-primary" onClick={handleAddOrUpdate}>
                    {editingIndex !== null ? 'Update' : 'Add'}
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="panel price-calc-right-panel">
            <h4 className="form-section-title">Top-Up Summary</h4>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Employee Count</th>
                    <th>Price Add-on</th>
                    <th>Estimated Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="request-table-empty">No benefits added. Select a benefit and click Add.</td>
                    </tr>
                  ) : (
                    summaryRows.map((row, index) => (
                      <tr key={index}>
                        <td><strong>{row.benefitName}</strong></td>
                        <td>{row.primaryCount}</td>
                        <td>{row.priceAddonCount}</td>
                        <td>{formatPrice(row.estimated)}</td>
                        <td>
                          <button type="button" className="btn-secondary btn-small" onClick={() => handleEdit(index)}>Edit</button>
                          {' '}
                          <button type="button" className="btn-secondary btn-small btn-danger" onClick={() => handleDelete(index)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="price-calc-summary-footer">
              <span className="price-calc-total-label">Total Top-Up Amount</span>
              <span className="price-calc-total-value">{formatPrice(recommendedTopUp)}</span>
            </div>
            <div className="form-actions" style={{ marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleProceed}
                disabled={summaryRows.length === 0}
              >
                Proceed to Top-Up Request
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
