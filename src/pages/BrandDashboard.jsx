import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { logout } from '../lib/logout'
import {
  LayoutDashboard, ShoppingBag, CheckCircle, Wallet, Settings,
  Bell, ChevronDown, ChevronRight, X, AlertCircle, Shield, Loader2,
  ExternalLink, Download, RotateCcw, Zap, Menu, Mail, Heart, MapPin, Star, Users, Search, UserPlus, LogOut,
} from 'lucide-react'
import MessagingPanel from '../components/MessagingPanel'
import InviteTab from '../components/InviteTab'
import { useFavorites } from '../hooks/useFavorites'

const API = 'http://localhost:3001/api'
const BRAND_ID = 'brand_demo'

const pink = '#FF6B9D'
const darkPurple = '#4c1d95'
const purple = '#7c3aed'

function formatNGN(n) {
  return '₦' + Number(n || 0).toLocaleString('en')
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days > 6) return new Date(dateStr).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}

const STATUS_CONFIG = {
  pending: { label: 'Pending Payment', bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  in_progress: { label: 'In Progress', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  delivered: { label: 'Delivered', bg: '#dcfce7', color: '#166534', border: '#86efac' },
  revision_requested: { label: 'Revision Pending', bg: '#ffedd5', color: '#9a3412', border: '#fdba74' },
  completed: { label: 'Completed', bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  cancelled: { label: 'Cancelled', bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  )
}

// Mock orders for offline mode
function generateMockOrders() {
  const statuses = ['pending', 'in_progress', 'delivered', 'revision_requested', 'completed', 'completed']
  return Array.from({ length: 8 }, (_, i) => ({
    _id: `order_${i + 1}`,
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - i * 2.5 * 86400000).toISOString(),
    packagePrice: [75000, 150000, 120000, 350000, 75000, 150000, 75000, 120000][i],
    platformFee: [7500, 15000, 12000, 35000, 7500, 15000, 7500, 12000][i],
    total: [82500, 165000, 132000, 385000, 82500, 165000, 82500, 132000][i],
    talent: {
      name: ['Adaeze Okafor', 'Chidi Nwosu', 'Fatimah Abdullahi', 'Emeka Eze', 'Ngozi Obi', 'Tunde Bakare', 'Amaka Igwe', 'Femi Adeyemi'][i],
      handle: ['adaeze_glam', 'chidi_tech', 'fatimah_style', 'emeka_eats', 'ngozi_fit', 'tunde_comedy', 'amaka_luxe', 'femi_finance'][i],
      avatar: null,
    },
    package: {
      name: ['Story Feature', 'Reel Campaign', 'TikTok Viral Push', 'Full Brand Deal', 'Story Feature', 'Reel Campaign', 'Story Feature', 'TikTok Viral Push'][i],
      platform: ['Instagram', 'Instagram', 'TikTok', 'Instagram', 'Instagram', 'Instagram', 'Instagram', 'TikTok'][i],
    },
    brief: {
      productName: ['GlowUp Serum', 'Tecno Phone X3', 'Ada Collections', 'Naija Bites', 'FitNaija App', 'Punchline Comedy Show', 'Luxe Bags', 'WealthUp Finance'][i],
      brandName: ['GlowUp Cosmetics', 'Tecno Mobile', 'Ada Collections', 'Naija Bites', 'FitNaija', 'Punchline Comedy', 'Luxe Brand', 'WealthUp'][i],
    },
    deliveredFiles: i === 2 || i === 4 || i === 5 ? [
      { name: 'content_v1.mp4', url: '#' },
      { name: 'caption.txt', url: '#' },
    ] : [],
  }))
}

// Payment modal
function PaymentModal({ order, onClose, onSuccess }) {
  const [step, setStep] = useState('confirm') // confirm → processing → success

  const handlePay = async () => {
    setStep('processing')
    // Simulate Paystack redirect + return
    await new Promise(r => setTimeout(r, 2000))
    try {
      await fetch(`${API}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id, brandId: BRAND_ID }),
      })
    } catch { /* ignore */ }
    setStep('success')
    setTimeout(() => {
      onSuccess(order._id)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
        {step === 'confirm' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
              <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Package</span>
                <span className="font-medium text-gray-800">{order.package?.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Talent</span>
                <span className="font-medium text-gray-800">{order.talent?.name}</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-extrabold" style={{ color: pink }}>{formatNGN(order.total)}</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Your payment will be held in escrow until you approve the delivered content.</p>
            </div>
            <button
              onClick={handlePay}
              className="w-full py-3.5 rounded-full text-white font-bold transition-colors"
              style={{ backgroundColor: darkPurple }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3b0764'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = darkPurple}
            >
              Pay {formatNGN(order.total)} via Paystack
            </button>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f3e8ff' }}>
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: purple }} />
            </div>
            <p className="font-bold text-gray-900 mb-1">Redirecting to Paystack...</p>
            <p className="text-sm text-gray-500">Please wait while we process your payment</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-bold text-gray-900 mb-1">Payment Successful!</p>
            <p className="text-sm text-gray-500">Funds held in escrow. The talent has been notified.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Revision modal
function RevisionModal({ order, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setSubmitting(true)
    await onSubmit(order._id, reason)
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Request Revision</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Describe what you'd like the talent to change or improve.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={5}
          placeholder="e.g. Please adjust the lighting, change the caption to mention our promo code..."
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 resize-none mb-5"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-full text-sm font-semibold border border-gray-200 text-gray-700">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className="flex-1 py-3 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: submitting || !reason.trim() ? '#9ca3af' : '#ea580c' }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Submit Revision
          </button>
        </div>
      </div>
    </div>
  )
}

// Individual order card
function OrderCard({ order, onPayNow, onApprove, onRevision }) {
  const [expanded, setExpanded] = useState(false)

  const PLATFORM_COLORS = {
    Instagram: '#E1306C', TikTok: '#010101', YouTube: '#FF0000', Twitter: '#1DA1F2', Facebook: '#1877F2',
  }
  const platformColor = PLATFORM_COLORS[order.package?.platform] || '#6b7280'

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Main row */}
      <div className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          {/* Talent */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img
              src={order.talent?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.talent?.name || 'C')}&background=7c3aed&color=fff&size=40`}
              alt={order.talent?.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=C&background=7c3aed&color=fff&size=40` }}
            />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{order.talent?.name}</p>
              <p className="text-xs text-gray-400">@{order.talent?.handle}</p>
            </div>
          </div>

          {/* Package + status */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-800">{order.package?.name}</span>
              {order.package?.platform && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: platformColor }}>
                  {order.package.platform}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-1.5">{order.brief?.productName} · {timeAgo(order.createdAt)}</p>
            <StatusBadge status={order.status} />
          </div>

          {/* Price + actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <p className="font-bold text-gray-900">{formatNGN(order.total)}</p>
            <OrderActions order={order} onPayNow={onPayNow} onApprove={onApprove} onRevision={onRevision} />
          </div>

          {/* Expand */}
          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-700">
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Brief Summary</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Brand:</span> {order.brief?.brandName}</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Product:</span> {order.brief?.productName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Payment</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Package:</span> {formatNGN(order.packagePrice)}</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Platform fee:</span> {formatNGN(order.platformFee)}</p>
              <p className="text-sm font-bold text-gray-900"><span className="font-medium">Total:</span> {formatNGN(order.total)}</p>
            </div>
          </div>

          {/* Delivered files */}
          {order.deliveredFiles && order.deliveredFiles.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivered Files</p>
              <div className="flex flex-wrap gap-2">
                {order.deliveredFiles.map(f => (
                  <a
                    key={f.name}
                    href={f.url}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    download
                  >
                    <Download className="w-3.5 h-3.5" />
                    {f.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function OrderActions({ order, onPayNow, onApprove, onRevision }) {
  if (order.status === 'pending') {
    return (
      <button
        onClick={() => onPayNow(order)}
        className="px-4 py-2 rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: '#eab308' }}
      >
        Pay Now
      </button>
    )
  }
  if (order.status === 'in_progress') {
    return (
      <span className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">
        In Progress
      </span>
    )
  }
  if (order.status === 'delivered') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(order._id)}
          className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          Approve ✓
        </button>
        <button
          onClick={() => onRevision(order)}
          className="px-3 py-1.5 rounded-full text-xs font-bold border-2 border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors"
        >
          Request Revision
        </button>
      </div>
    )
  }
  if (order.status === 'revision_requested') {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#ffedd5', color: '#9a3412' }}>
        Revision Pending
      </span>
    )
  }
  if (order.status === 'completed') {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Completed ✓
      </span>
    )
  }
  return null
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-white text-sm font-medium max-w-sm"
      style={{ backgroundColor: type === 'success' ? '#16a34a' : '#dc2626' }}
    >
      {type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span>{message}</span>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
          <Icon className="w-4.5 h-4.5" style={{ color, width: '18px', height: '18px' }} />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { id: 'active',     label: 'Active Campaigns', icon: ShoppingBag },
  { id: 'completed',  label: 'Completed',     icon: CheckCircle },
  { id: 'favorites',  label: 'Saved Talents', icon: Heart },
  { id: 'messages',   label: 'Messages',      icon: Mail },
  { id: 'payments',   label: 'Payments',      icon: Wallet },
  { id: 'invite',     label: 'Invite Creators', icon: UserPlus },
  { id: 'settings',   label: 'Settings',      icon: Settings },
]

const MOCK_TALENTS = [
  { id: 1, name: 'Adaeze Okafor',   handle: '@adaeze_glam',   initials: 'AO', location: 'Lagos',          niche: 'Beauty & Skincare',    followers: '125K', engagement: '4.2%', rating: 4.8, tier: 'top-rated',   accent: '#FF6B9D', platforms: ['Instagram','TikTok'],            minPrice: 25000  },
  { id: 2, name: 'Chidi Nwosu',     handle: '@chidi_tech',    initials: 'CN', location: 'Accra, Ghana',   niche: 'Tech & Gadgets',       followers: '45K',  engagement: '5.1%', rating: 4.5, tier: 'next-rated',  accent: '#a78bfa', platforms: ['YouTube','Twitter/X'],           minPrice: 15000  },
  { id: 3, name: 'Fatimah Abdullahi',handle: '@fatimah_style', initials: 'FA', location: 'Nairobi, Kenya', niche: 'Fashion & Style',      followers: '280K', engagement: '3.8%', rating: 4.9, tier: 'top-rated',   accent: '#D4AF37', platforms: ['Instagram','TikTok','YouTube'],   minPrice: 75000  },
  { id: 4, name: 'Emeka Eze',       handle: '@emeka_eats',    initials: 'EE', location: 'Abuja',          niche: 'Food & Cooking',       followers: '62K',  engagement: '6.3%', rating: 4.3, tier: 'next-rated',  accent: '#22c55e', platforms: ['TikTok','Instagram'],            minPrice: 18000  },
  { id: 5, name: 'Ngozi Obi',       handle: '@ngozi_fit',     initials: 'NO', location: 'Nairobi, Kenya', niche: 'Fitness & Wellness',   followers: '189K', engagement: '4.9%', rating: 4.7, tier: 'top-rated',   accent: '#FF6B9D', platforms: ['Instagram','YouTube'],           minPrice: 45000  },
  { id: 6, name: 'Tunde Bakare',    handle: '@tunde_comedy',  initials: 'TB', location: 'Kumasi, Ghana',  niche: 'Comedy',               followers: '310K', engagement: '5.5%', rating: 4.6, tier: 'next-rated',  accent: '#f59e0b', platforms: ['TikTok','YouTube','Facebook'],    minPrice: 100000 },
  { id: 7, name: 'Amaka Igwe',      handle: '@amaka_luxe',    initials: 'AI', location: 'Lagos',          niche: 'Fashion & Style',      followers: '95K',  engagement: '3.2%', rating: 5.0, tier: 'top-rated',   accent: '#D4AF37', platforms: ['Instagram','Snapchat'],          minPrice: 55000  },
  { id: 8, name: 'Femi Adeyemi',    handle: '@femi_finance',  initials: 'FA', location: 'Accra, Ghana',   niche: 'Finance & Business',   followers: '28K',  engagement: '7.1%', rating: 4.1, tier: 'fast-rising', accent: '#3b82f6', platforms: ['LinkedIn','Twitter/X'],          minPrice: 10000  },
]

const TIER_INFO = {
  'fast-rising': { label: 'Fast Rising', color: '#22c55e' },
  'next-rated':  { label: 'Next',        color: '#a78bfa', diamond: true },
  'top-rated':   { label: 'Top',         color: '#D4AF37', diamond: true },
}

function FindTalentsTab() {
  const [search, setSearch] = useState('')
  const [nicheFilter, setNicheFilter] = useState('All')
  const niches = ['All', 'Beauty & Skincare', 'Fashion & Style', 'Food & Cooking', 'Tech & Gadgets', 'Fitness & Wellness', 'Comedy', 'Finance & Business']

  const filtered = MOCK_TALENTS.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.handle.toLowerCase().includes(search.toLowerCase())) return false
    if (nicheFilter !== 'All' && t.niche !== nicheFilter) return false
    return true
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1a0035 0%, #3d0080 100%)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>Talent Marketplace</p>
        <h2 className="text-xl font-black text-white mb-1">Find Your Next Creator</h2>
        <p className="text-white/50 text-sm">Browse verified African creators ready to bring your brand campaigns to life.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or handle…"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          style={{ border: '1px solid #e9d5ff', backgroundColor: '#faf5ff' }}
        />
      </div>

      {/* Niche pills */}
      <div className="flex gap-2 flex-wrap">
        {niches.map(n => (
          <button key={n} onClick={() => setNicheFilter(n)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={nicheFilter === n
              ? { backgroundColor: darkPurple, color: 'white' }
              : { backgroundColor: '#f3eeff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
            {n}
          </button>
        ))}
      </div>

      {/* Talent cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(t => {
          const tier = TIER_INFO[t.tier]
          return (
            <Link key={t.id} to={`/creators/${t.handle || t.id}`}
              className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 8px rgba(192,132,252,0.07)' }}>
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: t.accent }}>
                {t.initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-bold text-brand-dark text-sm truncate">{t.name}</p>
                  {/* Tier badge */}
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: tier.color, backgroundColor: `${tier.color}18`, border: `1px solid ${tier.color}40` }}>
                    {tier.label}
                    {tier.diamond && <svg width="7" height="7" viewBox="0 0 24 24" fill={tier.color}><path d="M12 2L2 9l10 13L22 9z"/></svg>}
                  </span>
                </div>
                <p className="text-brand-dark/40 text-xs mb-1">{t.handle} · {t.location}</p>
                <p className="text-xs text-brand-dark/50 mb-2">{t.niche}</p>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-0.5 text-brand-dark/60"><Users className="w-3 h-3" />{t.followers}</span>
                  <span className="flex items-center gap-0.5" style={{ color: t.accent }}><Star className="w-3 h-3 fill-current" />{t.rating}</span>
                  <span className="font-semibold ml-auto" style={{ color: darkPurple }}>from ₦{t.minPrice.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="text-center pt-2">
        <Link to="/marketplace" className="text-sm font-semibold hover:underline" style={{ color: '#7c3aed' }}>
          Browse all talents in Marketplace →
        </Link>
      </div>
    </div>
  )
}

export default function BrandDashboard() {
  const [searchParams] = useSearchParams()
  const newOrderId = searchParams.get('newOrder')
  const initialTab = searchParams.get('tab')
  const initialConvId = searchParams.get('conv')

  const [activeTab, setActiveTab] = useState(initialTab || 'overview')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [paymentModal, setPaymentModal] = useState(null) // order object
  const [revisionModal, setRevisionModal] = useState(null)

  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/orders?brandId=${BRAND_ID}`)
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : data.orders || [])
    } catch {
      setOrders(generateMockOrders())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  useEffect(() => {
    if (newOrderId && !loading) {
      showToast('Order placed successfully! Complete payment to get started.', 'success')
      setActiveTab('active')
    }
  }, [newOrderId, loading])

  // Actions
  const handlePaySuccess = (orderId) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'in_progress' } : o))
    showToast('Payment successful! Funds held in escrow.')
  }

  const handleApprove = async (orderId) => {
    try {
      await fetch(`${API}/orders/${orderId}/approve`, { method: 'POST' })
    } catch { /* ignore */ }
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'completed' } : o))
    showToast('Order approved! Payment released to talent.')
  }

  const handleRevision = async (orderId, reason) => {
    try {
      await fetch(`${API}/orders/${orderId}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
    } catch { /* ignore */ }
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'revision_requested' } : o))
    showToast('Revision request sent to talent.')
  }

  // Derived stats
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status))
  const pendingReview = orders.filter(o => o.status === 'delivered')
  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <>
        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col w-60 flex-shrink-0 min-h-screen sticky top-0"
          style={{ backgroundColor: darkPurple }}
        >
          <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="bg-black/40 flex-1" onClick={() => setSidebarOpen(false)} />
            <aside className="w-60 flex flex-col" style={{ backgroundColor: darkPurple }}>
              <SidebarContent activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false) }} />
            </aside>
          </div>
        )}
      </>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">Brand Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/marketplace"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Browse Talents
              </Link>
              <button onClick={() => setActiveTab('messages')} className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-500" />
                {pendingReview.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              <BrandAvatarMenu />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-3 border-purple-200 border-t-purple-600 animate-spin" style={{ borderWidth: '3px' }} />
            </div>
          ) : (
            <>
              {activeTab === 'talents' && <FindTalentsTab />}
              {activeTab === 'overview' && (
                <OverviewTab
                  activeOrders={activeOrders}
                  pendingReview={pendingReview}
                  completedOrders={completedOrders}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'active' && (
                <OrdersTab
                  title="Active Campaigns"
                  orders={activeOrders}
                  emptyMsg="No active orders. Browse talents to get started!"
                  onPayNow={setPaymentModal}
                  onApprove={handleApprove}
                  onRevision={setRevisionModal}
                />
              )}
              {activeTab === 'completed' && (
                <OrdersTab
                  title="Completed Orders"
                  orders={completedOrders}
                  emptyMsg="No completed orders yet."
                  onPayNow={setPaymentModal}
                  onApprove={handleApprove}
                  onRevision={setRevisionModal}
                />
              )}
              {activeTab === 'payments' && (
                <PaymentsTab orders={orders} totalSpent={totalSpent} onPayNow={setPaymentModal} onApprove={handleApprove} onRevision={setRevisionModal} />
              )}
              {activeTab === 'favorites' && <FavoritesTab />}
              {activeTab === 'messages' && (
                <MessagingPanel userId="brand_demo" userType="brand" initialConvId={initialConvId} />
              )}
              {activeTab === 'invite' && <InviteTab userType="brand" />}
              {activeTab === 'settings' && (
                <SettingsTab />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      {paymentModal && (
        <PaymentModal
          order={paymentModal}
          onClose={() => setPaymentModal(null)}
          onSuccess={handlePaySuccess}
        />
      )}
      {revisionModal && (
        <RevisionModal
          order={revisionModal}
          onClose={() => setRevisionModal(null)}
          onSubmit={handleRevision}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

function BrandAvatarMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="relative focus:outline-none">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: darkPurple }}>
          B
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-white" title="Online" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-44 rounded-2xl shadow-xl overflow-hidden z-50"
          style={{ backgroundColor: '#1e0a3c', border: '1px solid rgba(196,181,253,0.15)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(196,181,253,0.1)' }}>
            <p className="text-white text-sm font-semibold">Brand Account</p>
            <p className="text-white/35 text-xs">brand@brandiór.co</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium w-full transition-colors text-left"
            style={{ color: '#c4b5fd' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(196,181,253,0.08)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      )}
    </div>
  )
}

function SidebarContent({ activeTab, setActiveTab }) {
  return (
    <>
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Brandiór</span>
        </Link>
        <div className="mt-2 ml-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.35)' }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-violet-400" />
            Brand Account
          </span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
            style={
              activeTab === id
                ? { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }
                : { color: 'rgba(255,255,255,0.6)' }
            }
            onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)' }}
            onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.backgroundColor = '' }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {id === 'messages' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: pink }}>1</span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link to="/marketplace" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <ExternalLink className="w-4 h-4" />
          Browse Talents
        </Link>
      </div>
    </>
  )
}

const FEATURED_CREATORS = [
  { id: 'talent_001', name: 'Adaeze Okafor', handle: '@adaeze.creates', niche: 'Beauty & Skincare', avatar: 'https://i.pravatar.cc/150?u=adaeze_okafor', rating: 4.8, followers: '82K', tier: 'top-rated', from: 45000 },
  { id: 'talent_003', name: 'Chiamaka Eze',  handle: '@chiamaka.tv',    niche: 'Food & Cooking',    avatar: 'https://i.pravatar.cc/150?u=chiamaka_eze',  rating: 4.6, followers: '61K', tier: 'next-rated', from: 30000 },
  { id: 'talent_005', name: 'Tunde Bakare',  handle: '@tundebakare',    niche: 'Tech & Gadgets',    avatar: 'https://i.pravatar.cc/150?u=tunde_bakare',  rating: 4.9, followers: '120K', tier: 'top-rated', from: 75000 },
  { id: 'talent_002', name: 'Emeka Obi',     handle: '@emeka.fitness',  niche: 'Fitness & Wellness',avatar: 'https://i.pravatar.cc/150?u=emeka_obi',     rating: 4.5, followers: '34K', tier: 'next-rated', from: 20000 },
  { id: 'talent_004', name: 'Ngozi Nnaji',   handle: '@ngozi.style',    niche: 'Fashion & Style',   avatar: 'https://i.pravatar.cc/150?u=ngozi_nnaji',   rating: 4.7, followers: '55K', tier: 'top-rated', from: 38000 },
  { id: 'talent_006', name: 'Sola Adesanya', handle: '@solacomedy',     niche: 'Comedy',             avatar: 'https://i.pravatar.cc/150?u=sola_adesanya', rating: 4.4, followers: '28K', tier: 'fast-rising', from: 15000 },
]

const TIER_STYLE = {
  'top-rated':   { label: 'Top Rated',   bg: '#D4AF3718', color: '#D4AF37', border: '#D4AF3740' },
  'next-rated':  { label: 'Next Rated',  bg: '#3b82f618', color: '#3b82f6', border: '#3b82f640' },
  'fast-rising': { label: 'Fast Rising', bg: '#22c55e18', color: '#22c55e', border: '#22c55e40' },
}

function TalentMiniCard({ talent }) {
  const tier = TIER_STYLE[talent.tier] || TIER_STYLE['fast-rising']
  const { toggle, isFav } = useFavorites()
  const faved = isFav(talent.id)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <img src={talent.avatar} alt={talent.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name)}&background=4c1d95&color=fff&size=48` }} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{talent.name}</p>
          <p className="text-xs text-gray-400 truncate">{talent.handle}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => toggle(talent)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: faved ? '#fff0f5' : '#f9f9f9' }}
            title={faved ? 'Remove from saved' : 'Save talent'}
          >
            <Heart className="w-3.5 h-3.5" fill={faved ? pink : 'none'}
              style={{ color: faved ? pink : '#d1d5db' }} />
          </button>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
            {tier.label}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="truncate">{talent.niche}</span>
        <span className="font-semibold text-gray-700 flex-shrink-0 ml-2">{talent.followers}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(i => (
            <svg key={i} className="w-3 h-3" fill={i <= Math.round(talent.rating) ? '#D4AF37' : '#e5e7eb'} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-1 text-xs font-semibold text-gray-600">{talent.rating}</span>
        </div>
        <span className="text-xs font-bold" style={{ color: pink }}>From ₦{talent.from.toLocaleString('en')}</span>
      </div>
      <Link to={`/creators/${talent.handle || talent.id}`}
        className="w-full text-center text-xs font-semibold py-2 rounded-xl text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: darkPurple }}>
        View Profile
      </Link>
    </div>
  )
}

