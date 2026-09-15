import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { supabase } from './lib/supabase'
import ErrorBoundary from './components/ErrorBoundary'
import { getSetting, loadSettingsFromDB } from './lib/siteSettings'
import { loadLogosFromDB } from './lib/brandSettings'
import { loadThemeFromDB } from './lib/themeSettings'

// Capture at module load time — before Supabase processes/strips the ?code= parameter.
// This is the only reliable way to detect a password-recovery link click.
const STARTED_WITH_RECOVERY = (
  new URLSearchParams(window.location.search).has('code') ||
  new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
)

// Domain routing — app.brandior.africa is the web app, www.brandior.africa is marketing/SEO.
// localhost/127.0.0.1 behave as app domain so all routes work during development.
const IS_APP = ['app.brandior.africa', 'localhost', '127.0.0.1'].includes(window.location.hostname)
const APP_URL = 'https://app.brandior.africa'
const WWW_URL = 'https://www.brandior.africa'

const ComingSoon      = lazy(() => import('./pages/ComingSoon'))
const Landing         = lazy(() => import('./pages/Landing'))
const TalentLanding   = lazy(() => import('./pages/TalentLanding'))
const BrandLanding    = lazy(() => import('./pages/BrandLanding'))
const SignupPage      = lazy(() => import('./pages/SignupPage'))
const LoginPage       = lazy(() => import('./pages/LoginPage'))
const TalentDashboard = lazy(() => import('./pages/TalentDashboard'))
const Marketplace     = lazy(() => import('./pages/Marketplace'))
const TalentProfilePage = lazy(() => import('./pages/TalentProfilePage'))
const BrandDashboard  = lazy(() => import('./pages/BrandDashboard'))
const CollabBriefPage  = lazy(() => import('./pages/CollabBriefPage'))
const CollabReviewPage = lazy(() => import('./pages/CollabReviewPage'))
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin'))
const AdminPanel      = lazy(() => import('./pages/admin/AdminPanel'))
const ManagerPanel    = lazy(() => import('./pages/admin/ManagerPanel'))
const StaffPanel      = lazy(() => import('./pages/admin/StaffPanel'))
const LegalPage       = lazy(() => import('./pages/LegalPage'))
const AboutPage       = lazy(() => import('./pages/AboutPage'))
const ContactPage     = lazy(() => import('./pages/ContactPage'))
const HowItWorksPage  = lazy(() => import('./pages/HowItWorksPage'))
const PricingPage     = lazy(() => import('./pages/PricingPage'))
const ConfirmedPage      = lazy(() => import('./pages/ConfirmedPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f3eeff' }}>
      <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
    </div>
  )
}

// Immediately navigates the browser to a different domain (not React Router — full page replace).
// Pass keepSearch=true to forward the current query string (e.g. ?role=talent).
function CrossDomainRedirect({ to, keepSearch }) {
  const { search } = useLocation()
  useEffect(() => { window.location.replace(to + (keepSearch && search ? search : '')) }, [])
  return <PageLoader />
}

