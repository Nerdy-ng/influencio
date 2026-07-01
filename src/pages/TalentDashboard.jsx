import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { logout } from '../lib/logout'
import { getLogo } from '../lib/brandSettings'
import {
  Zap, BadgeCheck, MapPin, Camera, Star,
  TrendingUp, Users, Heart, MessageCircle, Eye, EyeOff, ChevronRight,
  Briefcase, DollarSign, Edit3, Plus, Save, X, Bell,
  LayoutDashboard, Settings, LogOut, Upload, CheckCircle, Link2,
  HelpCircle, Send, Ticket, ChevronDown, AlertCircle, CheckSquare,
  Wallet, ArrowDownLeft, ArrowUpRight, CreditCard, Hash, Globe, Building2,
  PieChart, BarChart2, Tag, ImagePlus, FileText, Mail, UserPlus, Inbox, Clock,
  Shield, Lock, KeyRound, AlertTriangle, ShieldCheck, Loader2, ArrowLeftRight,
} from 'lucide-react'

import MessagingPanel from '../components/MessagingPanel'
import { supabase } from '../lib/supabase'
import InviteTab from '../components/InviteTab'
import { getTalentAnalytics } from '../lib/analytics'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import OnboardingTour from '../components/OnboardingTour'
import { getOrCreatePhylloUser, getPhylloSDKToken, openPhylloConnect, PHYLLO_PLATFORMS } from '../lib/phyllo'

const pink = '#FF6B9D'
const gold = '#D4AF37'
const purple = '#7c3aed'
const darkPurple = '#4c1d95'

const TIERS = {
  'fast-rising': {
    label: 'Fast Rising', color: '#22c55e', bg: '#22c55e18', border: '#22c55e40', emoji: null, StarIcon: true, diamond: false,
    desc: 'You\'re new and climbing. Keep creating!',
    perks: ['Profile listed on Brandior', 'Apply for entry-level gigs', 'Access talent community'],
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
  email: '',
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
      { label: 'Instagram Post',                     amount: '', group: 'Platform' },
      { label: 'Instagram Reel',                     amount: '', group: 'Platform' },
      { label: 'TikTok Video',                       amount: '', group: 'Platform' },
      { label: 'YouTube Video',                      amount: '', group: 'Platform' },
      { label: 'Story / Snap',                       amount: '', group: 'Platform' },
      { label: 'Up to 1 min video',                  amount: '', group: 'Video Length' },
      { label: '1–3 min video',                      amount: '', group: 'Video Length' },
      { label: '3–5 min video',                      amount: '', group: 'Video Length' },
      { label: '5–10 min video',                     amount: '', group: 'Video Length' },
      { label: '10+ min video',                      amount: '', group: 'Video Length' },
      { label: 'Script writing (no editing)',        amount: '', group: 'Script & Editing' },
      { label: 'Script writing (with editing)',      amount: '', group: 'Script & Editing' },
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
  { id: 'collabs',      label: 'My Collabs',        icon: Inbox },
  { id: 'analytics',    label: 'Analytics',         icon: TrendingUp },
  { id: 'notifications',label: 'Notifications',     icon: Bell },
  { id: 'rate-card',    label: 'Rate Card',          icon: CreditCard },
  { id: 'profile',      label: 'My Profile',        icon: LayoutDashboard },
  { id: 'portfolio',    label: 'Portfolio',          icon: ImagePlus },
  { id: 'transactions',    label: 'Transactions',       icon: Wallet },
  { id: 'payout-settings', label: 'Payout Settings',    icon: Building2 },
  { id: 'messages',        label: 'Messages',           icon: Mail },
  { id: 'settings',        label: 'Profile Settings',   icon: Settings },
  { id: 'invite',          label: 'Invite Brands',      icon: UserPlus },
  { id: 'support',         label: 'Support',            icon: HelpCircle },
]

function AvatarMenu({ profile, activeTab, setActiveTab }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigateTo = useNavigate()
  const [realEmail, setRealEmail] = useState('')
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setRealEmail(session.user.email)
    })
  }, [])

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function navigate(id) {
    setActiveTab(id)
    setOpen(false)
  }

  function handleSwitchToBrand() {
    setOpen(false)
    localStorage.setItem('brandiór_role', 'brand')
    navigateTo('/brand-dashboard')
  }

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigateTo('/')
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
              <p className="text-white/35 text-xs truncate">{realEmail || profile.email || ''}</p>
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
                    style={{ color: activeTab === id ? purple : 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = `${purple}14`}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: activeTab === id ? purple : 'rgba(255,255,255,0.3)' }} />
                    {label}
                    {activeTab === id && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: purple }} />}
                  </button>
            ))}
          </div>

          <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

          <Link to={`/creators/${profile?.handle || profile?.nickname || 'me'}`} target="_blank" rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full transition-colors"
            style={{ color: purple }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = `${purple}14`}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
            <Eye className="w-3.5 h-3.5" /> View Public Profile
          </Link>
          <button onClick={handleSwitchToBrand}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full text-left transition-colors"
            style={{ color: '#F72585' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(247,37,133,0.08)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
            <ArrowLeftRight className="w-3.5 h-3.5" /> Switch to Brand Account
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full text-left transition-colors"
            style={{ color: '#FF6B9D' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,107,157,0.08)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      )}
    </div>
  )
}

