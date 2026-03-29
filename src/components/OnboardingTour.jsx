import { useState, useEffect, useCallback } from 'react'
import { X, ChevronRight, ChevronLeft, CheckCircle, Zap, Star, Users, DollarSign, Briefcase, Search, Shield, BarChart2 } from 'lucide-react'

const darkPurple = '#4c1d95'
const purple = '#7c3aed'
const pink = '#FF6B9D'
const gold = '#D4AF37'

// ── Talent tour steps ──────────────────────────────────────────────────────────
const TALENT_STEPS = [
  {
    id: 'welcome',
    accent: '#7c3aed',
    gradFrom: '#1a0035',
    gradTo: '#3d0080',
    visual: <WelcomeVisual role="talent" />,
    title: 'Welcome to Brandiór! 🎉',
    desc: "You're now part of Africa's premier creator marketplace. Brands are already searching for talents like you. Let's show you how it works.",
    cta: null,
  },
  {
    id: 'profile',
    accent: '#FF6B9D',
    gradFrom: '#3d0040',
    gradTo: '#0a001a',
    visual: <ProfileVisual />,
    title: 'Build a Profile Brands Love',
    desc: 'Talents with complete profiles get 5× more inquiries. Add your niche, bio, social handles, and rate card so brands can find and contact you.',
    cta: { label: 'Set Up Profile →', tab: 'settings' },
  },
  {
    id: 'jobs',
    accent: '#D4AF37',
    gradFrom: '#1a1400',
    gradTo: '#0a0020',
    visual: <JobsVisual />,
    title: 'Browse Open Campaigns',
    desc: 'New brand campaigns are posted daily. Filter by platform, budget, and niche to find the ones that match your audience and content style.',
    cta: { label: 'Browse Jobs →', tab: 'jobs' },
  },
  {
    id: 'apply',
    accent: '#22c55e',
    gradFrom: '#001a0d',
    gradTo: '#0a0025',
    visual: <ApplyVisual />,
    title: 'Apply & Get Paid Securely',
    desc: "Send proposals directly to brands — no middlemen. Once accepted, your payment is held safely in escrow and released when you deliver.",
    cta: null,
  },
  {
    id: 'ready',
    accent: '#c084fc',
    gradFrom: '#1a0035',
    gradTo: '#2d0070',
    visual: <ReadyVisualTalent />,
    title: "You're All Set! 🚀",
    desc: 'Start by completing your profile so brands can discover you. Your first paid campaign is just a few steps away.',
    cta: { label: 'Complete My Profile →', tab: 'settings' },
    final: true,
  },
]

// ── Brand tour steps ───────────────────────────────────────────────────────────
const BRAND_STEPS = [
  {
    id: 'welcome',
    accent: '#7c3aed',
    gradFrom: '#0d0030',
    gradTo: '#280060',
    visual: <WelcomeVisual role="brand" />,
    title: 'Welcome to Brandiór! 🎉',
    desc: "Connect with Nigeria's verified creators and launch campaigns that actually convert. Let's walk you through how it works.",
    cta: null,
  },
  {
    id: 'discover',
    accent: '#FF6B9D',
    gradFrom: '#2d0020',
    gradTo: '#0a0030',
    visual: <DiscoverVisual />,
    title: 'Find the Right Creators',
    desc: 'Browse creators by niche, platform, follower count, and engagement rate. Filter by location, tier, and verified status.',
    cta: { label: 'Browse Marketplace →', href: '/marketplace' },
  },
  {
    id: 'post',
    accent: '#D4AF37',
    gradFrom: '#1a1200',
    gradTo: '#0d0030',
    visual: <PostJobVisual />,
    title: 'Post a Campaign Brief',
    desc: 'Describe your campaign — niche, platform, budget, deliverables — and let matching creators apply directly to you.',
    cta: { label: 'Post a Job →', href: '/post-job' },
  },
  {
    id: 'escrow',
    accent: '#22c55e',
    gradFrom: '#001a08',
    gradTo: '#0a0025',
    visual: <EscrowVisual />,
    title: 'Payments Held in Escrow',
    desc: "Your money is held securely until you review and approve the content. You're fully protected — only release payment when you're satisfied.",
    cta: null,
  },
  {
    id: 'ready',
    accent: '#c084fc',
    gradFrom: '#1a0035',
    gradTo: '#2d0070',
    visual: <ReadyVisualBrand />,
    title: "You're All Set! 🚀",
    desc: 'Post a campaign brief or browse the marketplace to find your first creator partner. Your campaign is waiting.',
    cta: { label: 'Browse Creators →', href: '/marketplace' },
    final: true,
  },
]