// Like CrossDomainRedirect but substitutes :param tokens from the current route match.
function ParamRedirect({ baseUrl, path }) {
  const params = useParams()
  const resolved = path.replace(/:(\w+)/g, (_, k) => encodeURIComponent(params[k] || ''))
  useEffect(() => { window.location.replace(baseUrl + resolved) }, [])
  return <PageLoader />
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
// Exception: allow /signup?step=complete for new Google users to complete profile.
function PublicOnly({ children }) {
  if (localStorage.getItem('brandiór_user')) {
    const params = new URLSearchParams(window.location.search)
    if (params.get('step') === 'complete') return children  // profile completion allowed while logged in
    const role = localStorage.getItem('brandiór_role')
    return <Navigate to={role === 'talent' ? '/dashboard' : '/brand-dashboard'} replace />
  }
  return children
}

// Logged-in → show the page. Logged-out → redirect to /login. Recovery session → reset page only.
function PrivateRoute({ children, isRecoverySession }) {
  if (isRecoverySession) return <Navigate to="/reset-password" replace />
  if (!localStorage.getItem('brandiór_user')) return <Navigate to="/login" replace />
  return children
}

function RootRoute() {
  if (!IS_APP) return <PublicOnly><ComingSoon /></PublicOnly>
  const user = localStorage.getItem('brandiór_user')
  if (user) {
    const role = localStorage.getItem('brandiór_role')
    return <Navigate to={role === 'talent' ? '/dashboard' : '/brand-dashboard'} replace />
  }
  return <Navigate to="/login" replace />
}

const PUBLIC_PATHS = ['/', '/for-talents', '/for-brands', '/signup', '/login']
const ADMIN_PATHS = ['/admin', '/admin/login', '/admin/manager', '/admin/staff']

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authReady, setAuthReady] = useState(!!localStorage.getItem('brandiór_user'))
  const [isRecoverySession, setIsRecoverySession] = useState(false)

  // Load logos, theme colours, and platform settings from DB on startup
  useEffect(() => { loadLogosFromDB(); loadThemeFromDB(); loadSettingsFromDB() }, [])


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (window.location.pathname.startsWith('/admin')) { setAuthReady(true); return }
      // Recovery link clicked — lock session to /reset-password only, no dashboard access
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true)
        setAuthReady(true)
        navigate('/reset-password', { replace: true })
        return
      }
      if (location.pathname === '/reset-password') { setAuthReady(true); return }
      if (session) {
        const metaRole = session.user.user_metadata?.role

        if (event === 'PASSWORD_RECOVERY') {
          setAuthReady(true)
          return
        } else if (event === 'SIGNED_IN') {
          if (location.pathname === '/reset-password') { setAuthReady(true); return }
          // SIGNED_IN fires as part of the recovery code exchange — PASSWORD_RECOVERY follows next.
          // Supabase strips ?code= from the URL before events fire, so check the module-level flag.
          if (STARTED_WITH_RECOVERY) {
            navigate('/reset-password', { replace: true })
            setAuthReady(true)
            return
          }
          localStorage.setItem('brandiór_user', session.user.id)
          // Pick up role the user selected before Google OAuth redirect
          const pendingRole = sessionStorage.getItem('brandiór_pending_role')
          const isNewSignup  = sessionStorage.getItem('brandiór_new_signup') === '1'
          if (pendingRole) {
            sessionStorage.removeItem('brandiór_pending_role')
            sessionStorage.removeItem('brandiór_new_signup')
            localStorage.setItem('brandiór_role', pendingRole)
            if (isNewSignup) {
              // New Google signup — send to profile completion
              navigate(`/signup?step=complete&oauth=1&role=${pendingRole}`, { replace: true })
            } else {
              navigate(pendingRole === 'brand' ? '/brand-dashboard' : '/dashboard', { replace: true })

            }
          } else if (!localStorage.getItem('brandiór_role')) {
            if (metaRole) {
              localStorage.setItem('brandiór_role', metaRole)
              const profileComplete = session.user.user_metadata?.profile_complete
              if (!profileComplete) {
                navigate(`/signup?step=complete&oauth=1&role=${metaRole}`, { replace: true })
              } else {
                navigate(metaRole === 'brand' ? '/brand-dashboard' : '/dashboard', { replace: true })
              }
            } else {
              navigate('/signup?step=role&oauth=1', { replace: true })
            }
          }
        } else if (event === 'INITIAL_SESSION') {
          // Don't process initial session if it came from a recovery link
          if (STARTED_WITH_RECOVERY) { setAuthReady(true); return }
          localStorage.setItem('brandiór_user', session.user.id)
          if (!localStorage.getItem('brandiór_role')) {
            if (metaRole) {
              localStorage.setItem('brandiór_role', metaRole)
            } else {
              // Check profiles table before falling back to role picker
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .maybeSingle()
              if (profile?.role) {
                localStorage.setItem('brandiór_role', profile.role)
              } else {
                navigate('/signup?step=role&oauth=1', { replace: true })
              }
            }
          }
        }
      } else {
        const wasLoggedIn = !!localStorage.getItem('brandiór_user')
        localStorage.removeItem('brandiór_user')
        localStorage.removeItem('brandiór_role')
        setIsRecoverySession(false)
        if (wasLoggedIn) navigate('/login', { replace: true })
      }
      setAuthReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Show spinner only on first load when we have no cached auth state
  if (!authReady) return <PageLoader />

  return (
    <ErrorBoundary key={location.key}>
    <MaintenanceGate>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root — www shows ComingSoon; app redirects to marketplace or dashboard */}
        <Route path="/" element={<RootRoute />} />

        {/* ── Marketing / SEO — www.brandior.africa only ────────────────────── */}
        <Route path="/preview"
          element={IS_APP ? <CrossDomainRedirect to={`${WWW_URL}/preview`} /> : <Landing />} />
        <Route path="/for-talents"
          element={IS_APP ? <CrossDomainRedirect to={`${WWW_URL}/for-talents`} /> : <TalentLanding />} />
        <Route path="/for-brands"
          element={IS_APP ? <CrossDomainRedirect to={`${WWW_URL}/for-brands`} /> : <BrandLanding />} />
        <Route path="/about"
          element={IS_APP ? <CrossDomainRedirect to={`${WWW_URL}/about`} /> : <AboutPage />} />
        <Route path="/contact"
          element={IS_APP ? <CrossDomainRedirect to={`${WWW_URL}/contact`} /> : <ContactPage />} />
        <Route path="/how-it-works"
          element={IS_APP ? <CrossDomainRedirect to={`${WWW_URL}/how-it-works`} /> : <HowItWorksPage />} />
        <Route path="/pricing"
          element={IS_APP ? <CrossDomainRedirect to={`${WWW_URL}/pricing`} /> : <PricingPage />} />

        {/* ── Auth — app.brandior.africa only; www redirects straight to app ── */}
        <Route path="/login"
          element={IS_APP
            ? <PublicOnly><LoginPage /></PublicOnly>
            : <CrossDomainRedirect to={`${APP_URL}/login`} keepSearch />} />
        <Route path="/signup"
          element={IS_APP
            ? <PublicOnly><SignupPage /></PublicOnly>
            : <CrossDomainRedirect to={`${APP_URL}/signup`} keepSearch />} />
        <Route path="/signup/brand"
          element={IS_APP
            ? <PublicOnly><SignupPage /></PublicOnly>
            : <CrossDomainRedirect to={`${APP_URL}/signup/brand`} />} />
        <Route path="/signup/creator"
          element={IS_APP
            ? <PublicOnly><SignupPage /></PublicOnly>
            : <CrossDomainRedirect to={`${APP_URL}/signup/creator`} />} />
        <Route path="/forgot-password"
          element={IS_APP
            ? <ForgotPasswordPage />
            : <CrossDomainRedirect to={`${APP_URL}/forgot-password`} />} />
        <Route path="/reset-password"
          element={IS_APP
            ? <ResetPasswordPage />
            : <CrossDomainRedirect to={`${APP_URL}/reset-password`} />} />
        <Route path="/confirmed"
          element={IS_APP
            ? <ConfirmedPage />
            : <CrossDomainRedirect to={`${APP_URL}/confirmed`} />} />

        {/* ── App pages — app.brandior.africa only ───────────────────────────── */}
        <Route path="/marketplace"
          element={IS_APP
            ? <Marketplace />
            : <CrossDomainRedirect to={`${APP_URL}/marketplace`} />} />
        <Route path="/creators/:handle"
          element={IS_APP
            ? <TalentProfilePage />
            : <ParamRedirect baseUrl={APP_URL} path="/creators/:handle" />} />
        <Route path="/marketplace/:handle"
          element={IS_APP
            ? <TalentProfilePage />
            : <ParamRedirect baseUrl={APP_URL} path="/marketplace/:handle" />} />
        <Route path="/dashboard"
          element={IS_APP
            ? <PrivateRoute isRecoverySession={isRecoverySession}><TalentDashboard /></PrivateRoute>
            : <CrossDomainRedirect to={`${APP_URL}/dashboard`} />} />
        <Route path="/brand-dashboard"
          element={IS_APP
            ? <PrivateRoute isRecoverySession={isRecoverySession}><BrandDashboard /></PrivateRoute>
            : <CrossDomainRedirect to={`${APP_URL}/brand-dashboard`} />} />
        <Route path="/collab/brief"
          element={IS_APP
            ? <PrivateRoute isRecoverySession={isRecoverySession}><CollabBriefPage /></PrivateRoute>
            : <CrossDomainRedirect to={`${APP_URL}/collab/brief`} />} />
        <Route path="/collab/review"
          element={IS_APP
            ? <PrivateRoute isRecoverySession={isRecoverySession}><CollabReviewPage /></PrivateRoute>
            : <CrossDomainRedirect to={`${APP_URL}/collab/review`} />} />

        {/* ── Admin — app.brandior.africa only (vercel.json redirects www→app) ─ */}
        <Route path="/admin/login"   element={<AdminLogin />} />
        <Route path="/admin"         element={<AdminPanel />} />
        <Route path="/admin/manager" element={<ManagerPanel />} />
        <Route path="/admin/staff"   element={<StaffPanel />} />

        {/* ── Legal — available on both domains ──────────────────────────────── */}
        <Route path="/terms"          element={<LegalPage />} />
        <Route path="/privacy"        element={<LegalPage />} />
        <Route path="/cookies"        element={<LegalPage />} />
        <Route path="/acceptable-use" element={<LegalPage />} />
      </Routes>
    </Suspense>
    </MaintenanceGate>
    </ErrorBoundary>
  )
}
