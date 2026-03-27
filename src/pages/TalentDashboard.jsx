import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Zap, BadgeCheck, MapPin, Camera, Star,
  TrendingUp, Users, Heart, MessageCircle, Eye, EyeOff, ChevronRight,
  Briefcase, DollarSign, Edit3, Plus, Save, X, Bell,
  LayoutDashboard, Settings, LogOut, Upload, CheckCircle, Link2,
  HelpCircle, Send, Ticket, ChevronDown, AlertCircle, CheckSquare,
  Wallet, ArrowDownLeft, ArrowUpRight, CreditCard, Hash, Globe, Building2,
  PieChart, BarChart2, Tag, ImagePlus, FileText, Mail, UserPlus,
} from 'lucide-react'
import MessagingPanel from '../components/MessagingPanel'
import InviteTab from '../components/InviteTab'

const pink = '#FF6B9D'
const gold = '#D4AF37'
const purple = '#c084fc'
const darkPurple = '#4c1d95'

const TIERS = {
  'fast-rising': {
    label: 'Fast Rising', color: '#22c55e', bg: '#22c55e18', border: '#22c55e40', emoji: null, StarIcon: true, diamond: false,
    desc: 'You\'re new and climbing. Keep creating!',
    perks: ['Profile listed on Brandiór', 'Apply for entry-level gigs', 'Access talent community'],
    criteria: ['Complete your profile', 'Connect 1 social account', '3+ completed campaigns'],
  },
  'next-rated': {
    label: 'Next', color: '#a78bfa', bg: '#a78bfa18', border: '#a78bfa40', emoji: '⚡', StarIcon: false, diamond: true,
    desc: 'You\'re gaining traction. Brands are noticing you.',
    perks: ['Priority in brand searches', 'Access mid-tier gigs', 'Verified badge eligibility', 'Dedicated account manager'],
    criteria: ['10+ completed campaigns', '4.0+ average rating', '5K+ total followers'],
  },
  'top-rated': {
    label: 'Top', color: '#D4AF37', bg: '#D4AF3718', border: '#D4AF3740', emoji: '👑', StarIcon: false, diamond: true,
    desc: 'The elite. Brands seek you out directly.',
    perks: ['Featured in brand discovery', 'Premium gig access', 'Negotiated rates unlocked', 'Early access to new features', 'Dedicated talent manager'],
    criteria: ['30+ completed campaigns', '4.7+ average rating', '25K+ total followers'],
  },
}

function Diamond({ color, size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'inline', flexShrink: 0 }}>
      <path d="M12 2L2 9l10 13L22 9z" />
    </svg>
  )
}

function TierLabel({ tier }) {
  const t = TIERS[tier]
  return (
    <span className="flex items-center gap-1">
      {t.diamond
        ? <Diamond color={t.color} size={10} />
        : t.label
      }
    </span>
  )
}

function TierIcon({ tier }) {
  const t = TIERS[tier]
  if (t.StarIcon) return <Star className="w-3 h-3 fill-current" style={{ color: t.color }} />
  return <span>{t.emoji}</span>
}

const NICHES = [
  'Beauty & Skincare', 'Fashion & Style', 'Food & Cooking', 'Tech & Gadgets',
  'Fitness & Health', 'Travel', 'Comedy & Entertainment', 'Parenting',
  'Finance & Business', 'Music', 'Gaming', 'Lifestyle', 'Sports', 'Education',
]

const CONTENT_STYLES = [
  { id: 'Talking Head', emoji: '🎙️' },
  { id: 'Voiceover',    emoji: '🔊' },
  { id: 'Aesthetic',    emoji: '✨' },
  { id: 'Tutorial',     emoji: '📚' },
  { id: 'Vlog',         emoji: '🎬' },
  { id: 'Comedy / Skit',emoji: '😂' },
  { id: 'Review',       emoji: '⭐' },
  { id: 'Unboxing',     emoji: '📦' },
]

// SVG platform icons
const PlatformIcons = {
  Instagram: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
      <defs>
        <linearGradient id="ig" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9CE34"/><stop offset="0.35" stopColor="#EE2A7B"/><stop offset="1" stopColor="#6228D7"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  TikTok: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path fill="#69C9D0" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.94a8.2 8.2 0 004.79 1.53V7.02a4.85 4.85 0 01-1.02-.33z"/>
      <path fill="#EE1D52" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.94a8.2 8.2 0 004.79 1.53V7.02a4.85 4.85 0 01-1.02-.33z" opacity="0.5"/>
      <path fill="#010101" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.94a8.2 8.2 0 004.79 1.53V7.02a4.85 4.85 0 01-1.02-.33z" opacity="0.8"/>
    </svg>
  ),
  YouTube: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/>
    </svg>
  ),
  'Twitter/X': () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  ),
}

// Simulated OAuth follower data per platform
const mockOAuthData = {
  Instagram: { handle: '@yourhandle', followers: '12.4K', engagement: '5.2%' },
  TikTok:    { handle: '@yourhandle', followers: '8.1K',  engagement: '7.8%' },
  YouTube:   { handle: 'Your Channel', followers: '3.2K', engagement: '4.1%' },
  'Twitter/X': { handle: '@yourhandle', followers: '2.8K', engagement: '2.9%' },
  Facebook:  { handle: 'Your Page',   followers: '6.5K',  engagement: '3.4%' },
}

const emptyProfile = {
  name: '',
  nickname: '',
  handle: '',
  location: '',
  niches: [],
  website: '',
  talentTypes: [],
  bio: '',
  initials: '?',
  avatar: '',
  hashtags: [],
  contentStyles: [],
  availableForHire: true,
  tier: 'fast-rising',
  rating: 4.2,
  pricing: {
    type: 'negotiable', // 'fixed' | 'negotiable'
    rates: [
      { label: 'Instagram Post',  amount: '' },
      { label: 'Instagram Reel',  amount: '' },
      { label: 'TikTok Video',    amount: '' },
      { label: 'YouTube Video',   amount: '' },
      { label: 'Story / Snap',    amount: '' },
    ],
  },
  portfolio: [],
  featuredVideo: '',
  socials: [
    { platform: 'Instagram',  handle: '', followers: '', engagement: '', connected: false, color: '#E1306C' },
    { platform: 'TikTok',     handle: '', followers: '', engagement: '', connected: false, color: '#010101' },
    { platform: 'YouTube',    handle: '', followers: '', engagement: '', connected: false, color: '#FF0000' },
    { platform: 'Twitter/X',  handle: '', followers: '', engagement: '', connected: false, color: '#1DA1F2' },
    { platform: 'Facebook',   handle: '', followers: '', engagement: '', connected: false, color: '#1877F2' },
  ],
}

const AVATAR_NAV = [
  { id: 'jobs',         label: 'Browse Jobs',      icon: Briefcase,     href: '/jobs' },
  { id: 'profile',      label: 'My Profile',       icon: LayoutDashboard },
  { id: 'portfolio',    label: 'Portfolio',         icon: ImagePlus },
  { id: 'overview',     label: 'Analytics',         icon: TrendingUp },
  { id: 'transactions', label: 'Transactions',      icon: Wallet },
  { id: 'messages',     label: 'Messages',          icon: Mail },
  { id: 'settings',     label: 'Profile Settings',  icon: Settings },
  { id: 'invite',       label: 'Invite Brands',     icon: UserPlus },
  { id: 'support',      label: 'Support',           icon: HelpCircle },
]

