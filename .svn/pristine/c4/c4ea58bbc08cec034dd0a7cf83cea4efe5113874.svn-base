import { useState, useEffect, Suspense } from 'react'
import { Outlet, useNavigate, useLocation, Link, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingOverlay } from './Spinner'
import '../App.css'

const NAV_ADMIN = [
  { id: 'partners', label: 'Manage Partners', path: '/dashboard?tab=partners', children: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard?tab=partners' },
    { id: 'create', label: 'Create', path: '/dashboard/partners/create' },
    { id: 'center', label: 'Centers', path: '/dashboard/centers/create' },
    { id: 'test-creation', label: 'Test Creation', path: '/dashboard/tests/upload' },
    { id: 'test-mapping', label: 'Center Mapping', path: '/dashboard/tests/mapping' },
    { id: 'slot-config', label: 'Slot Configuration', path: '/dashboard/slots/config' },
    { id: 'city-catalogue', label: 'City Catalogues', path: '/dashboard/catalogues' },
  ]},
  { id: 'summary', label: 'Organization Summary', path: '/dashboard/summary', children: null },
  { id: 'available-slots', label: 'Slots Dashboard', path: '/dashboard/available-slots', children: null },
  { id: 'benefit', label: 'Benefit', path: '/dashboard?tab=benefit', children: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard?tab=benefit' },
    { id: 'create', label: 'Create', path: '/dashboard/benefit/create' },
  ]},
  { id: 'package', label: 'Package', path: '/dashboard?tab=package', children: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard?tab=package' },
    { id: 'create', label: 'Create', path: '/dashboard/package/create' },
  ]},
  { id: 'request-dashboard', label: 'Request Dashboard', path: '/dashboard/request-dashboard', children: null },
]

const NAV_EMPLOYEE = [
  { id: 'summary', label: 'Organization Summary', path: '/dashboard/summary', children: null },
  { id: 'available-slots', label: 'Slots Dashboard', path: '/dashboard/available-slots', children: null },
  { id: 'price-calculator', label: 'Price Calculator', path: '/dashboard/price-calculator', children: null },
  { id: 'request-dashboard', label: 'Request Dashboard', path: '/dashboard/request-dashboard', children: null },
]

const ADMIN_ALLOWED_BASE = ['/dashboard?tab=', '/dashboard/partners', '/dashboard/benefit', '/dashboard/package', '/dashboard/centers', '/dashboard/request-dashboard']

function isCreatePath(pathname) {
  return pathname.includes('/create')
}

function isHrAllowedPath(pathname) {
  // HR users can access: summary, subscriptions, subscription detail, available-slots, price-calculator, enroll-employee, request-dashboard
  return pathname === '/dashboard/summary' ||
         pathname.startsWith('/dashboard/subscriptions/') ||
         pathname.startsWith('/dashboard/subscription/') ||
         pathname === '/dashboard/available-slots' ||
         pathname === '/dashboard/price-calculator' ||
         pathname.startsWith('/dashboard/enroll-employee') ||
         pathname === '/dashboard/request-dashboard'
}

function getExpandedNav(pathname, search, navStructure) {
  const tab = new URLSearchParams(search).get('tab')
  for (const item of navStructure) {
    if (!item.children) continue
    if (item.id === 'partners' && (pathname.startsWith('/dashboard/partners') || pathname.startsWith('/dashboard/centers') || pathname.startsWith('/dashboard/tests') || pathname.startsWith('/dashboard/slots') || pathname.startsWith('/dashboard/catalogues') || tab === 'partners')) return 'partners'
    if (item.id === 'benefit' && (pathname.startsWith('/dashboard/benefit') || tab === 'benefit')) return 'benefit'
    if (item.id === 'package' && (pathname.startsWith('/dashboard/package') || tab === 'package')) return 'package'
  }
  if (pathname === '/dashboard/summary') return 'summary'
  return null
}

