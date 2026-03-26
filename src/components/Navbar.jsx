import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Zap, LayoutDashboard, ImagePlus, TrendingUp, Wallet, Mail, Settings, UserPlus, HelpCircle, Eye, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'profile',      label: 'My Profile',      icon: LayoutDashboard, href: '/dashboard' },
  { id: 'portfolio',    label: 'Portfolio',        icon: ImagePlus,       href: '/dashboard' },
  { id: 'overview',     label: 'Analytics',        icon: TrendingUp,      href: '/dashboard' },
  { id: 'transactions', label: 'Transactions',     icon: Wallet,          href: '/dashboard' },
  { id: 'messages',     label: 'Messages',         icon: Mail,            href: '/dashboard' },
  { id: 'settings',     label: 'Profile Settings', icon: Settings,        href: '/dashboard' },
  { id: 'invite',       label: 'Invite Brands',    icon: UserPlus,        href: '/dashboard' },
  { id: 'support',      label: 'Support',          icon: HelpCircle,      href: '/dashboard' },
]

const TALENT_NAV = [
  { label: 'My Dashboard', href: '/dashboard' },
  { label: 'Messages',     href: '/dashboard?tab=messages',  notifKey: 'messages' },
  { label: 'Analytics',    href: '/dashboard?tab=overview' },
  { label: 'Invite Brands', href: '/dashboard?tab=invite' },
]

const BRAND_NAV = [
  { label: 'Find Talents',   href: '/marketplace' },
  { label: 'My Dashboard',   href: '/brand-dashboard' },
  { label: 'Campaigns',      href: '/brand-dashboard?tab=orders',   notifKey: 'campaigns' },
  { label: 'Messages',       href: '/brand-dashboard?tab=messages', notifKey: 'messages' },
  { label: 'Invite Creator', href: '/brand-dashboard?tab=invite' },
  { label: 'Post a Job',     href: '/post-job', isPostJob: true },
]