// ── Visual components ──────────────────────────────────────────────────────────
function WelcomeVisual({ role }) {
  return (
    <div className="relative flex items-center justify-center h-48">
      {/* Pulsing rings */}
      <div className="absolute w-36 h-36 rounded-full opacity-10 animate-ping" style={{ backgroundColor: '#c084fc', animationDuration: '2s' }} />
      <div className="absolute w-28 h-28 rounded-full opacity-15" style={{ backgroundColor: '#7c3aed' }} />
      {/* Logo */}
      <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #c084fc)' }}>
        <Zap className="w-10 h-10 text-white" />
      </div>
      {/* Floating badges */}
      <div className="absolute top-4 right-8 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce"
        style={{ backgroundColor: '#FF6B9D', color: 'white', animationDuration: '2.2s' }}>
        {role === 'talent' ? '🎨 Creator' : '🏷️ Brand'}
      </div>
      <div className="absolute bottom-4 left-8 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce"
        style={{ backgroundColor: '#D4AF37', color: '#1a0035', animationDuration: '1.8s' }}>
        ✓ Verified
      </div>
    </div>
  )
}

function ProfileVisual() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setPct(78), 300)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="flex items-center justify-center h-48">
      <div className="bg-white/8 rounded-2xl p-4 w-64 space-y-3" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: 'linear-gradient(135deg, #FF6B9D, #c084fc)' }}>A</div>
          <div>
            <p className="text-white font-bold text-sm">Adaeze Okafor</p>
            <p className="text-white/40 text-xs">@adaeze_glow</p>
          </div>
          <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="flex gap-1.5">
          {['Beauty', 'Fashion', 'Lagos'].map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(192,132,252,0.2)', color: '#c084fc' }}>{t}</span>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>Profile complete</span><span style={{ color: '#c084fc' }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #FF6B9D)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function JobsVisual() {
  const jobs = [
    { brand: 'GlowUp', budget: '₦350K', platform: 'Instagram', color: '#FF6B9D', tag: 'Beauty' },
    { brand: 'TechHub', budget: '₦980K', platform: 'YouTube', color: '#a78bfa', tag: 'Tech' },
  ]
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2.5">
      {jobs.map((j, i) => (
        <div key={j.brand} className="w-64 rounded-xl p-3 flex items-center gap-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: `1px solid ${j.color}30`,
            animation: `slideInLeft 0.4s ease-out ${i * 0.15}s both` }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ backgroundColor: j.color }}>{j.brand[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold">{j.brand}</p>
            <p className="text-white/40 text-[10px]">{j.platform} · {j.tag}</p>
          </div>
          <span className="font-black text-sm flex-shrink-0" style={{ color: j.color }}>{j.budget}</span>
        </div>
      ))}
      <div className="w-64 rounded-xl px-3 py-2 text-center text-[10px]"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
        + 6 more campaigns waiting
      </div>
    </div>
  )
}

