import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'BD Dashboard'

const TITLES = {
  '/login': 'Sign in',
  '/login/bd-admin': 'Employee sign in',
  '/login/hr': 'HR sign in',
  '/dashboard': 'Dashboard',
  '/dashboard/price-calculator': 'Price Calculator',
  '/dashboard/enroll-employee': 'Enroll Employee',
  '/dashboard/request-dashboard': 'Request Dashboard',
}

export default function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const pageTitle = TITLES[pathname] || (pathname.startsWith('/dashboard') ? 'Dashboard' : null)
    document.title = pageTitle ? `${pageTitle} – ${SITE_NAME}` : SITE_NAME
  }, [pathname])

  return null
}