function UserAvatar({ profile, size = 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'
  if (profile?.avatar) {
    return <img src={profile.avatar} alt={profile.nickname || 'Profile'} className={`${sz} rounded-full object-cover ring-2 ring-white/40`} />
  }
  const initials = profile?.nickname ? profile.nickname.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'
  return (
    <div className={`${sz} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`} style={{ backgroundColor: '#FF6B9D' }}>
      {initials !== '?' ? initials : (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/80"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
      )}
    </div>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('talent')
  const [notifs, setNotifs] = useState({})

  const joinRef = useRef(null)
  const userRef = useRef(null)

  function loadNotifs() {
    try {
      const stored = localStorage.getItem('brandiór_notifs')
      setNotifs(stored ? JSON.parse(stored) : { messages: 3, campaigns: 1 })
    } catch { setNotifs({}) }
  }

  useEffect(() => {
    function load() {
      const loggedIn = !!localStorage.getItem('brandiór_user')
      setIsLoggedIn(loggedIn)
      if (loggedIn) {
        setUserRole(localStorage.getItem('brandiór_role') || 'talent')
        try {
          const saved = localStorage.getItem('brandiór_preview_profile')
          if (saved) setProfile(JSON.parse(saved))
        } catch { /* ignore */ }
        loadNotifs()
      }
    }
    load()
    window.addEventListener('storage', load)
    window.addEventListener('brandiór:notification', loadNotifs)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('brandiór:notification', loadNotifs)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (joinRef.current && !joinRef.current.contains(e.target)) setJoinOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    localStorage.removeItem('brandiór_user')
    localStorage.removeItem('brandiór_role')
    localStorage.removeItem('brandiór_preview_profile')
    setIsLoggedIn(false)
    setProfile(null)
    setUserOpen(false)
    navigate('/')
  }

  return (
    <nav className={isLoggedIn ? 'fixed top-0 left-0 right-0 z-50' : 'fixed top-4 left-0 right-0 z-50 px-6'}>
      <div
        className={`flex items-center justify-between gap-8 ${isLoggedIn ? 'w-full px-8 py-3' : 'max-w-6xl mx-auto px-6 py-3 rounded-2xl'}`}
        style={isLoggedIn
          ? { backgroundColor: '#0d0020', borderBottom: '1px solid rgba(255,255,255,0.07)' }
          : { backgroundColor: '#c084fc', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(192,132,252,0.35)' }
        }>

        {/* Logo */}
        <Link
          to={isLoggedIn ? (userRole === 'brand' ? '/marketplace' : '/jobs') : '/'}
          onClick={e => {
            if (!isLoggedIn) return
            e.preventDefault()
            const home = userRole === 'brand' ? '/marketplace' : '/jobs'
            if (window.location.pathname === home) {
              window.location.reload()
            } else {
              navigate(home)
            }
          }}
          className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center" style={{ backgroundColor: '#4c1d95' }}>
            <Zap className="w-4 h-4 text-brand-orange" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Brandiór</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {(isLoggedIn ? (userRole === 'brand' ? BRAND_NAV : TALENT_NAV) : [
            { label: 'Brands',       href: '#talents',      isAnchor: true },
            { label: 'Talents',      href: '#pricing',      isAnchor: true },
            { label: 'How it Works', href: '#how-it-works', isAnchor: true },
            { label: 'Marketplace',  href: '/marketplace' },
          ]).map(({ label, href, isAnchor, notifKey, isPostJob }) => (
            <li key={label}>
              {isAnchor
                ? <a href={href}
                    className="text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 block"
                    style={{ color: 'rgba(255,255,255,0.8)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}>
                    {label}
                  </a>
                : isPostJob
                  ? <Link to={href}
                      className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-all duration-200"
                      style={{ backgroundColor: '#FA8112', color: '#fff', boxShadow: '0 2px 12px rgba(250,129,18,0.4)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e07010'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FA8112'}>
                      + Post a Job
                    </Link>
                  : <Link to={href}
                      className="relative inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
                      style={{ color: 'rgba(255,255,255,0.8)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}>
                      {label}
                      {notifKey && notifs[notifKey] > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: '#ef4444' }}>
                          {notifs[notifKey] > 9 ? '9+' : notifs[notifKey]}
                        </span>
                      )}
                    </Link>
              }
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {isLoggedIn ? (
            /* ── Logged-in: avatar dropdown ── */
            <div className="relative" ref={userRef}>
              <button onClick={() => setUserOpen(o => !o)} className="relative focus:outline-none">
                <UserAvatar profile={profile} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-[#c084fc]" />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl shadow-2xl overflow-hidden z-50"
                  style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff' }}>
                  {/* Profile header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: '#f3eeff' }}>
                    <UserAvatar profile={profile} size="sm" />
                    <div className="min-w-0">
                      <p className="text-brand-dark font-bold text-sm truncate">{profile?.nickname || 'Your Profile'}</p>
                      <p className="text-brand-dark/40 text-xs truncate">{profile?.email || 'talent@brandiór.co'}</p>
                    </div>
                  </div>

                  {/* Nav items */}
                  <div className="py-1">
                    {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                      <Link key={id} to={`/dashboard?tab=${id}`} onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-dark/70 font-medium w-full transition-colors"
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#faf5ff'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
                        {label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t" style={{ borderColor: '#f3eeff' }} />

                  {/* View public profile */}
                  <Link to={`/creators/${profile?.handle || profile?.nickname || 'me'}`} target="_blank" rel="noopener noreferrer"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full transition-colors"
                    style={{ color: '#7c3aed' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#faf5ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                    <Eye className="w-3.5 h-3.5" /> View Public Profile
                  </Link>

                  {/* Log out */}
                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full transition-colors"
                    style={{ color: '#FF6B9D' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff5f8'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Logged-out: login + join dropdown ── */
            <>
              <Link to="/login"
                className="text-sm text-white/80 hover:text-white font-medium px-4 py-2 rounded-xl transition-all duration-200"
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                Log in
              </Link>

              <div className="relative" ref={joinRef}>
                <button
                  onClick={() => setJoinOpen(o => !o)}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-colors"
                  style={{ backgroundColor: '#4c1d95' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3b0764'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = joinOpen ? '#3b0764' : '#4c1d95'}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  Get Started
                  <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${joinOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {joinOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-2xl z-50"
                    style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff' }}>
                    <div className="p-2 space-y-1">
                      <Link to="/signup?role=talent" onClick={() => setJoinOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fdf4ff'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B9D18' }}>
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#FF6B9D" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-brand-dark">Join as Talent</p>
                          <p className="text-xs text-brand-dark/40">Monetise your audience</p>
                        </div>
                      </Link>

                      <Link to="/signup?role=brand" onClick={() => setJoinOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fdf4ff'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#c084fc18' }}>
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#c084fc" strokeWidth="2">
                            <path d="M3 3h18v4H3z"/><path d="M3 7v14h18V7"/><path d="M12 7v14"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-brand-dark">Join as Brand</p>
                          <p className="text-xs text-brand-dark/40">Find talents & launch campaigns</p>
                        </div>
                      </Link>
                    </div>
                    <div className="border-t mx-4" style={{ borderColor: '#f3eeff' }} />
                    <p className="text-center text-xs text-brand-dark/30 py-3">
                      Already have an account?{' '}
                      <Link to="/login" onClick={() => setJoinOpen(false)} className="font-semibold" style={{ color: '#c084fc' }}>Log in</Link>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile toggle / avatar */}
        <div className="md:hidden flex items-center gap-2 flex-shrink-0">
          {isLoggedIn && (
            <Link to="/dashboard">
              <UserAvatar profile={profile} size="sm" />
            </Link>
          )}
          <button className="text-white/80 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-6 py-6 space-y-1 mt-2 mx-6 rounded-2xl"
          style={{ backgroundColor: '#c084fc', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(192,132,252,0.35)' }}>
          <div className="h-px bg-white/5 my-1" />
          {isLoggedIn ? (
            <>
              {(userRole === 'brand' ? BRAND_NAV : TALENT_NAV).map(({ label, href, notifKey, isPostJob }) => (
                isPostJob
                  ? <Link key={label} to={href} onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm mb-1"
                      style={{ backgroundColor: '#FA8112', color: '#fff' }}>
                      + Post a Job
                    </Link>
                  : <Link key={label} to={href} onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between text-white/70 hover:text-[#D4AF37] font-medium px-3 py-2.5 border-l-2 border-transparent hover:border-[#D4AF37] rounded-r-xl transition-all">
                      {label}
                      {notifKey && notifs[notifKey] > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: '#ef4444' }}>
                          {notifs[notifKey] > 9 ? '9+' : notifs[notifKey]}
                        </span>
                      )}
                    </Link>
              ))}
              <button onClick={() => { setMobileOpen(false); handleLogout() }}
                className="flex items-center gap-3 text-[#FF6B9D] font-medium px-3 py-2.5 rounded-xl w-full">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signup?role=talent" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 font-bold text-white py-3 px-4 rounded-xl mb-2"
                style={{ backgroundColor: '#FF6B9D' }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Join as Talent
              </Link>
              <Link to="/signup?role=brand" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 font-bold text-white py-3 px-4 rounded-xl mb-2"
                style={{ backgroundColor: '#4c1d95' }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v4H3z"/><path d="M3 7v14h18V7"/><path d="M12 7v14"/>
                </svg>
                Join as Brand
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="block text-center text-white/70 font-medium py-2 hover:text-[#D4AF37] transition-colors">
                Log in
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
