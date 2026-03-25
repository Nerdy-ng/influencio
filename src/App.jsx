import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import TalentLanding from './pages/TalentLanding'
import BrandLanding from './pages/BrandLanding'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import TalentDashboard from './pages/TalentDashboard'
import Marketplace from './pages/Marketplace'
import TalentProfilePage from './pages/TalentProfilePage'
import OrderForm from './pages/OrderForm'
import BrandDashboard from './pages/BrandDashboard'
import JobListings from './pages/JobListings'
import JobDetail from './pages/JobDetail'
import AdminLogin from './pages/admin/AdminLogin'
import AdminPanel from './pages/admin/AdminPanel'
import ManagerPanel from './pages/admin/ManagerPanel'
import StaffPanel from './pages/admin/StaffPanel'

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
  )
}
