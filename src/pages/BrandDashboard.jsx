import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { stripInjection } from '../utils/sanitize'
import { logout } from '../lib/logout'
import { getLogo } from '../lib/brandSettings'
import {
  LayoutDashboard, ShoppingBag, CheckCircle, Wallet, Settings,
  Bell, ChevronDown, ChevronRight, X, AlertCircle, Shield, Loader2,
  ExternalLink, Download, RotateCcw, Zap, Menu, Mail, Heart, MapPin, Star, Users, Search, UserPlus, LogOut,
  Inbox, Clock, ThumbsUp, ThumbsDown, MessageSquare, FileText, TrendingUp, Send, ArrowLeftRight,
  Plus, CreditCard, Building2, ArrowUpRight,
} from 'lucide-react'
import MessagingPanel from '../components/MessagingPanel'
import InviteTab from '../components/InviteTab'
import { useFavorites } from '../hooks/useFavorites'
import { supabase } from '../lib/supabase'
import { createNotification, sendNotificationEmail } from '../lib/notifications'
import { getBrandAnalytics } from '../lib/analytics'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import OnboardingTour from '../components/OnboardingTour'

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
                <span title={order.package.platform} className="inline-flex items-center rounded-lg overflow-hidden flex-shrink-0" style={{ lineHeight: 0 }}>
                  <PlatformIcon platform={order.package.platform} size={20} />
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-1.5">{order.brief?.productName} · {timeAgo(order.createdAt)}</p>
            <StatusBadge status={order.status} />
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
  { id: 'overview',       label: 'Overview',        icon: LayoutDashboard },
  { id: 'analytics',      label: 'Analytics',       icon: TrendingUp },
  { id: 'notifications',  label: 'Notifications',   icon: Bell },
  { id: 'collabs',        label: 'Collabs',         icon: ShoppingBag },
  { id: 'favorites',      label: 'Saved Talents',   icon: Heart },
  { id: 'messages',       label: 'Messages',        icon: Mail },
  { id: 'wallet',         label: 'Wallet',          icon: Wallet },
  { id: 'payments',       label: 'Payments',        icon: ArrowLeftRight },
  { id: 'invite',         label: 'Invite Creators', icon: UserPlus },
  { id: 'settings',       label: 'Settings',        icon: Settings },
]

const TIER_INFO = {
  'fast-rising': { label: 'Fast Rising', color: '#22c55e' },
  'next-rated':  { label: 'Next',        color: '#a78bfa', diamond: true },
  'top-rated':   { label: 'Top',         color: '#D4AF37', diamond: true },
}