function isRequestDashboard(pathname) {
  return pathname === '/dashboard/request-dashboard'
}
function isPriceCalculator(pathname) {
  return pathname === '/dashboard/price-calculator'
}
function isSummary(pathname) {
  return pathname === '/dashboard/summary' || pathname.startsWith('/dashboard/subscriptions/') || pathname.startsWith('/dashboard/subscription/')
}
export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const searchParams = new URLSearchParams(location.search)
  const isAdmin = user?.type === 'bd_admin'
  const isHr = user?.type === 'hr'
  const navStructure = isAdmin ? NAV_ADMIN : NAV_EMPLOYEE
  const expandedNav = getExpandedNav(pathname, location.search, navStructure)

  const isPriceCalculatorActive = isPriceCalculator(pathname)
  const isRequestDashboardActive = isRequestDashboard(pathname)
  const isSummaryActive = isSummary(pathname)

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Sidebar resize state
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [isResizing, setIsResizing] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname, location.search])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sidebar resize handlers
  const handleMouseDown = (e) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return

      const newWidth = e.clientX
      // Set min and max width constraints
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  if (isAdmin && pathname === '/dashboard' && !searchParams.get('tab')) {
    return <Navigate to="/dashboard?tab=partners" replace />
  }
  if (isHr && pathname === '/dashboard') {
    return <Navigate to="/dashboard/summary" replace />
  }
  if (isHr && !isHrAllowedPath(pathname)) {
    return <Navigate to="/dashboard/summary" replace />
  }
  if (isAdmin && pathname === '/dashboard/price-calculator') {
    return <Navigate to="/dashboard?tab=partners" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app">
      {/* Mobile menu toggle button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}>
        <div className="sidebar-header">
          <Link to={isAdmin ? '/dashboard?tab=partners' : '/dashboard/summary'} className="logo-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            {isHr ? (
              <span className="logo-icon">HR</span>
            ) : (
              <span className="logo-icon logo-icon--img">
                <img src="/MedPlusLogo.svg" alt="MedPlus" />
              </span>
            )}
            <div>
              <h1 className="sidebar-title">{isHr ? 'HR Dashboard' : 'BD Dashboard'}</h1>
              {isHr && user?.organizationName && (
                <p className="sidebar-org-name" style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>{user.organizationName}</p>
              )}
            </div>
          </Link>
        </div>
        <nav className="sidebar-nav">
          {navStructure.map((item) => (
            <div key={item.id} className="nav-group">
              {item.children ? (
                <>
                  <Link
                    to={item.path}
                    className={`nav-item nav-parent ${expandedNav === item.id ? 'active' : ''}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span className="nav-chevron">{expandedNav === item.id ? '▾' : '▸'}</span>
                  </Link>
                  {expandedNav === item.id && (
                    <div className="nav-children">
                      {item.children.map((child) => {
                        // Custom active check to prevent multiple active states
                        const isChildActive = () => {
                          const currentPath = pathname + location.search
                          const childPath = child.path

                          // Exact match for query params
                          if (childPath.includes('?')) {
                            return currentPath === childPath
                          }

                          // For regular paths, exact match or starts with path + /
                          // This handles both exact matches and sub-routes
                          if (pathname === childPath) {
                            return true
                          }

                          // Check if it's a sub-route (e.g., /dashboard/partners/create/123)
                          if (pathname.startsWith(childPath + '/')) {
                            return true
                          }

                          return false
                        }

                        return (
                          <NavLink
                            key={child.id}
                            to={child.path}
                            className={() => `nav-item nav-child ${isChildActive() ? 'active' : ''}`}
                          >
                            {child.label}
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  isActive={() => {
                    if (item.id === 'summary') return isSummaryActive
                    if (item.id === 'price-calculator') return isPriceCalculatorActive
                    if (item.id === 'request-dashboard') return isRequestDashboardActive
                    return false
                  }}
                  className={({ isActive }) => `nav-item nav-parent ${isActive ? 'active' : ''}`}
                >
                  <span>{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name ?? user?.username ?? user?.email ?? '—'}</div>
            <div className="sidebar-user-role">{user?.type === 'hr' ? 'HR User' : 'BD Admin'}</div>
          </div>
          <button type="button" className="btn-logout" onClick={handleLogout}>Log out</button>
        </div>
        <div
          className="sidebar-resize-handle"
          onMouseDown={handleMouseDown}
          title="Drag to resize sidebar"
        />
      </aside>
      <main className="main">
        <Suspense fallback={<LoadingOverlay message="Loading..." />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
