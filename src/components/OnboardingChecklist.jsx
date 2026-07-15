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
      style={{ background: 'linear-gradient(135deg, #3b0764 0%, #7c3aed 55%, #a855f7 100%)' }}
    >
      <div className="p-5">
        {/* Header row: title + % circle + dismiss */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            {allDone ? (
              <p className="text-white font-medium text-base mb-1">You're all set up 🎉</p>
            ) : (
              <p className="text-white font-medium text-base mb-1">
                {role === 'creator' ? 'Complete your profile' : 'Launch your first collab'}
              </p>
            )}
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {allDone
                ? 'This panel will disappear in a moment.'
                : role === 'creator'
                  ? 'Fully set-up creators get 3× more collab offers'
                  : 'Everything you need to find and book a creator.'}
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            {allDone ? <PartyPopper className="w-5 h-5" /> : `${pct}%`}
          </div>
          <button
            onClick={dismiss}
            className="flex-shrink-0 mt-0.5 transition-opacity hover:opacity-70"
            aria-label="Dismiss checklist"
          >
            <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-2 mb-4">
          {steps.map(step => (
            <button
              key={step.key}
              onClick={() => handleStep(step)}
              disabled={step.done}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
              style={{
                backgroundColor: step.done ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
                cursor: step.done ? 'default' : 'pointer',
              }}
              onMouseEnter={e => { if (!step.done) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.16)' }}
              onMouseLeave={e => { if (!step.done) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: step.done ? '#fff' : 'rgba(255,255,255,0.1)',
                  border: `1.5px solid ${step.done ? '#fff' : 'rgba(255,255,255,0.3)'}`,
                }}
              >
                {step.done && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: purple }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: step.done ? 'rgba(255,255,255,0.5)' : 'white' }}>
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{step.desc}</p>
                )}
              </div>
              {!step.done && <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: pink }}
            />
          </div>
          <span className="text-xs font-bold flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {doneCount}/{steps.length}
          </span>
        </div>

        {/* CTA */}
        {!allDone && (
          <button
            onClick={() => handleStep(steps.find(s => !s.done) || steps[0])}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: pink, color: '#fff' }}
          >
            Continue setup
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
