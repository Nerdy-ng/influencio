import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, ChevronRight, X, PartyPopper } from 'lucide-react'
import { supabase } from '../lib/supabase'

const purple = '#7c3aed'
const pink   = '#ec4899'

const CREATOR_STEPS = [
  { key: 'bio',       label: 'Add your bio',               desc: 'Tell brands who you are',            tab: 'profile'   },
  { key: 'niche',     label: 'Set your niche & skills',    desc: 'Get discovered for what you do best', tab: 'profile'   },
  { key: 'rate',      label: 'Set your rate card',         desc: 'Show brands what you charge',         tab: 'profile'   },
  { key: 'portfolio', label: 'Add portfolio items',        desc: 'Show brands your past work',          tab: 'portfolio' },
]

const BRAND_STEPS = [
  { key: 'profile', label: 'Complete your company profile', desc: 'Help creators know who you are',         tab: 'settings'    },
  { key: 'browse',  label: 'Browse the creator marketplace', desc: 'Find the right creator for your brand',  href: '/marketplace' },
  { key: 'collab',  label: 'Set up your first collab',      desc: 'Launch your first paid collaboration',    href: '/collab/brief' },
]

export default function OnboardingChecklist({ role, setActiveTab }) {
  const navigate   = useNavigate()
  const [steps,     setSteps]     = useState([])
  const [userId,    setUserId]    = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [allDone,   setAllDone]   = useState(false)
  const [loading,   setLoading]   = useState(true)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const uid = user.id
    setUserId(uid)

    if (localStorage.getItem(`brandior_checklist_${uid}`)) {
      setDismissed(true); setLoading(false); return
    }

    if (role === 'creator') {
      const [profileRes, rateRes] = await Promise.all([
        supabase.from('profiles').select('bio, niches, portfolio').eq('id', uid).single(),
        supabase.from('rate_cards').select('id').eq('creator_id', uid).maybeSingle(),
      ])
      const p = profileRes.data || {}
      const filled = [
        { ...CREATOR_STEPS[0], done: !!(p.bio?.trim()) },
        { ...CREATOR_STEPS[1], done: (p.niches || []).length > 0 },
        { ...CREATOR_STEPS[2], done: !!rateRes.data },
        { ...CREATOR_STEPS[3], done: (p.portfolio || []).length > 0 },
      ]
      setSteps(filled)
      setAllDone(filled.every(s => s.done))
    } else {
      const [profileRes, collabRes] = await Promise.all([
        supabase.from('profiles').select('company_name, industry').eq('id', uid).single(),
        supabase.from('collabs').select('id', { count: 'exact', head: true }).eq('brand_id', uid),
      ])
      const p = profileRes.data || {}
      const filled = [
        { ...BRAND_STEPS[0], done: !!(p.company_name?.trim() && p.industry?.trim()) },
        { ...BRAND_STEPS[1], done: !!localStorage.getItem(`brandior_browsed_${uid}`) },
        { ...BRAND_STEPS[2], done: (collabRes.count || 0) > 0 },
      ]
      setSteps(filled)
      setAllDone(filled.every(s => s.done))
    }
    setLoading(false)
  }, [role])

  useEffect(() => { load() }, [load])

  // Auto-dismiss 3 s after all done
  useEffect(() => {
    if (!allDone || !userId) return
    const t = setTimeout(() => dismiss(), 3000)
    return () => clearTimeout(t)
  }, [allDone, userId])

  function dismiss() {
    if (userId) localStorage.setItem(`brandior_checklist_${userId}`, '1')
    setDismissed(true)
  }

  function handleStep(step) {
    if (step.done) return
    if (step.href) { navigate(step.href); return }
    if (step.tab && setActiveTab) setActiveTab(step.tab)
  }

  if (loading || dismissed) return null

  const doneCount = steps.filter(s => s.done).length
  const pct       = steps.length ? Math.round((doneCount / steps.length) * 100) : 0

  return (
    <div
      className="rounded-2xl mb-5 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d001a 0%, #1e0045 100%)', border: '1px solid rgba(124,58,237,0.25)' }}
    >
      {/* Top accent line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${purple}, ${pink})` }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {allDone
              ? <PartyPopper className="w-4 h-4" style={{ color: pink }} />
              : <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${purple}, ${pink})` }} />
            }
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c4b5fd' }}>
              {allDone ? 'All set!' : 'Getting started'}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
            aria-label="Dismiss checklist"
          >
            <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
          </button>
        </div>

        {allDone ? (
          <p className="text-white font-bold text-base mb-1">You're all set up 🎉</p>
        ) : (
          <p className="text-white font-bold text-base mb-1">
            {role === 'creator' ? 'Set up your creator profile' : 'Launch your first collab'}
          </p>
        )}
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {allDone
            ? 'This panel will disappear in a moment.'
            : role === 'creator'
              ? 'Brands are more likely to reach out to fully set-up creators.'
              : 'Everything you need to find and book a creator.'}
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${purple}, ${pink})` }}
            />
          </div>
          <span className="text-xs font-bold flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {doneCount}/{steps.length}
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map(step => (
            <button
              key={step.key}
              onClick={() => handleStep(step)}
              disabled={step.done}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
              style={{
                backgroundColor: step.done ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
                cursor: step.done ? 'default' : 'pointer',
              }}
              onMouseEnter={e => { if (!step.done) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.09)' }}
              onMouseLeave={e => { if (!step.done) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
            >
              {step.done
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: pink }} />
                : <Circle       className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: step.done ? 'rgba(255,255,255,0.35)' : 'white' }}>
                  {step.done ? <s className="no-underline" style={{ textDecoration: 'line-through', opacity: 0.5 }}>{step.label}</s> : step.label}
                </p>
                {!step.done && (
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{step.desc}</p>
                )}
              </div>
              {!step.done && <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
