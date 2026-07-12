import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '');
import { Helmet } from 'react-helmet-async'
import { ChevronLeft, Zap, ArrowRight } from 'lucide-react'

const darkPurple = '#4c1d95'

function fmt(n) {
  return '₦' + Number(n || 0).toLocaleString('en')
}

export default function CollabBriefPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const collab = location.state

  const [productName, setProductName] = useState('')
  const [goal, setGoal] = useState('')
  const [instructions, setInstructions] = useState('')
  const [deadline, setDeadline] = useState('')

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

  const { creator, total, typeLabel, durationLabel } = collab
  const canContinue = productName.trim().length > 0 && goal.trim().length > 0

  function goToReview() {
    if (!canContinue) return
    navigate('/collab/review', {
      state: { ...collab, brief: { productName, goal, instructions, deadline } },
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet><title>Project Brief | Brandior</title></Helmet>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-xl font-extrabold text-gray-900 mb-6">Project Brief</h1>

        {/* Collab summary pill */}
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: (creator?.color || '#7c3aed') + '22', color: creator?.color || '#7c3aed' }}>
            {creator?.initials || creator?.name?.[0] || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{creator?.name}</p>
            <p className="text-xs text-gray-400">{typeLabel} · {durationLabel}</p>
          </div>
          <p className="text-base font-extrabold" style={{ color: darkPurple }}>{fmt(total)}</p>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Tell the creator what you need so they can deliver exactly what works for your brand.
        </p>

        <div className="space-y-5">
          <Field label="Product or Service" required>
            <input
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-purple-400"
              placeholder="e.g. Glow Serum by Zuri Skincare"
              value={productName}
              onChange={e => setProductName(stripInjection(e.target.value))}
            />
          </Field>

          <Field label="What's your goal?" required>
            <input
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-purple-400"
              placeholder="e.g. Drive awareness and sales on Instagram"
              value={goal}
              onChange={e => setGoal(stripInjection(e.target.value))}
            />
          </Field>

          <Field label="Instructions & Key Points">
            <textarea
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-purple-400 h-28 resize-none"
              placeholder="Key messages, dos and don'ts, hashtags, links to include…"
              value={instructions}
              onChange={e => setInstructions(stripInjection(e.target.value))}
            />
          </Field>

          <Field label="Deadline (optional)">
            <input
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-purple-400"
              placeholder="e.g. 10 July 2026"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </Field>
        </div>

        <button
          onClick={goToReview}
          disabled={!canContinue}
          className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-sm font-bold transition-opacity disabled:opacity-40"
          style={{ backgroundColor: darkPurple }}
        >
          Continue to Review · {fmt(total)}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
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