function OverviewTab({ activeOrders, pendingReview, completedOrders, setActiveTab }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Overview</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active Campaigns" value={activeOrders.length} icon={ShoppingBag} color={purple} />
        <StatCard label="Pending Review" value={pendingReview.length} icon={RotateCcw} color="#f59e0b" />
        <StatCard label="Completed" value={completedOrders.length} icon={CheckCircle} color="#16a34a" />
      </div>

      {/* Featured Talents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Featured Talents</h3>
          <Link to="/marketplace" className="text-sm font-medium flex items-center gap-1" style={{ color: purple }}>
            Browse all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_CREATORS.map(c => <TalentMiniCard key={c.id} talent={c} />)}
        </div>
      </div>
    </div>
  )
}

const ORDER_STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending Payment' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'revision_requested', label: 'Revision' },
]

function OrdersTab({ title, orders, emptyMsg, onPayNow, onApprove, onRevision }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = orders.filter(o => {
    const nameMatch = !search || (o.talent?.name || '').toLowerCase().includes(search.toLowerCase())
    const statusMatch = statusFilter === 'all' || o.status === statusFilter
    return nameMatch && statusMatch
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters bar */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by talent name…"
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            {ORDER_STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
                style={
                  statusFilter === f.value
                    ? { backgroundColor: darkPurple, color: 'white', borderColor: darkPurple }
                    : { backgroundColor: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f3e8ff' }}>
            <ShoppingBag className="w-7 h-7" style={{ color: purple }} />
          </div>
          <p className="text-gray-500 text-sm mb-5">{emptyMsg}</p>
          <Link to="/marketplace" className="px-6 py-2.5 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: darkPurple }}>
            Browse Talents
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm mb-3">No orders match your filters</p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all') }}
            className="text-sm font-semibold px-4 py-2 rounded-full"
            style={{ color: purple }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard key={order._id} order={order} onPayNow={onPayNow} onApprove={onApprove} onRevision={onRevision} />
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentsTab({ orders, totalSpent, onPayNow, onApprove, onRevision }) {
  const paidOrders = orders.filter(o => o.status !== 'pending' && o.status !== 'cancelled')
  const totalFees = paidOrders.reduce((sum, o) => sum + (o.platformFee || 0), 0)
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Payments</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-extrabold" style={{ color: pink }}>{formatNGN(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Platform Fees Paid</p>
          <p className="text-2xl font-extrabold text-gray-800">{formatNGN(totalFees)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Transactions</p>
          <p className="text-2xl font-extrabold text-gray-800">{paidOrders.length}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Talent</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Package</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Date</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={order.talent?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.talent?.name || 'C')}&background=4c1d95&color=fff&size=32`}
                          className="w-8 h-8 rounded-full" alt=""
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=C&background=4c1d95&color=fff&size=32` }}
                        />
                        <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{order.talent?.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{order.package?.name}</td>
                    <td className="px-3 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-3 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{formatNGN(order.total)}</td>
                    <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">{timeAgo(order.createdAt)}</td>
                    <td className="px-3 py-3">
                      <OrderActions order={order} onPayNow={onPayNow} onApprove={onApprove} onRevision={onRevision} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Payment History</h3>
        </div>
        {paidOrders.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">No payments yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Talent</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Package</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Platform Fee</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Escrow</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paidOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">{order.talent?.name}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{order.package?.name}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{formatNGN(order.total)}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{formatNGN(order.platformFee)}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status === 'completed' ? 'Released' : 'In Escrow'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">{timeAgo(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function FavoritesTab() {
  const { favorites, toggle, isFav } = useFavorites()

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#fff0f5' }}>
          <Heart className="w-7 h-7" style={{ color: pink }} />
        </div>
        <p className="font-bold text-gray-700 text-lg mb-2">No saved talents yet</p>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">
          Tap the heart on any talent profile or marketplace listing to save them here.
        </p>
        <Link to="/marketplace"
          className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: darkPurple }}>
          Browse Talents
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Saved Talents</h2>
        <span className="text-sm text-gray-400">{favorites.length} saved</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map(talent => {
          const faved = isFav(talent._id || talent.id)
          const tier = TIER_STYLE[talent.tier] || TIER_STYLE['fast-rising']
          return (
            <div key={talent._id || talent.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={talent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name || 'T')}&background=4c1d95&color=fff&size=48`}
                    alt={talent.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=T&background=4c1d95&color=fff&size=48` }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{talent.name}</p>
                    <p className="text-xs text-gray-400 truncate">@{talent.handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(talent)}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#fff0f5' }}
                  title="Remove from saved"
                >
                  <Heart className="w-3.5 h-3.5" fill={pink} style={{ color: pink }} />
                </button>
              </div>
              {/* Tier + niche */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
                  {tier.label}
                </span>
                {talent.niches?.[0] && (
                  <span className="text-xs text-gray-500 truncate">{talent.niches[0]}</span>
                )}
              </div>
              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {talent.totalFollowers >= 1000 ? (talent.totalFollowers / 1000).toFixed(1) + 'K' : talent.totalFollowers || talent.followers || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" style={{ color: '#D4AF37' }} fill="#D4AF37" />
                  {(talent.avgRating || talent.rating || 0).toFixed(1)}
                </span>
                {talent.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {talent.location}
                  </span>
                )}
              </div>
              {/* Price */}
              <p className="text-sm font-bold" style={{ color: pink }}>
                From ₦{(talent.minPrice || talent.from || 0).toLocaleString('en')}
              </p>
              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Link to={`/creators/${talent.handle || talent._id || talent.id}`}
                  className="flex-1 text-center text-xs font-semibold py-2 rounded-xl text-white"
                  style={{ backgroundColor: darkPurple }}>
                  View Profile
                </Link>
                <Link to={`/order/${talent._id || talent.id}`}
                  className="flex-1 text-center text-xs font-semibold py-2 rounded-xl border"
                  style={{ borderColor: darkPurple, color: darkPurple }}>
                  Order
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SettingsTab() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ brandName: 'My Brand', email: 'brand@example.com', website: '', notifications: true })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand Name</label>
          <input
            type="text"
            value={form.brandName}
            onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            placeholder="https://yourbrand.com"
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setForm(f => ({ ...f, notifications: !f.notifications }))}
            className="w-10 h-5 rounded-full relative transition-colors cursor-pointer flex-shrink-0"
            style={{ backgroundColor: form.notifications ? darkPurple : '#d1d5db' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
              style={{ transform: form.notifications ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </div>
          <span className="text-sm text-gray-700">Email notifications</span>
        </label>
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-full text-sm font-bold text-white transition-colors"
          style={{ backgroundColor: saved ? '#16a34a' : darkPurple }}
        >
          {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