function ApplyVisual() {
  return (
    <div className="flex items-center justify-center h-48 gap-4">
      {/* Proposal */}
      <div className="rounded-xl p-3 w-28 space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg, #FF6B9D, #c084fc)' }} />
          <p className="text-white text-[10px] font-bold">Your Proposal</p>
        </div>
        <div className="space-y-1">
          {[60, 80, 45].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full" style={{ width: `${w}%`, backgroundColor: 'rgba(255,255,255,0.12)' }} />
          ))}
        </div>
        <div className="text-center py-1 rounded-lg text-[9px] font-bold" style={{ backgroundColor: '#7c3aed', color: 'white' }}>
          Send →
        </div>
      </div>
      {/* Arrow */}
      <div className="flex flex-col items-center gap-1">
        <ChevronRight className="w-5 h-5" style={{ color: '#22c55e' }} />
      </div>
      {/* Escrow */}
      <div className="rounded-xl p-3 w-28 space-y-2" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#22c55e' }}>
          <Shield className="w-4 h-4 text-white" />
        </div>
        <p className="text-center text-[10px] font-bold" style={{ color: '#22c55e' }}>Escrow</p>
        <p className="text-center text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Funds held safely until delivery</p>
      </div>
    </div>
  )
}

function ReadyVisualTalent() {
  const stats = [
    { icon: Briefcase, val: '8', label: 'Open Jobs', color: '#c084fc' },
    { icon: DollarSign, val: '₦0', label: 'Earned', color: '#D4AF37' },
    { icon: Star, val: '—', label: 'Rating', color: '#FF6B9D' },
  ]
  return (
    <div className="flex items-center justify-center h-48 gap-3">
      {stats.map(({ icon: Icon, val, label, color }, i) => (
        <div key={label} className="rounded-2xl p-4 text-center w-20"
          style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25`,
            animation: `bounceIn 0.5s ease-out ${i * 0.12}s both` }}>
          <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color }} />
          <p className="font-black text-sm text-white">{val}</p>
          <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
        </div>
      ))}
    </div>
  )
}

function DiscoverVisual() {
  const creators = [
    { name: 'Adaeze', niche: 'Beauty', followers: '128K', color: '#FF6B9D' },
    { name: 'Chidi', niche: 'Tech', followers: '84K', color: '#a78bfa' },
    { name: 'Fatimah', niche: 'Fashion', followers: '210K', color: '#D4AF37' },
  ]
  return (
    <div className="flex items-center justify-center h-48 gap-2">
      {creators.map((c, i) => (
        <div key={c.name} className="rounded-xl p-3 text-center w-20"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${c.color}30`,
            animation: `bounceIn 0.4s ease-out ${i * 0.1}s both` }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-2"
            style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }}>
            {c.name[0]}
          </div>
          <p className="text-white text-[10px] font-bold">{c.name}</p>
          <p className="text-[9px]" style={{ color: c.color }}>{c.followers}</p>
          <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{c.niche}</p>
        </div>
      ))}
    </div>
  )
}

function PostJobVisual() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="rounded-2xl p-4 w-64 space-y-3" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wide">Campaign Brief</p>
        {[
          { label: 'Platform', val: 'Instagram Reels', color: '#FF6B9D' },
          { label: 'Niche', val: 'Beauty & Skincare', color: '#c084fc' },
          { label: 'Budget', val: '₦150,000 – ₦300,000', color: '#D4AF37' },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>{val}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Applications</span>
          <span className="text-[10px] font-bold" style={{ color: '#22c55e' }}>12 received</span>
        </div>
      </div>
    </div>
  )
}

