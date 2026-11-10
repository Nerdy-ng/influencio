import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '');
import { logout } from '../lib/logout'
import { getLogo } from '../lib/brandSettings'
import { searchLocations, locationMatches } from '../lib/locationData'
import {
  LayoutDashboard, ShoppingBag, CheckCircle, Wallet, Settings,
  Bell, ChevronDown, ChevronRight, X, AlertCircle, Shield, Loader2,
  ExternalLink, Download, RotateCcw, Zap, Award, Lock, Menu, Mail, Heart, MapPin, Star, Users, Search, UserPlus, LogOut,
  Inbox, Clock, ThumbsUp, ThumbsDown, MessageSquare, FileText, TrendingUp, Send, ArrowLeftRight,
  Plus, CreditCard, Building2, ArrowUpRight, Megaphone, ChevronLeft,
} from 'lucide-react'
import MessagingPanel from '../components/MessagingPanel'
import AnnouncementBanner from '../components/AnnouncementBanner'
import PromoCodeRedeemer from '../components/PromoCodeRedeemer'
import InviteTab from '../components/InviteTab'
import { useFavorites } from '../hooks/useFavorites'
import { supabase } from '../lib/supabase'
import { createNotification, sendNotificationEmail } from '../lib/notifications'
import { saveProfile } from '../lib/profile'
import { getBrandAnalytics } from '../lib/analytics'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import OnboardingTour from '../components/OnboardingTour'
import OnboardingChecklist from '../components/OnboardingChecklist'

const pink = '#F72585'
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

const STEPS       = ['Hired', 'In Progress', 'Submitted', 'Approved']
const STEP_COLORS = ['#10b981', '#f59e0b', '#be185d', '#a855f7']
function stepIndex(status) {
  if (status === 'pending')            return 0
  if (status === 'in_progress')        return 1
  if (status === 'revision_requested') return 1
  if (status === 'delivered')          return 2
  if (status === 'completed')          return 3
  return 0
}

function CollabStepper({ status }) {
  const step = stepIndex(status)
  return (
    <div className="flex items-center mt-2">
      {STEPS.map((label, i) => {
        const done   = i < step
        const active = i === step
        const color  = STEP_COLORS[i]
        return (
          <div key={label} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? '1' : 'none' }}>
            <span
              className="flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full border-2 whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: active ? color : done ? color + '28' : '#f0eff5',
                borderColor:     active ? color : done ? color + '80' : '#d1d5db',
                color:           active ? '#fff' : done ? color : '#9ca3af',
              }}
            >
              {done && <span style={{ fontSize: 9 }}>✓</span>}
              {active && <span style={{ width: 5, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.6)', display: 'inline-block' }} />}
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-1 rounded-full" style={{ flex: 1, height: 2.5, backgroundColor: done ? color + '55' : '#e5e7eb', minWidth: 8 }} />
            )}
          </div>
        )
      })}
    </div>
  )
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

// Payment modal
function PaymentModal({ order, onClose, onSuccess }) {
  const [step, setStep] = useState('confirm') // confirm → processing → success

  const handlePay = async () => {
    setStep('processing')
    // Simulate Paystack redirect + return
    await new Promise(r => setTimeout(r, 2000))
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
              <h2 className="text-xl font-black text-brand-dpurple">Complete Payment</h2>
              <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
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
              <p className="text-sm text-green-700">Your payment will be held securely until you approve the delivered content.</p>
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
            <p className="text-sm text-gray-500">Funds held securely. The talent has been notified.</p>
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
          <h2 className="text-xl font-black text-brand-dpurple">Request Revision</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Describe what you'd like the talent to change or improve.</p>
        <textarea
          value={reason}
          onChange={e => setReason(stripInjection(e.target.value))}
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

function PlatformIcon({ platform, size = 16 }) {
  const s = size
  if (platform === 'Instagram') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="url(#ig_od)"/>
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
      <defs>
        <linearGradient id="ig_od" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9CE34"/><stop offset="0.35" stopColor="#EE2A7B"/><stop offset="1" stopColor="#6228D7"/>
        </linearGradient>
      </defs>
    </svg>
  )
  if (platform === 'TikTok') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#010101"/>
      <path d="M17 8.5a3.5 3.5 0 01-3.5-3.5V4h-2.1v10.8a1.9 1.9 0 11-1.9-1.9c.17 0 .34.02.5.06V10.8a4 4 0 10 4 4V8.67A5.56 5.56 0 0017 9.5V8.5z" fill="#69C9D0"/>
      <path d="M16.5 8.17a5.56 5.56 0 01-2.5-.67v6.3a4 4 0 11-4-4c.17 0 .34.02.5.06V7.7a6.1 6.1 0 00-.5-.02 6 6 0 100 12 6 6 0 006-6V8.17h-.5z" fill="white" fillOpacity="0.15"/>
      <path d="M10.5 9.88V7.7a6.1 6.1 0 00-.5-.02 6 6 0 100 12 6 6 0 006-6V5h-2.1v4.8A3.5 3.5 0 0110.5 9.88z" fill="#EE1D52" fillOpacity="0.4"/>
    </svg>
  )
  if (platform === 'YouTube') return (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#FF0000"/>
      <path fill="white" d="M19.8 8.2a2 2 0 00-1.4-1.4C17 6.5 12 6.5 12 6.5s-5 0-6.4.3A2 2 0 004.2 8.2 20 20 0 004 12a20 20 0 00.2 3.8 2 2 0 001.4 1.4c1.4.3 6.4.3 6.4.3s5 0 6.4-.3a2 2 0 001.4-1.4A20 20 0 0020 12a20 20 0 00-.2-3.8zM10.5 14.5V9.5l4.3 2.5-4.3 2.5z"/>
    </svg>
  )
  if (platform === 'Twitter' || platform === 'Twitter/X') return (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#000"/>
      <path fill="white" d="M17.75 4h-2.6L12 8.1 8.85 4H3.5l5.9 8L3.5 20h2.6L10 15.6 13.15 20h5.35l-6.1-8.3L17.75 4zm-3.1 13.5L5.7 5.5h1.6l9 12H14.65z"/>
    </svg>
  )
  if (platform === 'Facebook') return (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#1877F2"/>
      <path fill="white" d="M15.5 8H13.5V6.5c0-.6.4-.8.7-.8H15V4h-2.1C10.8 4 10.5 5.5 10.5 7v1H9v2h1.5V20h2.5v-9.5H15l.5-2.5z"/>
    </svg>
  )
  if (platform === 'Snapchat') return (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#FFFC00"/>
      <path fill="#000" d="M12 4c-2.4 0-4 1.8-4 4v1.5c-.4.1-.8.3-1 .7-.2.4 0 .8.4 1 .4.2.6.2.7.3-.3.8-1 1.8-2.1 2 .1.3.6.5 1.5.7.1.3.2.7.4.9.2.2.4.2.6.1.3-.1.7-.2 1.1-.2.4 0 .8.2 1.4.6.5.3.9.5 1.5.5.6 0 1-.2 1.5-.5.6-.4 1-.6 1.4-.6.4 0 .8.1 1.1.2.2.1.4.1.6-.1.2-.2.3-.6.4-.9.9-.2 1.4-.4 1.5-.7-1.1-.2-1.8-1.2-2.1-2 .1-.1.3-.1.7-.3.4-.2.6-.6.4-1-.2-.4-.6-.6-1-.7V8c0-2.2-1.6-4-4-4z"/>
    </svg>
  )
  // Generic fallback
  return (
    <span className="inline-flex items-center justify-center rounded font-bold text-white text-[9px]"
      style={{ width: s, height: s, backgroundColor: '#6b7280', fontSize: s * 0.45 }}>
      {(platform || '?')[0]}
    </span>
  )
}

