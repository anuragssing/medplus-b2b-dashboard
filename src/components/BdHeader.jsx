import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const HEADER_HEIGHT_REM = 3.812

export function getBdHeaderHeightRem() {
  return HEADER_HEIGHT_REM
}

export default function BdHeader({ onLogout }) {
  const { user } = useAuth()
  const displayName = user?.name ?? user?.username ?? user?.email ?? '—'
  const initials = displayName !== '—'
    ? displayName.split(/\s+/).map(s => s[0]).join('').toUpperCase().slice(0, 2)
    : '—'
  const role = user?.type === 'hr' ? 'HR User' : 'BD Admin'

  return (
    <header
      className="bd-header bg-white d-flex justify-content-between align-items-center shadow-sm position-sticky"
      style={{ top: 0, zIndex: 1060, height: `${HEADER_HEIGHT_REM}rem` }}
    >
      <div className="d-flex align-items-center">
        <Link to="/dashboard" className="d-flex align-items-center text-decoration-none text-dark">
          <img src="/MedPlusLogo.svg" alt="MedPlus" className="me-2" style={{ height: '1.75rem' }} />
          <span className="fw-bold">BD Dashboard</span>
        </Link>
      </div>
      <div className="d-flex align-items-center gap-3">
        <div className="text-end d-none d-md-block">
          <div className="small fw-semibold">{displayName}</div>
          <div className="small text-secondary">{role}</div>
        </div>
        <div
          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
          style={{ width: '2.25rem', height: '2.25rem', fontSize: '0.75rem' }}
          title={displayName}
        >
          {initials}
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onLogout}
        >
          Log out
        </button>
      </div>
    </header>
  )
}
