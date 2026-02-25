/**
 * Spinner Component
 * Reusable loading spinner with multiple sizes and variants
 */

export default function Spinner({ size = 'md', variant = 'primary', className = '' }) {
  const sizeClass = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  }[size] || 'spinner-md'

  const variantClass = variant === 'light' ? 'spinner-light' : ''

  return (
    <div className={`spinner ${sizeClass} ${variantClass} ${className}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Loading Overlay Component
 * Full-screen or container loading overlay with spinner
 */
export function LoadingOverlay({ message = 'Loading...', dark = false }) {
  return (
    <div className={`loading-overlay ${dark ? 'loading-overlay-dark' : ''}`}>
      <div className="loading-content">
        <Spinner size="lg" variant={dark ? 'light' : 'primary'} />
        {message && <div className="loading-text">{message}</div>}
      </div>
    </div>
  )
}

/**
 * Inline Spinner Component
 * Small spinner for inline use (e.g., in buttons)
 */
export function InlineSpinner({ className = '' }) {
  return <Spinner size="sm" className={className} />
}

/**
 * Skeleton Loader Component
 * Placeholder loading state for content
 */
export function Skeleton({ type = 'text', className = '' }) {
  const typeClass = {
    text: 'skeleton-text',
    title: 'skeleton-title',
    card: 'skeleton-card',
  }[type] || 'skeleton-text'

  return <div className={`skeleton ${typeClass} ${className}`} />
}

