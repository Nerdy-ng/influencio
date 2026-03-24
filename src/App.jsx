import { Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
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
