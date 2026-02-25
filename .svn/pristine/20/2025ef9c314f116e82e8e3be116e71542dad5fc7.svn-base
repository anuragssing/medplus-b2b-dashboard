import PropTypes from 'prop-types'
import '../App.css'

/**
 * PageWrapper - Reusable wrapper component for all dashboard pages
 * Provides consistent header and content structure with responsive design
 * 
 * @param {string} title - Page title
 * @param {string} description - Page description/subtitle
 * @param {React.ReactNode} children - Page content
 * @param {React.ReactNode} headerActions - Optional action buttons/elements in header
 */
export default function PageWrapper({ title, description, children, headerActions }) {
  return (
    <>
      <header className="main-header">
        <div className="main-header-content">
          <div className="main-header-text">
            <h2 className="page-title">{title}</h2>
            {description && <p className="page-desc">{description}</p>}
          </div>
          {headerActions && (
            <div className="main-header-actions">
              {headerActions}
            </div>
          )}
        </div>
      </header>
      <div className="content">
        {children}
      </div>
    </>
  )
}

PageWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  headerActions: PropTypes.node,
}

