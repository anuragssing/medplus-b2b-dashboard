import { useState, useMemo, useRef, useEffect } from 'react'
import { useDashboardStore, ORDER_STATUSES } from '../store/dashboardStore.jsx'
import { FaCheck, FaSearch } from 'react-icons/fa'
import '../App.css'

const defaultFilters = {
  orderId: '',
  cartId: '',
  customerId: '',
  dateFrom: '',
  dateTo: '',
  mobileNo: '',
  vendorId: '',
  centerId: '',
  statuses: [],
}

export default function OrderDashboard() {
  const { orders, vendors, centers } = useDashboardStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)
  const popupRef = useRef(null)
  const triggerRef = useRef(null)

  // Close popup on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchOpen &&
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filters.orderId && !String(order.orderId || order.displayOrderId || '').toLowerCase().includes(filters.orderId.toLowerCase())) return false
      if (filters.cartId && !String(order.cartId || '').toLowerCase().includes(filters.cartId.toLowerCase())) return false
      if (filters.customerId && String(order.customerId || '') !== String(filters.customerId)) return false
      if (filters.mobileNo && !String(order.mobileNo || '').includes(filters.mobileNo)) return false
      if (filters.vendorId && order.vendorId !== filters.vendorId) return false
      if (filters.centerId && order.centerId !== filters.centerId) return false
      if (filters.statuses.length > 0 && !filters.statuses.includes(order.status)) return false
      if (filters.dateFrom || filters.dateTo) {
        const orderDate = order.dateCreated ? new Date(order.dateCreated).toISOString().slice(0, 10) : ''
        if (filters.dateFrom && orderDate < filters.dateFrom) return false
        if (filters.dateTo && orderDate > filters.dateTo) return false
      }
      return true
    })
  }, [orders, filters])

  const applySearch = () => {
    setSearchOpen(false)
  }

  const toggleStatus = (status) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status) ? prev.statuses.filter((s) => s !== status) : [...prev.statuses, status],
    }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    setSearchOpen(false)
  }

  const getVendorName = (vendorId) => vendors.find((v) => v.id === vendorId)?.name ?? vendorId
  const getCenterName = (centerId) => centers.find((c) => c.id === centerId)?.name ?? centerId
  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '')
  const formatAmount = (n) => (n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '')

  return (
    <div className="order-dashboard page-content">
      <header className="main-header">
        <div className="main-header-content">
          <div className="main-header-text">
            <h2 className="page-title">Order Dashboard</h2>
            <p className="page-desc">View and search orders by status, customer, center, and date.</p>
          </div>
          <div className="main-header-actions">
            <div className="order-search-wrap">
              <button
                type="button"
                ref={triggerRef}
                className="btn btn-primary order-search-trigger"
                onClick={() => setSearchOpen((o) => !o)}
                aria-expanded={searchOpen}
              >
                <FaSearch /> Search
              </button>
              {searchOpen && (
                <div className="order-search-popup" ref={popupRef}>
              <div className="order-search-popup-title">Search Orders</div>
              <div className="order-search-form">
                <div className="form-row">
                  <label>Order ID</label>
                  <input
                    type="text"
                    value={filters.orderId}
                    onChange={(e) => setFilters((f) => ({ ...f, orderId: e.target.value }))}
                    placeholder="Order ID"
                  />
                </div>
                <div className="form-row">
                  <label>Cart ID</label>
                  <input
                    type="text"
                    value={filters.cartId}
                    onChange={(e) => setFilters((f) => ({ ...f, cartId: e.target.value }))}
                    placeholder="Cart ID"
                  />
                </div>
                <div className="form-row">
                  <label>Customer ID</label>
                  <input
                    type="text"
                    value={filters.customerId}
                    onChange={(e) => setFilters((f) => ({ ...f, customerId: e.target.value }))}
                    placeholder="Customer ID"
                  />
                </div>
                <div className="form-row">
                  <label>Mobile No</label>
                  <input
                    type="text"
                    value={filters.mobileNo}
                    onChange={(e) => setFilters((f) => ({ ...f, mobileNo: e.target.value }))}
                    placeholder="Mobile"
                  />
                </div>
                <div className="form-row">
                  <label>Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label>Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label>Vendor</label>
                  <select
                    value={filters.vendorId}
                    onChange={(e) => setFilters((f) => ({ ...f, vendorId: e.target.value }))}
                  >
                    <option value="">All</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label>Center</label>
                  <select
                    value={filters.centerId}
                    onChange={(e) => setFilters((f) => ({ ...f, centerId: e.target.value }))}
                  >
                    <option value="">All</option>
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row form-row-full">
                  <label>Status (multiple)</label>
                  <div className="order-status-chips">
                    {ORDER_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`chip ${filters.statuses.includes(s) ? 'chip-active' : ''}`}
                        onClick={() => toggleStatus(s)}
                      >
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="order-search-popup-footer">
                <button type="button" className="btn btn-secondary" onClick={clearFilters}>Clear</button>
                <button type="button" className="btn btn-primary" onClick={applySearch}>Search</button>
              </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="content">
      <div className="order-table-wrapper">
        <table className="order-table">
          <thead>
            <tr>
              <th className="col-fixed-left col-status">Status</th>
              <th className="col-fixed-left col-display-id">Display Order ID</th>
              <th className="col-scroll">Order ID</th>
              <th className="col-scroll">Cart ID</th>
              <th className="col-scroll">Customer ID</th>
              <th className="col-scroll">Mobile No</th>
              <th className="col-scroll">Collection Center</th>
              <th className="col-scroll">Payment</th>
              <th className="col-scroll">Type Action Status</th>
              <th className="col-scroll">Order Amount</th>
              <th className="col-scroll">Date Created</th>
              <th className="col-scroll">Vendor</th>
              <th className="col-scroll">Center</th>
              <th className="col-fixed-right col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={14} className="no-orders">No orders match your search.</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="col-fixed-left col-status">
                    <span className={`order-status-badge status-${order.status}`}>{order.status?.replace(/_/g, ' ') ?? '-'}</span>
                  </td>
                  <td className="col-fixed-left col-display-id">{order.displayOrderId ?? order.orderId ?? '-'}</td>
                  <td className="col-scroll">{order.orderId ?? '-'}</td>
                  <td className="col-scroll">{order.cartId ?? '-'}</td>
                  <td className="col-scroll">{order.customerId ?? '-'}</td>
                  <td className="col-scroll">{order.mobileNo ?? '-'}</td>
                  <td className="col-scroll">{getCenterName(order.centerId)}</td>
                  <td className="col-scroll">{order.payment ?? '-'}</td>
                  <td className="col-scroll">{order.typeActionStatus?.replace(/_/g, ' ') ?? '-'}</td>
                  <td className="col-scroll">{formatAmount(order.orderAmount)}</td>
                  <td className="col-scroll">{formatDate(order.dateCreated)}</td>
                  <td className="col-scroll">{getVendorName(order.vendorId)}</td>
                  <td className="col-scroll">{getCenterName(order.centerId)}</td>
                  <td className="col-fixed-right col-action">
                    <span className="order-action-btns">
                      <button type="button" className="icon-btn" title="Acknowledge patient" onClick={() => {}} aria-label="Acknowledge patient">
                        <FaCheck />
                      </button>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      <style>{`
        .order-dashboard .order-search-wrap { position: relative; }
        .order-search-trigger { display: inline-flex; align-items: center; gap: 0.5rem; }
        .order-search-popup {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          min-width: 420px;
          max-width: 90vw;
          background: var(--card-bg, #fff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          z-index: 100;
          padding: 1rem;
        }
        .order-search-popup-title { font-weight: 600; margin-bottom: 1rem; }
        .order-search-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .form-row { display: flex; flex-direction: column; gap: 0.25rem; }
        .form-row-full { grid-column: 1 / -1; }
        .form-row label { font-size: 0.875rem; color: var(--text-muted, #64748b); }
        .form-row input, .form-row select { padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; }
        .order-status-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .chip { padding: 0.35rem 0.75rem; border-radius: 999px; border: 1px solid var(--border-color); background: var(--card-bg); cursor: pointer; font-size: 0.8rem; }
        .chip:hover { background: var(--sidebar-bg, #f8fafc); }
        .chip-active { background: var(--accent); color: #fff; border-color: var(--accent); }
        .order-search-popup-footer { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
        .order-table-wrapper { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 10px; background: var(--card-bg); }
        .order-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
        .order-table th, .order-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
        .order-table thead th { font-weight: 600; background: var(--sidebar-bg, #f8fafc); }
        .order-table .col-scroll { position: relative; z-index: 0; }
        .order-table .col-fixed-left { position: sticky; left: 0; z-index: 10; min-width: 120px; box-shadow: 4px 0 8px -2px rgba(0,0,0,0.08); }
        .order-table .col-fixed-left.col-status { min-width: 120px; }
        .order-table .col-fixed-left.col-display-id { left: 120px; min-width: 120px; }
        .order-table thead .col-fixed-left { background: var(--sidebar-bg, #f8fafc) !important; }
        .order-table tbody .col-fixed-left { background: var(--card-bg, #fff) !important; }
        .order-table tbody tr:hover .col-fixed-left { background: var(--sidebar-bg, #f8fafc) !important; }
        .order-table .col-fixed-right { position: sticky; right: 0; z-index: 10; min-width: 90px; box-shadow: -4px 0 8px -2px rgba(0,0,0,0.08); }
        .order-table thead .col-fixed-right { background: var(--sidebar-bg, #f8fafc) !important; }
        .order-table tbody .col-fixed-right { background: var(--card-bg, #fff) !important; }
        .order-table tbody tr:hover .col-fixed-right { background: var(--sidebar-bg, #f8fafc) !important; }
        .order-status-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.8rem; text-transform: capitalize; }
        .order-status-badge.status-pending { background: #fef3c7; color: #92400e; }
        .order-status-badge.status-confirmed { background: #dbeafe; color: #1e40af; }
        .order-status-badge.status-sample_collected { background: #e0e7ff; color: #3730a3; }
        .order-status-badge.status-processing { background: #fce7f3; color: #9d174d; }
        .order-status-badge.status-completed { background: #d1fae5; color: #065f46; }
        .order-status-badge.status-cancelled { background: #fee2e2; color: #991b1b; }
        .order-action-btns { display: inline-flex; gap: 0.5rem; }
        .icon-btn { padding: 0.4rem; border: none; background: transparent; color: var(--accent); cursor: pointer; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; }
        .icon-btn:hover { background: rgba(191, 0, 39, 0.1); }
        .no-orders { text-align: center; color: var(--text-muted); padding: 2rem !important; }
      `}</style>
    </div>
  )
}