function AvatarMenu({ profile, activeTab, setActiveTab }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function navigate(id) {
    setActiveTab(id)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="relative focus:outline-none">
        {profile.avatar ? (
          <img src={profile.avatar} alt={profile.nickname || 'Profile'} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20" />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20" style={{ backgroundColor: pink }}>
            {profile.initials !== '?' ? profile.initials : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white/80"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            )}
          </div>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-[#0d0020]" title="Online" />
      </button>

      {open && (
        <div className="absolute right-0 top-13 mt-1 w-56 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{ backgroundColor: '#1a0035', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Profile header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {profile.avatar ? (
              <img src={profile.avatar} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: pink }}>
                {profile.initials !== '?' ? profile.initials : '?'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{profile.nickname || 'Your Profile'}</p>
              <p className="text-white/35 text-xs truncate">{profile.email || 'talent@brandiór.co'}</p>
            </div>
          </div>

          {/* Nav items */}
          <div className="py-1">
            {AVATAR_NAV.map(({ id, label, icon: Icon, href }) => (
              href
                ? <Link key={id} to={href} onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full text-left transition-colors"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(192,132,252,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    {label}
                  </Link>
                : <button key={id} onClick={() => navigate(id)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full text-left transition-colors"
                    style={{ color: activeTab === id ? '#c084fc' : 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(192,132,252,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: activeTab === id ? '#c084fc' : 'rgba(255,255,255,0.3)' }} />
                    {label}
                    {activeTab === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />}
                  </button>
            ))}
          </div>

          <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

          <Link to={`/creators/${profile?.handle || profile?.nickname || 'me'}`} target="_blank" rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full transition-colors"
            style={{ color: '#c084fc' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(192,132,252,0.08)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
            <Eye className="w-3.5 h-3.5" /> View Public Profile
          </Link>
          <Link to="/login" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full transition-colors"
            style={{ color: '#FF6B9D' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,107,157,0.08)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </Link>
        </div>
      )}
    </div>
  )
}

function Sidebar({ active, setActive }) {
  const nav = [
    { id: 'jobs',         label: 'Browse Jobs',      icon: Briefcase,      href: '/jobs' },
    { id: 'profile',      label: 'My Profile',       icon: LayoutDashboard },
    { id: 'portfolio',    label: 'Portfolio',         icon: ImagePlus },
    { id: 'overview',     label: 'Analytics',         icon: TrendingUp },
    { id: 'transactions', label: 'Transactions',      icon: Wallet },
    { id: 'messages',     label: 'Messages',          icon: Mail },
    { id: 'settings',     label: 'Profile Settings',  icon: Settings },
    { id: 'invite',       label: 'Invite Brands',     icon: UserPlus },
    { id: 'support',      label: 'Support',           icon: HelpCircle },
  ]
  return (
    <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 min-h-screen py-8 px-4"
      style={{ backgroundColor: '#0d0020', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 px-3 mb-3">
        <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center" style={{ backgroundColor: darkPurple }}>
          <Zap className="w-4 h-4" style={{ color: '#FA8112' }} />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Brandiór</span>
      </Link>
      {/* Account type label */}
      <div className="px-3 mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${pink}20`, color: pink, border: `1px solid ${pink}40` }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: pink }} />
          Talent Account
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {nav.map(({ id, label, icon: Icon, href }) => (
          href
            ? <Link key={id} to={href}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${purple}18`; e.currentTarget.style.color = purple }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
              </Link>
            : <button key={id} onClick={() => setActive(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  backgroundColor: active === id ? `${purple}18` : 'transparent',
                  color: active === id ? purple : 'rgba(255,255,255,0.4)',
                  border: active === id ? `1px solid ${purple}25` : '1px solid transparent',
                }}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

    </aside>
  )
}

function ProfileSetupBanner({ completion }) {
  if (completion >= 100) return null
  return (
    <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
      style={{ background: `linear-gradient(135deg, ${darkPurple}90, #2d0060)`, border: `1px solid ${purple}30` }}>
      <div className="flex-1">
        <p className="font-bold text-white text-sm mb-1">Complete your profile to start earning</p>
        <p className="text-white/50 text-xs mb-3">Brands are {100 - completion}% more likely to contact talents with full profiles.</p>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${completion}%`, backgroundColor: purple }} />
        </div>
        <p className="text-white/40 text-[10px] mt-1">{completion}% complete</p>
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg"
        style={{ backgroundColor: `${purple}20`, border: `2px solid ${purple}40`, color: purple }}>
        {completion}%
      </div>
    </div>
  )
}

function TierLadderAccordion({ profile }) {
  const [openTier, setOpenTier] = useState(null)
  const tierKeys = Object.keys(TIERS)
  const currentIdx = tierKeys.indexOf(profile.tier)

  return (
    <div style={{ backgroundColor: 'white' }}>
      {Object.entries(TIERS).map(([key, t], idx) => {
        const isCurrent = profile.tier === key
        const achieved = idx <= currentIdx
        const locked = idx > currentIdx
        const isOpen = openTier === key

        return (
          <div key={key} style={{ borderTop: idx > 0 ? '1px solid #f3eeff' : 'none' }}>
            {/* Row header — always visible, click to toggle */}
            <button
              onClick={() => setOpenTier(isOpen ? null : key)}
              className="w-full flex items-center gap-4 p-5 hover:bg-purple-50/40 transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: achieved ? t.bg : '#f3f4f6' }}>
                {t.StarIcon
                  ? <Star className="w-5 h-5 fill-current" style={{ color: achieved ? t.color : '#d1d5db' }} />
                  : <span className="text-xl" style={{ filter: locked ? 'grayscale(1) opacity(0.4)' : 'none' }}>{t.emoji}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-sm flex items-center gap-1" style={{ color: achieved ? t.color : '#9ca3af' }}>
                    {t.diamond
                      ? <Diamond color={achieved ? t.color : '#9ca3af'} size={11} />
                      : t.label
                    }
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${t.color}18`, color: t.color }}>Current</span>
                  )}
                  {locked && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}>Locked</span>
                  )}
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: achieved ? t.color + 'aa' : '#9ca3af' }}>
                  {isOpen ? 'Tap to collapse' : 'Tap to see perks & criteria'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
                style={{ color: '#9ca3af', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {/* Expandable body */}
            {isOpen && (
              <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid #f9f5ff' }}>
                {/* Perks */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Perks</p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.perks.map(p => (
                      <span key={p} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: achieved ? `${t.color}12` : '#f3f4f6',
                          color: achieved ? t.color : '#9ca3af',
                        }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Criteria */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>
                    {isCurrent ? 'How you got here' : 'Requirements'}
                  </p>
                  <div className="space-y-1.5">
                    {t.criteria.map(c => (
                      <div key={c} className="flex items-center gap-2">
                        {achieved
                          ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.color }} />
                          : <div className="w-3.5 h-3.5 rounded-full border flex-shrink-0" style={{ borderColor: '#d1d5db' }} />}
                        <span className="text-[11px]" style={{ color: achieved ? '#374151' : '#9ca3af' }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EditableField({ label, value, onChange, placeholder, multiline, isEditing }) {
  return (
    <div>
      <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">{label}</label>
      {isEditing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-brand-dark outline-none resize-none"
            style={{ border: `1px solid ${purple}50`, backgroundColor: '#f9f5ff' }}
            placeholder={placeholder}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-brand-dark outline-none"
            style={{ border: `1px solid ${purple}50`, backgroundColor: '#f9f5ff' }}
            placeholder={placeholder}
          />
        )
      ) : (
        <p className={`text-sm py-1 ${value ? 'text-brand-dark' : 'text-brand-dark/25 italic'}`}>
          {value || placeholder}
        </p>
      )}
    </div>
  )
}

const MOCK_JOBS = [
  { id: 1, brand: 'GlowLab Skincare',   initials: 'GL', verified: true,  title: 'Instagram Skincare Routine Reel',      budget: '₦350,000', budgetRange: '₦200K–₦500K', platform: 'Instagram', niche: 'Beauty & Skincare',    deadline: '5 days left',  minFollowers: '50K+',  engagement: '4%+', tags: ['Skincare','Reels','UGC'],          accent: '#FF6B9D', featured: true  },
  { id: 2, brand: 'PeakFit Africa',      initials: 'PF', verified: true,  title: 'YouTube Fitness Transformation Video', budget: '₦980,000', budgetRange: '₦700K–₦1.2M', platform: 'YouTube',   niche: 'Fitness & Health',     deadline: '10 days left', minFollowers: '100K+', engagement: '3%+', tags: ['Fitness','YouTube','Long-form'],    accent: '#a78bfa', featured: false },
  { id: 3, brand: 'UrbanThread Africa',  initials: 'UT', verified: false, title: 'Fashion Lookbook — Eid Collection',    budget: '₦220,000', budgetRange: '₦150K–₦300K', platform: 'Instagram', niche: 'Fashion & Style',      deadline: '3 days left',  minFollowers: '20K+',  engagement: '5%+', tags: ['Fashion','Eid','Lookbook'],         accent: '#D4AF37', featured: false },
  { id: 4, brand: 'MindfulBrew Co.',     initials: 'MB', verified: true,  title: 'TikTok Morning Routine Integration',   budget: '₦180,000', budgetRange: '₦100K–₦250K', platform: 'TikTok',    niche: 'Lifestyle & Wellness', deadline: '7 days left',  minFollowers: '30K+',  engagement: '6%+', tags: ['TikTok','Lifestyle','Wellness'],    accent: '#FF6B9D', featured: false },
  { id: 5, brand: 'SwiftTech Gadgets',   initials: 'ST', verified: true,  title: 'Unboxing & Review — SwiftPad Pro',     budget: '₦1,400,000', budgetRange: '₦1M–₦2M', platform: 'YouTube',   niche: 'Tech & Gaming',        deadline: '14 days left', minFollowers: '200K+', engagement: '3%+', tags: ['Tech','Unboxing','Review'],         accent: '#c084fc', featured: false },
  { id: 6, brand: 'BiteBliss Foods',     initials: 'BB', verified: false, title: 'Recipe Creation — Afro-Fusion Series', budget: '₦290,000', budgetRange: '₦200K–₦400K', platform: 'Instagram', niche: 'Food & Cooking',       deadline: '8 days left',  minFollowers: '25K+',  engagement: '5%+', tags: ['Food','Recipe','Afro-Fusion'],      accent: '#D4AF37', featured: false },
  { id: 7, brand: 'Chill Soda Africa',   initials: 'CS', verified: true,  title: 'TikTok Product Launch — Summer Can',   budget: '₦450,000', budgetRange: '₦300K–₦600K', platform: 'TikTok',    niche: 'Entertainment',        deadline: '6 days left',  minFollowers: '80K+',  engagement: '7%+', tags: ['TikTok','FMCG','Viral'],           accent: '#22c55e', featured: false },
  { id: 8, brand: 'TechHub Africa',      initials: 'TH', verified: true,  title: 'LinkedIn Thought Leadership Post',     budget: '₦120,000', budgetRange: '₦80K–₦200K',  platform: 'LinkedIn',  niche: 'Finance & Business',   deadline: '12 days left', minFollowers: '10K+',  engagement: '3%+', tags: ['LinkedIn','B2B','Thought Leader'], accent: '#3b82f6', featured: false },
]

function JobsTab() {
  const [filter, setFilter] = useState('All')
  const platforms = ['All', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn']
  const filtered = filter === 'All' ? MOCK_JOBS : MOCK_JOBS.filter(j => j.platform === filter)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1a0035 0%, #3d0080 100%)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>Brand Campaigns</p>
        <h2 className="text-xl font-black text-white mb-1">Jobs Posted by Brands</h2>
        <p className="text-white/50 text-sm">Browse open campaigns and apply directly to brands looking for talent like you.</p>
      </div>

      {/* Platform filter pills */}
      <div className="flex gap-2 flex-wrap">
        {platforms.map(p => (
          <button key={p} onClick={() => setFilter(p)}
            className="text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
            style={filter === p
              ? { backgroundColor: darkPurple, color: 'white' }
              : { backgroundColor: '#f3eeff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
            {p}
          </button>
        ))}
      </div>

      {/* Job cards grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(job => (
          <div key={job.id}
            className="rounded-2xl p-5 flex flex-col gap-3 relative cursor-pointer transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: job.featured ? `${job.accent}08` : '#fff',
              border: `1px solid ${job.featured ? job.accent + '40' : '#e9d5ff'}`,
              boxShadow: job.featured ? `0 4px 20px ${job.accent}15` : '0 2px 8px rgba(192,132,252,0.07)',
            }}>
            {job.featured && (
              <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ backgroundColor: job.accent }}>
                <Zap className="w-2.5 h-2.5" /> Featured
              </span>
            )}

            {/* Brand row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: job.accent }}>{job.initials}</div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-brand-dark font-semibold text-xs">{job.brand}</p>
                    {job.verified && <BadgeCheck className="w-3 h-3" style={{ color: job.accent }} />}
                  </div>
                  <p className="text-brand-dark/40 text-[10px]">{job.platform} · {job.niche}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: job.accent, backgroundColor: `${job.accent}15`, border: `1px solid ${job.accent}30` }}>
                {job.platform}
              </span>
            </div>

            {/* Title & budget */}
            <div>
              <h3 className="text-brand-dark font-bold text-sm leading-snug mb-1">{job.title}</h3>
              <p className="font-black text-base" style={{ color: job.accent }}>{job.budget}
                <span className="text-brand-dark/30 text-[10px] font-normal ml-1">{job.budgetRange}</span>
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {job.tags.map(t => (
                <span key={t} className="text-[10px] text-brand-dark/40 bg-brand-dark/5 rounded-full px-2 py-0.5">{t}</span>
              ))}
            </div>

            {/* Stats + Apply */}
            <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${job.accent}18` }}>
              <div className="flex items-center gap-3 text-[10px] text-brand-dark/40">
                <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{job.minFollowers}</span>
                <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{job.engagement}</span>
                <span className="flex items-center gap-0.5"><Briefcase className="w-3 h-3" />{job.deadline}</span>
              </div>
              <button className="text-[11px] font-bold px-3 py-1.5 rounded-full text-white transition-all"
                style={{ backgroundColor: job.accent }}>
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-brand-dark/30 text-xs pt-2">
        Showing {filtered.length} of {MOCK_JOBS.length} open campaigns
      </p>
    </div>
  )
}

export default function TalentDashboard() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'jobs')
  const [profile, setProfile] = useState(emptyProfile)
  const [hashInput, setHashInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showAddWork, setShowAddWork] = useState(false)
  const [showRatingDetail, setShowRatingDetail] = useState(false)
  const [settingsEditMode, setSettingsEditMode] = useState(false)
  const [profileSnapshot, setProfileSnapshot] = useState(null)

  // Keep public preview in sync with latest profile data
  useEffect(() => {
    localStorage.setItem('brandiór_preview_profile', JSON.stringify(profile))
  }, [profile])

  function startEditSettings() {
    setProfileSnapshot(JSON.parse(JSON.stringify(profile)))
    setSettingsEditMode(true)
  }
  function cancelEditSettings() {
    setProfile(profileSnapshot)
    setProfileSnapshot(null)
    setSettingsEditMode(false)
  }
  function saveSettings() {
    setProfileSnapshot(null)
    setSettingsEditMode(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  const [newWork, setNewWork] = useState({ title: '', brand: '', type: 'video', url: '', desc: '' })

  function updateField(field, value) {
    setProfile(p => ({
      ...p,
      [field]: value,
      initials: field === 'nickname'
        ? (value.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?')
        : p.initials,
    }))
  }

  function addHashtag() {
    let t = hashInput.trim().replace(/^#/, '')
    if (t && !profile.hashtags.includes(t)) {
      setProfile(p => ({ ...p, hashtags: [...p.hashtags, t] }))
    }
    setHashInput('')
  }

  function removeHashtag(t) {
    setProfile(p => ({ ...p, hashtags: p.hashtags.filter(x => x !== t) }))
  }

  function addPortfolioItem(e) {
    e.preventDefault()
    if (!newWork.title.trim()) return
    setProfile(p => ({ ...p, portfolio: [...p.portfolio, { ...newWork, id: Date.now() }] }))
    resetAddWork()
  }

  function removePortfolioItem(id) {
    setProfile(p => {
      const removed = p.portfolio.find(x => x.id === id)
      return {
        ...p,
        portfolio: p.portfolio.filter(x => x.id !== id),
        featuredVideo: removed?.url === p.featuredVideo ? '' : p.featuredVideo,
      }
    })
  }

  function setFeaturedVideo(item) {
    setProfile(p => ({ ...p, featuredVideo: p.featuredVideo === item.url ? '' : item.url }))
  }

  // ── File upload refs ──
  const portfolioFileRef = useRef(null)
  const avatarFileRef = useRef(null)
  const [uploadPreview, setUploadPreview] = useState(null) // { url, name, size, mime }
  const [dragOver, setDragOver] = useState(false)

  function handlePortfolioFile(file) {
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) return
    const url = URL.createObjectURL(file)
    const preview = { url, name: file.name, size: (file.size / (1024 * 1024)).toFixed(1), mime: file.type }
    setUploadPreview(preview)
    setNewWork(w => ({ ...w, url, type: isVideo ? 'video' : 'photo' }))
  }

  function handleAvatarFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setProfile(p => ({ ...p, avatar: url }))
  }

  function resetAddWork() {
    setNewWork({ title: '', brand: '', type: 'video', url: '', desc: '' })
    setUploadPreview(null)
    setShowAddWork(false)
  }

  const [connecting, setConnecting] = useState(null)

  function connectSocial(i) {
    const platform = profile.socials[i].platform
    setConnecting(i)
    // Simulate OAuth handshake delay then auto-fill from mock API
    setTimeout(() => {
      const data = mockOAuthData[platform]
      setProfile(p => {
        const s = [...p.socials]
        s[i] = { ...s[i], ...data, connected: true }
        return { ...p, socials: s }
      })
      setConnecting(null)
    }, 1400)
  }

  function disconnectSocial(i) {
    setProfile(p => {
      const s = [...p.socials]
      s[i] = { ...s[i], handle: '', followers: '', engagement: '', connected: false }
      return { ...p, socials: s }
    })
  }

  function updateSocial(i, field, value) {
    setProfile(p => {
      const s = [...p.socials]
      s[i] = { ...s[i], [field]: value }
      return { ...p, socials: s }
    })
  }

  // Completion score
  const fields = [profile.nickname, profile.handle, profile.location, profile.bio, profile.website]
  const nicheScore = profile.niches.length > 0 ? 1 : 0
  const filled = fields.filter(Boolean).length
  const socialFilled = profile.socials.filter(s => s.handle).length
  const hashScore = profile.hashtags.length > 0 ? 1 : 0
  const talentScore = profile.talentTypes.length > 0 ? 1 : 0
  const completion = Math.round(((filled + Math.min(socialFilled, 2) + hashScore + talentScore + nicheScore) / 11) * 100)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs = ['profile', 'overview', 'transactions', 'settings', 'support']

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f9f5ff' }}>
      <Sidebar active={activeTab} setActive={tab => {
        if (settingsEditMode) { cancelEditSettings() }
        setActiveTab(tab)
      }} />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: 'rgba(249,245,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e9d5ff' }}>
          <div>
            <h1 className="font-black text-brand-dark text-lg capitalize">
              {activeTab === 'jobs' ? 'Browse Jobs' : activeTab === 'profile' ? 'My Profile' : activeTab === 'settings' ? 'Profile Settings' : activeTab === 'portfolio' ? 'Portfolio' : activeTab}
            </h1>
            <p className="text-brand-dark/40 text-xs">Manage your talent presence on Brandiór</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('messages')} className="relative p-2 rounded-xl hover:bg-white transition-colors">
              <Mail className="w-5 h-5 text-brand-dark/40" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button className="relative p-2 rounded-xl hover:bg-white transition-colors">
              <Bell className="w-5 h-5 text-brand-dark/40" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            {/* Tier badge */}
            {(() => { const t = TIERS[profile.tier]; return (
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                <TierIcon tier={profile.tier} /> <TierLabel tier={profile.tier} />
              </span>
            )})()}
            {/* Avatar with dropdown */}
            <AvatarMenu profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

        <div className="p-6 max-w-4xl">

          {/* Mobile tab bar */}
          <div className="flex gap-1 mb-6 lg:hidden overflow-x-auto pb-1">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all"
                style={{
                  backgroundColor: activeTab === t ? darkPurple : 'white',
                  color: activeTab === t ? 'white' : '#9ca3af',
                  border: activeTab === t ? 'none' : '1px solid #e9d5ff',
                }}>
                {t === 'settings' ? 'Profile Settings' : t}
              </button>
            ))}
          </div>

          {/* ── JOBS TAB ── */}
          {activeTab === 'jobs' && <JobsTab />}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <ProfileSetupBanner completion={completion} />

              {/* ── Header card ── */}
              <div className="rounded-3xl overflow-hidden shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="h-32 relative group cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #1a0030 0%, #3b0764 60%, #c084fc 100%)' }}>
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <span className="flex items-center gap-2 text-white text-xs font-semibold"><Upload className="w-4 h-4" /> Upload cover</span>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="flex items-end justify-between -mt-10 mb-4">
                    <div className="relative group cursor-pointer" onClick={() => avatarFileRef.current?.click()}>
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.nickname || 'Profile'}
                          className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl object-cover" />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-2xl"
                          style={{ backgroundColor: profile.nickname ? pink : '#e9d5ff', color: profile.nickname ? 'white' : '#c084fc' }}>
                          {profile.initials !== '?' ? profile.initials : (
                            <svg viewBox="0 0 24 24" className="w-9 h-9" style={{ fill: profile.nickname ? 'white' : '#c084fc' }}><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                          )}
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <input ref={avatarFileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => handleAvatarFile(e.target.files?.[0])} />
                      {/* Online indicator */}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 ring-2 ring-white shadow-sm" title="Online" />
                    </div>
                    <div className="flex items-center gap-2 pb-1">
                      {completion >= 100 && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: `${gold}15`, color: gold }}>
                          <CheckCircle className="w-3 h-3" /> Profile Complete
                        </span>
                      )}
                      <button onClick={handleSave}
                        className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-full text-white transition-all"
                        style={{ backgroundColor: saved ? '#16a34a' : darkPurple }}>
                        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Profile</>}
                      </button>
                    </div>
                  </div>

                  {/* Name + identity */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-xl font-black text-brand-dark">{profile.nickname || <span className="text-brand-dark/25 font-normal italic text-base">No name set</span>}</h2>
                      {profile.handle && <span className="text-sm text-brand-dark/40">{profile.handle}</span>}
                      {/* Tier badge */}
                      {(() => { const t = TIERS[profile.tier]; return (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                          <TierIcon tier={profile.tier} /> <TierLabel tier={profile.tier} />
                        </span>
                      )})()}
                      {/* Available for hire badge */}
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{
                          backgroundColor: profile.availableForHire ? '#22c55e18' : '#9ca3af12',
                          color: profile.availableForHire ? '#16a34a' : '#9ca3af',
                          border: `1px solid ${profile.availableForHire ? '#22c55e40' : '#e5e7eb'}`,
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: profile.availableForHire ? '#22c55e' : '#9ca3af' }} />
                        {profile.availableForHire ? 'Available for hire' : 'Not available'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-brand-dark/50 mb-3">
                      {/* Star rating */}
                      <span className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-3.5 h-3.5"
                            style={{ color: i <= Math.round(profile.rating) ? '#D4AF37' : '#e5e7eb' }}
                            fill={i <= Math.round(profile.rating) ? '#D4AF37' : 'none'} />
                        ))}
                        <span className="font-bold text-brand-dark ml-0.5">{profile.rating.toFixed(1)}</span>
                        <span className="text-brand-dark/30">/ 5</span>
                      </span>
                      {profile.niches.length > 0 && profile.niches.map(n => (
                        <span key={n} className="flex items-center gap-1"><Tag className="w-3 h-3" />{n}</span>
                      ))}
                      {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: purple }}>
                          <Globe className="w-3 h-3" />{profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                    {/* Talent type + content style badges */}
                    {(profile.talentTypes.length > 0 || profile.contentStyles.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {profile.talentTypes.map(t => (
                          <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: darkPurple, color: 'white' }}>{t}</span>
                        ))}
                        {profile.contentStyles.map(s => (
                          <span key={s} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${purple}15`, color: darkPurple, border: `1px solid ${purple}30` }}>{s}</span>
                        ))}
                      </div>
                    )}
                    {/* Bio */}
                    {profile.bio
                      ? <p className="text-sm text-brand-dark/60 leading-relaxed">{profile.bio}</p>
                      : (
                        <button onClick={() => setActiveTab('settings')}
                          className="text-xs font-semibold flex items-center gap-1" style={{ color: purple }}>
                          <Edit3 className="w-3 h-3" /> Add bio in Profile Settings
                        </button>
                      )}
                    {/* Hashtags */}
                    {profile.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {profile.hashtags.map(h => (
                          <span key={h} className="text-[11px] text-brand-dark/40">#{h}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Social Media Integration ── */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center justify-between mb-5">
                  <p className="font-bold text-brand-dark">Social Media</p>
                  <p className="text-[10px] text-brand-dark/30">Connect to import followers & engagement</p>
                </div>
                <div className="space-y-3">
                  {profile.socials.map((s, i) => {
                    const Icon = PlatformIcons[s.platform]
                    const isConnecting = connecting === i
                    return (
                      <div key={i} className="rounded-2xl p-4 flex items-center gap-4 transition-all"
                        style={{
                          backgroundColor: s.connected ? `${s.color}08` : '#f9f5ff',
                          border: s.connected ? `1px solid ${s.color}30` : '1px solid #e9d5ff',
                        }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: s.connected ? `${s.color}15` : '#ede9fe' }}>
                          <Icon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-brand-dark font-semibold text-sm">{s.platform}</p>
                          {s.connected ? (
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-brand-dark/50">{s.handle}</span>
                              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: s.color }}>
                                <Users className="w-3 h-3" /> {s.followers}
                              </span>
                              <span className="text-xs text-brand-dark/40">{s.engagement} eng.</span>
                            </div>
                          ) : (
                            <p className="text-brand-dark/30 text-xs mt-0.5">Not connected</p>
                          )}
                        </div>
                        {s.connected ? (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <BadgeCheck className="w-4 h-4" style={{ color: s.color }} />
                            <button onClick={() => disconnectSocial(i)}
                              className="text-[10px] font-semibold text-brand-dark/30 hover:text-red-400 transition-colors">
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => connectSocial(i)} disabled={isConnecting}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full text-white flex-shrink-0 disabled:opacity-60"
                            style={{ backgroundColor: s.color }}>
                            {isConnecting
                              ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              : <Link2 className="w-3 h-3" />}
                            {isConnecting ? 'Connecting…' : 'Connect'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── Pricing ── */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" style={{ color: purple }} />
                    <p className="font-bold text-brand-dark">Pricing</p>
                  </div>
                  {/* Fixed / Negotiable toggle */}
                  <div className="flex rounded-full overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
                    {['fixed', 'negotiable'].map(type => (
                      <button key={type} onClick={() => setProfile(p => ({ ...p, pricing: { ...p.pricing, type } }))}
                        className="px-4 py-1.5 text-xs font-semibold capitalize transition-all"
                        style={{
                          backgroundColor: profile.pricing.type === type ? darkPurple : 'white',
                          color: profile.pricing.type === type ? 'white' : '#9ca3af',
                        }}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {profile.pricing.type === 'negotiable' && (
                  <div className="rounded-2xl px-4 py-3 mb-4 flex items-start gap-2"
                    style={{ backgroundColor: `${purple}08`, border: `1px solid ${purple}20` }}>
                    <MessageCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: purple }} />
                    <p className="text-xs text-brand-dark/60">Your rates are negotiable. Brands will reach out to discuss pricing. You can still set base rates below as a guide.</p>
                  </div>
                )}

                <div className="space-y-3">
                  {profile.pricing.rates.map((rate, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-brand-dark/60 flex-1">{rate.label}</span>
                      <div className="flex items-center rounded-xl overflow-hidden w-36"
                        style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                        <span className="pl-3 text-sm text-brand-dark/40">₦</span>
                        <input
                          type="number"
                          value={rate.amount}
                          onChange={e => setProfile(p => {
                            const rates = [...p.pricing.rates]
                            rates[i] = { ...rates[i], amount: e.target.value }
                            return { ...p, pricing: { ...p.pricing, rates } }
                          })}
                          placeholder="0"
                          className="flex-1 px-2 py-2.5 text-sm text-brand-dark outline-none bg-transparent w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── PORTFOLIO TAB ── */}
          {activeTab === 'portfolio' && (
            <div className="space-y-5">
              {/* Header bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-brand-dark text-base">My Portfolio</h2>
                  <p className="text-xs text-brand-dark/40 mt-0.5">Showcase your best video &amp; photo work to attract brands</p>
                </div>
                <div className="flex items-center gap-3">
                  {profile.featuredVideo && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                      <Star className="w-3 h-3 fill-violet-500" /> Featured video set
                    </span>
                  )}
                  <button
                    onClick={() => setShowAddWork(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full text-white"
                    style={{ backgroundColor: darkPurple }}>
                    <Plus className="w-4 h-4" /> Add Work
                  </button>
                </div>
              </div>

              {/* Empty state */}
              {profile.portfolio.length === 0 ? (
                <div className="rounded-3xl p-16 text-center" style={{ backgroundColor: '#f9f5ff', border: '2px dashed #e9d5ff' }}>
                  <div className="flex justify-center gap-4 mb-4 opacity-20">
                    <Briefcase className="w-10 h-10" style={{ color: purple }} />
                    <ImagePlus className="w-10 h-10" style={{ color: purple }} />
                  </div>
                  <p className="font-bold text-brand-dark/40 text-base mb-1">No portfolio items yet</p>
                  <p className="text-brand-dark/25 text-sm mb-6 max-w-sm mx-auto">Upload video or photo samples of your past brand collaborations and campaigns.</p>
                  <button
                    onClick={() => setShowAddWork(true)}
                    className="text-sm font-semibold px-6 py-3 rounded-full text-white inline-flex items-center gap-2"
                    style={{ backgroundColor: darkPurple }}>
                    <Plus className="w-4 h-4" /> Add your first sample
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {profile.portfolio.map(item => {
                    const isFeatured = item.type === 'video' && item.url && profile.featuredVideo === item.url
                    return (
                      <div key={item.id} className="rounded-2xl overflow-hidden group relative bg-white"
                        style={{ border: isFeatured ? '2px solid #c084fc' : '1px solid #e9d5ff', boxShadow: isFeatured ? '0 4px 20px rgba(192,132,252,0.15)' : '0 1px 6px rgba(124,58,237,0.05)' }}>
                        {/* Thumbnail */}
                        <div className="h-44 flex items-center justify-center relative"
                          style={{ backgroundColor: item.url ? '#000' : `${darkPurple}12` }}>
                          {item.url ? (
                            item.type === 'video'
                              ? <video src={item.url} className="w-full h-full object-cover opacity-85" />
                              : <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-2 opacity-25">
                              {item.type === 'video'
                                ? <FileText className="w-10 h-10" style={{ color: purple }} />
                                : <ImagePlus className="w-10 h-10" style={{ color: purple }} />}
                              <span className="text-xs font-medium text-brand-dark/40 capitalize">{item.type}</span>
                            </div>
                          )}
                          {/* Type badge */}
                          <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
                            style={{ backgroundColor: item.type === 'video' ? `${darkPurple}cc` : `${pink}cc`, color: 'white' }}>
                            {item.type === 'video' ? '🎬' : '📷'} {item.type}
                          </span>
                          {/* Featured badge */}
                          {isFeatured && (
                            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: 'rgba(192,132,252,0.92)', color: 'white' }}>
                              <Star className="w-2.5 h-2.5 fill-white" /> Featured on card
                            </span>
                          )}
                          {/* Remove */}
                          <button onClick={() => removePortfolioItem(item.id)}
                            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
                            <X className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <p className="font-semibold text-brand-dark text-sm truncate">{item.title}</p>
                          {item.brand && (
                            <p className="text-xs mt-0.5 font-medium" style={{ color: purple }}>
                              {item.brand}
                            </p>
                          )}
                          {item.desc && <p className="text-[11px] text-brand-dark/35 mt-1 line-clamp-2">{item.desc}</p>}

                          {/* Set as Featured button */}
                          {item.type === 'video' && item.url && (
                            <button
                              onClick={() => setFeaturedVideo(item)}
                              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                              style={isFeatured
                                ? { backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd' }
                                : { backgroundColor: '#f9f5ff', color: '#a78bfa', border: '1px solid #e9d5ff' }
                              }
                            >
                              <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-violet-500 text-violet-600' : ''}`} />
                              {isFeatured ? 'Featured on marketplace card' : 'Set as Featured video'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add Work Modal */}
              {showAddWork && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                  <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
                    <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e9d5ff' }}>
                      <p className="font-bold text-brand-dark">Add Portfolio Sample</p>
                      <button onClick={resetAddWork} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <X className="w-4 h-4 text-brand-dark/40" />
                      </button>
                    </div>
                    <form onSubmit={addPortfolioItem} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">

                      {/* ── Upload zone ── */}
                      <div>
                        <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-2 block">
                          Upload File
                        </label>
                        <input
                          ref={portfolioFileRef}
                          type="file"
                          accept={newWork.type === 'video' ? 'video/*' : 'image/*,video/*'}
                          className="hidden"
                          onChange={e => handlePortfolioFile(e.target.files?.[0])}
                        />

                        {uploadPreview ? (
                          /* Preview of selected file */
                          <div className="rounded-2xl overflow-hidden relative" style={{ border: '2px solid #c084fc' }}>
                            {newWork.type === 'video' ? (
                              <video src={uploadPreview.url} className="w-full max-h-48 object-cover bg-black"
                                controls muted playsInline />
                            ) : (
                              <img src={uploadPreview.url} alt="preview"
                                className="w-full max-h-48 object-cover" />
                            )}
                            <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#f9f5ff' }}>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm">{newWork.type === 'video' ? '🎬' : '📷'}</span>
                                <p className="text-xs font-medium text-brand-dark truncate">{uploadPreview.name}</p>
                                <p className="text-[10px] text-brand-dark/35 flex-shrink-0">{uploadPreview.size} MB</p>
                              </div>
                              <button type="button"
                                onClick={() => { setUploadPreview(null); setNewWork(w => ({ ...w, url: '' })) }}
                                className="ml-2 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: '#fee2e2' }}>
                                <X className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Drop zone */
                          <div
                            onClick={() => portfolioFileRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); handlePortfolioFile(e.dataTransfer.files?.[0]) }}
                            className="cursor-pointer rounded-2xl flex flex-col items-center justify-center gap-2 py-10 transition-colors"
                            style={{
                              border: `2px dashed ${dragOver ? '#c084fc' : '#e9d5ff'}`,
                              backgroundColor: dragOver ? '#fdf4ff' : '#f9f5ff',
                            }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#ede9fe' }}>
                              <Upload className="w-5 h-5" style={{ color: purple }} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-brand-dark">Click to upload or drag & drop</p>
                              <p className="text-xs text-brand-dark/35 mt-0.5">
                                {newWork.type === 'video' ? 'MP4, MOV, WebM — max 15s recommended' : 'JPG, PNG, WebP — up to 10 MB'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Type toggle (auto-set by file, or manual override) ── */}
                      <div>
                        <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-2 block">Type</label>
                        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
                          {['video', 'photo'].map(t => (
                            <button key={t} type="button"
                              onClick={() => {
                                setNewWork(w => ({ ...w, type: t, url: '' }))
                                setUploadPreview(null)
                              }}
                              className="flex-1 py-2.5 text-sm font-semibold capitalize transition-all"
                              style={{ backgroundColor: newWork.type === t ? darkPurple : 'white', color: newWork.type === t ? 'white' : '#9ca3af' }}>
                              {t === 'video' ? '🎬' : '📷'} {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ── Title ── */}
                      <div>
                        <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Title *</label>
                        <input required value={newWork.title} onChange={e => setNewWork(w => ({ ...w, title: e.target.value }))}
                          placeholder="e.g. GlowSerum Instagram Reel"
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff', color: '#1e0040' }} />
                      </div>

                      {/* ── Brand ── */}
                      <div>
                        <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Brand / Client</label>
                        <input value={newWork.brand} onChange={e => setNewWork(w => ({ ...w, brand: e.target.value }))}
                          placeholder="e.g. GlowLab Skincare"
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff', color: '#1e0040' }} />
                      </div>

                      {/* ── Description ── */}
                      <div>
                        <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Description</label>
                        <textarea value={newWork.desc} onChange={e => setNewWork(w => ({ ...w, desc: e.target.value }))}
                          placeholder="Brief description of the campaign…"
                          rows={2} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                          style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff', color: '#1e0040' }} />
                      </div>

                      {/* ── Actions ── */}
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={resetAddWork}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold text-brand-dark/50 border border-gray-200 hover:bg-gray-50 transition-colors">
                          Cancel
                        </button>
                        <button type="submit"
                          className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: darkPurple }}>
                          Add to Portfolio
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">

              {/* Engagement Metrics */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 className="w-4 h-4" style={{ color: purple }} />
                  <p className="font-bold text-brand-dark">Engagement Metrics</p>
                </div>
                {profile.socials.some(s => s.connected) ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: 'Total Followers', value: (() => {
                            const total = profile.socials.filter(s => s.connected).reduce((sum, s) => {
                              const n = parseFloat(s.followers)
                              return sum + (s.followers.includes('K') ? n * 1000 : n)
                            }, 0)
                            return total >= 1000 ? `${(total/1000).toFixed(1)}K` : total
                          })(), icon: Users, color: purple },
                        { label: 'Avg. Engagement', value: (() => {
                            const connected = profile.socials.filter(s => s.connected && s.engagement)
                            if (!connected.length) return '—'
                            const avg = connected.reduce((s, p) => s + parseFloat(p.engagement), 0) / connected.length
                            return `${avg.toFixed(1)}%`
                          })(), icon: Heart, color: pink },
                        { label: 'Platforms',  value: profile.socials.filter(s => s.connected).length, icon: Link2, color: '#f59e0b' },
                        { label: 'Est. Reach', value: (() => {
                            const total = profile.socials.filter(s => s.connected).reduce((sum, s) => {
                              const n = parseFloat(s.followers)
                              return sum + (s.followers.includes('K') ? n * 1000 : n)
                            }, 0)
                            const reach = Math.round(total * 0.35)
                            return reach >= 1000 ? `${(reach/1000).toFixed(1)}K` : reach
                          })(), icon: Eye, color: '#22c55e' },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${color}15` }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <p className="text-lg font-black text-brand-dark">{value}</p>
                          <p className="text-[10px] text-brand-dark/40 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {profile.socials.filter(s => s.connected).map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-24 text-xs text-brand-dark/50 flex-shrink-0">{s.platform}</div>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f3eeff' }}>
                            <div className="h-full rounded-full" style={{ width: s.engagement, backgroundColor: s.color }} />
                          </div>
                          <span className="text-xs font-bold w-10 text-right" style={{ color: s.color }}>{s.engagement}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10" style={{ border: '1px dashed #e9d5ff', borderRadius: 16 }}>
                    <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: purple }} />
                    <p className="text-sm text-brand-dark/40 mb-3">Connect a social account to see your metrics</p>
                    <button onClick={() => setActiveTab('profile')}
                      className="text-xs font-semibold px-4 py-2 rounded-full text-white"
                      style={{ backgroundColor: darkPurple }}>
                      Connect accounts
                    </button>
                  </div>
                )}
              </div>

              {/* Audience Demographics */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center gap-2 mb-5">
                  <PieChart className="w-4 h-4" style={{ color: purple }} />
                  <p className="font-bold text-brand-dark">Audience Demographics</p>
                  <span className="text-[10px] text-brand-dark/30 ml-auto">Based on connected accounts</span>
                </div>
                {profile.socials.some(s => s.connected) ? (
                  <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                      <p className="text-xs font-semibold text-brand-dark/40 uppercase tracking-widest mb-3">Age Groups</p>
                      <div className="space-y-2">
                        {[
                          { label: '18–24', pct: 42 },
                          { label: '25–34', pct: 35 },
                          { label: '35–44', pct: 15 },
                          { label: '45+',   pct: 8  },
                        ].map(({ label, pct }) => (
                          <div key={label} className="flex items-center gap-2">
                            <span className="text-xs text-brand-dark/50 w-10 flex-shrink-0">{label}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f3eeff' }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: purple }} />
                            </div>
                            <span className="text-xs font-bold text-brand-dark/60 w-8 text-right">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-dark/40 uppercase tracking-widest mb-3">Gender</p>
                      <div className="space-y-2">
                        {[
                          { label: 'Female', pct: 62, color: pink },
                          { label: 'Male',   pct: 35, color: purple },
                          { label: 'Other',  pct: 3,  color: '#9ca3af' },
                        ].map(({ label, pct, color }) => (
                          <div key={label} className="flex items-center gap-2">
                            <span className="text-xs text-brand-dark/50 w-10 flex-shrink-0">{label}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f3eeff' }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                            </div>
                            <span className="text-xs font-bold text-brand-dark/60 w-8 text-right">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-dark/40 uppercase tracking-widest mb-3">Top Locations</p>
                      <div className="space-y-2">
                        {[
                          { city: 'Lagos',   pct: 32 },
                          { city: 'Accra',   pct: 24 },
                          { city: 'Nairobi', pct: 19 },
                          { city: 'Kumasi',  pct: 10 },
                          { city: 'Others',  pct: 15 },
                        ].map(({ city, pct }) => (
                          <div key={city} className="flex items-center gap-2">
                            <span className="text-xs text-brand-dark/50 w-12 flex-shrink-0">{city}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f3eeff' }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: darkPurple }} />
                            </div>
                            <span className="text-xs font-bold text-brand-dark/60 w-8 text-right">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10" style={{ border: '1px dashed #e9d5ff', borderRadius: 16 }}>
                    <PieChart className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: purple }} />
                    <p className="text-sm text-brand-dark/40">Connect a social account to see audience data</p>
                  </div>
                )}
              </div>

              {/* Job Score Card */}
              <div className="rounded-3xl shadow-sm overflow-hidden" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <button
                  onClick={() => setShowRatingDetail(v => !v)}
                  className="w-full flex items-center justify-between p-6 hover:bg-purple-50/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#D4AF3718' }}>
                      <Star className="w-5 h-5 fill-current" style={{ color: '#D4AF37' }} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-brand-dark">Job Score</p>
                      <p className="text-xs text-brand-dark/40 mt-0.5">Your performance score &amp; tier eligibility</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4"
                          style={{ color: i <= Math.round(profile.rating) ? '#D4AF37' : '#e5e7eb' }}
                          fill={i <= Math.round(profile.rating) ? '#D4AF37' : 'none'} />
                      ))}
                      <span className="font-black text-brand-dark ml-1">{profile.rating.toFixed(1)}</span>
                      <span className="text-brand-dark/30 text-sm">/5</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-brand-dark/30 transition-transform" style={{ transform: showRatingDetail ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </div>
                </button>

                {showRatingDetail && (
                  <div className="px-6 pb-6 space-y-4">
                    <div className="h-px" style={{ backgroundColor: '#e9d5ff' }} />
                    <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-semibold">Tier Ladder &amp; Eligibility</p>
                    {Object.entries(TIERS).map(([key, tier]) => {
                      const isCurrent = profile.tier === key
                      return (
                        <div key={key} className="rounded-2xl p-5" style={{
                          backgroundColor: isCurrent ? tier.bg : '#fafafa',
                          border: `1px solid ${isCurrent ? tier.border : '#e9d5ff'}`,
                        }}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ backgroundColor: `${tier.color}20` }}>
                                <TierIcon tier={key} />
                              </div>
                              <div>
                                <p className="font-bold text-sm" style={{ color: tier.color }}>{tier.label}</p>
                                <p className="text-[11px] text-brand-dark/40">{tier.desc}</p>
                              </div>
                            </div>
                            {isCurrent ? (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: tier.color }}>Current</span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-brand-dark/30" style={{ border: '1px solid #e5e7eb' }}>Locked</span>
                            )}
                          </div>
                          <div className="mb-3">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-dark/30 mb-2">Eligibility Criteria</p>
                            <div className="space-y-1.5">
                              {tier.criteria.map((c, i) => {
                                const achieved = isCurrent || key === 'fast-rising'
                                return (
                                  <div key={i} className="flex items-center gap-2">
                                    {achieved
                                      ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tier.color }} />
                                      : <div className="w-3.5 h-3.5 rounded-full border flex-shrink-0" style={{ borderColor: '#d1d5db' }} />
                                    }
                                    <span className="text-xs" style={{ color: achieved ? '#0a0a0a' : '#9ca3af' }}>{c}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-dark/30 mb-2">Perks</p>
                            <div className="flex flex-wrap gap-1.5">
                              {tier.perks.map((perk, i) => (
                                <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{
                                  backgroundColor: isCurrent ? `${tier.color}15` : '#f3f4f6',
                                  color: isCurrent ? tier.color : '#9ca3af',
                                }}>{perk}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          )}


          {/* ── TRANSACTIONS TAB ── */}
          {activeTab === 'transactions' && (
            <TransactionsTab showWithdraw={showWithdraw} setShowWithdraw={setShowWithdraw} />
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div className="space-y-5">

              {/* Edit / Save bar */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-brand-dark/40">
                  {settingsEditMode ? 'Editing profile — changes are live' : 'Click Edit to update your profile'}
                </p>
                {settingsEditMode ? (
                  <div className="flex items-center gap-2">
                    <button onClick={cancelEditSettings}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border text-brand-dark/50 hover:text-brand-dark/70 transition-colors"
                      style={{ borderColor: '#e9d5ff' }}>
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button onClick={saveSettings}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white"
                      style={{ backgroundColor: darkPurple }}>
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                ) : (
                  <button onClick={startEditSettings}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white"
                    style={{ backgroundColor: darkPurple }}>
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
              </div>

              {/* Public info */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center justify-between mb-5">
                  <p className="font-bold text-brand-dark">Public Info</p>
                  <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: '#22c55e' }}>
                    <Eye className="w-3 h-3" /> Visible to brands
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <EditableField label="Nickname / Talent Name" value={profile.nickname} onChange={v => updateField('nickname', v)} placeholder="e.g. BeautyByAmaka" isEditing={settingsEditMode} />
                  <EditableField label="Brandiór Username" value={profile.handle} onChange={v => updateField('handle', v)} placeholder="@yourhandle" isEditing={settingsEditMode} />
                  {/* Location — country + city */}
                  <div>
                    <label className="block text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5">Location</label>
                    {settingsEditMode ? (
                      <div className="flex gap-2">
                        <select
                          value={profile.location?.split(', ')[1] || ''}
                          onChange={e => {
                            const country = e.target.value
                            updateField('location', country ? `, ${country}` : '')
                          }}
                          className="flex-1 rounded-xl px-3 py-2 text-sm border focus:outline-none"
                          style={{ borderColor: '#e9d5ff', color: '#1a0030', backgroundColor: '#faf5ff' }}>
                          <option value="">Country</option>
                          {['Nigeria', 'South Africa', 'Kenya'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <select
                          value={profile.location?.split(', ')[0] || ''}
                          onChange={e => {
                            const country = profile.location?.split(', ')[1] || ''
                            updateField('location', e.target.value ? `${e.target.value}, ${country}` : (country ? `, ${country}` : ''))
                          }}
                          disabled={!profile.location?.split(', ')[1]}
                          className="flex-1 rounded-xl px-3 py-2 text-sm border focus:outline-none disabled:opacity-40"
                          style={{ borderColor: '#e9d5ff', color: '#1a0030', backgroundColor: '#faf5ff' }}>
                          <option value="">City</option>
                          {({
                            Nigeria: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'],
                            'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Sandton'],
                            Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
                          }[profile.location?.split(', ')[1]] || []).map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-brand-dark py-2">
                        {profile.location || <span className="text-brand-dark/30 italic">Not set</span>}
                      </p>
                    )}
                  </div>
                  {/* Niche — multi-select, max 5 */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest">Niche / Category</label>
                      {settingsEditMode && (
                        <span className="text-[10px]" style={{ color: profile.niches.length >= 5 ? pink : '#9ca3af' }}>
                          {profile.niches.length}/5 selected
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settingsEditMode ? NICHES.map(n => {
                        const selected = profile.niches.includes(n)
                        const maxed = profile.niches.length >= 5 && !selected
                        return (
                          <button key={n} type="button"
                            disabled={maxed}
                            onClick={() => setProfile(p => ({
                              ...p,
                              niches: p.niches.includes(n)
                                ? p.niches.filter(x => x !== n)
                                : [...p.niches, n],
                            }))}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all disabled:opacity-30"
                            style={{
                              backgroundColor: selected ? darkPurple : '#f9f5ff',
                              color: selected ? 'white' : '#6b7280',
                              border: selected ? `1px solid ${purple}` : '1px solid #e9d5ff',
                            }}>
                            {n}
                          </button>
                        )
                      }) : (
                        profile.niches.length > 0
                          ? profile.niches.map(n => (
                            <span key={n} className="px-3 py-1.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: darkPurple, color: 'white', border: `1px solid ${purple}` }}>
                              {n}
                            </span>
                          ))
                          : <p className="text-sm text-brand-dark/25 italic py-1">No niches selected</p>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <EditableField label="Website / Portfolio URL" value={profile.website} onChange={v => updateField('website', v)} placeholder="https://yourportfolio.com" isEditing={settingsEditMode} />
                  </div>
                  <div className="sm:col-span-2">
                    <EditableField label="Bio" value={profile.bio} onChange={v => updateField('bio', v)} placeholder="Tell brands about yourself and your content style…" multiline isEditing={settingsEditMode} />
                  </div>
                </div>

                {/* Available for hire toggle */}
                <div className="flex items-center justify-between py-4 px-5 rounded-2xl"
                  style={{ backgroundColor: '#0d0020', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <p className="text-sm font-semibold text-white">Available for hire</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Brands can see you're open to new campaigns</p>
                  </div>
                  <button
                    onClick={() => settingsEditMode && setProfile(p => ({ ...p, availableForHire: !p.availableForHire }))}
                    className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                    style={{
                      backgroundColor: profile.availableForHire ? '#22c55e' : 'rgba(255,255,255,0.15)',
                      opacity: settingsEditMode ? 1 : 0.7,
                      cursor: settingsEditMode ? 'pointer' : 'default',
                    }}>
                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: profile.availableForHire ? 'translateX(22px)' : 'translateX(2px)' }} />
                  </button>
                </div>
              </div>

              {/* Hashtags */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center gap-1.5 mb-4">
                  <Hash className="w-4 h-4" style={{ color: purple }} />
                  <p className="font-bold text-brand-dark">Hashtags</p>
                  <span className="text-[10px] text-brand-dark/30 ml-1">— helps brands discover you</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.hashtags.map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${purple}12`, color: darkPurple, border: `1px solid ${purple}30` }}>
                      #{t}
                      {settingsEditMode && (
                        <button onClick={() => removeHashtag(t)} className="hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {profile.hashtags.length === 0 && (
                    <span className="text-xs text-brand-dark/25 italic">No hashtags yet</span>
                  )}
                </div>
                {settingsEditMode && (
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center rounded-xl overflow-hidden"
                      style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                      <span className="pl-3 text-sm font-bold" style={{ color: purple }}>#</span>
                      <input
                        value={hashInput}
                        onChange={e => setHashInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addHashtag()}
                        placeholder="fashion, beauty, lagos…"
                        className="flex-1 px-2 py-2 text-xs text-brand-dark outline-none bg-transparent"
                      />
                    </div>
                    <button onClick={addHashtag}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1"
                      style={{ backgroundColor: darkPurple }}>
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}
              </div>

              {/* Content Style */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-brand-dark">Content Style</p>
                  <span className="text-[10px] text-brand-dark/30">Select all that apply</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CONTENT_STYLES.map(({ id, emoji }) => {
                    const selected = profile.contentStyles.includes(id)
                    return (
                      <button key={id}
                        disabled={!settingsEditMode}
                        onClick={() => setProfile(p => ({
                          ...p,
                          contentStyles: p.contentStyles.includes(id)
                            ? p.contentStyles.filter(s => s !== id)
                            : [...p.contentStyles, id],
                        }))}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-center transition-all relative"
                        style={{
                          backgroundColor: selected ? `${purple}15` : '#f9f5ff',
                          border: selected ? `2px solid ${purple}` : '2px solid #e9d5ff',
                          cursor: settingsEditMode ? 'pointer' : 'default',
                          opacity: !settingsEditMode && !selected ? 0.5 : 1,
                        }}>
                        {selected && <CheckCircle className="absolute top-1.5 right-1.5 w-3 h-3" style={{ color: purple }} />}
                        <span className="text-xl">{emoji}</span>
                        <span className="text-[11px] font-semibold text-brand-dark leading-tight">{id}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Talent Tier */}
              <div className="rounded-3xl overflow-hidden shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
                {/* Header */}
                <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #0d0020 0%, #1e0a3c 100%)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-white">Talent Tier</p>
                    <span className="text-[10px] text-white/30">Assigned by Brandiór</span>
                  </div>
                  <p className="text-xs text-white/40">Grow your profile, complete campaigns, and earn your way to the top.</p>
                  {/* Current tier highlight */}
                  {(() => { const t = TIERS[profile.tier]; return (
                    <div className="flex items-center gap-3 mt-4 p-3 rounded-2xl"
                      style={{ backgroundColor: `${t.color}18`, border: `1px solid ${t.color}40` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${t.color}25` }}>
                        {t.StarIcon
                          ? <Star className="w-5 h-5 fill-current" style={{ color: t.color }} />
                          : <span className="text-xl">{t.emoji}</span>}
                      </div>
                      <div>
                        <p className="text-sm font-black" style={{ color: t.color }}>You are {t.label}</p>
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{t.desc}</p>
                      </div>
                    </div>
                  )})()}
                </div>

                {/* Tier ladder — accordion */}
                <TierLadderAccordion profile={profile} />
              </div>

              {/* Private info */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-brand-dark">Private Info</p>
                  <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: '#9ca3af' }}>
                    <EyeOff className="w-3 h-3" /> Not shown to brands
                  </span>
                </div>
                <EditableField label="Official / Legal Name" value={profile.name} onChange={v => updateField('name', v)} placeholder="Your full legal name" isEditing={settingsEditMode} />
              </div>

              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <p className="font-bold text-brand-dark mb-4">Account Settings</p>
                <div className="space-y-4">
                  {[
                    { label: 'Email Address', placeholder: 'your@email.com', type: 'email' },
                    { label: 'Change Password', placeholder: '••••••••', type: 'password' },
                  ].map(({ label, placeholder, type }) => (
                    <div key={label}>
                      <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">{label}</label>
                      {settingsEditMode ? (
                        <input type={type} placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark outline-none"
                          style={{ border: `1px solid ${purple}50`, backgroundColor: '#f9f5ff' }} />
                      ) : (
                        <p className="text-sm text-brand-dark/25 italic py-1">{placeholder}</p>
                      )}
                    </div>
                  ))}
                  {settingsEditMode && (
                    <button className="px-5 py-2.5 rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: darkPurple }}>
                      Update Account
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-brand-dark">Talent Types</p>
                  <span className="text-[10px] text-brand-dark/30">Select all that apply</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'Content Talent',  emoji: '🎬' },
                    { id: 'Voiceover Artist', emoji: '🎙️' },
                    { id: 'Brand Ambassador', emoji: '🤝' },
                    { id: 'Product Reviewer', emoji: '⭐' },
                  ].map(({ id, emoji }) => {
                    const selected = profile.talentTypes.includes(id)
                    return (
                      <button key={id}
                        disabled={!settingsEditMode}
                        onClick={() => setProfile(p => ({
                          ...p,
                          talentTypes: p.talentTypes.includes(id)
                            ? p.talentTypes.filter(t => t !== id)
                            : [...p.talentTypes, id],
                        }))}
                        className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl text-center transition-all relative"
                        style={{
                          backgroundColor: selected ? darkPurple : '#f9f5ff',
                          border: selected ? `2px solid ${purple}` : '2px solid #e9d5ff',
                          color: selected ? 'white' : '#0a0a0a',
                          cursor: settingsEditMode ? 'pointer' : 'default',
                          opacity: !settingsEditMode && !selected ? 0.5 : 1,
                        }}>
                        {selected && (
                          <CheckCircle className="absolute top-2 right-2 w-3.5 h-3.5" style={{ color: purple }} />
                        )}
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-xs font-semibold leading-tight">{id}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #ffe4e6', backgroundColor: 'white' }}>
                <p className="font-bold text-red-500 mb-1">Danger Zone</p>
                <p className="text-brand-dark/40 text-sm mb-4">Permanently delete your Brandiór account and all associated data.</p>
                <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
          {/* ── MESSAGES TAB ── */}
          {activeTab === 'messages' && (
            <MessagingPanel userId="talent_001" userType="talent" />
          )}

          {/* ── INVITE TAB ── */}
          {activeTab === 'invite' && <InviteTab userType="talent" />}

          {/* ── SUPPORT TAB ── */}
          {activeTab === 'support' && <SupportTab />}

        </div>
      </main>
    </div>
  )
}

// status: 'wip' | 'in-review' | 'available' | 'withdrawn'
const mockTransactions = [
  { id: 'TXN-0044', date: 'Mar 23, 2026', type: 'credit', desc: 'Campaign Funded — Chill Soda Africa',       amount: 18000, status: 'wip'       },
  { id: 'TXN-0043', date: 'Mar 21, 2026', type: 'credit', desc: 'Campaign Funded — TechHub Africa',          amount: 25000, status: 'wip'       },
  { id: 'TXN-0042', date: 'Mar 19, 2026', type: 'credit', desc: 'Campaign Submitted — BeautyBrand Co.',      amount: 22000, status: 'in-review' },
  { id: 'TXN-0041', date: 'Mar 17, 2026', type: 'credit', desc: 'Campaign Submitted — Konga Flash Sale',     amount: 12000, status: 'in-review' },
  { id: 'TXN-0040', date: 'Mar 14, 2026', type: 'credit', desc: 'Campaign Approved — African Fashion Week',  amount: 30000, status: 'available' },
  { id: 'TXN-0039', date: 'Mar 11, 2026', type: 'credit', desc: 'Campaign Approved — AfriTech Summit Bonus', amount: 15200, status: 'available' },
  { id: 'TXN-0038', date: 'Mar 08, 2026', type: 'debit',  desc: 'Withdrawal — GTBank ****4921',              amount: 20000, status: 'withdrawn' },
  { id: 'TXN-0037', date: 'Mar 03, 2026', type: 'credit', desc: 'Campaign Approved — PalmOil Kitchen',       amount: 8000,  status: 'available' },
  { id: 'TXN-0036', date: 'Feb 25, 2026', type: 'debit',  desc: 'Withdrawal — GTBank ****4921',              amount: 15000, status: 'withdrawn' },
  { id: 'TXN-0035', date: 'Feb 20, 2026', type: 'credit', desc: 'Campaign Approved — Jumia Africa',          amount: 10000, status: 'available' },
]

const TX_STATUS = {
  'wip':       { label: 'Work in Progress', color: '#0a0a0a', bg: '#0a0a0a08', dot: '#0a0a0a' },
  'in-review': { label: 'In Review',        color: '#0a0a0a', bg: '#0a0a0a08', dot: '#0a0a0a' },
  'available': { label: 'Available',        color: '#0a0a0a', bg: '#0a0a0a08', dot: '#0a0a0a' },
  'withdrawn': { label: 'Withdrawn',        color: '#9ca3af', bg: '#9ca3af15', dot: '#9ca3af' },
}

const nigerianBanks = [
  'Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA',
  'Fidelity Bank', 'Sterling Bank', 'Opay', 'Kuda Bank', 'Moniepoint',
]

function TransactionsTab({ showWithdraw, setShowWithdraw }) {
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bank: '', accountNumber: '', accountName: '' })
  const [withdrawStep, setWithdrawStep] = useState('form') // 'form' | 'confirm' | 'success'
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState('all')

  const wipTotal      = mockTransactions.filter(t => t.status === 'wip').reduce((s, t) => s + t.amount, 0)
  const reviewTotal   = mockTransactions.filter(t => t.status === 'in-review').reduce((s, t) => s + t.amount, 0)
  const availableTotal = mockTransactions.filter(t => t.status === 'available').reduce((s, t) => s + t.amount, 0)

  function handleWithdraw(e) {
    e.preventDefault()
    setWithdrawStep('confirm')
  }

  function confirmWithdraw() {
    setProcessing(true)
    setTimeout(() => { setProcessing(false); setWithdrawStep('success') }, 2000)
  }

  function resetWithdraw() {
    setShowWithdraw(false)
    setWithdrawStep('form')
    setWithdrawForm({ amount: '', bank: '', accountNumber: '', accountName: '' })
  }

  const filtered = filter === 'all' ? mockTransactions : mockTransactions.filter(t => t.status === filter)

  return (
    <div className="space-y-5">

      {/* Pipeline stage cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            key: 'wip',
            label: 'Work in Progress',
            sub: 'Brand has funded your campaign',
            value: wipTotal,
            icon: Briefcase,
            color: '#0a0a0a',
            bg: '#0a0a0a08',
            border: '#ddd6fe',
            muted: false,
          },
          {
            key: 'in-review',
            label: 'In Review',
            sub: 'Security hold — awaiting approval',
            value: reviewTotal,
            icon: Eye,
            color: '#0a0a0a',
            bg: '#0a0a0a08',
            border: '#ddd6fe',
            muted: false,
          },
          {
            key: 'available',
            label: 'Available',
            sub: 'Ready to withdraw now',
            value: availableTotal,
            icon: Wallet,
            color: '#0a0a0a',
            bg: '#0a0a0a08',
            border: '#ddd6fe',
            muted: false,
          },
          {
            key: 'withdrawn',
            label: 'Withdrawn',
            sub: 'Already paid out',
            value: mockTransactions.filter(t => t.status === 'withdrawn').reduce((s, t) => s + t.amount, 0),
            icon: ArrowUpRight,
            color: '#9ca3af',
            bg: '#9ca3af0d',
            border: '#e5e7eb',
            muted: true,
          },
        ].map(({ key, label, sub, value, icon: Icon, color, bg, border, muted }) => (
          <button key={key} onClick={() => setFilter(key === filter ? 'all' : key)}
            className="rounded-2xl p-5 bg-white shadow-sm text-left transition-all"
            style={{
              border: `1px solid ${filter === key ? color : border}`,
              boxShadow: filter === key ? `0 0 0 3px ${color}20` : undefined,
              opacity: muted ? 0.75 : 1,
            }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <p className={`${muted ? 'text-xl' : 'text-2xl'} font-black mb-0.5`} style={{ color }}>₦{value.toLocaleString()}</p>
            <p className="font-semibold text-brand-dark text-xs">{label}</p>
            <p className="text-brand-dark/35 text-[10px] mt-0.5">{sub}</p>
          </button>
        ))}
      </div>

      {/* Pipeline explanation */}
      <div className="rounded-2xl px-5 py-4 flex items-center gap-3 flex-wrap"
        style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
        {[
          { label: 'Work in Progress', color: '#0a0a0a' },
          { label: '→', color: '#c4b5fd' },
          { label: 'In Review',        color: '#0a0a0a' },
          { label: '→', color: '#c4b5fd' },
          { label: 'Available',        color: '#0a0a0a' },
          { label: '→', color: '#c4b5fd' },
          { label: 'Withdrawn',        color: '#9ca3af' },
        ].map((s, i) => (
          <span key={i} className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
        ))}
        <span className="text-[10px] text-brand-dark/30 ml-auto">Funds move through these stages automatically</span>
      </div>

      {/* Withdraw card */}
      <div className="rounded-3xl p-6 bg-white shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-bold text-brand-dark">Withdraw Available Funds</p>
            <p className="text-brand-dark/40 text-xs mt-0.5">
              {availableTotal >= 5000
                ? `₦${availableTotal.toLocaleString()} ready · Min ₦5,000 · Processed within 24h`
                : `You need at least ₦5,000 available to withdraw`}
            </p>
          </div>
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={availableTotal < 5000}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold disabled:opacity-40"
            style={{ backgroundColor: '#22c55e' }}>
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {['Bank Transfer', 'Paystack', 'Flutterwave', 'Opay'].map(m => (
            <span key={m} className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: `${purple}10`, color: darkPurple, border: `1px solid ${purple}25` }}>
              <CreditCard className="w-3 h-3" /> {m}
            </span>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-3xl p-6 bg-white shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <p className="font-bold text-brand-dark text-sm">Transaction History</p>
          <div className="flex gap-1 flex-wrap">
            {['all', 'wip', 'in-review', 'available', 'withdrawn'].map(f => {
              const s = TX_STATUS[f]
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                  style={{
                    backgroundColor: filter === f ? (s?.color ?? darkPurple) : '#f9f5ff',
                    color: filter === f ? 'white' : '#9ca3af',
                    border: filter === f ? 'none' : '1px solid #e9d5ff',
                  }}>
                  {f === 'all' ? 'All' : s.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map(tx => {
            const s = TX_STATUS[tx.status]
            return (
              <div key={tx.id} className="flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-[#f9f5ff]"
                style={{ border: '1px solid #f3eeff' }}>
                {/* Status icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: s.bg }}>
                  {tx.type === 'debit'
                    ? <ArrowUpRight className="w-4 h-4" style={{ color: s.color }} />
                    : <ArrowDownLeft className="w-4 h-4" style={{ color: s.color }} />}
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-dark truncate">{tx.desc}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-brand-dark/30">{tx.date}</span>
                    <span className="text-[10px] text-brand-dark/25">·</span>
                    <span className="text-[10px] text-brand-dark/30 font-mono">{tx.id}</span>
                  </div>
                </div>
                {/* Amount + status badge */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm mb-1" style={{ color: tx.type === 'debit' ? '#9ca3af' : s.color }}>
                    {tx.type === 'debit' ? '−' : '+'}₦{tx.amount.toLocaleString()}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: s.bg, color: s.color }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e9d5ff' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${darkPurple}15` }}>
                  <Wallet className="w-4 h-4" style={{ color: darkPurple }} />
                </div>
                <div>
                  <p className="font-bold text-brand-dark text-sm">Withdraw Funds</p>
                  <p className="text-brand-dark/40 text-[11px]">Available: ₦{availableTotal.toLocaleString()}</p>
                </div>
              </div>
              <button onClick={resetWithdraw} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-brand-dark/40" />
              </button>
            </div>

            <div className="px-6 py-5">
              {withdrawStep === 'form' && (
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Amount (₦)</label>
                    <input
                      type="number"
                      min="5000"
                      max={availableTotal}
                      required
                      value={withdrawForm.amount}
                      onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="e.g. 10000"
                      className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark outline-none"
                      style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}
                    />
                    <p className="text-[10px] text-brand-dark/30 mt-1">Minimum ₦5,000</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Bank</label>
                    <select
                      required
                      value={withdrawForm.bank}
                      onChange={e => setWithdrawForm(f => ({ ...f, bank: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark outline-none appearance-none"
                      style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                      <option value="">Select your bank</option>
                      {nigerianBanks.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      value={withdrawForm.accountNumber}
                      onChange={e => setWithdrawForm(f => ({ ...f, accountNumber: e.target.value.replace(/\D/g, '') }))}
                      placeholder="10-digit account number"
                      className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark outline-none font-mono"
                      style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Account Name</label>
                    <input
                      type="text"
                      required
                      value={withdrawForm.accountName}
                      onChange={e => setWithdrawForm(f => ({ ...f, accountName: e.target.value }))}
                      placeholder="Name on account"
                      className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark outline-none"
                      style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}
                    />
                  </div>
                  <button type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: darkPurple }}>
                    <ArrowUpRight className="w-4 h-4" /> Continue
                  </button>
                </form>
              )}

              {withdrawStep === 'confirm' && (
                <div className="space-y-4">
                  <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
                    {[
                      { label: 'Amount',         value: `₦${Number(withdrawForm.amount).toLocaleString()}` },
                      { label: 'Bank',           value: withdrawForm.bank },
                      { label: 'Account Number', value: withdrawForm.accountNumber },
                      { label: 'Account Name',   value: withdrawForm.accountName },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-brand-dark/40">{label}</span>
                        <span className="text-sm font-semibold text-brand-dark">{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-brand-dark/40 text-center">Please confirm the details above are correct before proceeding.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setWithdrawStep('form')}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm text-brand-dark/60 border border-gray-200 hover:bg-gray-50 transition-colors">
                      Edit
                    </button>
                    <button onClick={confirmWithdraw} disabled={processing}
                      className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ backgroundColor: darkPurple }}>
                      {processing
                        ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <><CheckCircle className="w-4 h-4" /> Confirm Withdrawal</>}
                    </button>
                  </div>
                </div>
              )}

              {withdrawStep === 'success' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#22c55e18' }}>
                    <CheckCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
                  </div>
                  <p className="font-black text-brand-dark text-lg mb-1">Withdrawal Submitted!</p>
                  <p className="text-brand-dark/40 text-sm mb-1">₦{Number(withdrawForm.amount).toLocaleString()} will arrive in your account within 24 hours.</p>
                  <p className="text-brand-dark/30 text-xs mb-6">{withdrawForm.bank} · {withdrawForm.accountNumber}</p>
                  <button onClick={resetWithdraw}
                    className="px-6 py-2.5 rounded-full font-bold text-white text-sm"
                    style={{ backgroundColor: darkPurple }}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SupportTab() {
  const [ticket, setTicket] = useState({ subject: '', category: 'Payment', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [messages, setMessages] = useState([
    { from: 'agent', name: 'Tolu · Support', text: 'Hi! 👋 How can I help you today?', time: 'just now' },
  ])

  function sendChat() {
    if (!chatMsg.trim()) return
    const userMsg = { from: 'user', name: 'You', text: chatMsg, time: 'just now' }
    setMessages(m => [...m, userMsg])
    setChatMsg('')
    setTimeout(() => {
      setMessages(m => [...m, {
        from: 'agent', name: 'Tolu · Support',
        text: "Thanks for reaching out! I'm looking into that for you right now. Give me a moment.",
        time: 'just now',
      }])
    }, 1200)
  }

  function submitTicket(e) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => { setSubmitting(false); setSubmitted(true) }, 1500)
  }

  const faqs = [
    { q: 'When do I get paid for a completed campaign?', a: 'Payments are released within 24–48 hours after the brand approves your content. Funds go directly to your Brandiór wallet.' },
    { q: 'How do I dispute a rejected submission?', a: 'Go to the campaign in your dashboard, click "View Feedback", and use the dispute button. Our team reviews all disputes within 2 business days.' },
    { q: 'Can I change my rate card after applying to a gig?', a: 'Your rate card applies to future gig applications. Rates already agreed upon in an active campaign cannot be changed.' },
    { q: 'How do I withdraw my earnings?', a: 'Go to Wallet → Withdraw. We support bank transfer across our supported countries, Paystack, and Flutterwave. Minimum withdrawal is ₦5,000.' },
    { q: 'What happens if a brand ghosts me?', a: "If a brand doesn't respond within 5 days of your submission, you can escalate the campaign to our team and we'll mediate." },
  ]

  return (
    <div className="space-y-6">

      {/* Header cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open Tickets',    value: '0' },
          { label: 'Avg. Response',   value: '< 2h' },
          { label: 'Resolved',        value: '3' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl p-4 bg-white shadow-sm text-center" style={{ border: '1px solid #e9d5ff' }}>
            <p className="font-black text-2xl text-brand-dark">{value}</p>
            <p className="text-brand-dark text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Submit a Ticket ── */}
        <div className="rounded-3xl p-6 bg-white shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
          <div className="flex items-center gap-2 mb-5">
            <Ticket className="w-4 h-4" style={{ color: purple }} />
            <p className="font-bold text-brand-dark text-sm">Submit a Ticket</p>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#22c55e' }} />
              <p className="font-bold text-brand-dark mb-1">Ticket submitted!</p>
              <p className="text-brand-dark/40 text-sm mb-4">We'll get back to you within 2 hours.</p>
              <button onClick={() => { setSubmitted(false); setTicket({ subject: '', category: 'Payment', message: '' }) }}
                className="text-xs font-semibold px-4 py-2 rounded-full text-white"
                style={{ backgroundColor: darkPurple }}>
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={submitTicket} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Category</label>
                <select
                  value={ticket.category}
                  onChange={e => setTicket(t => ({ ...t, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark outline-none appearance-none"
                  style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                  {['Payment', 'Campaign Issue', 'Account', 'Technical', 'Other'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Subject</label>
                <input
                  value={ticket.subject}
                  onChange={e => setTicket(t => ({ ...t, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark placeholder-brand-dark/25 outline-none"
                  style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Message</label>
                <textarea
                  value={ticket.message}
                  onChange={e => setTicket(t => ({ ...t, message: e.target.value }))}
                  placeholder="Describe your issue in detail…"
                  required rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark placeholder-brand-dark/25 outline-none resize-none"
                  style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}
                />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: darkPurple }}>
                {submitting ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <><Send className="w-4 h-4" /> Send Ticket</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* ── Live Chat ── */}
        <div className="rounded-3xl bg-white shadow-sm flex flex-col overflow-hidden" style={{ border: '1px solid #e9d5ff', height: 420 }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #e9d5ff' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: purple }}>T</div>
            <div>
              <p className="font-bold text-brand-dark text-sm">Live Chat</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-brand-dark/40 text-xs">Tolu is online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: m.from === 'user' ? pink : purple }}>
                  {m.from === 'user' ? 'U' : 'T'}
                </div>
                <div className={`max-w-[75%] ${m.from === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  <div className="px-3 py-2 rounded-2xl text-xs leading-relaxed"
                    style={{
                      backgroundColor: m.from === 'user' ? darkPurple : '#f3eeff',
                      color: m.from === 'user' ? 'white' : '#0a0a0a',
                      borderBottomRightRadius: m.from === 'user' ? 4 : undefined,
                      borderBottomLeftRadius: m.from === 'agent' ? 4 : undefined,
                    }}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-brand-dark/25 px-1">{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid #e9d5ff' }}>
            <input
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Type a message…"
              className="flex-1 px-4 py-2.5 rounded-full text-sm text-brand-dark placeholder-brand-dark/25 outline-none"
              style={{ backgroundColor: '#f3eeff', border: '1px solid #e9d5ff' }}
            />
            <button onClick={sendChat}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: darkPurple }}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Reach Us On Social ── */}
      <div className="rounded-3xl p-6 bg-white shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4" style={{ color: purple }} />
          <p className="font-bold text-brand-dark text-sm">Reach Us On Social</p>
          <span className="text-xs text-brand-dark/30">DM us directly for quick help</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Instagram */}
          <a href="https://instagram.com/brandior" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group"
            style={{ border: '1px solid #e9d5ff', backgroundColor: '#fdf4ff' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E1306C'; e.currentTarget.style.backgroundColor = '#fff0f5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.backgroundColor = '#fdf4ff' }}>
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig_sup)" />
              <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
              <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
              <defs>
                <linearGradient id="ig_sup" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F9CE34"/><stop offset="0.35" stopColor="#EE2A7B"/><stop offset="1" stopColor="#6228D7"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xs font-semibold text-brand-dark">Instagram</span>
            <span className="text-[10px] text-brand-dark/40">@brandior</span>
          </a>

          {/* Twitter/X */}
          <a href="https://twitter.com/brandior" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
            style={{ border: '1px solid #e9d5ff', backgroundColor: '#fdf4ff' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.backgroundColor = '#f5f5f5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.backgroundColor = '#fdf4ff' }}>
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <rect width="24" height="24" rx="6" fill="#000"/>
              <path d="M17.5 3h3l-6.5 7.5L21 21h-5.5l-4.5-5.5L5.5 21H2.5l7-8L3 3h5.5l4 5z" fill="white"/>
            </svg>
            <span className="text-xs font-semibold text-brand-dark">Twitter / X</span>
            <span className="text-[10px] text-brand-dark/40">@brandior</span>
          </a>

          {/* TikTok */}
          <a href="https://tiktok.com/@brandior" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
            style={{ border: '1px solid #e9d5ff', backgroundColor: '#fdf4ff' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#69C9D0'; e.currentTarget.style.backgroundColor = '#f0fffe' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.backgroundColor = '#fdf4ff' }}>
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <rect width="24" height="24" rx="6" fill="#010101"/>
              <path fill="#69C9D0" d="M17.59 8.19a4.83 4.83 0 01-3.77-4.25V3.5h-3.45v11.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.44a8.2 8.2 0 004.79 1.53V7.52a4.85 4.85 0 01-1.02-.33z"/>
            </svg>
            <span className="text-xs font-semibold text-brand-dark">TikTok</span>
            <span className="text-[10px] text-brand-dark/40">@brandior</span>
          </a>

          {/* LinkedIn */}
          <a href="https://linkedin.com/company/brandior" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
            style={{ border: '1px solid #e9d5ff', backgroundColor: '#fdf4ff' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0A66C2'; e.currentTarget.style.backgroundColor = '#f0f7ff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.backgroundColor = '#fdf4ff' }}>
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <rect width="24" height="24" rx="4" fill="#0A66C2"/>
              <path d="M7 9h2v8H7zm1-3a1.2 1.2 0 110 2.4A1.2 1.2 0 018 6zm4 3h2v1.1c.3-.5 1-1.1 2-1.1 2.2 0 2.5 1.5 2.5 3.4V17h-2v-4.1c0-.9-.3-1.4-1-1.4s-1.5.5-1.5 1.5V17h-2V9z" fill="white"/>
            </svg>
            <span className="text-xs font-semibold text-brand-dark">LinkedIn</span>
            <span className="text-[10px] text-brand-dark/40">Brandiór</span>
          </a>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="rounded-3xl p-6 bg-white shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle className="w-4 h-4" style={{ color: purple }} />
          <p className="font-bold text-brand-dark text-sm">Frequently Asked Questions</p>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                style={{ backgroundColor: openFaq === i ? '#f3eeff' : 'white' }}>
                <p className="text-brand-dark font-semibold text-sm pr-4">{faq.q}</p>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  style={{ color: purple }} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4" style={{ backgroundColor: '#f9f5ff' }}>
                  <p className="text-brand-dark/60 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