function EscrowVisual() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 1200)
    return () => clearInterval(t)
  }, [])
  const steps = [
    { label: 'Brand pays', icon: DollarSign, color: '#7c3aed', done: step >= 1 },
    { label: 'In escrow', icon: Shield, color: '#D4AF37', done: step >= 2 },
    { label: 'Content delivered', icon: CheckCircle, color: '#c084fc', done: step >= 3 },
    { label: 'Funds released', icon: Zap, color: '#22c55e', done: step >= 4 },
  ]
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
                  style={{ backgroundColor: step >= i ? `${s.color}25` : 'rgba(255,255,255,0.05)', border: `2px solid ${step >= i ? s.color : 'rgba(255,255,255,0.1)'}` }}>
                  <Icon className="w-4 h-4" style={{ color: step >= i ? s.color : 'rgba(255,255,255,0.2)' }} />
                </div>
                <p className="text-[8px] text-center" style={{ color: step >= i ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)', maxWidth: 44 }}>{s.label}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="w-6 h-0.5 mb-4 transition-all duration-500 rounded"
                  style={{ backgroundColor: step > i ? steps[i + 1].color : 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReadyVisualBrand() {
  const stats = [
    { icon: Users, val: '1K+', label: 'Creators', color: '#c084fc' },
    { icon: Briefcase, val: '0', label: 'Campaigns', color: '#D4AF37' },
    { icon: BarChart2, val: 'Ready', label: 'Dashboard', color: '#22c55e' },
  ]
  return (
    <div className="flex items-center justify-center h-48 gap-3">
      {stats.map(({ icon: Icon, val, label, color }, i) => (
        <div key={label} className="rounded-2xl p-4 text-center w-20"
          style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25`,
            animation: `bounceIn 0.5s ease-out ${i * 0.12}s both` }}>
          <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color }} />
          <p className="font-black text-sm text-white">{val}</p>
          <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main Tour component ────────────────────────────────────────────────────────
export default function OnboardingTour({ role, onClose, setActiveTab }) {
  const userId = localStorage.getItem('brandiór_user') || 'guest'
  const storageKey = `brandior_tour_done_${userId}`
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)

  // Only show once per user
  const alreadySeen = !!localStorage.getItem(storageKey)

  const steps = role === 'brand' ? BRAND_STEPS : TALENT_STEPS
  const current = steps[step]
  const isLast = step === steps.length - 1

  const dismiss = useCallback((navigateTo) => {
    localStorage.setItem(storageKey, '1')
    setExiting(true)
    setTimeout(() => {
      onClose()
      if (navigateTo) {
        if (navigateTo.tab && setActiveTab) setActiveTab(navigateTo.tab)
        if (navigateTo.href) window.location.href = navigateTo.href
      }
    }, 300)
  }, [storageKey, onClose, setActiveTab])

  const next = () => {
    if (isLast) {
      dismiss(current.cta ? { tab: current.cta.tab, href: current.cta.href } : null)
    } else {
      setStep(s => s + 1)
    }
  }

  const prev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  // Keyboard nav
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') dismiss(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, isLast])

  if (alreadySeen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(160deg, ${current.gradFrom} 0%, ${current.gradTo} 100%)`,
          border: `1px solid ${current.accent}30`,
          transform: exiting ? 'scale(0.96)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Skip button */}
        <button
          onClick={() => dismiss(null)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="absolute top-4 left-4 text-[11px] font-semibold" style={{ color: `${current.accent}cc` }}>
          {step + 1} / {steps.length}
        </div>

        {/* Visual area */}
        <div
          key={`visual-${step}`}
          className="px-6 pt-14"
          style={{ animation: 'fadeSlideIn 0.35s ease-out both' }}
        >
          {current.visual}
        </div>

        {/* Text area */}
        <div
          key={`text-${step}`}
          className="px-6 pb-6 pt-4"
          style={{ animation: 'fadeSlideIn 0.35s ease-out 0.05s both' }}
        >
          <h2 className="text-white font-black text-xl mb-2 leading-tight">{current.title}</h2>
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>{current.desc}</p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  backgroundColor: i === step ? current.accent : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: current.accent }}
            >
              {isLast
                ? (current.cta ? current.cta.label : 'Get Started')
                : (current.cta ? current.cta.label : <>Next <ChevronRight className="w-4 h-4" /></>)
              }
            </button>

            {!isLast && current.cta && (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-4 py-3 text-sm font-medium rounded-2xl transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
