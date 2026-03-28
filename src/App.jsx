import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { supabase } from './lib/supabase'
import ErrorBoundary from './components/ErrorBoundary'
import { getSetting } from './lib/siteSettings'

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
const PostJob         = lazy(() => import('./pages/PostJob'))
const JobListings     = lazy(() => import('./pages/JobListings'))
const JobDetail       = lazy(() => import('./pages/JobDetail'))
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin'))
const AdminPanel      = lazy(() => import('./pages/admin/AdminPanel'))
const ManagerPanel    = lazy(() => import('./pages/admin/ManagerPanel'))
const StaffPanel      = lazy(() => import('./pages/admin/StaffPanel'))
const LegalPage       = lazy(() => import('./pages/LegalPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f3eeff' }}>
      <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
    </div>
  )
}

function MaintenanceGate({ children }) {
  const location = useLocation()
  const [maintenance, setMaintenance] = useState(() => getSetting('maintenanceMode'))
  const [platformName, setPlatformName] = useState(() => getSetting('platformName'))

  useEffect(() => {
    function onUpdate(e) {
      if (e.detail?.key === 'maintenanceMode') setMaintenance(e.detail.value)
      if (e.detail?.key === 'platformName') setPlatformName(e.detail.value)
    }
    window.addEventListener('brandior:settings-updated', onUpdate)
    return () => window.removeEventListener('brandior:settings-updated', onUpdate)
  }, [])

  const isAdmin = location.pathname.startsWith('/admin')
  if (maintenance && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#4c1d95' }}>
          <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{platformName} is under maintenance</h1>
        <p className="text-white/40 text-base max-w-md">We're making some improvements. We'll be back shortly. Thank you for your patience.</p>
      </div>
    )
  }
  return children
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
const ADMIN_PATHS = ['/admin', '/admin/login', '/admin/manager', '/admin/staff']

export default function App() {
  const navigate = useNavigate()
  const [authReady, setAuthReady] = useState(!!localStorage.getItem('brandiór_user'))

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const metaRole = session.user.user_metadata?.role

        if (event === 'SIGNED_IN') {
          // LoginPage already set localStorage + used window.location.href to redirect.
          // Only handle Google OAuth (no role in metadata → send to role picker).
          localStorage.setItem('brandiór_user', session.user.id)
          if (!metaRole && !localStorage.getItem('brandiór_role')) {
            localStorage.removeItem('brandiór_role')
            navigate('/signup?step=role&oauth=1', { replace: true })
          }
        } else if (event === 'INITIAL_SESSION') {
          localStorage.setItem('brandiór_user', session.user.id)
          // Trust localStorage role set at login time — never override with Supabase metadata
          if (!localStorage.getItem('brandiór_role')) {
            if (metaRole) {
              localStorage.setItem('brandiór_role', metaRole)
            } else {
              navigate('/signup?step=role&oauth=1', { replace: true })
            }
          }
        }
      } else {
        localStorage.removeItem('brandiór_user')
        localStorage.removeItem('brandiór_role')
      }
      setAuthReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Show spinner only on first load when we have no cached auth state
  if (!authReady) return <PageLoader />

  return (
    <ErrorBoundary>
    <MaintenanceGate>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"             element={<PublicOnly><Landing /></PublicOnly>} />
        <Route path="/for-talents"  element={<PublicOnly><TalentLanding /></PublicOnly>} />
        <Route path="/for-brands"   element={<PublicOnly><BrandLanding /></PublicOnly>} />
        <Route path="/signup"       element={<PublicOnly><SignupPage /></PublicOnly>} />
        <Route path="/login"        element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/dashboard"              element={<TalentDashboard />} />
        <Route path="/marketplace"            element={<Marketplace />} />
        <Route path="/creators/:handle"       element={<TalentProfilePage />} />
        <Route path="/marketplace/:handle"  element={<TalentProfilePage />} />
        <Route path="/order/:packageId"       element={<OrderForm />} />
        <Route path="/brand-dashboard"        element={<BrandDashboard />} />
        <Route path="/post-job"               element={<PostJob />} />
        <Route path="/jobs"                   element={<JobListings />} />
        <Route path="/jobs/:slug"             element={<JobDetail />} />
        <Route path="/admin/login"            element={<AdminLogin />} />
        <Route path="/admin"                  element={<AdminPanel />} />
        <Route path="/admin/manager"          element={<ManagerPanel />} />
        <Route path="/admin/staff"            element={<StaffPanel />} />
        <Route path="/terms"                  element={<LegalPage />} />
        <Route path="/privacy"                element={<LegalPage />} />
        <Route path="/cookies"                element={<LegalPage />} />
      </Routes>
    </Suspense>
    </MaintenanceGate>
    </ErrorBoundary>
  )
}