function Sidebar({ active, setActive, dashLogo }) {
  const navigate = useNavigate()
  const nav = [
    { id: 'collabs',      label: 'My Collabs',       icon: Inbox },
    { id: 'notifications',label: 'Notifications',    icon: Bell },
    { id: 'rate-card',    label: 'Rate Card',         icon: CreditCard },
    { id: 'profile',      label: 'My Profile',       icon: LayoutDashboard },
    { id: 'portfolio',    label: 'Portfolio',         icon: ImagePlus },
    { id: 'transactions',    label: 'Transactions',      icon: Wallet },
    { id: 'payout-settings', label: 'Payout Settings',   icon: Building2 },
    { id: 'messages',        label: 'Messages',          icon: Mail },
    { id: 'settings',        label: 'Profile Settings',  icon: Settings },
    { id: 'invite',          label: 'Invite Brands',     icon: UserPlus },
    { id: 'support',         label: 'Support',           icon: HelpCircle },
  ]

  function switchToBrand() {
    localStorage.setItem('brandiór_role', 'brand')
    navigate('/brand-dashboard')
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0 overflow-y-auto py-8 px-4"
      style={{ backgroundColor: 'var(--b-creatorDashBg)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <Link to="/" className="block -mx-4 px-4 mb-4">
        <img src={dashLogo} alt="Brandior" className="w-full object-contain object-left" style={{ height: '160px' }} />
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
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--b-creatorMenuBg) 10%, transparent)'; e.currentTarget.style.color = 'var(--b-creatorMenuBg)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
              </Link>
            : <button key={id} onClick={() => setActive(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  backgroundColor: active === id ? 'color-mix(in srgb, var(--b-creatorMenuBg) 10%, transparent)' : 'transparent',
                  color: active === id ? 'var(--b-creatorMenuBg)' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${active === id ? 'color-mix(in srgb, var(--b-creatorMenuBg) 25%, transparent)' : 'transparent'}`,
                }}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={switchToBrand}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
          style={{ color: '#F72585' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(247,37,133,0.08)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
          <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
          Switch to Brand Account
        </button>
      </div>
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

function NewUserWelcomeBanner({ completion, setActiveTab }) {
  if (completion >= 40) return null
  return (
    <div className="rounded-2xl p-5 mb-2" style={{ background: 'linear-gradient(135deg, #1a0035 0%, #3d0080 100%)', border: '1px solid rgba(192,132,252,0.25)' }}>
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#c4b5fd' }}>Getting Started</p>
      <h3 className="text-white font-bold text-base mb-1">Complete your profile to apply for campaigns</h3>
      <p className="text-white/45 text-sm mb-4">Brands won't be able to hire you until your profile is set up.</p>
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { n: 1, label: 'Add your name & bio' },
          { n: 2, label: 'Connect a social account' },
          { n: 3, label: 'Set your rates' },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.3)' }}>{n}</div>
            {label}
          </div>
        ))}
      </div>
      <button onClick={() => setActiveTab('settings')}
        className="px-5 py-2 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-80"
        style={{ backgroundColor: '#7c3aed' }}>
        Complete Profile →
      </button>
    </div>
  )
}

const COLLAB_STATUS = {
  pending:             { label: 'New Request',  bg: '#fef9c3', color: '#854d0e', icon: Clock },
  in_progress:         { label: 'In Progress',  bg: '#dbeafe', color: '#1d4ed8', icon: Loader2 },
  delivered:           { label: 'Delivered',    bg: '#ede9fe', color: '#6d28d9', icon: Upload },
  revision_requested:  { label: 'Revision Requested', bg: '#fee2e2', color: '#b91c1c', icon: AlertCircle },
  completed:           { label: 'Completed',    bg: '#dcfce7', color: '#166534', icon: CheckCircle },
  cancelled:           { label: 'Cancelled',    bg: '#f3f4f6', color: '#6b7280', icon: X },
}

function MyCollabsTab({ completion = 100, setActiveTab }) {
  const [collabs, setCollabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [deliverCollab, setDeliverCollab] = useState(null)
  const [deliverFile, setDeliverFile] = useState(null)
  const [deliverLink, setDeliverLink] = useState('')
  const [deliverNote, setDeliverNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const deliverFileRef = useRef(null)
  const [reviewCollab, setReviewCollab] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)

  useEffect(() => {
    async function fetchCollabs() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: rows } = await supabase
          .from('collabs')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })

        const brandIds = [...new Set((rows || []).map(c => c.brand_id))]
        let brandMap = {}
        if (brandIds.length > 0) {
          const { data: brands } = await supabase
            .from('profiles')
            .select('id, full_name, company_name, avatar_url')
            .in('id', brandIds)
          ;(brands || []).forEach(b => { brandMap[b.id] = b })
        }

        setCollabs((rows || []).map(c => ({ ...c, brand: brandMap[c.brand_id] || null })))
      } catch {
        setCollabs([])
      } finally {
        setLoading(false)
      }
    }
    fetchCollabs()
  }, [])

  async function uploadDeliverable() {
    if (!deliverCollab) return
    const hasFile = !!deliverFile
    const hasLink = deliverLink.trim().length > 0
    if (!hasFile && !hasLink) return
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let newFile
      if (hasFile) {
        const path = `${user.id}/${deliverCollab.id}/${Date.now()}-${deliverFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { error } = await supabase.storage.from('deliverables').upload(path, deliverFile)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('deliverables').getPublicUrl(path)
        newFile = { name: deliverFile.name, url: publicUrl, size: deliverFile.size, note: deliverNote.trim() || null, uploaded_at: new Date().toISOString() }
      } else {
        newFile = { name: 'Shared link', url: deliverLink.trim(), size: null, note: deliverNote.trim() || null, uploaded_at: new Date().toISOString() }
      }
      const updatedFiles = [...(deliverCollab.delivered_files || []), newFile]

      await supabase.from('collabs')
        .update({ delivered_files: updatedFiles, status: 'delivered' })
        .eq('id', deliverCollab.id)

      setCollabs(prev => prev.map(c => c.id === deliverCollab.id ? { ...c, delivered_files: updatedFiles, status: 'delivered' } : c))
      setUploadDone(true)
      setDeliverFile(null)
      setDeliverLink('')
      setDeliverNote('')
      setTimeout(() => { setDeliverCollab(null); setUploadDone(false) }, 2000)
    } catch {
      /* fail silently for now */
    } finally {
      setUploading(false)
    }
  }

  async function submitBrandReview() {
    if (!reviewCollab || reviewRating === 0 || reviewComment.trim().length < 20) return
    setReviewSubmitting(true)
    await supabase.from('collabs').update({
      creator_review_rating: reviewRating,
      creator_review_comment: reviewComment.trim(),
      creator_reviewed_at: new Date().toISOString(),
    }).eq('id', reviewCollab.id)
    setCollabs(prev => prev.map(c => c.id === reviewCollab.id ? { ...c, creator_review_rating: reviewRating } : c))
    setReviewSubmitting(false)
    setReviewDone(true)
    setTimeout(() => { setReviewCollab(null); setReviewDone(false); setReviewRating(0); setReviewComment('') }, 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
    </div>
  )

  if (collabs.length === 0) return (
    <div className="space-y-5">
      <NewUserWelcomeBanner completion={completion} setActiveTab={setActiveTab} />
      <div className="text-center py-16">
        <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: purple }} />
        <p className="font-semibold mb-1" style={{ color: darkPurple }}>No collabs yet</p>
        <p className="text-sm text-gray-400">Brands will be able to hire you directly once your rate card is set up.</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <NewUserWelcomeBanner completion={completion} setActiveTab={setActiveTab} />

      {/* Incoming custom offers */}
      <CustomOffersInbox />

      {/* Deliverable upload modal */}
      {deliverCollab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-gray-900 text-lg">
                {deliverCollab.status === 'revision_requested' ? 'Resubmit Work' : 'Submit Deliverable'}
              </h3>
              <button onClick={() => setDeliverCollab(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              For: <span className="font-semibold text-gray-800">{deliverCollab.content_type} — {deliverCollab.brand?.company_name || deliverCollab.brand?.full_name || 'Brand'}</span>
            </p>

            {deliverCollab.status === 'revision_requested' && deliverCollab.revision_reason && (
              <div className="flex gap-3 rounded-xl p-3 mb-4" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ea580c' }} />
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: '#ea580c' }}>Brand's revision feedback</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{deliverCollab.revision_reason}</p>
                </div>
              </div>
            )}

            {uploadDone ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#16a34a' }} />
                <p className="font-bold text-gray-800">{deliverCollab.status === 'revision_requested' ? 'Resubmission sent!' : 'Deliverable uploaded!'}</p>
              </div>
            ) : (
              <>
                <input ref={deliverFileRef} type="file" className="hidden"
                  onChange={e => { setDeliverFile(e.target.files?.[0]); setDeliverLink('') }} />

                {deliverFile ? (
                  <div className="flex items-center justify-between p-3 rounded-xl mb-3"
                    style={{ backgroundColor: '#f3e8ff', border: '1px solid #e9d5ff' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 flex-shrink-0" style={{ color: purple }} />
                      <p className="text-sm font-medium text-gray-800 truncate">{deliverFile.name}</p>
                      <p className="text-xs text-gray-400 flex-shrink-0">{(deliverFile.size / (1024*1024)).toFixed(1)} MB</p>
                    </div>
                    <button onClick={() => setDeliverFile(null)} className="ml-2 text-gray-400 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => deliverFileRef.current?.click()}
                    className="cursor-pointer rounded-2xl flex flex-col items-center justify-center gap-2 py-6 mb-3 transition-colors"
                    style={{ border: '2px dashed #e9d5ff', backgroundColor: '#f9f5ff' }}>
                    <Upload className="w-7 h-7" style={{ color: purple }} />
                    <p className="text-sm font-semibold text-gray-700">Click to upload file</p>
                    <p className="text-xs text-gray-400">Images, videos, PDFs, ZIP — any format</p>
                  </div>
                )}

                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-semibold text-gray-400">or paste a link</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <input type="url" value={deliverLink} disabled={!!deliverFile}
                  onChange={e => setDeliverLink(e.target.value)}
                  placeholder="Instagram, TikTok, YouTube, Drive…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none mb-3 disabled:opacity-40"
                  style={{ borderColor: deliverLink && !deliverFile ? '#e9d5ff' : undefined }} />

                <textarea value={deliverNote} onChange={e => setDeliverNote(e.target.value)}
                  placeholder="Add a note for the brand (optional)..."
                  rows={2} className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none mb-4" />

                <button onClick={uploadDeliverable} disabled={(!deliverFile && !deliverLink.trim()) || uploading}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: darkPurple }}>
                  {uploading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                    : deliverCollab.status === 'revision_requested' ? 'Resubmit for Review' : 'Submit Deliverable'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Brand review modal ── */}
      {reviewCollab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e9d5ff' }}>
              <p className="font-black text-brand-dark">Rate the Brand</p>
              <button onClick={() => setReviewCollab(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-brand-dark/40" /></button>
            </div>
            {reviewDone ? (
              <div className="text-center py-10 px-6">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-black text-brand-dark text-lg">Review Submitted!</p>
                <p className="text-sm text-brand-dark/40 mt-1">Your feedback helps the community.</p>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-5">
                <div>
                  <p className="text-sm font-bold text-brand-dark mb-3">How was working with {reviewCollab.brand?.company_name || reviewCollab.brand?.full_name || 'this brand'}?</p>
                  <div className="flex gap-3 justify-center">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setReviewRating(n)}
                        className="text-3xl transition-transform hover:scale-110"
                        style={{ color: n <= reviewRating ? '#f59e0b' : '#d1d5db' }}>
                        ★
                      </button>
                    ))}
                  </div>
                  {reviewRating > 0 && (
                    <p className="text-center text-sm font-bold mt-2" style={{ color: '#f59e0b' }}>
                      {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][reviewRating]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Your review * <span className="normal-case font-normal text-brand-dark/30">(min 20 chars)</span></label>
                  <textarea rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                    placeholder="Describe your experience working with this brand. Was communication clear? Did they provide a detailed brief?"
                    className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark resize-none outline-none"
                    style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }} />
                  <p className={`text-[10px] mt-0.5 ${reviewComment.length > 0 && reviewComment.length < 20 ? 'text-red-500' : 'text-brand-dark/20'}`}>{reviewComment.length} / 20 min</p>
                </div>
                <button onClick={submitBrandReview} disabled={reviewRating === 0 || reviewComment.trim().length < 20 || reviewSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ backgroundColor: darkPurple }}>
                  {reviewSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Star className="w-4 h-4" /> Submit Review</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-black" style={{ color: darkPurple }}>My Collabs</h2>
        <p className="text-sm text-gray-400 mt-0.5">{collabs.length} collab{collabs.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="space-y-3">
        {collabs.map(c => {
          const sc = COLLAB_STATUS[c.status] || COLLAB_STATUS.pending
          const StatusIcon = sc.icon
          const isOpen = expanded === c.id
          const brandName = c.brand?.company_name || c.brand?.full_name || 'Brand'
          const canDeliver = ['pending', 'in_progress', 'revision_requested'].includes(c.status)
          return (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm overflow-hidden"
              style={{ border: '1.5px solid #e9d5ff' }}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{c.content_type}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{brandName} · {new Date(c.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sc.bg, color: sc.color }}>
                    <StatusIcon className="w-3 h-3" />
                    {sc.label}
                  </span>
                </div>
                <p className="text-xs font-semibold mb-2" style={{ color: '#16a34a' }}>
                  Payout: ₦{Number(c.creator_payout || 0).toLocaleString('en')}
                </p>
                <button onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: purple }}>
                  {isOpen ? 'Hide details' : 'View details'}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                  <div className="mt-3 p-3 rounded-xl text-sm text-gray-700 leading-relaxed space-y-1"
                    style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                    <p><span className="font-semibold">Duration:</span> {c.duration_label}</p>
                    {c.brief?.productName && <p><span className="font-semibold">Product:</span> {c.brief.productName}</p>}
                    {c.brief?.goal && <p><span className="font-semibold">Goal:</span> {c.brief.goal}</p>}
                    {c.brief?.instructions && <p><span className="font-semibold">Instructions:</span> {c.brief.instructions}</p>}
                    {c.brief?.deadline && <p><span className="font-semibold">Deadline:</span> {c.brief.deadline}</p>}
                    {c.revision_reason && <p><span className="font-semibold">Revision note:</span> {c.revision_reason}</p>}
                  </div>
                )}
              </div>
              {c.status === 'revision_requested' && c.revision_reason && (
                <div className="mx-4 mb-3 flex gap-2 rounded-xl p-3"
                  style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#ea580c' }} />
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-bold" style={{ color: '#ea580c' }}>Revision requested: </span>
                    {c.revision_reason}
                  </p>
                </div>
              )}
              <div className="px-4 pb-3 flex gap-2 flex-wrap">
                <button onClick={() => setActiveTab('messages')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: darkPurple, color: 'white' }}>
                  <Mail className="w-4 h-4" /> Messages
                </button>
                {canDeliver && (
                  <button onClick={() => { setDeliverCollab(c); setDeliverFile(null); setDeliverLink(''); setDeliverNote(''); setUploadDone(false) }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: c.status === 'revision_requested' ? '#fff7ed' : '#f3e8ff', color: c.status === 'revision_requested' ? '#ea580c' : purple, border: c.status === 'revision_requested' ? '1px solid #fed7aa' : 'none' }}>
                    <Upload className="w-4 h-4" />
                    {c.status === 'revision_requested' ? 'Resubmit' : 'Deliverables'}
                  </button>
                )}
                {c.status === 'completed' && !c.creator_review_rating && (
                  <button onClick={() => { setReviewCollab(c); setReviewRating(0); setReviewComment(''); setReviewDone(false) }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' }}>
                    <Star className="w-4 h-4" /> Rate Brand
                  </button>
                )}
                {c.status === 'completed' && c.creator_review_rating > 0 && (
                  <div className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-semibold text-amber-600">
                    {'★'.repeat(c.creator_review_rating)}{'☆'.repeat(5 - c.creator_review_rating)} Reviewed
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Custom Offers Inbox (creator sees incoming offers from brands) ─────────────
function CustomOffersInbox() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [acting, setActing] = useState(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('custom_offers')
        .select('*, brand:profiles!brand_id(id, full_name, company_name, avatar_url)')
        .eq('creator_id', user.id)
        .eq('status', 'offer_pending')
        .order('created_at', { ascending: false })
      setOffers(data || [])
      setLoading(false)
    })()
  }, [])

  async function respondToOffer(id, action) {
    setActing(id)
    await supabase.from('custom_offers').update({ status: action }).eq('id', id)
    setOffers(prev => prev.filter(o => o.id !== id))
    setActing(null)
  }

  if (loading || offers.length === 0) return null

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pink }} />
        <p className="font-black text-brand-dark text-sm">Custom Offers ({offers.length})</p>
      </div>
      <div className="space-y-3">
        {offers.map(o => {
          const brandName = o.brand?.company_name || o.brand?.full_name || 'Brand'
          const isOpen = expanded === o.id
          const isActing = acting === o.id
          return (
            <div key={o.id} className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${pink}40` }}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-dark text-sm truncate">{o.title}</p>
                    <p className="text-xs text-brand-dark/40 mt-0.5">From {brandName} · {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <p className="font-black text-sm flex-shrink-0" style={{ color: '#22c55e' }}>₦{Number(o.budget).toLocaleString()}</p>
                </div>
                {o.timeline && (
                  <p className="text-xs text-brand-dark/50 mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {o.timeline}
                  </p>
                )}
                <button onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="text-xs font-semibold flex items-center gap-1 mb-3" style={{ color: purple }}>
                  {isOpen ? 'Hide details' : 'See brief'}
                  <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs text-brand-dark/70 leading-relaxed">{o.brief}</p>
                    {o.deliverables?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {o.deliverables.map(d => (
                          <span key={d} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${darkPurple}10`, color: darkPurple }}>{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => respondToOffer(o.id, 'accepted')} disabled={isActing}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60 transition-opacity"
                    style={{ backgroundColor: '#22c55e' }}>
                    {isActing ? '…' : 'Accept'}
                  </button>
                  <button onClick={() => respondToOffer(o.id, 'declined')} disabled={isActing}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-red-500 disabled:opacity-60 transition-opacity"
                    style={{ border: '1px solid #ef444440', backgroundColor: '#fef2f2' }}>
                    {isActing ? '…' : 'Decline'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AccountSettingsCard({ settingsEditMode, realEmail }) {
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (realEmail) setNewEmail(realEmail)
  }, [realEmail])

  async function handleUpdate() {
    setError('')
    const updates = {}
    if (newEmail && newEmail !== realEmail) updates.email = newEmail
    if (newPassword.length >= 8) updates.password = newPassword
    if (!Object.keys(updates).length) { setError('Nothing to update.'); return }
    setSaving(true)
    const { error: err } = await supabase.auth.updateUser(updates)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setNewPassword('')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
      <p className="font-bold text-brand-dark mb-4">Account Settings</p>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Email Address</label>
          {settingsEditMode ? (
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark outline-none"
              style={{ border: `1px solid ${purple}50`, backgroundColor: '#f9f5ff' }} />
          ) : (
            <p className="text-sm py-1" style={{ color: realEmail ? '#0a0a0a' : 'rgba(10,0,32,0.25)' }}>
              {realEmail || 'your@email.com'}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Change Password</label>
          {settingsEditMode ? (
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark outline-none"
              style={{ border: `1px solid ${purple}50`, backgroundColor: '#f9f5ff' }} />
          ) : (
            <p className="text-sm text-brand-dark/25 italic py-1">••••••••</p>
          )}
        </div>
        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
        {settingsEditMode && (
          <button onClick={handleUpdate} disabled={saving}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white flex items-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: saved ? '#16a34a' : darkPurple }}>
            {saving
              ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Update Account'
            }
          </button>
        )}
      </div>
    </div>
  )
}

const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What is your mother\'s maiden name?',
  'What city were you born in?',
  'What was the name of your first school?',
  'What is the name of the street you grew up on?',
  'What was your childhood nickname?',
  'What is your oldest sibling\'s middle name?',
  'What was the make and model of your first car?',
  'What is the name of your favourite childhood friend?',
  'What was the first concert you attended?',
]

function SecurityCard() {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [pinVisible, setPinVisible] = useState(false)
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSaved, setPinSaved] = useState(false)
  const [questions, setQuestions] = useState([
    { q: '', a: '' },
    { q: '', a: '' },
    { q: '', a: '' },
  ])
  const [error, setError] = useState('')

  // Load from supabase metadata on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const m = user.user_metadata || {}
      if (m.securityQuestions) setQuestions(m.securityQuestions)
      if (m.withdrawalPin) setPin(m.withdrawalPin)
    })
  }, [])

  function updateQ(i, field, val) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q))
  }

  async function handleSave() {
    setError('')
    const incomplete = questions.some(q => (q.q && !q.a) || (!q.q && q.a))
    if (incomplete) { setError('Please provide both a question and answer for each row.'); return }
    setSaving(true)
    await supabase.auth.updateUser({ data: { securityQuestions: questions } })
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleSavePin() {
    setPinError('')
    if (!/^\d{4}$/.test(pin)) { setPinError('PIN must be exactly 4 digits.'); return }
    if (pin !== pinConfirm) { setPinError('PINs do not match.'); return }
    await supabase.auth.updateUser({ data: { withdrawalPin: pin } })
    setPinSaved(true)
    setPinConfirm('')
    setTimeout(() => setPinSaved(false), 2500)
  }

  const usedQs = questions.map(q => q.q).filter(Boolean)

  return (
    <div className="rounded-3xl overflow-hidden shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5" style={{ background: 'linear-gradient(135deg, #0d0020 0%, #2d0060 100%)' }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(250,129,18,0.15)' }}>
          <Shield className="w-5 h-5" style={{ color: '#FA8112' }} />
        </div>
        <div>
          <p className="font-bold text-white">Account & Withdrawal Security</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Protect your earnings and account from unauthorised access</p>
        </div>
      </div>

      <div className="p-6 space-y-7">
        {/* ── Security Questions ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" style={{ color: purple }} />
              <p className="font-semibold text-brand-dark text-sm">Security Questions</p>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full text-white"
                style={{ backgroundColor: darkPurple }}>
                {questions.some(q => q.q) ? 'Edit' : 'Set Up'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full border text-brand-dark/50"
                  style={{ borderColor: '#e9d5ff' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full text-white flex items-center gap-1.5 disabled:opacity-60"
                  style={{ backgroundColor: saved ? '#16a34a' : darkPurple }}>
                  {saving
                    ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : saved ? <><ShieldCheck className="w-3 h-3" /> Saved!</> : 'Save Questions'}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-brand-dark/40 mb-4">
            These questions are used to verify your identity when you forget your password or request a withdrawal.
          </p>

          {!editing && !questions.some(q => q.q) ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#ea580c' }} />
              <p className="text-xs text-orange-700 font-medium">Security questions not set. Your account has limited recovery options.</p>
            </div>
          ) : !editing ? (
            <div className="space-y-2">
              {questions.filter(q => q.q).map((q, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: '#f9f5ff' }}>
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-brand-dark truncate">{q.q}</p>
                    <p className="text-xs text-brand-dark/30">Answer set ••••••</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="p-4 rounded-2xl space-y-2" style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
                  <p className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest">Question {i + 1}</p>
                  <select
                    value={q.q}
                    onChange={e => updateQ(i, 'q', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ border: '1px solid #e9d5ff', color: '#1a0030', backgroundColor: 'white' }}>
                    <option value="">— Select a question —</option>
                    {SECURITY_QUESTIONS.filter(sq => !usedQs.includes(sq) || sq === q.q).map(sq => (
                      <option key={sq} value={sq}>{sq}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={q.a}
                    onChange={e => updateQ(i, 'a', e.target.value)}
                    placeholder="Your answer"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ border: '1px solid #e9d5ff', color: '#1a0030', backgroundColor: 'white' }} />
                </div>
              ))}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #f3e8ff' }} />

        {/* ── Withdrawal PIN ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4" style={{ color: purple }} />
            <p className="font-semibold text-brand-dark text-sm">Withdrawal PIN</p>
          </div>
          <p className="text-xs text-brand-dark/40 mb-4">
            A 4-digit PIN is required every time you request a payout. Keep it private — never share it with anyone, including Brandior staff.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest block mb-1.5">
                {pin ? 'New PIN' : 'Set PIN'}
              </label>
              <div className="relative">
                <input
                  type={pinVisible ? 'text' : 'password'}
                  value={pin}
                  onChange={e => { if (/^\d{0,4}$/.test(e.target.value)) setPin(e.target.value) }}
                  maxLength={4}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none tracking-[0.5em] font-bold"
                  style={{ border: '1px solid #e9d5ff', color: '#1a0030', backgroundColor: '#f9f5ff' }} />
                <button type="button" onClick={() => setPinVisible(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/30 hover:text-brand-dark/60 transition-colors">
                  {pinVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest block mb-1.5">Confirm PIN</label>
              <input
                type="password"
                value={pinConfirm}
                onChange={e => { if (/^\d{0,4}$/.test(e.target.value)) setPinConfirm(e.target.value) }}
                maxLength={4}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none tracking-[0.5em] font-bold"
                style={{ border: '1px solid #e9d5ff', color: '#1a0030', backgroundColor: '#f9f5ff' }} />
            </div>
          </div>
          {pinError && <p className="text-xs text-red-500 mt-2">{pinError}</p>}
          <button onClick={handleSavePin}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: pinSaved ? '#16a34a' : darkPurple }}>
            {pinSaved ? <><ShieldCheck className="w-4 h-4" /> PIN Saved!</> : <><Lock className="w-4 h-4" /> Save PIN</>}
          </button>
        </div>

        <div style={{ borderTop: '1px solid #f3e8ff' }} />

        {/* ── Safety tips ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4" style={{ color: '#22c55e' }} />
            <p className="font-semibold text-brand-dark text-sm">Stay Safe on Brandior</p>
          </div>
          <ul className="space-y-2.5">
            {[
              { icon: '🔐', text: 'Never share your password or PIN with anyone — Brandior staff will never ask for them.' },
              { icon: '💸', text: 'Always receive payment through the platform. Off-platform payments are not protected.' },
              { icon: '🚨', text: 'Report any brand asking to pay you directly outside Brandior. Your account may be at risk.' },
              { icon: '📧', text: 'Beware of phishing emails. Brandior only emails from @brandior.africa.' },
              { icon: '🔑', text: 'Use a strong, unique password and update your security questions regularly.' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-xs text-brand-dark/60 leading-relaxed">
                <span className="flex-shrink-0 text-base">{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function TalentDashboard() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'collabs')
  const initialConvId = searchParams.get('conv')
  const [profile, setProfile] = useState(emptyProfile)
  const [dashLogo, setDashLogo] = useState(() => getLogo('dashboard'))
  const [hashInput, setHashInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showAddWork, setShowAddWork] = useState(false)
  const [showRatingDetail, setShowRatingDetail] = useState(false)
  const [settingsEditMode, setSettingsEditMode] = useState(false)
  const [profileSnapshot, setProfileSnapshot] = useState(null)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const userId = localStorage.getItem('brandiór_user') || 'guest'
  const [showTour, setShowTour] = useState(() => !localStorage.getItem(`brandior_tour_done_${userId}`))
  const [showOffPlatformWarning, setShowOffPlatformWarning] = useState(() => !localStorage.getItem(`brandior_offplatform_seen_${userId}`))

  // Load profile from Supabase user metadata
  useEffect(() => {
    function onLogoUpdate() { setDashLogo(getLogo('dashboard')) }
    window.addEventListener('brandior:logo-updated', onLogoUpdate)
    return () => window.removeEventListener('brandior:logo-updated', onLogoUpdate)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const m = user.user_metadata || {}
      setProfile(p => ({
        ...p,
        email: user.email || p.email,
        nickname: m.full_name || m.nickname || p.nickname,
        handle: m.handle || p.handle,
        bio: m.bio || p.bio,
        location: m.location || p.location,
        niches: m.niches || p.niches,
        website: m.website || p.website,
        hashtags: m.hashtags || p.hashtags,
        contentStyles: m.contentStyles || p.contentStyles,
        availableForHire: m.availableForHire ?? p.availableForHire,
        talentTypes: m.talentTypes || p.talentTypes,
        pricing: m.pricing ? {
          ...m.pricing,
          rates: (m.pricing.rates || []).map(r => ({ ...r, group: r.group || 'Platform' }))
        } : p.pricing,
        socials: m.socials || p.socials,
      }))
      // Load portfolio + avatar from profiles table
      const { data: profileRow } = await supabase.from('profiles').select('portfolio, avatar_url').eq('id', user.id).single()
      if (profileRow) {
        setProfile(p => ({
          ...p,
          portfolio: profileRow.portfolio?.length ? profileRow.portfolio : p.portfolio,
          avatar: profileRow.avatar_url || m.avatar || p.avatar,
        }))
      }
    })
  }, [])

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
  async function saveSettings() {
    setProfileSnapshot(null)
    setSettingsEditMode(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.auth.updateUser({
      data: {
        full_name: profile.nickname,
        nickname: profile.nickname,
        handle: profile.handle,
        bio: profile.bio,
        location: profile.location,
        niches: profile.niches,
        website: profile.website,
        hashtags: profile.hashtags,
        contentStyles: profile.contentStyles,
        availableForHire: profile.availableForHire,
        talentTypes: profile.talentTypes,
        pricing: profile.pricing,
        socials: profile.socials,
      }
    })

    // Derive min_price from the lowest non-empty rate
    const rates = profile.pricing?.rates || []
    const minPrice = rates
      .map(r => Number(r.amount))
      .filter(n => n > 0)
      .reduce((min, n) => (n < min ? n : min), Infinity)

    await supabase.from('profiles').upsert({
      id: user.id,
      handle: profile.handle,
      full_name: profile.nickname,
      bio: profile.bio,
      location: profile.location,
      niches: profile.niches || [],
      platforms: (profile.socials || []).map(s => s.platform).filter(Boolean),
      content_types: profile.contentStyles || [],
      talent_types: profile.talentTypes || [],
      hashtags: profile.hashtags || [],
      website: profile.website,
      available_for_hire: profile.availableForHire,
      pricing: profile.pricing || {},
      socials: profile.socials || [],
      min_price: isFinite(minPrice) ? minPrice : 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
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

  async function addPortfolioItem(e) {
    e.preventDefault()
    if (!newWork.title.trim()) return
    setUploadingPortfolio(true)
    let finalUrl = newWork.url
    try {
      if (portfolioFile) {
        const { data: { user } } = await supabase.auth.getUser()
        const ext = portfolioFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${portfolioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { error } = await supabase.storage.from('portfolio').upload(path, portfolioFile)
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path)
          finalUrl = publicUrl
        }
      }
      const item = { ...newWork, url: finalUrl, id: Date.now() }
      setProfile(p => {
        const updated = [...p.portfolio, item]
        // persist to profiles table
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) supabase.from('profiles').upsert({ id: user.id, portfolio: updated, updated_at: new Date().toISOString() }, { onConflict: 'id' })
        })
        return { ...p, portfolio: updated }
      })
      resetAddWork()
    } finally {
      setUploadingPortfolio(false)
    }
  }

  function removePortfolioItem(id) {
    setProfile(p => {
      const removed = p.portfolio.find(x => x.id === id)
      const updated = p.portfolio.filter(x => x.id !== id)
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) supabase.from('profiles').upsert({ id: user.id, portfolio: updated, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      })
      return {
        ...p,
        portfolio: updated,
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

  const [portfolioFile, setPortfolioFile] = useState(null)
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)

  function handlePortfolioFile(file) {
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) return
    const url = URL.createObjectURL(file)
    const preview = { url, name: file.name, size: (file.size / (1024 * 1024)).toFixed(1), mime: file.type }
    setUploadPreview(preview)
    setPortfolioFile(file)
    setNewWork(w => ({ ...w, url, type: isVideo ? 'video' : 'photo' }))
  }

  async function handleAvatarFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const previewUrl = URL.createObjectURL(file)
    setProfile(p => ({ ...p, avatar: previewUrl }))
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (error) return
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      setProfile(p => ({ ...p, avatar: publicUrl }))
      await supabase.auth.updateUser({ data: { avatar: publicUrl } })
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    } catch { /* keep preview */ }
  }

  function resetAddWork() {
    setNewWork({ title: '', brand: '', type: 'video', url: '', desc: '' })
    setUploadPreview(null)
    setPortfolioFile(null)
    setShowAddWork(false)
  }

  const [connecting, setConnecting] = useState(null)

  async function connectSocial(i) {
    const platform = profile.socials[i].platform
    const platformId = PHYLLO_PLATFORMS[platform]
    if (!platformId) return
    setConnecting(i)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // Get or create Phyllo user, then get SDK token
      const phylloUserId = await getOrCreatePhylloUser(user.id, profile.nickname || user.email)
      const token = await getPhylloSDKToken(phylloUserId)

      openPhylloConnect({
        token,
        userId: phylloUserId,
        platformId,
        onConnected: async ({ accountId }) => {
          // Fetch real data from Phyllo after connection
          const res = await fetch(`/api/phyllo-account-data?user_id=${phylloUserId}&account_id=${accountId}`)
          const data = await res.json()
          const followers = data.followers
            ? data.followers >= 1000000
              ? (data.followers / 1000000).toFixed(1) + 'M'
              : data.followers >= 1000
                ? (data.followers / 1000).toFixed(1) + 'K'
                : String(data.followers)
            : ''
          const engagement = data.engagement_rate
            ? (data.engagement_rate * 100).toFixed(1) + '%'
            : ''
          setProfile(p => {
            const s = [...p.socials]
            s[i] = { ...s[i], handle: data.handle || '', followers, engagement, connected: true }
            return { ...p, socials: s }
          })
          setConnecting(null)
        },
        onDisconnected: () => {
          setProfile(p => {
            const s = [...p.socials]
            s[i] = { ...s[i], handle: '', followers: '', engagement: '', connected: false }
            return { ...p, socials: s }
          })
          setConnecting(null)
        },
        onExit: () => setConnecting(null),
      })
    } catch (err) {
      console.error('[Phyllo] connectSocial error:', err)
      setConnecting(null)
    }
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

  const tabs = ['profile', 'collabs', 'overview', 'transactions', 'settings', 'support']

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f9f5ff' }}>
      {showTour && (
        <OnboardingTour
          role="talent"
          onClose={() => setShowTour(false)}
          setActiveTab={setActiveTab}
        />
      )}

      {/* ── Off-platform transaction warning ── */}
      {showOffPlatformWarning && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: '#0a0a0a', border: '1px solid #FA8112', boxShadow: '0 0 32px rgba(250,129,18,0.15)' }}>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(250,129,18,0.12)', border: '1px solid rgba(250,129,18,0.3)' }}>
                <Shield className="w-5 h-5" style={{ color: '#FA8112' }} />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">Your Money Is Only Safe</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: '#FA8112' }}>Inside Brandior</p>
              </div>
            </div>

            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Every year, thousands of creators lose their hard-earned income to brands who disappear after receiving content because the deal was done outside the platform.
            </p>

            <div className="mb-5">
              <div className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <span className="flex-shrink-0">🚫</span>
                <span>No escrow = no protection. If a brand pays you directly and disputes it, you have no recourse.</span>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem(`brandior_offplatform_seen_${userId}`, '1')
                setShowOffPlatformWarning(false)
              }}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{ backgroundColor: '#FA8112', color: '#fff' }}>
              I Understand
            </button>
          </div>
        </div>
      )}

      <Sidebar active={activeTab} setActive={tab => {
        if (settingsEditMode) { cancelEditSettings() }
        setActiveTab(tab)
      }} dashLogo={dashLogo} />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: 'rgba(249,245,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e9d5ff' }}>
          <div>
            <h1 className="font-black text-brand-dark text-lg capitalize">
              {activeTab === 'collabs' ? 'My Collabs' : activeTab === 'profile' ? 'My Profile' : activeTab === 'settings' ? 'Profile Settings' : activeTab === 'portfolio' ? 'Portfolio' : activeTab}
            </h1>
            <p className="text-brand-dark/40 text-xs">Manage your talent presence on Brandior</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('messages')} className="relative p-2 rounded-xl hover:bg-white transition-colors">
              <Mail className="w-5 h-5 text-brand-dark/40" />
              {unreadMessages > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />}
            </button>
            <button className="relative p-2 rounded-xl hover:bg-white transition-colors">
              <Bell className="w-5 h-5 text-brand-dark/40" />
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

          {/* ── COLLABS TAB ── */}
          {activeTab === 'collabs' && <MyCollabsTab completion={completion} setActiveTab={setActiveTab} />}

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
                        <button type="submit" disabled={uploadingPortfolio}
                          className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                          style={{ backgroundColor: darkPurple }}>
                          {uploadingPortfolio ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : 'Add to Portfolio'}
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

              {/* ── Pricing ── */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" style={{ color: purple }} />
                    <p className="font-bold text-brand-dark">Pricing</p>
                  </div>
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

                <div className="space-y-5">
                  {['Platform', 'Video Length', 'Script & Editing'].map(group => {
                    const groupRates = profile.pricing.rates
                      .map((rate, i) => ({ ...rate, i }))
                      .filter(r => (r.group || 'Platform') === group)
                    if (!groupRates.length) return null
                    return (
                      <div key={group}>
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: purple }}>{group}</p>
                        <div className="space-y-2">
                          {groupRates.map(({ label, amount, i }) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-sm text-brand-dark/60 flex-1">{label}</span>
                              <div className="flex items-center rounded-xl overflow-hidden w-36"
                                style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                                <span className="pl-3 text-sm text-brand-dark/40">₦</span>
                                <input
                                  type="number"
                                  value={amount}
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
                    )
                  })}
                </div>
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
                  <EditableField label="Brandior Username" value={profile.handle} onChange={v => updateField('handle', v)} placeholder="@yourhandle" isEditing={settingsEditMode} />
                  {/* Location — country + state */}
                  <div>
                    <label className="block text-xs font-medium text-brand-dark/40 uppercase tracking-widest mb-1.5">Location</label>
                    {settingsEditMode ? (() => {
                      const STATES = {
                        Nigeria: ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'],
                        'South Africa': ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'],
                        Kenya: ['Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa','Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi','Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos','Makueni','Mandera','Marsabit','Meru','Migori','Mombasa',"Murang'a",'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri','Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia','Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot'],
                        Ghana: ['Ahafo','Ashanti','Bono','Bono East','Central','Eastern','Greater Accra','North East','Northern','Oti','Savannah','Upper East','Upper West','Volta','Western','Western North'],
                      }
                      const parts = profile.location?.split(', ') || []
                      const selectedCountry = parts.length >= 2 ? parts.slice(1).join(', ') : ''
                      const selectedState = parts[0] || ''
                      return (
                        <div className="flex gap-2">
                          <select
                            value={selectedCountry}
                            onChange={e => updateField('location', e.target.value ? `, ${e.target.value}` : '')}
                            className="flex-1 rounded-xl px-3 py-2 text-sm border focus:outline-none"
                            style={{ borderColor: '#e9d5ff', color: '#1a0030', backgroundColor: '#faf5ff' }}>
                            <option value="">Country</option>
                            {Object.keys(STATES).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <select
                            value={selectedState}
                            onChange={e => updateField('location', e.target.value ? `${e.target.value}, ${selectedCountry}` : (selectedCountry ? `, ${selectedCountry}` : ''))}
                            disabled={!selectedCountry}
                            className="flex-1 rounded-xl px-3 py-2 text-sm border focus:outline-none disabled:opacity-40"
                            style={{ borderColor: '#e9d5ff', color: '#1a0030', backgroundColor: '#faf5ff' }}>
                            <option value="">State / Region</option>
                            {(STATES[selectedCountry] || []).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      )
                    })() : (
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
                  style={{ backgroundColor: '#0d0020', border: `1px solid ${profile.availableForHire ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                  <div>
                    <p className="text-sm font-semibold text-white">Available for hire</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Brands can see you're open to new campaigns</p>
                  </div>
                  <button
                    onClick={async () => {
                      const next = !profile.availableForHire
                      setProfile(p => ({ ...p, availableForHire: next }))
                      const { data: { user } } = await supabase.auth.getUser()
                      if (user) await supabase.from('profiles').update({ available_for_hire: next }).eq('id', user.id)
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                    style={{
                      backgroundColor: profile.availableForHire ? '#22c55e' : 'rgba(255,255,255,0.1)',
                      color: profile.availableForHire ? '#fff' : 'rgba(255,255,255,0.4)',
                      boxShadow: profile.availableForHire ? '0 0 12px rgba(34,197,94,0.35)' : 'none',
                    }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: profile.availableForHire ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                    {profile.availableForHire ? 'Open' : 'Closed'}
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
                    <span className="text-[10px] text-white/30">Assigned by Brandior</span>
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

              <AccountSettingsCard settingsEditMode={settingsEditMode} realEmail={profile.email} />

              <SecurityCard />

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
                <p className="text-brand-dark/40 text-sm mb-4">Permanently delete your Brandior account and all associated data.</p>
                <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
          {/* ── MESSAGES TAB ── */}
          {activeTab === 'messages' && (
            <MessagingPanel userId={localStorage.getItem('brandiór_user') || ''} userType="talent" initialConvId={initialConvId} onUnreadChange={setUnreadMessages} />
          )}

          {/* ── INVITE TAB ── */}
          {activeTab === 'invite' && <InviteTab userType="talent" />}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && <TalentAnalyticsTab />}

          {/* ── SUPPORT TAB ── */}
          {activeTab === 'support' && <SupportTab />}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === 'notifications' && <NotificationsTab />}

          {/* ── RATE CARD TAB ── */}
          {activeTab === 'rate-card' && <RateCardTab />}

          {/* ── PAYOUT SETTINGS TAB ── */}
          {activeTab === 'payout-settings' && <PayoutSettingsTab />}

        </div>
      </main>
    </div>
  )
}

function TalentAnalyticsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const stats = await getTalentAnalytics(user.id)
      setData(stats)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>

  const pieData = [
    { name: 'Completed', value: data.completed, color: '#16a34a' },
    { name: 'Pending',   value: data.pending,   color: '#f59e0b' },
    { name: 'Cancelled', value: data.cancelled, color: '#ef4444' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">My Analytics</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Collabs',  value: data.totalCollabs,                           color: purple },
          { label: 'Success Rate',   value: `${data.successRate}%`,                      color: '#16a34a' },
          { label: 'Avg Rating',     value: data.avgRating ? `${data.avgRating}★` : '—', color: '#D4AF37' },
          { label: 'Reviews',        value: data.totalReviews,                            color: '#0ea5e9' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Collabs over time */}
      <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
        <p className="font-bold text-gray-900 mb-4">Collabs — Last 30 Days</p>
        {data.dailyCollabs.some(d => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.dailyCollabs}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke={purple} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-28 text-sm text-gray-400">No collabs yet</div>
        )}
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
        <p className="font-bold text-gray-900 mb-4">Collab Status</p>
        {pieData.length > 0 ? (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={120} height={120}>
              <RechartsPieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                  <span className="font-bold text-gray-900 ml-auto pl-4">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-28 text-sm text-gray-400">No collabs yet</div>
        )}
      </div>
    </div>
  )
}

function mapCollabToTx(c) {
  const brandName = c.brand?.company_name || c.brand?.full_name || 'Brand'
  const label = c.content_type ? `${c.content_type} — ${brandName}` : `Collab — ${brandName}`
  const date = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const short = c.id.replace(/-/g, '').slice(-6).toUpperCase()
  let status = 'wip'
  if (c.payment_status === 'released' || c.status === 'completed') status = 'available'
  else if (c.status === 'delivered' || c.status === 'revision_requested') status = 'in-review'
  else if (c.status === 'in_progress') status = 'wip'
  else if (c.status === 'cancelled') status = 'withdrawn'
  return { id: `C-${short}`, date, type: 'credit', desc: label, amount: c.creator_payout || 0, status }
}

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
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setTxLoading(false); return }
      const { data } = await supabase
        .from('collabs')
        .select('id, creator_payout, status, payment_status, content_type, created_at, brand:profiles!brand_id(company_name, full_name)')
        .eq('creator_id', user.id)
        .neq('payment_status', 'unpaid')
        .order('created_at', { ascending: false })
      if (data) setTransactions(data.map(mapCollabToTx))
      setTxLoading(false)
    })()
  }, [])

  const wipTotal       = transactions.filter(t => t.status === 'wip').reduce((s, t) => s + t.amount, 0)
  const reviewTotal    = transactions.filter(t => t.status === 'in-review').reduce((s, t) => s + t.amount, 0)
  const availableTotal = transactions.filter(t => t.status === 'available').reduce((s, t) => s + t.amount, 0)

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

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.status === filter)

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
            value: transactions.filter(t => t.status === 'withdrawn').reduce((s, t) => s + t.amount, 0),
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
          {txLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-brand-dark/30">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading transactions…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-brand-dark/30 text-sm">
              {transactions.length === 0 ? 'No transactions yet — complete a collab to earn.' : 'No transactions in this category.'}
            </div>
          ) : filtered.map(tx => {
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

  async function submitTicket(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const saved = localStorage.getItem('brandiór_preview_profile')
      const profile = saved ? JSON.parse(saved) : {}
      await supabase.from('support_tickets').insert({
        user_id: user?.id || null,
        user_email: profile?.email || user?.email || null,
        user_name: profile?.nickname || null,
        role: localStorage.getItem('brandiór_role') || 'talent',
        category: ticket.category,
        subject: ticket.subject,
        message: ticket.message,
      })
    } catch (_) { /* silent — still show success */ }
    setSubmitting(false)
    setSubmitted(true)
  }

  const faqs = [
    { q: 'When do I get paid for a completed campaign?', a: 'Payments are released within 24–48 hours after the brand approves your content. Funds go directly to your Brandior wallet.' },
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
            <span className="text-[10px] text-brand-dark/40">Brandior</span>
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

// ── Notifications Tab ─────────────────────────────────────────────────────────

const NOTIF_ICONS = {
  new_collab:         { color: '#7c3aed', bg: '#f3e8ff', label: 'New Collab'      },
  delivered:          { color: '#2563eb', bg: '#dbeafe', label: 'Delivered'       },
  revision_requested: { color: '#ea580c', bg: '#fff7ed', label: 'Revision'        },
  completed:          { color: '#16a34a', bg: '#dcfce7', label: 'Completed'       },
  payment_released:   { color: '#16a34a', bg: '#dcfce7', label: 'Payment'         },
  message:            { color: '#0284c7', bg: '#e0f2fe', label: 'Message'         },
  default:            { color: '#6b7280', bg: '#f3f4f6', label: 'Notification'    },
}

function NotificationsTab() {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifs(data || [])
      setLoading(false)
      // mark all unread as read
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    })()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black" style={{ color: darkPurple }}>Notifications</h2>
        {notifs.length > 0 && (
          <span className="text-xs text-gray-400">{notifs.filter(n => !n.read).length} unread</span>
        )}
      </div>
      {notifs.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: purple }} />
          <p className="font-semibold text-gray-500">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">We'll notify you when brands place orders or respond to your work</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const meta = NOTIF_ICONS[n.type] || NOTIF_ICONS.default
            return (
              <div key={n.id} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: n.read ? 'white' : meta.bg, border: `1px solid ${n.read ? '#e9d5ff' : meta.color + '30'}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: meta.bg, border: `1px solid ${meta.color}30` }}>
                  <Bell className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">{new Date(n.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: meta.color }} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Rate Card Tab ──────────────────────────────────────────────────────────────

const INIT_CONTENT_TYPES = [
  { id: 'influencer', label: 'Influencer Post', color: '#F72585', desc: 'You post on your channels', enabled: true },
  { id: 'ugc',        label: 'UGC Content',     color: '#7c3aed', desc: 'Brand receives content to post', enabled: true },
]
const INIT_DURATIONS = [
  { id: 'd1', label: 'Up to 30s',   price: 20000  },
  { id: 'd2', label: '31s – 60s',   price: 35000  },
  { id: 'd3', label: '1 – 3 mins',  price: 55000  },
  { id: 'd4', label: '3 – 10 mins', price: 90000  },
  { id: 'd5', label: '10+ mins',    price: 150000 },
]
const INIT_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E4405F', reach: 'Reels, Stories, Feed',  enabled: true,  fee: 20000 },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101', reach: 'Short-form video',       enabled: true,  fee: 15000 },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000', reach: 'Videos & Shorts',        enabled: true,  fee: 40000 },
  { id: 'x',         label: 'X (Twitter)', color: '#1DA1F2', reach: 'Posts & threads',     enabled: false, fee: 10000 },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', reach: 'Feed, Reels, Stories',  enabled: false, fee: 10000 },
]
const INIT_ADDONS = [
  { id: 'script', label: 'Script Writing', color: '#3b82f6', desc: 'You research and write the full script', enabled: true, price: 20000, custom: false },
]
const MIN_RATE = 20000
const fmt = n => '₦' + Number(n || 0).toLocaleString()
const parseNum = s => { const n = parseInt(String(s).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : n }

function RateCardTab() {
  const [types,       setTypes]       = useState(INIT_CONTENT_TYPES)
  const [durations,   setDurations]   = useState(INIT_DURATIONS)
  const [platforms,   setPlatforms]   = useState(INIT_PLATFORMS)
  const [addons,      setAddons]      = useState(INIT_ADDONS)
  const [isPublic,    setIsPublic]    = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [showCustom,  setShowCustom]  = useState(false)
  const [customName,  setCustomName]  = useState('')
  const [customPrice, setCustomPrice] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('rate_cards').select('*').eq('creator_id', user.id).maybeSingle()
      if (data) {
        if (data.content_types) setTypes(data.content_types)
        if (data.durations)     setDurations(data.durations)
        if (data.platforms)     setPlatforms(data.platforms)
        if (data.addons)        setAddons(data.addons)
        if (typeof data.is_public === 'boolean') setIsPublic(data.is_public)
      }
      setLoading(false)
    })()
  }, [])

  const startingFrom = durations[0]?.price ?? MIN_RATE
  const enabledPlatforms = platforms.filter(p => p.enabled)

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    await supabase.from('rate_cards').upsert(
      { creator_id: user.id, content_types: types, durations, platforms, addons, is_public: isPublic },
      { onConflict: 'creator_id' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function addCustomAddon() {
    const name = customName.trim()
    const price = parseNum(customPrice)
    if (!name || !price) return
    setAddons(prev => [...prev, { id: `custom_${Date.now()}`, label: name, desc: 'Custom add-on', color: '#FA8112', enabled: true, price, custom: true }])
    setShowCustom(false); setCustomName(''); setCustomPrice('')
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black" style={{ color: darkPurple }}>Rate Card</h2>
          <p className="text-sm text-gray-400 mt-0.5">Set your pricing — brands see this when they hire you</p>
        </div>
        <button onClick={() => setIsPublic(v => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          style={{ backgroundColor: isPublic ? '#f3e8ff' : '#f3f4f6', color: isPublic ? purple : '#9ca3af', border: `1px solid ${isPublic ? '#e9d5ff' : '#e5e7eb'}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isPublic ? purple : '#9ca3af' }} />
          {isPublic ? 'Public' : 'Hidden'}
        </button>
      </div>

      {/* Preview card */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #7c3aed, #F72585)' }}>
        <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Production starts from</p>
        <p className="text-4xl font-black text-white">{fmt(startingFrom)}</p>
        <p className="text-sm text-white/75 mt-1">+ platform posting fees on top</p>
        <p className="text-xs text-white/80 mt-2 font-medium">Platform min {fmt(MIN_RATE)} · {enabledPlatforms.length} posting platforms</p>
      </div>

      {/* Content Types */}
      <RCSection label="Content Type" hint="Types of content you offer">
        <div className="grid grid-cols-2 gap-3">
          {types.map(t => (
            <button key={t.id} onClick={() => setTypes(prev => prev.map(x => x.id === t.id ? { ...x, enabled: !x.enabled } : x))}
              className="rounded-2xl p-4 text-left transition-all"
              style={{ border: `2px solid ${t.enabled ? t.color : '#e9d5ff'}`, backgroundColor: t.enabled ? t.color + '0C' : 'white' }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold" style={{ color: t.enabled ? t.color : '#9ca3af' }}>{t.label}</span>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: t.enabled ? t.color : '#e5e7eb' }}>
                  {t.enabled ? '✓' : ''}
                </span>
              </div>
              <p className="text-xs text-gray-400">{t.desc}</p>
            </button>
          ))}
        </div>
      </RCSection>

      {/* Video Production durations */}
      <RCSection label="Video Production" hint="What you charge to film & edit — same rate regardless of where it's posted">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
          {durations.map((d, i) => (
            <div key={d.id} className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < durations.length - 1 ? '1px solid #e9d5ff' : 'none' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{d.label}</span>
                {i === 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ backgroundColor: '#FA8112' + '18', color: '#FA8112' }}>Base</span>}
              </div>
              <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ backgroundColor: '#f9f5ff' }}>
                <span className="text-xs font-bold text-gray-400">₦</span>
                <input type="text" inputMode="numeric"
                  value={d.price > 0 ? d.price.toLocaleString() : ''}
                  onChange={e => setDurations(prev => prev.map(r => r.id === d.id ? { ...r, price: parseNum(e.target.value) } : r))}
                  className="w-24 text-sm font-bold text-gray-800 bg-transparent focus:outline-none text-right"
                  placeholder="0" />
              </div>
            </div>
          ))}
        </div>
      </RCSection>

      {/* Platform Posting */}
      <RCSection label="Platform Posting" hint="For Influencer Post only — flat fee per platform, added on top of production">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
          {platforms.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < platforms.length - 1 ? '1px solid #e9d5ff' : 'none' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: p.color + '18' }}>
                <span className="text-xs font-black" style={{ color: p.color }}>{p.label[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: p.enabled ? p.color : '#374151' }}>{p.label}</p>
                <p className="text-xs text-gray-400">{p.reach}</p>
              </div>
              {p.enabled && (
                <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ backgroundColor: '#f9f5ff' }}>
                  <span className="text-xs font-bold" style={{ color: p.color }}>+₦</span>
                  <input type="text" inputMode="numeric"
                    value={p.fee > 0 ? p.fee.toLocaleString() : ''}
                    onChange={e => setPlatforms(prev => prev.map(r => r.id === p.id ? { ...r, fee: parseNum(e.target.value) } : r))}
                    className="w-20 text-sm font-bold bg-transparent focus:outline-none text-right"
                    style={{ color: p.color }}
                    placeholder="0" />
                </div>
              )}
              <input type="checkbox" checked={p.enabled}
                onChange={() => setPlatforms(prev => prev.map(r => r.id === p.id ? { ...r, enabled: !r.enabled } : r))}
                className="w-4 h-4 accent-purple-600 flex-shrink-0" />
            </div>
          ))}
        </div>
      </RCSection>

      {/* Add-ons */}
      <RCSection label="Add-ons" hint="Extras you offer on top of the base price">
        <div className="space-y-3">
          {addons.map(a => (
            <div key={a.id} className="rounded-2xl overflow-hidden"
              style={{ border: `1.5px solid ${a.enabled ? a.color + '60' : '#e9d5ff'}`, backgroundColor: 'white' }}>
              <div className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: a.color + '15' }}>
                  <span className="text-sm font-black" style={{ color: a.color }}>+</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: a.enabled ? a.color : '#374151' }}>{a.label}</p>
                  <p className="text-xs text-gray-400">{a.desc}</p>
                </div>
                {a.custom ? (
                  <button onClick={() => setAddons(prev => prev.filter(x => x.id !== a.id))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#fef2f2' }}>
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                ) : (
                  <input type="checkbox" checked={a.enabled}
                    onChange={() => setAddons(prev => prev.map(x => x.id === a.id ? { ...x, enabled: !x.enabled } : x))}
                    className="w-4 h-4 accent-purple-600 flex-shrink-0" />
                )}
              </div>
              {a.enabled && (
                <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: '#f3e8ff', backgroundColor: '#fafafa' }}>
                  <span className="text-xs font-semibold text-gray-400">Price for this add-on</span>
                  <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ backgroundColor: '#f9f5ff' }}>
                    <span className="text-xs font-bold" style={{ color: a.color }}>+₦</span>
                    <input type="text" inputMode="numeric"
                      value={a.price > 0 ? a.price.toLocaleString() : ''}
                      onChange={e => setAddons(prev => prev.map(x => x.id === a.id ? { ...x, price: parseNum(e.target.value) } : x))}
                      className="w-24 text-sm font-bold bg-transparent focus:outline-none text-right"
                      style={{ color: a.color }}
                      placeholder="0" />
                  </div>
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setShowCustom(true)}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
            style={{ border: '1.5px dashed #a5b4fc', backgroundColor: '#f5f3ff' }}>
            <Plus className="w-5 h-5" style={{ color: '#6366f1' }} />
            <span className="text-sm font-bold" style={{ color: '#6366f1' }}>Add custom add-on</span>
          </button>
        </div>
      </RCSection>

      {/* Custom add-on modal */}
      {showCustom && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10">
            <div className="w-9 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <h3 className="text-lg font-black text-gray-900 mb-1">Custom Add-on</h3>
            <p className="text-sm text-gray-400 mb-5">Name it and set your price</p>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Add-on name</label>
            <input type="text" maxLength={40} value={customName} onChange={e => setCustomName(e.target.value)}
              placeholder="e.g. Express Delivery, Raw Files, Revision…"
              className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none mb-4" style={{ borderColor: '#e9d5ff' }} />
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Price</label>
            <div className="flex items-center rounded-xl border-2 px-4 py-3 mb-5" style={{ borderColor: '#e9d5ff' }}>
              <span className="text-xl font-black mr-2" style={{ color: purple }}>₦</span>
              <input type="text" inputMode="numeric" value={customPrice} onChange={e => setCustomPrice(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0" className="flex-1 text-xl font-black focus:outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCustom(false)}
                className="flex-1 py-3 rounded-xl border font-bold text-sm text-gray-500" style={{ borderColor: '#e9d5ff' }}>
                Cancel
              </button>
              <button onClick={addCustomAddon} disabled={!customName.trim() || !customPrice}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40"
                style={{ backgroundColor: purple }}>
                Add to Rate Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <button onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-base disabled:opacity-60"
        style={{ backgroundColor: darkPurple }}>
        {saving ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
          : saved ? <><CheckCircle className="w-5 h-5" /> Rate Card Saved!</>
          : <><Save className="w-5 h-5" /> Save Rate Card</>}
      </button>
    </div>
  )
}

function RCSection({ label, hint, children }) {
  return (
    <div>
      <p className="text-sm font-black mb-0.5" style={{ color: darkPurple }}>{label}</p>
      <p className="text-xs text-gray-400 mb-3">{hint}</p>
      {children}
    </div>
  )
}

// ── Payout Settings Tab ───────────────────────────────────────────────────────

const NIGERIAN_BANKS_LIST = [
  'Access Bank', 'Citibank', 'Ecobank', 'Fidelity Bank', 'First Bank',
  'First City Monument Bank (FCMB)', 'Globus Bank', 'GT Bank',
  'Heritage Bank', 'Keystone Bank', 'Kuda Bank', 'Moniepoint',
  'Opay', 'Palmpay', 'Polaris Bank', 'Providus Bank',
  'Stanbic IBTC Bank', 'Standard Chartered', 'Sterling Bank',
  'Suntrust Bank', 'Union Bank', 'United Bank for Africa (UBA)',
  'Unity Bank', 'VFD Microfinance Bank', 'Wema Bank', 'Zenith Bank',
]

const SECURITY_QUESTIONS_LIST = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your primary school?",
  "What city were you born in?",
  "What is your oldest sibling's middle name?",
  "What was the make of your first car?",
  "What is the name of the street you grew up on?",
  "What was your childhood nickname?",
]

function PayoutSettingsTab() {
  const [accounts, setAccounts] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [bankSearch, setBankSearch] = useState('')
  const [showBankPicker, setShowBankPicker] = useState(false)
  const [newBank, setNewBank] = useState('')
  const [newAccNum, setNewAccNum] = useState('')
  const [newAccName, setNewAccName] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  const [secQuestion, setSecQuestion] = useState(null)
  const [showSecModal, setShowSecModal] = useState(false)
  const [showQPicker, setShowQPicker] = useState(false)
  const [secStep, setSecStep] = useState('set')
  const [draftQuestion, setDraftQuestion] = useState('')
  const [draftAnswer, setDraftAnswer] = useState('')
  const [confirmAnswer, setConfirmAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [secError, setSecError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingAccounts(false); return }
      const { data } = await supabase.from('profiles').select('payout_accounts').eq('id', user.id).single()
      if (data?.payout_accounts) setAccounts(data.payout_accounts)
      setLoadingAccounts(false)
    })()
  }, [])

  async function persistAccounts(next) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ payout_accounts: next }).eq('id', user.id)
  }

  function resetForm() {
    setNewBank(''); setNewAccNum(''); setNewAccName(''); setVerified(false); setVerifying(false); setBankSearch('')
  }

  function handleAccNumChange(val) {
    const digits = val.replace(/\D/g, '').slice(0, 10)
    setNewAccNum(digits); setVerified(false); setNewAccName('')
    if (digits.length === 10 && newBank) simulateVerify(digits, newBank)
  }

  function handleSelectBank(bank) {
    setNewBank(bank); setShowBankPicker(false); setBankSearch('')
    setVerified(false); setNewAccName('')
    if (newAccNum.length === 10) simulateVerify(newAccNum, bank)
  }

  function simulateVerify(accNum, bank) {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false); setVerified(true)
      setNewAccName(accounts.length === 0 ? '' : accounts[0].accountName)
    }, 1200)
  }

  async function handleSaveAccount() {
    if (!verified || saving) return
    setSaving(true)
    const isFirst = accounts.length === 0
    const next = [
      ...accounts.map(a => ({ ...a, isDefault: false })),
      { id: Date.now().toString(), bankName: newBank, accountNumber: newAccNum, accountName: newAccName || 'Account Holder', isDefault: isFirst },
    ]
    await persistAccounts(next)
    setAccounts(next)
    setSaving(false); setShowAddModal(false); resetForm()
  }

  async function setDefault(id) {
    const next = accounts.map(a => ({ ...a, isDefault: a.id === id }))
    setAccounts(next)
    await persistAccounts(next)
  }

  async function removeAccount(id) {
    const next = accounts.filter(a => a.id !== id)
    if (next.length > 0 && !next.some(a => a.isDefault)) next[0].isDefault = true
    setAccounts(next)
    await persistAccounts(next)
    setDeleteTarget(null)
  }

  function openSecModal() {
    setDraftQuestion(secQuestion ?? ''); setDraftAnswer(''); setConfirmAnswer('')
    setSecError(''); setShowAnswer(false); setSecStep('set'); setShowSecModal(true)
  }

  function handleSecNext() {
    if (!draftQuestion) { setSecError('Please select a question'); return }
    if (draftAnswer.trim().length < 2) { setSecError('Answer is too short'); return }
    setSecError(''); setSecStep('confirm')
  }

  function handleSecSave() {
    if (confirmAnswer.trim().toLowerCase() !== draftAnswer.trim().toLowerCase()) {
      setSecError("Answers don't match. Try again."); setConfirmAnswer(''); return
    }
    setSecQuestion(draftQuestion); setShowSecModal(false)
  }

  const filteredBanks = NIGERIAN_BANKS_LIST.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()))
  const canSave = verified && !saving

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl p-4" style={{ backgroundColor: `${darkPurple}10`, border: `1px solid ${purple}30` }}>
        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: darkPurple }} />
        <p className="text-sm text-brand-dark/70">Your bank details are encrypted and never shared with brands. Withdrawals are processed within 1–3 business days.</p>
      </div>

      {/* Linked accounts */}
      <div>
        <p className="font-black text-brand-dark mb-3">Linked accounts</p>
        {loadingAccounts ? (
          <div className="flex items-center gap-2 py-6 text-brand-dark/30 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ border: '1.5px dashed #e9d5ff' }}>
            <CreditCard className="w-10 h-10 mx-auto mb-3 text-brand-dark/20" />
            <p className="font-bold text-brand-dark text-sm mb-1">No bank account linked</p>
            <p className="text-brand-dark/40 text-xs">Add a bank account to receive your payouts</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #e9d5ff' }}>
            {accounts.map((acc, i) => (
              <div key={acc.id} className="flex items-center gap-4 p-4"
                style={{ borderBottom: i < accounts.length - 1 ? '1px solid #f3eeff' : 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${darkPurple}12` }}>
                  <Building2 className="w-5 h-5" style={{ color: darkPurple }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-brand-dark text-sm">{acc.bankName}</span>
                    {acc.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#22c55e18', color: '#22c55e' }}>Default</span>
                    )}
                  </div>
                  <p className="text-brand-dark/40 text-xs tracking-widest">•••• •••• {acc.accountNumber.slice(-4)}</p>
                  <p className="text-brand-dark/60 text-xs font-medium mt-0.5">{acc.accountName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!acc.isDefault && (
                    <button onClick={() => setDefault(acc.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-purple-50"
                      style={{ color: darkPurple }}>
                      Set default
                    </button>
                  )}
                  <button onClick={() => setDeleteTarget(acc.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => { resetForm(); setShowAddModal(true) }}
          className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-colors hover:bg-purple-50"
          style={{ border: '1.5px dashed #c084fc', color: darkPurple }}>
          <Plus className="w-4 h-4" /> Add bank account
        </button>
      </div>

      {/* Withdrawal security */}
      <div>
        <p className="font-black text-brand-dark mb-3">Withdrawal security</p>
        {secQuestion ? (
          <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #10b98130' }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#10b98118' }}>
                <ShieldCheck className="w-5 h-5" style={{ color: '#10b981' }} />
              </div>
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: '#10b981' }}>Security question set</p>
                <p className="text-sm text-brand-dark/70">{secQuestion}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={openSecModal}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-purple-50"
                style={{ border: `1px solid ${purple}40`, color: darkPurple }}>
                <Edit3 className="w-3.5 h-3.5" /> Change
              </button>
              <button onClick={() => setSecQuestion(null)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                style={{ border: '1px solid #ef444430' }}>
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <button onClick={openSecModal}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-left hover:bg-purple-50 transition-colors"
            style={{ border: '1.5px dashed #e9d5ff' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${darkPurple}10` }}>
              <Lock className="w-5 h-5" style={{ color: darkPurple }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-brand-dark text-sm">Set a security question</p>
              <p className="text-brand-dark/40 text-xs mt-0.5">Required to authorise every withdrawal</p>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-dark/30" />
          </button>
        )}
      </div>

      {/* Payout info */}
      <div>
        <p className="font-black text-brand-dark mb-3">Payout info</p>
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #e9d5ff' }}>
          {[
            { icon: Clock,    label: 'Processing time',    value: '1–3 business days' },
            { icon: Wallet,   label: 'Minimum withdrawal', value: '₦5,000' },
            { icon: Mail,     label: 'Support',            value: 'support@brandior.africa' },
          ].map(({ icon: Icon, label, value }, i, arr) => (
            <div key={label} className="flex items-center gap-3 px-5 py-3.5"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid #f3eeff' : 'none' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${darkPurple}10` }}>
                <Icon className="w-4 h-4" style={{ color: darkPurple }} />
              </div>
              <span className="flex-1 text-sm text-brand-dark/60 font-medium">{label}</span>
              <span className="text-sm font-bold text-brand-dark">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" style={{ border: '1px solid #e9d5ff' }}>
            <p className="font-black text-brand-dark text-base mb-2">Remove account?</p>
            <p className="text-brand-dark/50 text-sm mb-5">This bank account will be removed from your payout settings.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-brand-dark/60 border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => removeAccount(deleteTarget)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: '#ef4444' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Account Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e9d5ff' }}>
              <p className="font-black text-brand-dark">Add bank account</p>
              <button onClick={() => { setShowAddModal(false); resetForm() }} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-brand-dark/40" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Bank select */}
              <div>
                <label className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Bank *</label>
                <button onClick={() => setShowBankPicker(true)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm outline-none text-left"
                  style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                  <span className={newBank ? 'text-brand-dark font-semibold' : 'text-brand-dark/40'}>{newBank || 'Select your bank'}</span>
                  <ChevronDown className="w-4 h-4 text-brand-dark/40" />
                </button>
              </div>
              {/* Account number */}
              <div>
                <label className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Account Number *</label>
                <div className="flex items-center px-4 rounded-xl" style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                  <input
                    type="text" inputMode="numeric" maxLength={10}
                    value={newAccNum}
                    onChange={e => handleAccNumChange(e.target.value)}
                    placeholder="10-digit account number"
                    className="flex-1 py-3 text-sm text-brand-dark bg-transparent outline-none font-mono tracking-widest"
                  />
                  {verifying && <Loader2 className="w-4 h-4 animate-spin text-brand-dark/30" />}
                  {verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                {verified && (
                  <div className="flex items-center gap-2 mt-2 p-3 rounded-xl" style={{ backgroundColor: '#22c55e12', border: '1px solid #22c55e30' }}>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-bold text-green-600">{newAccName}</span>
                  </div>
                )}
              </div>
              {/* Account name (editable if verify didn't auto-fill) */}
              {verified && !newAccName && (
                <div>
                  <label className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Account Name *</label>
                  <input
                    type="text" value={newAccName}
                    onChange={e => setNewAccName(e.target.value)}
                    placeholder="Name on account"
                    className="w-full px-4 py-3 rounded-xl text-sm text-brand-dark outline-none"
                    style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}
                  />
                </div>
              )}
              <button onClick={handleSaveAccount} disabled={!canSave}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                style={{ backgroundColor: darkPurple }}>
                {saving ? 'Saving…' : 'Save account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bank Picker Sheet ── */}
      {showBankPicker && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff', maxHeight: '80vh' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e9d5ff' }}>
              <p className="font-black text-brand-dark">Select bank</p>
              <button onClick={() => setShowBankPicker(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-brand-dark/40" />
              </button>
            </div>
            <div className="px-6 py-3" style={{ borderBottom: '1px solid #e9d5ff' }}>
              <div className="flex items-center gap-2 px-3 rounded-xl" style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                <Hash className="w-4 h-4 text-brand-dark/30" />
                <input type="text" placeholder="Search banks…" value={bankSearch} onChange={e => setBankSearch(e.target.value)}
                  autoFocus className="flex-1 py-2.5 text-sm text-brand-dark bg-transparent outline-none" />
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
              {filteredBanks.map((bank, i) => (
                <button key={bank} onClick={() => handleSelectBank(bank)}
                  className="w-full flex items-center justify-between px-6 py-3.5 text-sm hover:bg-purple-50 transition-colors text-left"
                  style={{ borderBottom: i < filteredBanks.length - 1 ? '1px solid #f3eeff' : 'none' }}>
                  <span className={`font-medium ${newBank === bank ? 'font-bold' : ''}`} style={{ color: newBank === bank ? darkPurple : '#374151' }}>{bank}</span>
                  {newBank === bank && <CheckCircle className="w-4 h-4" style={{ color: darkPurple }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Security Question Modal ── */}
      {showSecModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e9d5ff' }}>
              <p className="font-black text-brand-dark">
                {secStep === 'set' ? (secQuestion ? 'Change security question' : 'Set security question') : 'Confirm your answer'}
              </p>
              <button onClick={() => setShowSecModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-brand-dark/40" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {secStep === 'set' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Choose a question *</label>
                    <button onClick={() => setShowQPicker(true)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm outline-none text-left"
                      style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                      <span className={draftQuestion ? 'text-brand-dark font-medium text-xs' : 'text-brand-dark/40'}>{draftQuestion || 'Select a security question'}</span>
                      <ChevronDown className="w-4 h-4 text-brand-dark/40 flex-shrink-0" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Your answer *</label>
                    <div className="flex items-center px-4 rounded-xl" style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                      <input type={showAnswer ? 'text' : 'password'} value={draftAnswer}
                        onChange={e => { setDraftAnswer(e.target.value); setSecError('') }}
                        placeholder="Enter your answer" autoComplete="off"
                        className="flex-1 py-3 text-sm text-brand-dark bg-transparent outline-none" />
                      <button onClick={() => setShowAnswer(v => !v)} className="p-1">
                        {showAnswer ? <EyeOff className="w-4 h-4 text-brand-dark/30" /> : <Eye className="w-4 h-4 text-brand-dark/30" />}
                      </button>
                    </div>
                  </div>
                  {secError && <p className="text-xs text-red-500 font-medium">{secError}</p>}
                  <p className="text-xs text-brand-dark/40">Remember this exactly — you'll need it to authorise withdrawals. Not case-sensitive.</p>
                  <button onClick={handleSecNext} disabled={!draftQuestion || draftAnswer.length < 2}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                    style={{ backgroundColor: darkPurple }}>
                    Next →
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: `${darkPurple}08`, border: `1px solid ${purple}25` }}>
                    <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: darkPurple }} />
                    <p className="text-xs text-brand-dark/70 font-medium">{draftQuestion}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest mb-1.5 block">Re-enter your answer *</label>
                    <div className="flex items-center px-4 rounded-xl" style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                      <input type={showAnswer ? 'text' : 'password'} value={confirmAnswer}
                        onChange={e => { setConfirmAnswer(e.target.value); setSecError('') }}
                        placeholder="Re-enter your answer" autoFocus autoComplete="off"
                        className="flex-1 py-3 text-sm text-brand-dark bg-transparent outline-none" />
                      <button onClick={() => setShowAnswer(v => !v)} className="p-1">
                        {showAnswer ? <EyeOff className="w-4 h-4 text-brand-dark/30" /> : <Eye className="w-4 h-4 text-brand-dark/30" />}
                      </button>
                    </div>
                  </div>
                  {secError && <p className="text-xs text-red-500 font-medium">{secError}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => { setSecStep('set'); setSecError('') }}
                      className="px-5 py-3 rounded-xl text-sm font-semibold text-brand-dark/50 border border-gray-200 hover:bg-gray-50 transition-colors">
                      ← Back
                    </button>
                    <button onClick={handleSecSave} disabled={confirmAnswer.length < 2}
                      className="flex-1 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                      style={{ backgroundColor: darkPurple }}>
                      Save question
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Question Picker Sheet ── */}
      {showQPicker && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff', maxHeight: '75vh' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e9d5ff' }}>
              <p className="font-black text-brand-dark">Choose a question</p>
              <button onClick={() => setShowQPicker(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-brand-dark/40" />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {SECURITY_QUESTIONS_LIST.map((q, i) => (
                <button key={q} onClick={() => { setDraftQuestion(q); setShowQPicker(false); setSecError('') }}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-purple-50 transition-colors"
                  style={{ borderBottom: i < SECURITY_QUESTIONS_LIST.length - 1 ? '1px solid #f3eeff' : 'none' }}>
                  <span className="text-sm font-medium text-brand-dark pr-4">{q}</span>
                  {draftQuestion === q && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: darkPurple }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