function initials(name) {
  return (name || '??').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function FindTalentsTab() {
  const [search, setSearch] = useState('')
  const [nicheFilter, setNicheFilter] = useState('All')
  const [talents, setTalents] = useState([])
  const [loading, setLoading] = useState(true)
  const niches = ['All', 'Beauty & Skincare', 'Fashion & Style', 'Food & Cooking', 'Tech & Gadgets', 'Fitness & Wellness', 'Comedy', 'Finance & Business']

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, handle, location, niches, tier, avg_rating, min_price, avatar_url')
        .eq('role', 'creator')
        .order('avg_rating', { ascending: false })
        .limit(12)
      setTalents(data || [])
      setLoading(false)
    })()
  }, [])

  const filtered = talents.filter(t => {
    if (search && !t.full_name?.toLowerCase().includes(search.toLowerCase()) && !t.handle?.toLowerCase().includes(search.toLowerCase())) return false
    if (nicheFilter !== 'All' && !(t.niches || []).includes(nicheFilter)) return false
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
          onChange={e => setSearch(stripInjection(e.target.value))}
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
      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>
      ) : (
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <p className="col-span-2 text-center text-sm text-gray-400 py-8">No creators found</p>
        ) : filtered.map(t => {
          const tier = TIER_INFO[t.tier] || TIER_INFO['fast-rising']
          const handle = t.handle ? `@${t.handle}` : ''
          const niche = (t.niches || [])[0] || ''
          return (
            <Link key={t.id} to={`/creators/${t.handle || t.id}`}
              className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 8px rgba(192,132,252,0.07)' }}>
              {/* Avatar */}
              {t.avatar_url
                ? <img src={t.avatar_url} alt={t.full_name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                : <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: purple }}>
                    {initials(t.full_name)}
                  </div>
              }

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-bold text-brand-dark text-sm truncate">{t.full_name}</p>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: tier.color, backgroundColor: `${tier.color}18`, border: `1px solid ${tier.color}40` }}>
                    {tier.label}
                    {tier.diamond && <svg width="7" height="7" viewBox="0 0 24 24" fill={tier.color}><path d="M12 2L2 9l10 13L22 9z"/></svg>}
                  </span>
                </div>
                <p className="text-brand-dark/40 text-xs mb-1">{handle}{t.location ? ` · ${t.location}` : ''}</p>
                {niche && <p className="text-xs text-brand-dark/50 mb-2">{niche}</p>}

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-0.5" style={{ color: purple }}><Star className="w-3 h-3 fill-current" />{(t.avg_rating || 5).toFixed(1)}</span>
                  {t.min_price > 0 && <span className="font-semibold ml-auto" style={{ color: darkPurple }}>from ₦{t.min_price.toLocaleString()}</span>}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      )}

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

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [fetchOrders])

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
    showToast('Payment successful! Funds held in escrow.')
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
    <div className="min-h-screen bg-gray-50 flex">
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
          <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} dashLogo={dashLogo} />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="bg-black/40 flex-1" onClick={() => setSidebarOpen(false)} />
            <aside className="w-60 flex flex-col" style={{ backgroundColor: 'var(--b-brandDashBg)' }}>
              <SidebarContent activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false) }} dashLogo={dashLogo} />
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

      {reviewModal && (
        <ReviewModal
          order={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmitted={() => showToast('Review submitted! Thank you.')}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

function BrandAvatarMenu() {
  const [open, setOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setUserEmail(session.user.email)
    })
  }, [])

  function handleSwitchToCreator() {
    setOpen(false)
    localStorage.setItem('brandiór_role', 'talent')
    navigate('/dashboard')
  }

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="relative focus:outline-none">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: darkPurple }}>
          {userEmail ? userEmail[0].toUpperCase() : 'B'}
        </div>
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
            onClick={handleSwitchToCreator}
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium w-full transition-colors text-left"
            style={{ color: '#F72585' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(247,37,133,0.08)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
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

function SidebarContent({ activeTab, setActiveTab, dashLogo }) {
  const navigate = useNavigate()

  function switchToCreator() {
    localStorage.setItem('brandiór_role', 'talent')
    navigate('/dashboard')
  }

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
            onClick={() => setActiveTab(id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
            style={
              activeTab === id
                ? { backgroundColor: 'color-mix(in srgb, var(--b-brandMenuBg) 20%, transparent)', color: 'white' }
                : { color: 'rgba(255,255,255,0.6)' }
            }
            onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--b-brandMenuBg) 10%, transparent)' }}
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
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link to="/marketplace" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <ExternalLink className="w-4 h-4" />
          Browse Talents
        </Link>
        <button onClick={switchToCreator}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left"
          style={{ color: '#F72585' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(247,37,133,0.08)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
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
      <h2 className="text-xl font-bold text-gray-900">Analytics</h2>

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

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Collab status breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
          <p className="font-bold text-gray-900 mb-4">Collab Status</p>
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
          <p className="font-bold text-gray-900 mb-4">Top Creators by Collabs</p>
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
      <h2 className="text-xl font-bold text-gray-900">Overview</h2>

      {/* New account onboarding */}
      {isNewAccount && (
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #1a0035 0%, #3d0080 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#c4b5fd' }}>Getting Started</p>
          <h3 className="text-white font-bold text-lg mb-1">Book your first creator collab</h3>
          <p className="text-white/45 text-sm mb-5">Find the right creators, set up a collab, and track results — all in one place.</p>
          <div className="flex flex-wrap gap-5 mb-5">
            {[
              { n: 1, label: 'Browse the marketplace' },
              { n: 2, label: 'Set up a collab' },
              { n: 3, label: 'Track your results here' },
            ].map(({ n, label }) => (
              <div key={n} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.3)' }}>{n}</div>
                {label}
              </div>
            ))}
          </div>
          <Link to="/marketplace"
            className="inline-block px-5 py-2.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: purple }}>
            Browse Creators →
          </Link>
        </div>
      )}

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
            <h3 className="font-bold text-gray-900">Top Creators</h3>
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

// ── Brand Wallet Tab ─────────────────────────────────────────────────────────

const FUND_METHODS = [
  { id: 'card',  label: 'Debit / Credit Card', icon: CreditCard,  desc: 'Instant via Paystack' },
  { id: 'bank',  label: 'Bank Transfer',        icon: Building2,   desc: 'Transfer to virtual account' },
]

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000]

function WalletTab() {
  const [balance,  setBalance]  = useState(0)
  const [userId,   setUserId]   = useState(null)
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(true)
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
    if (!document.getElementById('paystack-js')) {
      const s = document.createElement('script')
      s.id = 'paystack-js'
      s.src = 'https://js.paystack.co/v1/inline.js'
      document.head.appendChild(s)
    }
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      setEmail(user.email || '')
      await reload(user.id)
      setLoading(false)
    })()
  }, [])

  async function handleFund() {
    const amt = Number(amount)
    if (!amt || amt < 500) return
    setFunding(true)

    if (method === 'card') {
      const pk = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
      if (!pk || !window.PaystackPop) {
        alert('Paystack public key not configured. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file.')
        setFunding(false); return
      }
      const handler = window.PaystackPop.setup({
        key: pk,
        email,
        amount: amt * 100,
        currency: 'NGN',
        metadata: { purpose: 'wallet_topup', user_id: userId },
        callback: async () => {
          const newBalance = balance + amt
          await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId)
          setBalance(newBalance)
          setAmount('')
          setSuccess(true)
          setTimeout(() => setSuccess(false), 4000)
          setFunding(false)
        },
        onClose: () => setFunding(false),
      })
      handler.openIframe()
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

  const txnStatusLabel = (ps) => ps === 'released' ? 'Released' : ps === 'paid' ? 'In Escrow' : ps === 'refunded' ? 'Refunded' : ps
  const txnStatusColor = (ps) => ps === 'released' ? { bg: '#dcfce7', color: '#166534' } : ps === 'paid' ? { bg: '#dbeafe', color: '#1e40af' } : { bg: '#fee2e2', color: '#991b1b' }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">Wallet</h2>

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

      {/* Fund wallet */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
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
          disabled={!amount || Number(amount) < 500 || funding}
          className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
          style={{ backgroundColor: purple }}
        >
          {funding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {funding ? 'Processing…' : `Fund ${amount ? formatNGN(Number(amount)) : 'Wallet'}`}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Minimum ₦500 · Funds appear instantly on card · Escrow protects every collab payment
        </p>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Transaction History</h3>
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

function SettingsTab() {
  const [saved,    setSaved]    = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [form, setForm] = useState({ companyName: '', ownerName: '', industry: '', website: '', email: '' })

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: profile } = await supabase.from('profiles').select('company_name, owner_name, industry, website, full_name').eq('id', user.id).maybeSingle()
      setForm({
        companyName: profile?.company_name || '',
        ownerName:   profile?.owner_name   || profile?.full_name || '',
        industry:    profile?.industry     || '',
        website:     profile?.website      || '',
        email:       user.email            || '',
      })
      setLoading(false)
    })()
  }, [])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        company_name: form.companyName.trim(),
        owner_name:   form.ownerName.trim(),
        industry:     form.industry,
        website:      form.website.trim(),
      }).eq('id', user.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
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

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-black" style={{ color: darkPurple }}>Brand Settings</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Account</p>
        {field('Email', 'email', { type: 'email', disabled: true })}
        <p className="text-xs text-gray-400">To change your email, contact support@brandior.africa</p>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-full text-sm font-bold text-white transition-colors disabled:opacity-60"
        style={{ backgroundColor: saved ? '#16a34a' : darkPurple }}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
      </button>
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black" style={{ color: darkPurple }}>Notifications</h2>
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
