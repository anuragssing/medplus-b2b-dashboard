# Responsive Design Guide

## Overview

The BD Dashboard is now fully responsive and optimized for mobile, tablet, and desktop screens. This document explains the responsive features and how to use the `PageWrapper` component.

## Breakpoints

The application uses the following breakpoints:

- **Desktop**: > 1024px (default)
- **Tablet**: 768px - 1024px
- **Mobile**: 480px - 768px
- **Small Mobile**: < 480px

## Mobile Features

### 1. **Mobile Menu**
- Hamburger menu button (☰) appears on mobile screens
- Sidebar slides in from the left when opened
- Dark overlay closes menu when clicked
- Menu automatically closes when navigating to a new page
- Menu automatically closes when screen is resized to desktop

### 2. **Responsive Layout**
- **Desktop**: Sidebar + main content side-by-side
- **Mobile**: Sidebar hidden by default, main content full-width
- Header padding adjusted for mobile menu button
- Content padding reduced on smaller screens

### 3. **Touch-Friendly**
- Larger touch targets for buttons and links
- Horizontal scrolling for tables on mobile
- Smooth scrolling with `-webkit-overflow-scrolling: touch`

## PageWrapper Component

### Purpose
`PageWrapper` is a reusable component that provides consistent header and content structure across all dashboard pages with built-in responsive design.

### Usage

```jsx
import PageWrapper from '../components/PageWrapper'

export default function MyPage() {
  return (
    <PageWrapper
      title="Page Title"
      description="Page description or subtitle"
      headerActions={
        <button className="btn-primary">Action Button</button>
      }
    >
      {/* Your page content here */}
      <div className="panel">
        <p>Content goes here</p>
      </div>
    </PageWrapper>
  )
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Page title displayed in header |
| `description` | string | No | Page description/subtitle |
| `children` | ReactNode | Yes | Page content |
| `headerActions` | ReactNode | No | Action buttons/elements in header (right side on desktop, below title on mobile) |

### Example: Simple Page

```jsx
<PageWrapper
  title="Manage Partners"
  description="Onboard and manage service partners"
>
  <div className="panel">
    <table>
      {/* table content */}
    </table>
  </div>
</PageWrapper>
```

### Example: Page with Header Actions

```jsx
<PageWrapper
  title="Test Creation"
  description="Upload and manage diagnostic tests"
  headerActions={
    <>
      <button className="btn-secondary">Download Template</button>
      <button className="btn-primary">Upload Tests</button>
    </>
  }
>
  <div className="panel">
    {/* content */}
  </div>
</PageWrapper>
```

### Example: Page with Conditional Actions

```jsx
const headerActions = user?.type === 'bd_admin' ? (
  <button className="btn-primary">Create New</button>
) : null

return (
  <PageWrapper
    title="Dashboard"
    description="Overview of your organization"
    headerActions={headerActions}
  >
    {/* content */}
  </PageWrapper>
)
```

## Responsive CSS Classes

### Layout Classes
- `.main-header-content` - Flex container for header (responsive)
- `.main-header-text` - Header text wrapper
- `.main-header-actions` - Header actions wrapper (stacks on mobile)

### Mobile-Specific Classes
- `.mobile-menu-toggle` - Hamburger menu button (hidden on desktop)
- `.mobile-overlay` - Dark overlay when menu is open
- `.sidebar.mobile-open` - Sidebar visible state on mobile

## Best Practices

### 1. **Use PageWrapper for All Pages**
Replace manual header/content structure with PageWrapper:

**Before:**
```jsx
<>
  <header className="main-header">
    <h2 className="page-title">Title</h2>
    <p className="page-desc">Description</p>
  </header>
  <div className="content">
    {/* content */}
  </div>
</>
```

**After:**
```jsx
<PageWrapper title="Title" description="Description">
  {/* content */}
</PageWrapper>
```

### 2. **Tables**
Always wrap tables in `.table-wrap` for horizontal scrolling on mobile:

```jsx
<div className="table-wrap">
  <table>
    {/* table content */}
  </table>
</div>
```

### 3. **Forms**
Use responsive grid classes:
- `.form-row-2` - 2 columns on desktop, 1 on mobile
- `.form-row-3` - 3 columns on desktop, 1 on mobile

### 4. **Modals**
Modals automatically adjust to mobile screens (full-width, reduced padding)

### 5. **Buttons**
Button groups stack vertically on mobile automatically

## Testing Responsive Design

### Browser DevTools
1. Open Chrome/Firefox DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Test different device sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)

### Real Device Testing
Test on actual devices for touch interactions and performance

## Migration Checklist

To migrate existing pages to use PageWrapper:

- [ ] Import PageWrapper component
- [ ] Replace `<header className="main-header">` with PageWrapper
- [ ] Move title to `title` prop
- [ ] Move description to `description` prop
- [ ] Move header buttons to `headerActions` prop
- [ ] Keep content inside PageWrapper children
- [ ] Remove manual `<div className="content">` wrapper
- [ ] Test on mobile, tablet, and desktop