// Individual order card
function OrderCard({ order, onPayNow, onApprove, onRevision, onReview }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-3xl border border-brand-lav shadow-sm overflow-hidden">
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
                <span title={order.package.platform} className="inline-flex items-center rounded-lg overflow-hidden flex-shrink-0" style={{ lineHeight: 0 }}>
                  <PlatformIcon platform={order.package.platform} size={20} />
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-1.5">{order.brief?.productName} · {timeAgo(order.createdAt)}</p>
            <StatusBadge status={order.status} />
            <CollabStepper status={order.status} />
          </div>

          {/* Price + actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <p className="font-bold text-gray-900">{formatNGN(order.total)}</p>
            <OrderActions order={order} onPayNow={onPayNow} onApprove={onApprove} onRevision={onRevision} onReview={onReview} />
          </div>

          {/* Expand */}
          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-700">
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-brand-lav p-5" style={{ backgroundColor: "#f9f5ff" }}>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-purple-50 transition-colors"
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

function OrderActions({ order, onPayNow, onApprove, onRevision, onReview }) {
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
      <div className="flex gap-2">
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          Completed ✓
        </span>
        <button
          onClick={() => onReview?.(order)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors hover:bg-yellow-50"
          style={{ borderColor: '#D4AF37', color: '#854d0e' }}
        >
          <Star className="w-3 h-3" style={{ fill: '#D4AF37', color: '#D4AF37' }} />
          Review
        </button>
      </div>
    )
  }
  return null
}

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ order, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!rating || !comment.trim()) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const meta = user?.user_metadata || {}
      const brandName = meta.brand_name || meta.full_name || 'A Brand'
      const initials = brandName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      await supabase.from('reviews').insert({
        talent_id: order.creatorId || order.creator_id || order.talent?._id,
        reviewer_id: user.id,
        collab_id: order._id,
        rating,
        comment,
        brand_name: brandName,
        brand_initials: initials,
        campaign_type: order.package?.name || null,
      })
    } catch { /* offline — store locally */ }
    setDone(true)
    setSubmitting(false)
    onSubmitted?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        {done ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-black text-gray-900 mb-1">Review submitted!</p>
            <p className="text-sm text-gray-400 mb-6">Your review helps other brands make informed decisions.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-full text-sm font-bold text-white" style={{ backgroundColor: purple }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900">Rate {order.talent?.name || 'Creator'}</h3>
              <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Campaign: <span className="font-medium text-gray-700">{order.package?.name || 'Campaign'}</span>
            </p>

            {/* Star picker */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className="w-9 h-9"
                    style={{
                      fill: star <= (hovered || rating) ? '#D4AF37' : 'none',
                      color: star <= (hovered || rating) ? '#D4AF37' : '#d1d5db',
                    }}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm font-medium mb-4" style={{ color: purple }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
              </p>
            )}

            <textarea
              value={comment}
              onChange={e => setComment(stripInjection(e.target.value))}
              rows={4}
              placeholder="Describe your experience with this creator — quality of content, communication, delivery time…"
              className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none border"
              style={{ borderColor: '#e9d5ff', backgroundColor: '#faf5ff', color: '#1e0040' }}
              onFocus={e => e.target.style.borderColor = purple}
              onBlur={e => e.target.style.borderColor = '#e9d5ff'}
            />
            <p className="text-right text-xs mt-1 mb-4" style={{ color: comment.length > 500 ? '#f97316' : '#9ca3af' }}>
              {comment.length}/500
            </p>

            <button
              type="submit"
              disabled={!rating || !comment.trim() || submitting}
              className="w-full py-3 rounded-full text-sm font-bold text-white transition-all"
              style={{ backgroundColor: rating && comment.trim() ? purple : '#e9d5ff', color: rating && comment.trim() ? 'white' : '#a78bfa' }}
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
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
    <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e9d5ff', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: 'rgba(28,0,64,0.5)' }}>{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
          <Icon className="w-4.5 h-4.5" style={{ color, width: '18px', height: '18px' }} />
        </div>
      </div>
      <p className="text-2xl font-extrabold" style={{ color: '#1e0040' }}>{value}</p>
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'talents',         label: 'Find Creators',   icon: Search },
  { id: 'post-campaign',   label: 'Post Campaign',   icon: Plus },
  { id: 'my-campaigns',    label: 'My Campaigns',    icon: Megaphone },
  { id: 'collabs',         label: 'Collabs',         icon: ShoppingBag },
  { id: 'overview',        label: 'Overview',        icon: LayoutDashboard },
  { id: 'favorites',       label: 'Saved Talents',   icon: Heart },
  { id: 'messages',        label: 'Messages',        icon: Mail },
  { id: 'analytics',       label: 'Analytics',       icon: TrendingUp },
  { id: 'wallet',          label: 'Wallet',          icon: Wallet },
  { id: 'payments',        label: 'Transactions',    icon: ArrowLeftRight },
  { id: 'notifications',   label: 'Notifications',   icon: Bell },
  { id: 'invite',          label: 'Invite Creators', icon: UserPlus },
  { id: 'settings',        label: 'Settings',        icon: Settings },
]

const TIER_INFO = {
  'fast-rising': { label: 'Fast Rising', color: '#22c55e' },
  'next-rated':  { label: 'Next',        color: '#a78bfa', diamond: true },
  'top-rated':   { label: 'Top',         color: '#D4AF37', diamond: true },
}

function initials(name) {
  return (name || '??').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}


