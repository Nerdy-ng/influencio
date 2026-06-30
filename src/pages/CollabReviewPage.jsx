import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronLeft, Zap, ShieldCheck, Lock, ArrowRight, BadgeCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

const darkPurple = '#4c1d95'
const PLATFORM_FEE_RATE = 0.10

function fmt(n) {
  return '₦' + Number(n || 0).toLocaleString('en')
}

export default function CollabReviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const collab = location.state

  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!collab) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-gray-500 mb-4">No collab in progress.</p>
          <button onClick={() => navigate('/marketplace')} className="px-6 py-2.5 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: darkPurple }}>
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  const { creator, creatorId, contentType, total, typeLabel, durationLabel, platforms = [], addons = [], brief, breakdown } = collab

  async function submit() {
    if (!agreed || submitting) return
    setSubmitting(true)
    setError(null)

    const productionCost = breakdown?.[0]?.amount ?? total ?? 0
    const postingCost = (breakdown || [])
      .filter(b => b.label.includes('posting'))
      .reduce((s, b) => s + b.amount, 0)
    const addonsCost = Math.max((total ?? 0) - productionCost - postingCost, 0)
    const platformFee = Math.round((total ?? 0) * PLATFORM_FEE_RATE)
    const brandId = localStorage.getItem('brandiór_user')

    const { error: dbError } = await supabase.from('collabs').insert({
      brand_id: brandId,
      creator_id: creatorId,
      content_type: contentType,
      duration_label: durationLabel,
      duration_price: productionCost,
      platforms,
      addons,
      production_cost: productionCost,
      posting_cost: postingCost,
      addons_cost: addonsCost,
      total_amount: total ?? 0,
      platform_fee: platformFee,
      creator_payout: (total ?? 0) - platformFee,
      brief: brief || {},
      agreed_to_terms: true,
      agreed_to_terms_at: new Date().toISOString(),
      status: 'pending',
      payment_status: 'unpaid',
    })

    setSubmitting(false)
    if (dbError) { setError(dbError.message); return }

    navigate('/brand-dashboard?tab=collabs', { state: { collabCreated: true } })
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet><title>Review Collab | Brandior</title></Helmet>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-xl font-extrabold text-gray-900 mb-6">Review Collab</h1>

        {/* Creator pill */}
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: (creator?.color || '#7c3aed') + '22', color: creator?.color || '#7c3aed' }}>
            {creator?.initials || creator?.name?.[0] || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{creator?.name}</p>
            <p className="text-xs text-gray-400 truncate">{creator?.role || ''}</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: darkPurple + '12', color: darkPurple }}>
            <BadgeCheck className="w-3.5 h-3.5" /> Verified
          </span>
        </div>

        {/* Collab details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Collab Details</p>
          <Row label="Content Type" value={typeLabel || '—'} />
          <Row label="Duration" value={durationLabel || '—'} />
          {platforms.length > 0 && <Row label="Platforms" value={platforms.join(', ')} />}
          {brief?.productName && <Row label="Product" value={brief.productName} />}
          {brief?.goal && <Row label="Goal" value={brief.goal} />}
          {brief?.deadline && <Row label="Deadline" value={brief.deadline} />}
          {brief?.instructions && (
            <div className="pt-3 mt-1 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Brief instructions</p>
              <p className="text-sm text-gray-700 leading-relaxed">{brief.instructions}</p>
            </div>
          )}
        </div>

        {/* Price breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Price Breakdown</p>
          {breakdown?.length > 0 ? (
            breakdown.map((line, i) => (
              <Row key={i} label={line.label} value={fmt(line.amount)} last={i === breakdown.length - 1} />
            ))
          ) : (
            <Row label={typeLabel || 'Collab'} value={fmt(total)} last />
          )}
          <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-100">
            <span className="text-sm font-extrabold text-gray-900">Total</span>
            <span className="text-lg font-extrabold" style={{ color: darkPurple }}>{fmt(total)}</span>
          </div>
        </div>

        {/* Escrow notice */}
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Secured by escrow</p>
            <p className="text-xs text-green-600 mt-0.5">Your payment is held safely — released only when you approve the content</p>
          </div>
        </div>

        {/* T&C */}
        <label className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-purple-700 flex-shrink-0"
          />
          <span className="text-sm text-gray-500 leading-relaxed">
            I have read and agree to Brandior's{' '}
            <Link to="/terms" className="font-semibold" style={{ color: darkPurple }}>Terms & Conditions</Link>
            {' '}and{' '}
            <Link to="/terms" className="font-semibold" style={{ color: darkPurple }}>Collaboration Policy</Link>
          </span>
        </label>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button
          onClick={submit}
          disabled={!agreed || submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-sm font-bold transition-opacity disabled:opacity-40"
          style={{ backgroundColor: darkPurple }}
        >
          {!agreed && <Lock className="w-4 h-4 opacity-60" />}
          {submitting ? 'Creating collab…' : agreed ? `Confirm Collab · ${fmt(total)}` : 'Agree to terms to continue'}
          {agreed && !submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, last }) {
  return (
    <div className={`flex justify-between items-start gap-3 py-2.5 ${!last ? 'border-b border-gray-50' : ''}`}>
      <span className="text-sm text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
  )
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: darkPurple }}>
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: darkPurple }}>Brandior</span>
        </Link>
      </div>
    </nav>
  )
}
