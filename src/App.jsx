import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import DocumentTitle from './components/DocumentTitle'
import { LoadingOverlay } from './components/Spinner'
// Keep layout static - don't lazy load it
import DashboardLayout from './components/DashboardLayout'

// Lazy load only page components (not layout)
const LoginChoice = lazy(() => import('./pages/LoginChoice'))
const BdAdminLogin = lazy(() => import('./pages/BdAdminLogin'))
const HrLogin = lazy(() => import('./pages/HrLogin'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Summary = lazy(() => import('./pages/Summary'))
const SubscriptionDetails = lazy(() => import('./pages/SubscriptionDetails'))
const SubscriptionDetail = lazy(() => import('./pages/SubscriptionDetail'))
const CreateClient = lazy(() => import('./pages/CreateClient'))
const CreateBenefit = lazy(() => import('./pages/CreateBenefit'))
const CreatePackage = lazy(() => import('./pages/CreatePackage'))
const CreatePartner = lazy(() => import('./pages/CreatePartner'))
const CreateCollectionCenter = lazy(() => import('./pages/CreateCollectionCenter'))
const PriceCalculator = lazy(() => import('./pages/PriceCalculator'))
const EnrollEmployee = lazy(() => import('./pages/EnrollEmployee'))
const RequestDashboard = lazy(() => import('./pages/RequestDashboard'))
const CreateTest = lazy(() => import('./pages/CreateTest'))
const TestCenterMapping = lazy(() => import('./pages/TestCenterMapping'))
const SlotConfiguration = lazy(() => import('./pages/SlotConfiguration'))
const CityCatalogue = lazy(() => import('./pages/CityCatalogue'))
const AvailableSlots = lazy(() => import('./pages/AvailableSlots'))

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <DocumentTitle />
          <Routes>
          {/* Login routes with Suspense */}
          <Route path="/login" element={
            <Suspense fallback={<LoadingOverlay message="Loading..." />}>
              <LoginChoice />
            </Suspense>
          } />
          <Route path="/login/bd-admin" element={
            <Suspense fallback={<LoadingOverlay message="Loading..." />}>
              <BdAdminLogin />
            </Suspense>
          } />
          <Route path="/login/hr" element={
            <Suspense fallback={<LoadingOverlay message="Loading..." />}>
              <HrLogin />
            </Suspense>
          } />

          {/* Dashboard routes - Suspense is inside DashboardLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="summary" element={<Summary />} />
            <Route path="subscriptions/:type" element={<SubscriptionDetails />} />
            <Route path="subscription/:subscriptionId" element={<SubscriptionDetail />} />
            <Route path="clients/create" element={<CreateClient />} />
            <Route path="benefit/create" element={<CreateBenefit />} />
            <Route path="benefit/view/:id" element={<CreateBenefit />} />
            <Route path="benefit/edit/:id" element={<CreateBenefit />} />
            <Route path="package/create" element={<CreatePackage />} />
            <Route path="partners/create" element={<CreatePartner />} />
            <Route path="partners/view/:id" element={<CreatePartner mode="view" />} />
            <Route path="partners/edit/:id" element={<CreatePartner mode="edit" />} />
            <Route path="centers/create" element={<CreateCollectionCenter />} />
            <Route path="price-calculator" element={<PriceCalculator />} />
            <Route path="enroll-employee" element={<EnrollEmployee />} />
            <Route path="request-dashboard" element={<RequestDashboard />} />
            <Route path="tests/upload" element={<CreateTest />} />
            <Route path="tests/mapping" element={<TestCenterMapping />} />
            <Route path="slots/config" element={<SlotConfiguration />} />
            <Route path="catalogues" element={<CityCatalogue />} />
            <Route path="available-slots" element={<AvailableSlots />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
