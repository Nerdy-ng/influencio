import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { supabase } from './lib/supabase'
import ErrorBoundary from './components/ErrorBoundary'

const Landing         = lazy(() => import('./pages/Landing'))
const TalentLanding   = lazy(() => import('./pages/TalentLanding'))
const BrandLanding    = lazy(() => import('./pages/BrandLanding'))
const SignupPage      = lazy(() => import('./pages/SignupPage'))
const LoginPage       = lazy(() => import('./pages/LoginPage'))
const TalentDashboard = lazy(() => import('./pages/TalentDashboard'))
const Marketplace     = lazy(() => import('./pages/Marketplace'))
const TalentProfilePage = lazy(() => import('./pages/TalentProfilePage'))
const OrderForm       = lazy(() => import('./pages/OrderForm'))
const BrandDashboard  = lazy(() => import('./pages/BrandDashboard'))
const JobListings     = lazy(() => import('./pages/JobListings'))
const JobDetail       = lazy(() => import('./pages/JobDetail'))
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin'))
const AdminPanel      = lazy(() => import('./pages/admin/AdminPanel'))
const ManagerPanel    = lazy(() => import('./pages/admin/ManagerPanel'))
const StaffPanel      = lazy(() => import('./pages/admin/StaffPanel'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f3eeff' }}>
      <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
    </div>
  )
}

// Logged-out → show the page. Logged-in → send to role home.
function PublicOnly({ children }) {
  if (localStorage.getItem('brandiór_user')) {
    const role = localStorage.getItem('brandiór_role')
    return <Navigate to={role === 'talent' ? '/jobs' : '/marketplace'} replace />
  }
  return children
}

const PUBLIC_PATHS = ['/', '/for-talents', '/for-brands', '/signup', '/login']

export default function App() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const role = session.user.user_metadata?.role || 'talent'
        localStorage.setItem('brandiór_user', session.user.id)
        localStorage.setItem('brandiór_role', role)
        // Redirect to role home only when signing in from a public page
        if (event === 'SIGNED_IN' && PUBLIC_PATHS.includes(window.location.pathname)) {
          navigate(role === 'brand' ? '/marketplace' : '/jobs', { replace: true })
        }
      } else {
        localStorage.removeItem('brandiór_user')
        localStorage.removeItem('brandiór_role')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"             element={<PublicOnly><Landing /></PublicOnly>} />
        <Route path="/for-talents"  element={<PublicOnly><TalentLanding /></PublicOnly>} />
        <Route path="/for-brands"   element={<PublicOnly><BrandLanding /></PublicOnly>} />
        <Route path="/signup"       element={<PublicOnly><SignupPage /></PublicOnly>} />
        <Route path="/login"        element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/dashboard"              element={<TalentDashboard />} />
        <Route path="/marketplace"            element={<Marketplace />} />
        <Route path="/marketplace/:talentId"  element={<TalentProfilePage />} />
        <Route path="/order/:packageId"       element={<OrderForm />} />
        <Route path="/brand-dashboard"        element={<BrandDashboard />} />
        <Route path="/jobs"                   element={<JobListings />} />
        <Route path="/jobs/:jobId"            element={<JobDetail />} />
        <Route path="/admin/login"            element={<AdminLogin />} />
        <Route path="/admin"                  element={<AdminPanel />} />
        <Route path="/admin/manager"          element={<ManagerPanel />} />
        <Route path="/admin/staff"            element={<StaffPanel />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  )
}
