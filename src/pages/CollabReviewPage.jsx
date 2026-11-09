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
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ backgroundColor: '#f7f4ff' }}>
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

    // Notify creator of new brief
    const { data: creatorProfile } = await supabase.from('profiles').select('email, full_name, username').eq('id', creatorId).single()
    const { data: brandProfile }   = await supabase.from('profiles').select('full_name, company_name').eq('id', brandId).single()
    if (creatorProfile?.email) {
      supabase.functions.invoke('send-email', {
        body: {
          type: 'new_brief',
          to:   creatorProfile.email,
          data: {
            creatorName:  creatorProfile.full_name || creatorProfile.username || 'Creator',
            brandName:    brandProfile?.company_name || brandProfile?.full_name || 'A brand',
            collabTitle:  brief?.productName || contentType || 'Collaboration',
            budget:       `₦${Number(total ?? 0).toLocaleString()}`,
            deadline:     brief?.deadline ? new Date(brief.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD',
            briefUrl:     'https://app.brandior.africa/dashboard',
          },
        },
      }).catch(() => {})
    }

    navigate('/brand-dashboard?tab=collabs', { state: { collabCreated: true } })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f4ff' }}>
      <Helmet><title>Review Collab | Brandior</title></Helmet>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 transition-opacity hover:opacity-70"
          style={{ color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-xl font-black mb-6" style={{ color: '#1e0040' }}>Review Collab</h1>

        {/* Creator pill */}
        <div className="flex items-center gap-3 rounded-2xl p-4 mb-4"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: (creator?.color || '#7c3aed') + '22', color: creator?.color || '#7c3aed' }}>
            {creator?.initials || creator?.name?.[0] || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: '#1e0040' }}>{creator?.name}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(76,29,149,0.5)' }}>{creator?.role || ''}</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: darkPurple }}>
            <BadgeCheck className="w-3.5 h-3.5" /> Verified
          </span>
        </div>

        {/* Collab details */}
        <div className="rounded-2xl p-5 mb-4"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'rgba(76,29,149,0.5)' }}>Collab Details</p>
          <Row label="Content Type" value={typeLabel || '—'} />
          <Row label="Duration" value={durationLabel || '—'} />
          {platforms.length > 0 && <Row label="Platforms" value={platforms.join(', ')} />}
          {brief?.productName && <Row label="Product" value={brief.productName} />}
          {brief?.goal && <Row label="Goal" value={brief.goal} />}
          {brief?.deadline && <Row label="Deadline" value={brief.deadline} />}
          {brief?.instructions && (
            <div className="pt-3 mt-1" style={{ borderTop: '1px solid rgba(124,58,237,0.06)' }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'rgba(76,29,149,0.6)' }}>Brief instructions</p>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{brief.instructions}</p>
            </div>
          )}
        </div>

        {/* Price breakdown */}
        <div className="rounded-2xl p-5 mb-4"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'rgba(76,29,149,0.5)' }}>Price Breakdown</p>
          {breakdown?.length > 0 ? (
            breakdown.map((line, i) => (
              <Row key={i} label={line.label} value={fmt(line.amount)} last={i === breakdown.length - 1} />
            ))
          ) : (
            <Row label={typeLabel || 'Collab'} value={fmt(total)} last />
          )}
          <div className="flex justify-between items-center pt-3 mt-2" style={{ borderTop: '2px solid rgba(124,58,237,0.1)' }}>
            <span className="text-sm font-extrabold" style={{ color: '#1e0040' }}>Total</span>
            <span className="text-lg font-extrabold" style={{ color: darkPurple }}>{fmt(total)}</span>
          </div>
        </div>

        {/* Payment protection notice */}
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Payment Protected</p>
            <p className="text-xs text-green-600 mt-0.5">Your payment is held safely — released only when you approve the content</p>
          </div>
        </div>

        {/* T&C */}
        <label className="flex items-start gap-3 rounded-2xl p-4 cursor-pointer mb-4"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(124,58,237,0.1)' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-purple-700 flex-shrink-0"
          />
          <span className="text-sm leading-relaxed" style={{ color: 'rgba(76,29,149,0.6)' }}>
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
          style={{ backgroundColor: darkPurple, boxShadow: agreed ? '0 4px 20px rgba(76,29,149,0.3)' : 'none' }}
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
    <div className="flex justify-between items-start gap-3 py-2.5"
      style={!last ? { borderBottom: '1px solid rgba(124,58,237,0.06)' } : {}}>
      <span className="text-sm flex-shrink-0" style={{ color: 'rgba(76,29,149,0.5)' }}>{label}</span>
      <span className="text-sm font-semibold text-right" style={{ color: '#1e0040' }}>{value}</span>
    </div>
  )
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: '#0d0020', borderBottom: '1px solid rgba(192,132,252,0.15)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4c1d95' }}>
            <Zap className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">Brandior</span>
        </Link>
      </div>
    </nav>
  )
}