export default function BrandDashboard() {
  const [searchParams] = useSearchParams()
  const newOrderId = searchParams.get('newOrder')
  const initialTab = searchParams.get('tab')
  const initialConvId = searchParams.get('conv')

  const [activeTab, setActiveTab] = useState(initialTab || 'overview')
  const hasSetInitialTab = useRef(false)
  const [dashLogo, setDashLogo] = useState(() => getLogo('dashboard'))
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [paymentModal, setPaymentModal] = useState(null) // order object
  const [revisionModal, setRevisionModal] = useState(null)
  const [reviewModal, setReviewModal] = useState(null)

  const [toast, setToast] = useState(null)
  const brandUserId = localStorage.getItem('brandiór_user') || 'guest'
  const [showTour, setShowTour] = useState(() => !localStorage.getItem(`brandior_tour_done_${brandUserId}`))

  // Shared creator-setup modal (used by sidebar + avatar menu)
  const [showCreatorSetup, setShowCreatorSetup] = useState(false)
  const [csProfileId,  setCsProfileId]  = useState(null)
  const [csUsername,       setCsUsername]       = useState('')
  const [csUsernameStatus, setCsUsernameStatus] = useState('idle') // idle|checking|available|taken|invalid
  const [csActivating,  setCsActivating]  = useState(false)
  const navigate = useNavigate()
  const csCheckTimer = useRef(null)

  async function openCreatorSetup() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Check server-authoritative capability — not user_metadata
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_creator_access, full_name, company_name')
      .eq('id', user.id)
      .single()
    if (profile?.has_creator_access) {
      // Already has creator capability — just switch workspace via EF
      const { error } = await supabase.functions.invoke('sync-workspace', { body: { workspace: 'creator' } })
      if (!error) {
        localStorage.setItem('brandiór_workspace', 'creator')
        localStorage.setItem('brandiór_role', 'talent')
        navigate('/dashboard')
      }
      return
    }
    setCsProfileId(user.id)
    const suggested = (profile?.full_name || profile?.company_name || '')
      .toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '_').slice(0, 24)
    setCsUsername(suggested)
    setCsUsernameStatus('idle')
    setShowCreatorSetup(true)
  }

  function handleCsUsernameChange(val) {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24)
    setCsUsername(clean)
    setCsUsernameStatus('idle')
    if (csCheckTimer.current) clearTimeout(csCheckTimer.current)
    if (!clean) return
    if (clean.length < 3) { setCsUsernameStatus('invalid'); return }
    setCsUsernameStatus('checking')
    csCheckTimer.current = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id').eq('handle', clean).maybeSingle()
      setCsUsernameStatus(data ? 'taken' : 'available')
    }, 500)
  }

  async function activateCreatorMode() {
    if (csUsernameStatus !== 'available' || !csUsername || !csProfileId) return
    setCsActivating(true)
    try {
      const { error } = await supabase.functions.invoke('sync-workspace', {
        body: { workspace: 'creator', username: csUsername },
      })
      if (error) throw error
      localStorage.setItem('brandiór_workspace', 'creator')
      localStorage.setItem('brandiór_role', 'talent')
      navigate('/dashboard')
    } catch {
      // EF failed — still navigate (EF may have partially succeeded)
      localStorage.setItem('brandiór_workspace', 'creator')
      localStorage.setItem('brandiór_role', 'talent')
      navigate('/dashboard')
    } finally {
      setCsActivating(false)
    }
  }

  const showToast = (message, type = 'success') => setToast({ message, type })

  const fetchOrders = useCallback(async () => {
    const brandId = localStorage.getItem('brandiór_user')
    if (!brandId) { setOrders([]); setLoading(false); return }
    try {
      const { data: collabs, error: collabsError } = await supabase
        .from('collabs')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
      if (collabsError) throw collabsError

      const creatorIds = [...new Set((collabs || []).map(c => c.creator_id))]
      let creatorMap = {}
      if (creatorIds.length > 0) {
        const { data: creators } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username')
          .in('id', creatorIds)
        ;(creators || []).forEach(c => { creatorMap[c.id] = c })
      }

      setOrders((collabs || []).map(c => {
        const creator = creatorMap[c.creator_id] || {}
        return {
          _id: c.id,
          status: c.status,
          createdAt: c.created_at,
          packagePrice: c.production_cost,
          platformFee: c.platform_fee,
          total: c.total_amount,
          creatorId: c.creator_id,
          talent: {
            _id: c.creator_id,
            name: creator.full_name || 'Creator',
            handle: creator.username || '',
            avatar: creator.avatar_url || null,
          },
          package: {
            name: `${c.content_type} · ${c.duration_label}`,
            platform: (c.platforms || [])[0] || null,
          },
          brief: c.brief || {},
          deliveredFiles: c.delivered_files || [],
        }
      }))
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    function onLogoUpdate() { setDashLogo(getLogo('dashboard')) }
    window.addEventListener('brandior:logo-updated', onLogoUpdate)
    return () => window.removeEventListener('brandior:logo-updated', onLogoUpdate)
  }, [])

  // Server-authoritative capability check: redirect if user lacks brand access
  useEffect(() => {
    const userId = localStorage.getItem('brandiór_user')
    if (!userId) return
    supabase.from('profiles').select('has_brand_access').eq('id', userId).single()
      .then(({ data }) => {
        if (data && data.has_brand_access === false) navigate('/dashboard', { replace: true })
      })
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  // New brand → redirect to Find Creators; returning brand → keep Overview
  useEffect(() => {
    if (loading || hasSetInitialTab.current || initialTab) return
    hasSetInitialTab.current = true
    const hasActivity = orders.some(o => !['cancelled'].includes(o.status))
    if (!hasActivity) navigate('/brand/find-creators')
  }, [loading])

  useEffect(() => {
    if (newOrderId && !loading) {
      showToast('Order placed successfully! Complete payment to get started.', 'success')
      setActiveTab('collabs')
    }
  }, [newOrderId, loading])

  // Actions
  const handlePaySuccess = async (orderId) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'in_progress' } : o))
    await supabase.from('collabs').update({ status: 'in_progress', payment_status: 'paid' }).eq('id', orderId)
    showToast('Payment successful! Funds held securely.')
  }

  const handleApprove = async (orderId) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'completed' } : o))
    await supabase.from('collabs').update({ status: 'completed', payment_status: 'released' }).eq('id', orderId)
    showToast('Order approved! Payment released to talent.')
  }

  const handleRevision = async (orderId, reason) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'revision_requested' } : o))
    const { data: current } = await supabase.from('collabs').select('revisions_requested').eq('id', orderId).single()
    await supabase.from('collabs').update({
      status: 'revision_requested',
      revision_reason: reason,
      revisions_requested: (current?.revisions_requested || 0) + 1,
    }).eq('id', orderId)
    showToast('Revision request sent to talent.')
  }

  // Derived stats
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status))
  const pendingReview = orders.filter(o => o.status === 'delivered')
  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f9f5ff' }}>
      {showTour && (
        <OnboardingTour
          role="brand"
          onClose={() => setShowTour(false)}
          setActiveTab={setActiveTab}
        />
      )}
      {/* Sidebar */}
      <>
        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col w-60 flex-shrink-0 min-h-screen sticky top-0"
          style={{ backgroundColor: 'var(--b-brandDashBg)' }}
        >
          <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} dashLogo={dashLogo} onSwitchToCreator={openCreatorSetup} />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="bg-black/40 flex-1" onClick={() => setSidebarOpen(false)} />
            <aside className="w-60 flex flex-col" style={{ backgroundColor: 'var(--b-brandDashBg)' }}>
              <SidebarContent activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false) }} dashLogo={dashLogo} onSwitchToCreator={openCreatorSetup} />
            </aside>
          </div>
        )}
      </>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40" style={{ backgroundColor: 'rgba(243,238,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e9d5ff' }}>
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-1.5 rounded-lg transition-colors" style={{ color: '#7c3aed' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.08)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = ''} onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-black" style={{ color: '#1e0040' }}>Brand Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/marketplace"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                style={{ border: '1px solid #e9d5ff', color: '#7c3aed' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ede9fe'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Browse Talents
              </Link>
              <button
                onClick={() => navigate('/brand/find-creators')}
                className="sm:hidden p-2 rounded-xl transition-colors"
                style={{ color: 'rgba(28,0,64,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'white'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                title="Find Creators"
              >
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setActiveTab('messages')} className="relative p-2 rounded-xl transition-colors"
                style={{ color: 'rgba(28,0,64,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.08)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                <Mail className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              <button className="relative p-2 rounded-xl transition-colors"
                style={{ color: 'rgba(28,0,64,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.08)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                <Bell className="w-5 h-5" />
                {pendingReview.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              <BrandAvatarMenu onSwitchToCreator={openCreatorSetup} />
            </div>
          </div>
        </header>

        <AnnouncementBanner role="brand" />
        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6">
          <div className="max-w-screen-xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-3 border-purple-200 border-t-purple-600 animate-spin" style={{ borderWidth: '3px' }} />
            </div>
          ) : (
            <>
              {activeTab === 'post-campaign' && <PostCampaignTab onCreated={() => navigate('/brand/my-campaigns')} />}
              {activeTab === 'overview' && (
                <OverviewTab
                  activeOrders={activeOrders}
                  pendingReview={pendingReview}
                  completedOrders={completedOrders}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'analytics' && <BrandAnalyticsTab />}
              {activeTab === 'collabs' && (
                <>
                  <BrandCustomOffersPanel />
                  <CampaignsTab
                    activeOrders={activeOrders}
                    completedOrders={completedOrders}
                    onPayNow={setPaymentModal}
                    onApprove={handleApprove}
                    onRevision={setRevisionModal}
                    onReview={setReviewModal}
                  />
                </>
              )}
              {activeTab === 'notifications' && <BrandNotificationsTab />}
              {activeTab === 'wallet' && <WalletTab />}
              {activeTab === 'payments' && (
                <PaymentsTab orders={orders} totalSpent={totalSpent} onPayNow={setPaymentModal} onApprove={handleApprove} onRevision={setRevisionModal} />
              )}
              {activeTab === 'favorites' && <FavoritesTab />}
              {activeTab === 'messages' && (
                <MessagingPanel userId={localStorage.getItem('brandiór_user') || ''} userType="brand" initialConvId={initialConvId} />
              )}
              {activeTab === 'invite' && <InviteTab userType="brand" />}
              {activeTab === 'settings' && (
                <SettingsTab />
              )}
            </>
          )}
          </div>
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 flex"
          style={{
            backgroundColor: 'var(--b-brandDashBg)',
            borderTop: '1px solid rgba(196,181,253,0.15)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
          {[
            { id: 'talents',   label: 'Discover',  Icon: Search },
            { id: 'collabs',   label: 'Collabs',   Icon: ShoppingBag },
            { id: 'messages',  label: 'Messages',  Icon: Mail },
            { id: 'wallet',    label: 'Wallet',    Icon: Wallet },
          ].map(({ id, label, Icon }) => (
            <button key={id} onClick={() => ROUTED_BRAND_TABS[id] ? navigate(ROUTED_BRAND_TABS[id]) : setActiveTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors"
              style={{ color: activeTab === id ? '#c084fc' : 'rgba(196,181,253,0.4)' }}>
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
          {/* Menu — opens sidebar overlay */}
          <button onClick={() => setSidebarOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors"
            style={{ color: ['post-campaign','my-campaigns','overview','favorites','analytics','payments','notifications','invite','settings'].includes(activeTab) ? '#c084fc' : 'rgba(196,181,253,0.4)' }}>
            <Menu className="w-5 h-5" />
            More
          </button>
        </nav>
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

      {reviewModal && (
        <ReviewModal
          order={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmitted={() => showToast('Review submitted! Thank you.')}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Creator-mode activation modal */}
      {showCreatorSetup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={() => !csActivating && setShowCreatorSetup(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: '#7c3aed18' }}>
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-lg font-black text-gray-900 text-center">Choose your creator handle</h2>
              <p className="text-sm text-gray-500 text-center mt-1">This will be your public username on Brandior. You can change it later.</p>
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Username</p>
            <div className="flex items-center border-2 rounded-xl px-4 py-3 mb-2 transition-colors"
              style={{ borderColor: csUsernameStatus === 'available' ? '#16a34a' : csUsernameStatus === 'taken' || csUsernameStatus === 'invalid' ? '#ef4444' : '#e5e7eb' }}>
              <span className="font-bold mr-1" style={{ color: '#7c3aed' }}>@</span>
              <input
                className="flex-1 text-sm font-bold text-gray-900 outline-none bg-transparent"
                placeholder="your_handle"
                value={csUsername}
                onChange={e => handleCsUsernameChange(e.target.value)}
                autoFocus
                spellCheck={false}
              />
              {csUsernameStatus === 'checking'  && <div className="w-4 h-4 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin ml-2" />}
              {csUsernameStatus === 'available' && <span className="ml-2 text-green-600 text-base">✓</span>}
              {csUsernameStatus === 'taken'     && <span className="ml-2 text-red-500 text-base">✗</span>}
              {csUsernameStatus === 'invalid'   && <span className="ml-2 text-amber-500 text-base">!</span>}
            </div>
            {csUsernameStatus === 'available' && <p className="text-xs font-semibold text-green-600 mb-3">@{csUsername} is available</p>}
            {csUsernameStatus === 'taken'     && <p className="text-xs font-semibold text-red-500 mb-3">@{csUsername} is already taken — try another</p>}
            {csUsernameStatus === 'invalid'   && <p className="text-xs font-semibold text-amber-500 mb-3">Letters, numbers and underscores only. Min 3 characters.</p>}
            {!['available','taken','invalid','checking'].includes(csUsernameStatus) && <div className="mb-3" />}

            <button onClick={activateCreatorMode} disabled={csUsernameStatus !== 'available' || csActivating}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity disabled:opacity-40"
              style={{ backgroundColor: '#7c3aed' }}>
              {csActivating ? 'Activating…' : 'Activate Creator Mode →'}
            </button>
            <button onClick={() => setShowCreatorSetup(false)} disabled={csActivating}
              className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function BrandAvatarMenu({ onSwitchToCreator }) {
  const [open, setOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      setUserEmail(session.user.email || '')
      supabase.from('profiles').select('avatar_url').eq('id', session.user.id).single()
        .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url) })
    })
  }, [])

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="relative focus:outline-none">
        {avatarUrl
          ? <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20" />
          : <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: darkPurple }}>
              {userEmail ? userEmail[0].toUpperCase() : 'B'}
            </div>
        }
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-white" title="Online" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-52 rounded-2xl shadow-xl overflow-hidden z-50"
          style={{ backgroundColor: '#1e0a3c', border: '1px solid rgba(196,181,253,0.15)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(196,181,253,0.1)' }}>
            <p className="text-white text-sm font-semibold">Brand Account</p>
            <p className="text-white/35 text-xs truncate">{userEmail || 'Loading...'}</p>
          </div>
          <button
            onClick={() => { setOpen(false); onSwitchToCreator() }}
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium w-full transition-colors text-left"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}>
            <ArrowLeftRight className="w-4 h-4" /> Switch to Creator Account
          </button>
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

const ROUTED_BRAND_TABS = {
  talents:        '/brand/find-creators',
  'my-campaigns': '/brand/my-campaigns',
}

function SidebarContent({ activeTab, setActiveTab, dashLogo, onSwitchToCreator }) {
  const navigate = useNavigate()

  return (
    <>
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="block -mx-5">
          <img src={dashLogo} alt="Brandior" className="w-full object-contain object-left px-5" style={{ height: '160px' }} />
        </Link>
        <div className="mt-2">
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
            onClick={() => ROUTED_BRAND_TABS[id] ? navigate(ROUTED_BRAND_TABS[id]) : setActiveTab(id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
            style={
              activeTab === id
                ? { backgroundColor: 'color-mix(in srgb, var(--b-brandMenuBg) 15%, transparent)', color: 'var(--b-brandMenuBg)', border: '1px solid color-mix(in srgb, var(--b-brandMenuBg) 25%, transparent)' }
                : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }
            }
            onMouseEnter={e => { if (activeTab !== id) { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--b-brandMenuBg) 8%, transparent)'; e.currentTarget.style.color = 'var(--b-brandMenuBg)' } }}
            onMouseLeave={e => { if (activeTab !== id) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' } }}
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
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link to="/marketplace" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <ExternalLink className="w-4 h-4" />
          Browse Talents
        </Link>
        <button onClick={onSwitchToCreator}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}>
          <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
          Switch to Creator Account
        </button>
      </div>
    </>
  )
}


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
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ border: '1px solid #e9d5ff', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
      <div className="flex items-center gap-3">
        {talent.avatar
          ? <img src={talent.avatar} alt={talent.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
          : null}
        <div className="w-12 h-12 rounded-full flex-shrink-0 items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: darkPurple, display: talent.avatar ? 'none' : 'flex' }}>
          {(talent.name || '?')[0].toUpperCase()}
        </div>
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
        <span className="text-xs font-bold" style={{ color: '#7c3aed' }}>From ₦{talent.from.toLocaleString('en')}</span>
      </div>
      <Link to={`/creators/${talent.handle || talent.id}`}
        className="w-full text-center text-xs font-semibold py-2 rounded-xl text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: darkPurple }}>
        View Profile
      </Link>
    </div>
  )
}

// ── Post Campaign ─────────────────────────────────────────────────────────────
const CAMPAIGN_NICHES = ['Fashion','Beauty','Tech','Food','Fitness','Lifestyle','Comedy','Travel','Fintech','Business','Voiceover','Gaming']
const COLLAB_TYPES    = ['UGC', 'Instagram Reel', 'TikTok', 'YouTube', 'Twitter/X', 'Podcast', 'Blog', 'Other']

function PostCampaignTab({ onCreated }) {
  const [title,    setTitle]    = useState('')
  const [niche,    setNiche]    = useState('')
  const [type,     setType]     = useState('UGC')
  const [brief,    setBrief]    = useState('')
  const [budget,   setBudget]   = useState('')
  const [timeline, setTimeline] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim())   { setError('Campaign title is required.'); return }
    if (!niche)          { setError('Please choose a niche.'); return }
    if (!brief.trim())   { setError('Brief is required.'); return }
    const budgetNum = Number(budget)
    if (!budget || budgetNum < 20000) { setError('Budget must be at least ₦20,000.'); return }
    if (!timeline.trim()) { setError('Timeline is required.'); return }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error: dbErr } = await supabase.from('public_jobs').insert({
        brand_id:       user.id,
        status:         'open',
        campaign_name:  title.trim(),
        niche,
        collab_type:    type,
        brief:          brief.trim(),
        budget:         budgetNum,
        timeline:       timeline.trim(),
        applicants_count: 0,
      })
      if (dbErr) throw dbErr
      setDone(true)
      onCreated?.()
    } catch (err) {
      setError(err.message || 'Could not post campaign. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: '#dcfce7' }}>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-black" style={{ color: '#1e0040' }}>Campaign Posted!</h2>
        <p className="text-gray-500 text-sm">Creators can now discover and pitch for your campaign. Check <strong>My Campaigns</strong> to see applicants.</p>
        <button onClick={() => { setDone(false); setTitle(''); setNiche(''); setBrief(''); setBudget(''); setTimeline('') }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: '#4c1d95' }}>
          <Plus className="w-4 h-4" /> Post another
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#7c3aed' }}>New Campaign</p>
        <h2 className="text-2xl font-black" style={{ color: '#1e0040' }}>Post a Campaign</h2>
        <p className="text-sm text-gray-500 mt-1">Creators on Brandior will discover your campaign and pitch for it. You choose who to hire.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campaign name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: '#374151' }}>Campaign Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Ramadan campaign — Instagram Reel"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#fff', color: '#1e0040' }} />
        </div>

        {/* Niche + Type row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: '#374151' }}>Niche</label>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_NICHES.map(n => (
                <button key={n} type="button" onClick={() => setNiche(n)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: niche === n ? '#7c3aed' : '#f3eeff',
                    color: niche === n ? '#fff' : '#6d28d9',
                    border: niche === n ? 'none' : '1px solid #e9d5ff',
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: '#374151' }}>Content Type</label>
            <div className="flex flex-wrap gap-2">
              {COLLAB_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: type === t ? '#4c1d95' : '#f3eeff',
                    color: type === t ? '#fff' : '#6d28d9',
                    border: type === t ? 'none' : '1px solid #e9d5ff',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Brief */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: '#374151' }}>Campaign Brief</label>
          <textarea value={brief} onChange={e => setBrief(e.target.value)} rows={5} placeholder="Describe what you need. Include product details, messaging, dos/don'ts, hashtags, etc."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#fff', color: '#1e0040' }} />
        </div>

        {/* Budget + Timeline row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: '#374151' }}>Budget (₦)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#9ca3af' }}>₦</span>
              <input value={budget} onChange={e => setBudget(e.target.value.replace(/\D/g, ''))} inputMode="numeric"
                placeholder="50000"
                className="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#fff', color: '#1e0040' }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimum ₦20,000</p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: '#374151' }}>Timeline / Deadline</label>
            <input value={timeline} onChange={e => setTimeline(e.target.value)}
              placeholder="e.g. 7 days, Dec 31 2026"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#fff', color: '#1e0040' }} />
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-50"
          style={{ backgroundColor: '#4c1d95' }}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</> : <><Megaphone className="w-4 h-4" /> Post Campaign</>}
        </button>
      </form>
    </div>
  )
}

// ── My Campaigns ──────────────────────────────────────────────────────────────
function MyCampaignsTab() {
  const [campaigns, setCampaigns]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null) // campaign with applicants view
  const [applicants, setApplicants]     = useState([])
  const [appsLoading, setAppsLoading]   = useState(false)
  const [toggling, setToggling]         = useState(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('public_jobs')
      .select('*, applications:job_applications(count)')
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false })
    setCampaigns(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function viewApplicants(campaign) {
    setSelected(campaign)
    setAppsLoading(true)
    const { data } = await supabase
      .from('job_applications')
      .select('*, creator:profiles!creator_id(id, full_name, avatar_url, username, niches, tier, avg_rating, min_price)')
      .eq('job_id', campaign.id)
      .order('created_at', { ascending: false })
    setApplicants(data || [])
    setAppsLoading(false)
  }

  async function toggleStatus(campaign) {
    setToggling(campaign.id)
    const newStatus = campaign.status === 'open' ? 'closed' : 'open'
    await supabase.from('public_jobs').update({ status: newStatus }).eq('id', campaign.id)
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c))
    if (selected?.id === campaign.id) setSelected(prev => ({ ...prev, status: newStatus }))
    setToggling(null)
  }

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm font-semibold mb-5"
          style={{ color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft className="w-4 h-4" /> Back to My Campaigns
        </button>

        <div className="rounded-2xl p-5 mb-5" style={{ background: 'linear-gradient(135deg, #1a0035, #3d0080)', border: '1px solid rgba(196,181,253,0.2)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>{selected.niche} · {selected.collab_type}</p>
              <h2 className="text-xl font-black text-white">{selected.campaign_name}</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>₦{Number(selected.budget).toLocaleString()} · {selected.timeline}</p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: selected.status === 'open' ? 'rgba(34,197,94,0.2)' : 'rgba(156,163,175,0.2)', color: selected.status === 'open' ? '#86efac' : '#d1d5db' }}>
              {selected.status === 'open' ? 'Open' : 'Closed'}
            </span>
          </div>
          {selected.brief && <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{selected.brief}</p>}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg" style={{ color: '#1e0040' }}>
            {appsLoading ? 'Loading pitches…' : `${applicants.length} Pitch${applicants.length !== 1 ? 'es' : ''}`}
          </h3>
          <button onClick={() => toggleStatus(selected)} disabled={toggling === selected.id}
            className="text-xs font-bold px-4 py-2 rounded-xl border transition-colors disabled:opacity-40"
            style={{ borderColor: '#e9d5ff', color: '#7c3aed', background: '#fff' }}>
            {toggling === selected.id ? 'Updating…' : selected.status === 'open' ? 'Close Campaign' : 'Reopen Campaign'}
          </button>
        </div>

        {appsLoading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold">No pitches yet — your campaign is live and visible to creators.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map(app => {
              const c = app.creator || {}
              const tier = c.tier || 'fast-rising'
              const tierColors = { 'fast-rising': { bg: '#f0fdf4', color: '#16a34a' }, 'next-rated': { bg: '#f5f3ff', color: '#7c3aed' }, 'top-rated': { bg: '#fefce8', color: '#d97706' } }
              const tc = tierColors[tier] || tierColors['fast-rising']
              return (
                <div key={app.id} className="rounded-2xl p-5 bg-white" style={{ border: '1px solid #e9d5ff' }}>
                  <div className="flex items-start gap-3 mb-3">
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt={c.full_name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: '#4c1d95' }}>{(c.full_name || '?')[0]}</div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm" style={{ color: '#1e0040' }}>{c.full_name || 'Creator'}</span>
                        {c.username && <span className="text-xs text-gray-400">@{c.username}</span>}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: tc.bg, color: tc.color }}>
                          {tier.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {c.niches?.length > 0 && <span>{c.niches[0]}</span>}
                        {c.avg_rating > 0 && <span>⭐ {c.avg_rating}</span>}
                        {c.min_price > 0 && <span style={{ color: '#7c3aed' }}>From ₦{Number(c.min_price).toLocaleString()}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#f3eeff', color: '#7c3aed' }}>
                      {timeAgo(app.created_at)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: '#374151', background: '#faf5ff', borderRadius: 10, padding: '10px 14px' }}>"{app.pitch}"</p>
                  <Link to={`/creators/${c.username || c.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white"
                    style={{ backgroundColor: '#4c1d95' }}>
                    View Profile <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#7c3aed' }}>Campaigns</p>
          <h2 className="text-2xl font-black" style={{ color: '#1e0040' }}>My Campaigns</h2>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-sm mb-4">No campaigns posted yet.</p>
          <p className="text-sm mb-6">Post a campaign and creators will apply directly to it.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(c => {
            const appCount = c.applications?.[0]?.count ?? 0
            return (
              <div key={c.id} className="rounded-2xl p-5 bg-white" style={{ border: '1px solid #e9d5ff' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-1" style={{ color: '#7c3aed' }}>{c.niche} · {c.collab_type}</p>
                    <h3 className="font-black text-base" style={{ color: '#1e0040' }}>{c.campaign_name}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: c.status === 'open' ? '#dcfce7' : '#f3f4f6', color: c.status === 'open' ? '#16a34a' : '#6b7280' }}>
                      {c.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-semibold mb-4" style={{ color: '#374151' }}>
                  <span style={{ color: '#7c3aed' }}>₦{Number(c.budget).toLocaleString()}</span>
                  <span>📅 {c.timeline}</span>
                  <span>👥 {appCount} pitch{appCount !== 1 ? 'es' : ''}</span>
                  <span style={{ color: '#9ca3af' }}>{timeAgo(c.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => viewApplicants(c)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: '#4c1d95' }}>
                    View Pitches ({appCount})
                  </button>
                  <button onClick={() => toggleStatus(c)} disabled={toggling === c.id}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold border disabled:opacity-40"
                    style={{ borderColor: '#e9d5ff', color: '#7c3aed', background: '#fff' }}>
                    {toggling === c.id ? '…' : c.status === 'open' ? 'Close' : 'Reopen'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BrandAnalyticsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const stats = await getBrandAnalytics(user.id)
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
      <h2 className="text-xl font-black text-brand-dpurple">Analytics</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Collabs', value: data.totalCollabs, color: purple },
          { label: 'Total Spent',   value: formatNGN(data.totalSpent), color: '#0ea5e9' },
          { label: 'Completed',     value: data.completed,    color: '#16a34a' },
          { label: 'Avg Rating',    value: data.avgRating ? `${data.avgRating}★` : '—', color: '#D4AF37' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Collabs over time */}
      <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
        <p className="font-bold mb-4" style={{ color: "#1e0040" }}>Collabs — Last 30 Days</p>
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

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Collab status breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
          <p className="font-bold mb-4" style={{ color: "#1e0040" }}>Collab Status</p>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-bold text-gray-900 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-28 text-sm text-gray-400">No collabs yet</div>
          )}
        </div>

        {/* Top creators by collabs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
          <p className="font-bold mb-4" style={{ color: "#1e0040" }}>Top Creators by Collabs</p>
          {data.topCreators.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={data.topCreators} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="title" width={90} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill={purple} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-28 text-sm text-gray-400">No creators yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ activeOrders, pendingReview, completedOrders, setActiveTab }) {
  const isNewAccount = activeOrders.length === 0 && completedOrders.length === 0
  const [featuredCreators, setFeaturedCreators] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, handle, niches, tier, avg_rating, min_price, avatar_url, total_followers')
        .eq('role', 'creator')
        .order('avg_rating', { ascending: false })
        .limit(6)
      if (data?.length) {
        setFeaturedCreators(data.map(p => ({
          id: p.id,
          name: p.full_name || 'Creator',
          handle: p.handle ? `@${p.handle}` : '',
          niche: (p.niches || [])[0] || '',
          avatar: p.avatar_url || null,
          rating: p.avg_rating || 5,
          followers: p.total_followers ? `${Math.round(p.total_followers / 1000)}K` : '—',
          tier: p.tier || 'fast-rising',
          from: p.min_price || 0,
        })))
      }
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black" style={{ color: '#1e0040' }}>Overview</h2>

      {/* New-brand hero — visible only when no activity yet */}
      {isNewAccount && (
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #1a0035 0%, #3d0080 100%)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>Get Started</p>
          <h3 className="text-xl font-black text-white mb-2">Find the right creator for your brand</h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Discover creators, compare their profiles and rates, and find the right talent for your next campaign.</p>
          <button
            onClick={() => navigate('/brand/find-creators')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#c084fc', color: '#1a0035' }}>
            Explore Creators <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Onboarding checklist */}
      <OnboardingChecklist role="brand" setActiveTab={setActiveTab} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Collabs" value={activeOrders.length} icon={ShoppingBag} color={purple} />
        <StatCard label="Pending Review" value={pendingReview.length} icon={RotateCcw} color="#f59e0b" />
        <StatCard label="Completed" value={completedOrders.length} icon={CheckCircle} color="#16a34a" />
      </div>

      {/* Featured Talents */}
      {featuredCreators.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black" style={{ color: '#1e0040' }}>Top Creators</h3>
            <Link to="/marketplace" className="text-sm font-medium flex items-center gap-1" style={{ color: purple }}>
              Browse all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCreators.map(c => <TalentMiniCard key={c.id} talent={c} />)}
          </div>
        </div>
      )}
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

function CampaignsTab({ activeOrders, completedOrders, onPayNow, onApprove, onRevision, onReview }) {
  const [sub, setSub] = useState('active')
  const tabs = [
    { id: 'active',    label: 'Active',    count: activeOrders.length },
    { id: 'completed', label: 'Completed', count: completedOrders.length },
  ]
  return (
    <div className="space-y-5">
      {/* Sub-tab bar */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ backgroundColor: '#f3eeff' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={sub === t.id
              ? { backgroundColor: '#7c3aed', color: '#fff', boxShadow: '0 2px 8px rgba(124,58,237,0.25)' }
              : { color: '#7c3aed' }}
          >
            {t.label}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={sub === t.id ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' } : { backgroundColor: '#ede9fe', color: '#7c3aed' }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {sub === 'active' && (
        <OrdersTab
          title="Active Collabs"
          orders={activeOrders}
          emptyMsg="No active collabs. Browse talents to get started!"
          onPayNow={onPayNow}
          onApprove={onApprove}
          onRevision={onRevision}
        />
      )}
      {sub === 'completed' && (
        <OrdersTab
          title="Completed Collabs"
          orders={completedOrders}
          emptyMsg="No completed collabs yet."
          onPayNow={onPayNow}
          onApprove={onApprove}
          onRevision={onRevision}
          onReview={onReview}
        />
      )}
    </div>
  )
}

function OrdersTab({ title, orders, emptyMsg, onPayNow, onApprove, onRevision, onReview }) {
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
        <h2 className="text-xl font-black text-brand-dpurple">{title}</h2>
        <span className="text-sm text-gray-500">{filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters bar */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-lav p-4 space-y-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-lav" style={{ backgroundColor: '#f9f5ff' }}>
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(stripInjection(e.target.value))}
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
        <div className="text-center py-20 bg-white rounded-3xl border border-brand-lav">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f3e8ff' }}>
            <ShoppingBag className="w-7 h-7" style={{ color: purple }} />
          </div>
          <p className="text-gray-500 text-sm mb-5">{emptyMsg}</p>
          <Link to="/marketplace" className="px-6 py-2.5 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: darkPurple }}>
            Browse Talents
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-brand-lav">
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
            <OrderCard key={order._id} order={order} onPayNow={onPayNow} onApprove={onApprove} onRevision={onRevision} onReview={onReview} />
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
      <h2 className="text-xl font-black text-brand-dpurple">Transactions</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-brand-lav shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-extrabold" style={{ color: '#7c3aed' }}>{formatNGN(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-lav shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Platform Fees Paid</p>
          <p className="text-2xl font-extrabold text-gray-800">{formatNGN(totalFees)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-lav shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Transactions</p>
          <p className="text-2xl font-extrabold text-gray-800">{paidOrders.length}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-brand-lav shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-lav">
          <h3 className="font-bold" style={{ color: "#1e0040" }}>Recent Orders</h3>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#f9f5ff" }}>
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
                  <tr key={order._id} className="hover:bg-purple-50 transition-colors">
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
                      <OrderActions order={order} onPayNow={onPayNow} onApprove={onApprove} onRevision={onRevision} onReview={onReview} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-2xl border border-brand-lav shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-lav">
          <h3 className="font-bold" style={{ color: "#1e0040" }}>Payment History</h3>
        </div>
        {paidOrders.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">No payments yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#f9f5ff" }}>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Talent</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Package</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Platform Fee</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Payment Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-3 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paidOrders.map(order => (
                  <tr key={order._id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">{order.talent?.name}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{order.package?.name}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{formatNGN(order.total)}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{formatNGN(order.platformFee)}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status === 'completed' ? 'Released' : 'Active'}
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

// ── Brand Wallet Tab ─────────────────────────────────────────────────────────

const FUND_METHODS = [
  { id: 'card',  label: 'Debit / Credit Card', icon: CreditCard,  desc: 'Instant via Interswitch' },
  { id: 'bank',  label: 'Bank Transfer',        icon: Building2,   desc: 'Transfer to virtual account' },
]

function loadInterswitchScript(cb) {
  if (window.PaymentEngine) { cb(); return }
  const existing = document.getElementById('interswitch-js')
  if (existing) { existing.addEventListener('load', cb); return }
  const s = document.createElement('script')
  s.id  = 'interswitch-js'
  s.src = 'https://newwebpay.interswitchng.com/collection/w/pay/js/pay.js'
  s.onload = cb
  document.head.appendChild(s)
}

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000]

function WalletTab() {
  const [balance,      setBalance]      = useState(0)
  const [userId,       setUserId]       = useState(null)
  const [userProfile,  setUserProfile]  = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [amount,   setAmount]   = useState('')
  const [method,   setMethod]   = useState('card')
  const [funding,  setFunding]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [txns,     setTxns]     = useState([])

  async function reload(uid) {
    const [profileRes, collabsRes] = await Promise.all([
      supabase.from('profiles').select('wallet_balance').eq('id', uid).single(),
      supabase.from('collabs')
        .select('id, total_amount, payment_status, content_type, created_at, creator:profiles!creator_id(full_name)')
        .eq('brand_id', uid)
        .neq('payment_status', 'unpaid')
        .order('created_at', { ascending: false })
        .limit(20)
    ])
    if (profileRes.data) setBalance(profileRes.data.wallet_balance || 0)
    setTxns(collabsRes.data || [])
  }

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      await reload(user.id)
      const { data: prof } = await supabase.from('profiles').select('full_name, company_name, role').eq('id', user.id).maybeSingle()
      setUserProfile(prof)
      setLoading(false)
    })()
  }, [])

  async function handleFund() {
    const amt = Number(amount)
    if (!amt || amt < 20000) return
    setFunding(true)

    if (method === 'card') {
      const { data, error } = await supabase.functions.invoke('rubies-fund-wallet', {
        body: { amount: amt, wantsLink: false },
      })
      if (error || !data?.ok) {
        alert(data?.error || 'Failed to initiate payment. Please try again.')
        setFunding(false); return
      }
      loadInterswitchScript(() => {
        if (!window.PaymentEngine) {
          alert('Payment widget failed to load. Please refresh and try again.')
          setFunding(false); return
        }
        window.PaymentEngine.init({
          ...data.inline,
          onSuccess: async () => {
            setAmount('')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 5000)
            setFunding(false)
            // Webhook credits the wallet; poll DB for updated balance
            await new Promise(r => setTimeout(r, 3000))
            if (userId) await reload(userId)
          },
          onError: () => {
            alert('Payment failed. No charge was made.')
            setFunding(false)
          },
          onClose: () => setFunding(false),
        })
      })
    } else {
      setFunding(false)
      alert('Bank transfer: Coming soon. Wallet will be credited after transfer confirms.')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-t-2 border-purple-600 animate-spin" style={{ borderWidth: '3px' }} />
    </div>
  )

  const txnStatusLabel = (ps) => ps === 'released' ? 'Released' : ps === 'paid' ? 'Active' : ps === 'refunded' ? 'Refunded' : ps
  const txnStatusColor = (ps) => ps === 'released' ? { bg: '#dcfce7', color: '#166534' } : ps === 'paid' ? { bg: '#dbeafe', color: '#1e40af' } : { bg: '#fee2e2', color: '#991b1b' }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-black text-brand-dpurple">Wallet</h2>

      {/* Balance card */}
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Brandior Wallet</p>
        <p className="text-4xl font-black mb-1">{formatNGN(balance)}</p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Available balance · Used for collab payments</p>
        {success && (
          <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 w-fit">
            <CheckCircle className="w-4 h-4 text-green-300" />
            <span className="text-sm font-semibold text-green-200">Wallet funded successfully!</span>
          </div>
        )}
      </div>

      {/* Promo code */}
      {userId && (
        <div className="bg-white rounded-2xl border border-brand-lav shadow-sm p-5">
          <h3 className="font-bold flex items-center gap-2 mb-3" style={{ color: "#1e0040" }}>
            <span className="text-purple-600">🎟</span> Redeem Promo Code
          </h3>
          <PromoCodeRedeemer
            userId={userId}
            userRole={userProfile?.role || 'brand'}
            userName={userProfile?.company_name || userProfile?.full_name || ''}
            onSuccess={(credit) => setBalance(b => b + credit)}
          />
        </div>
      )}

      {/* Fund wallet */}
      <div className="bg-white rounded-2xl border border-brand-lav shadow-sm p-6 space-y-5">
        <h3 className="font-bold flex items-center gap-2" style={{ color: "#1e0040" }}>
          <Plus className="w-4 h-4" style={{ color: purple }} /> Fund Wallet
        </h3>

        {/* Quick amounts */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick amounts</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-all"
                style={amount === String(a)
                  ? { backgroundColor: purple, color: '#fff', borderColor: purple }
                  : { backgroundColor: '#faf5ff', color: purple, borderColor: '#e9d5ff' }}
              >
                {formatNGN(a)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Custom amount</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₦</span>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Method */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Payment method</p>
          <div className="flex flex-col gap-2">
            {FUND_METHODS.map(m => {
              const Icon = m.icon
              const active = method === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                  style={active
                    ? { borderColor: purple, backgroundColor: '#faf5ff' }
                    : { borderColor: '#e5e7eb', backgroundColor: '#fff' }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: active ? purple + '18' : '#f3f4f6' }}>
                    <Icon className="w-4 h-4" style={{ color: active ? purple : '#6b7280' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: active ? purple : '#d1d5db', backgroundColor: active ? purple : 'transparent' }}>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleFund}
          disabled={!amount || Number(amount) < 20000 || funding}
          className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
          style={{ backgroundColor: purple }}
        >
          {funding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {funding ? 'Processing…' : `Fund ${amount ? formatNGN(Number(amount)) : 'Wallet'}`}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Minimum ₦20,000 · Card payments processed via Interswitch · Wallet credited after confirmation
        </p>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border border-brand-lav shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-lav flex items-center justify-between">
          <h3 className="font-bold" style={{ color: "#1e0040" }}>Transaction History</h3>
          <span className="text-xs text-gray-400">{txns.length} records</span>
        </div>
        {txns.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ArrowUpRight className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {txns.map(t => {
              const sc = txnStatusColor(t.payment_status)
              return (
                <div key={t.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f3e8ff' }}>
                    <ArrowUpRight className="w-4 h-4" style={{ color: purple }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {t.content_type || 'Collab'} · {t.creator?.full_name || 'Creator'}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800">{formatNGN(t.total_amount)}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: sc.bg, color: sc.color }}>
                      {txnStatusLabel(t.payment_status)}
                    </span>
                  </div>
                </div>
              )
            })}
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
        <h2 className="text-xl font-black text-brand-dpurple">Saved Talents</h2>
        <span className="text-sm text-gray-400">{favorites.length} saved</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map(talent => {
          const faved = isFav(talent._id || talent.id)
          const tier = TIER_STYLE[talent.tier] || TIER_STYLE['fast-rising']
          return (
            <div key={talent._id || talent.id}
              className="bg-white rounded-2xl border border-brand-lav shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
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
                  View Profile & Collab
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const INDUSTRIES = ['Fashion & Beauty', 'Food & Beverage', 'Tech & Gadgets', 'Health & Wellness', 'Finance & Fintech', 'Travel & Hospitality', 'Entertainment', 'Sports & Fitness', 'Real Estate', 'Education', 'Automotive', 'Retail & E-commerce', 'Other']

const BRAND_TIER_STEPS = [
  { key: 'dynamo',   label: 'Dynamo',   color: '#F72585', completions: 3,  creators: 2,  desc: 'First milestone. Keep building creator relationships.' },
  { key: 'elite',    label: 'Elite',    color: '#f59e0b', completions: 10, creators: 4,  desc: 'Established brand. Creators trust and return to work with you.' },
  { key: 'champion', label: 'Champion', color: '#7c3aed', completions: 22, creators: 9,  desc: 'Top brand on Brandior. Known for consistent, paid collaborations.' },
  { key: 'supremo',  label: 'Supremo',  color: '#D4AF37', completions: 40, creators: 16, desc: 'The pinnacle of brand achievement on Brandior. Among the most trusted and active.' },
]

function computeBrandTierFromStats(completions, creators) {
  for (let i = BRAND_TIER_STEPS.length - 1; i >= 0; i--) {
    const t = BRAND_TIER_STEPS[i]
    if (completions >= t.completions && creators >= t.creators) return t
  }
  return null
}

function SettingsTab() {
  const [saved,          setSaved]          = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [loading,        setLoading]        = useState(true)
  const [form,           setForm]           = useState({ companyName: '', ownerName: '', industry: '', website: '', email: '' })
  const [pwForm,         setPwForm]         = useState({ current: '', next: '', confirm: '' })
  const [pwSaving,       setPwSaving]       = useState(false)
  const [pwMsg,          setPwMsg]          = useState(null)
  const [downloading,    setDownloading]    = useState(false)
  const [brandStats,     setBrandStats]     = useState({ completions: 0, creators: 0 })

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      // Load brand achievement stats
      supabase.from('collabs').select('creator_id').eq('brand_id', user.id)
        .eq('status', 'completed').eq('payment_status', 'released')
        .then(({ data }) => {
          if (data) setBrandStats({
            completions: data.length,
            creators: new Set(data.map(c => c.creator_id)).size,
          })
        })
      const { data: profile } = await supabase.from('profiles').select('company_name, owner_name, industry, website, full_name').eq('id', user.id).maybeSingle()
      const meta = user.user_metadata || {}
      setForm({
        companyName: profile?.company_name || meta.brand_name || meta.full_name || '',
        ownerName:   profile?.owner_name   || profile?.full_name || meta.full_name || '',
        industry:    profile?.industry     || meta.industry || '',
        website:     profile?.website      || meta.website  || '',
        email:       user.email            || '',
      })
      setLoading(false)
    })()
  }, [])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({
        id:           user.id,
        company_name: form.companyName.trim(),
        owner_name:   form.ownerName.trim(),
        industry:     form.industry,
        website:      form.website.trim(),
      }, { onConflict: 'id' })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleChangePassword() {
    if (!pwForm.next || pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' }); return
    }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    setPwSaving(false)
    if (error) { setPwMsg({ type: 'error', text: error.message }); return }
    setPwMsg({ type: 'success', text: 'Password updated successfully.' })
    setPwForm({ current: '', next: '', confirm: '' })
    setTimeout(() => setPwMsg(null), 4000)
  }

  async function handleDownloadData() {
    setDownloading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')
      const [{ data: profile }, { data: notifications }, { data: collabs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('collabs').select('*').eq('brand_id', user.id).order('created_at', { ascending: false }),
      ])
      const json = JSON.stringify({
        exported_at: new Date().toISOString(),
        account:     { email: user.email, created_at: user.created_at },
        profile:     profile ?? {},
        notifications: notifications ?? [],
        collabs:     collabs ?? [],
      }, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `brandior-data-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Export failed: ' + (e.message || 'Something went wrong.'))
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>

  const field = (label, key, opts = {}) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type={opts.type || 'text'}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: stripInjection(e.target.value) }))}
        placeholder={opts.placeholder || ''}
        disabled={opts.disabled}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  )

  const currentBrandTier = computeBrandTierFromStats(brandStats.completions, brandStats.creators)
  const currentTierIdx  = currentBrandTier ? BRAND_TIER_STEPS.findIndex(t => t.key === currentBrandTier.key) : -1
  const nextBrandTier   = currentTierIdx < BRAND_TIER_STEPS.length - 1 ? BRAND_TIER_STEPS[currentTierIdx + 1] : null
  const isMaxBrandTier  = currentTierIdx === BRAND_TIER_STEPS.length - 1

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-black" style={{ color: darkPurple }}>Brand Settings</h2>

      {/* Brandior Achievement */}
      <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${currentBrandTier ? currentBrandTier.color + '22' : '#F7258520'}`, backgroundColor: '#0d0020', ...(isMaxBrandTier && currentBrandTier ? { boxShadow: `0 0 0 1px ${currentBrandTier.color}40` } : {}) }}>
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Brandior Achievement</p>
          <div className="flex items-start justify-between gap-3">
            <div>
              {currentBrandTier ? (
                <>
                  <p className="text-3xl font-black tracking-tight" style={{ color: currentBrandTier.color, letterSpacing: '-0.02em' }}>{currentBrandTier.label}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{currentBrandTier.desc}</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-black tracking-tight" style={{ color: '#F7258550', letterSpacing: '-0.02em' }}>Dynamo</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Hire creators and complete paid collabs to unlock</p>
                </>
              )}
            </div>
            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ backgroundColor: currentBrandTier ? `${currentBrandTier.color}15` : '#F7258508', border: `1px solid ${currentBrandTier ? currentBrandTier.color + '30' : '#F7258525'}` }}>
              {currentBrandTier ? <Award className="w-4 h-4" style={{ color: currentBrandTier.color }} /> : <Lock className="w-4 h-4" style={{ color: '#F7258550' }} />}
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          {isMaxBrandTier ? (
            <div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{currentBrandTier.desc}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-3" style={{ color: currentBrandTier.color + '80' }}>Pinnacle</p>
            </div>
          ) : nextBrandTier ? (
            <>
              <p className="text-[11px] font-semibold mb-3" style={{ color: nextBrandTier.color + '99' }}>Progress to {nextBrandTier.label}</p>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Paid completions</p>
                    <p className="text-xs font-bold" style={{ color: nextBrandTier.color }}>{brandStats.completions} / {nextBrandTier.completions}</p>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (brandStats.completions / nextBrandTier.completions) * 100)}%`, backgroundColor: nextBrandTier.color }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Unique creators</p>
                    <p className="text-xs font-bold" style={{ color: nextBrandTier.color }}>{brandStats.creators} / {nextBrandTier.creators}</p>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (brandStats.creators / nextBrandTier.creators) * 100)}%`, backgroundColor: nextBrandTier.color }} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div>
              <p className="text-[11px] font-semibold mb-2" style={{ color: '#F72585' + '99' }}>Progress to Dynamo</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Complete 3 paid collaborations with at least 2 unique creators.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-lav shadow-sm p-6 space-y-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Brand Info</p>
        {field('Company / Brand name', 'companyName', { placeholder: 'e.g. GlowUp Cosmetics' })}
        {field('Owner / Contact name', 'ownerName',   { placeholder: 'e.g. Chisom Adeyemi' })}
        {field('Website', 'website', { type: 'url', placeholder: 'https://yourbrand.com' })}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Industry</label>
          <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: stripInjection(e.target.value) }))}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 bg-white">
            <option value="">Select industry…</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-lav shadow-sm p-6 space-y-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Account</p>
        {field('Email', 'email', { type: 'email', disabled: true })}
        <p className="text-xs text-gray-400">To change your email, contact support@brandior.africa</p>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-full text-sm font-bold text-white transition-colors disabled:opacity-60"
        style={{ backgroundColor: saved ? '#16a34a' : darkPurple }}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
      </button>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-brand-lav shadow-sm p-6 space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Change Password</p>
        {['next', 'confirm'].map(k => (
          <div key={k}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              {k === 'next' ? 'New password' : 'Confirm new password'}
            </label>
            <input type="password" value={pwForm[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))}
              placeholder={k === 'next' ? 'At least 8 characters' : 'Repeat new password'}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300" />
          </div>
        ))}
        {pwMsg && (
          <p className={`text-xs font-semibold ${pwMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{pwMsg.text}</p>
        )}
        <button onClick={handleChangePassword} disabled={pwSaving || !pwForm.next || !pwForm.confirm}
          className="w-full py-3 rounded-full text-sm font-bold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: darkPurple }}>
          {pwSaving ? 'Updating…' : 'Update Password'}
        </button>
      </div>

      {/* Privacy & Data */}
      <div className="bg-white rounded-2xl border border-brand-lav shadow-sm p-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Privacy & Data</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Download my data</p>
            <p className="text-xs text-gray-400 mt-0.5">Get a JSON export of your account, collabs, and notifications</p>
          </div>
          <button onClick={handleDownloadData} disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: darkPurple }}>
            <Download className="w-4 h-4" />
            {downloading ? 'Exporting…' : 'Download Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Brand Notifications Tab ────────────────────────────────────────────────────

const BRAND_NOTIF_ICONS = {
  delivered:          { color: '#7c3aed', bg: '#f3e8ff' },
  new_collab:         { color: '#2563eb', bg: '#dbeafe' },
  revision_requested: { color: '#ea580c', bg: '#fff7ed' },
  completed:          { color: '#16a34a', bg: '#dcfce7' },
  message:            { color: '#0284c7', bg: '#e0f2fe' },
  default:            { color: '#6b7280', bg: '#f3f4f6' },
}

function BrandNotificationsTab() {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)
  const [prefs, setPrefs] = useState({ creatorMatch: true, platformUpdate: true })

  useEffect(() => {
    const stored = localStorage.getItem('brandior_notif_prefs')
    if (stored) { try { setPrefs(JSON.parse(stored)) } catch {} }
  }, [])

  function togglePref(key) {
    setPrefs(p => {
      const next = { ...p, [key]: !p[key] }
      localStorage.setItem('brandior_notif_prefs', JSON.stringify(next))
      return next
    })
  }

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
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    })()
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
    </div>
  )

  const PREF_ITEMS = [
    { key: 'creatorMatch',   label: 'Creator Matches',  desc: 'Creators matching your active campaigns',   color: '#c084fc' },
    { key: 'platformUpdate', label: 'New Features',     desc: 'New features and announcements',            color: '#94a3b8' },
  ]

  return (
    <div className="space-y-6">
      {/* Preferences section */}
      <div>
        <h2 className="text-xl font-black mb-4" style={{ color: darkPurple }}>Notification Preferences</h2>
        <div className="bg-white rounded-2xl border border-brand-lav shadow-sm divide-y divide-gray-50">
          {PREF_ITEMS.map(({ key, label, desc, color }) => (
            <div key={key} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <div>
                  <p className="text-sm font-bold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
              <button onClick={() => togglePref(key)}
                className="w-11 h-6 rounded-full flex items-center transition-colors duration-200 flex-shrink-0"
                style={{ backgroundColor: prefs[key] ? darkPurple : '#d1d5db' }}>
                <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ml-0.5"
                  style={{ transform: prefs[key] ? 'translateX(20px)' : 'translateX(0)', width: '18px', height: '18px', minWidth: '18px' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black" style={{ color: darkPurple }}>Recent Activity</h2>
        {notifs.length > 0 && (
          <span className="text-xs text-gray-400">{notifs.filter(n => !n.read).length} unread</span>
        )}
      </div>
      {notifs.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20 text-gray-400" />
          <p className="font-semibold text-gray-500">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">We'll let you know when creators submit work or respond to your collabs</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const meta = BRAND_NOTIF_ICONS[n.type] || BRAND_NOTIF_ICONS.default
            return (
              <div key={n.id} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: n.read ? 'white' : meta.bg, border: `1px solid ${n.read ? '#e5e7eb' : meta.color + '30'}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: meta.bg, border: `1px solid ${meta.color}20` }}>
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
    </div>
  )
}

// ── Brand's sent custom offers panel ─────────────────────────────────────────
function BrandCustomOffersPanel() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [withdrawing, setWithdrawing] = useState(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('custom_offers')
        .select('*, creator:profiles!creator_id(id, full_name, avatar_url)')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false })
      setOffers(data || [])
      setLoading(false)
    })()
  }, [])

  async function withdrawOffer(id) {
    setWithdrawing(id)
    await supabase.from('custom_offers').update({ status: 'withdrawn' }).eq('id', id)
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'withdrawn' } : o))
    setWithdrawing(null)
  }

  if (loading || offers.length === 0) return null

  const STATUS_MAP = {
    offer_pending: { label: 'Awaiting response', bg: '#fef9c3', color: '#854d0e' },
    accepted:      { label: 'Accepted', bg: '#dcfce7', color: '#15803d' },
    declined:      { label: 'Declined', bg: '#fef2f2', color: '#991b1b' },
    withdrawn:     { label: 'Withdrawn', bg: '#f3f4f6', color: '#6b7280' },
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Send className="w-4 h-4" style={{ color: purple }} />
        <p className="font-black text-gray-900 text-sm">Custom Offers Sent</p>
        <span className="text-xs text-gray-400 font-medium">{offers.length} total</span>
      </div>
      <div className="space-y-3">
        {offers.map(o => {
          const creatorName = o.creator?.full_name || 'Creator'
          const s = STATUS_MAP[o.status] || STATUS_MAP.offer_pending
          const isOpen = expanded === o.id
          return (
            <div key={o.id} className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${purple}25` }}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{o.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">To {creatorName} · {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="font-black text-sm" style={{ color: '#22c55e' }}>₦{Number(o.budget).toLocaleString()}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                </div>
                <button onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="text-xs font-semibold flex items-center gap-1 mb-2" style={{ color: purple }}>
                  {isOpen ? 'Hide' : 'View brief'} <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                  <div className="mb-3 space-y-2 text-xs text-gray-600 leading-relaxed">
                    <p>{o.brief}</p>
                    {o.deliverables?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {o.deliverables.map(d => (
                          <span key={d} className="px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${darkPurple}10`, color: darkPurple }}>{d}</span>
                        ))}
                      </div>
                    )}
                    {o.timeline && <p className="flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {o.timeline}</p>}
                  </div>
                )}
                {o.status === 'offer_pending' && (
                  <button onClick={() => withdrawOffer(o.id)} disabled={withdrawing === o.id}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-40">
                    {withdrawing === o.id ? 'Withdrawing…' : 'Withdraw offer'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
