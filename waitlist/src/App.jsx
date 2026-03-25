import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ruepnwhgehcwfeekkpjb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZXBud2hnZWhjd2ZlZWtrcGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjU2MzMsImV4cCI6MjA4OTk0MTYzM30.JQCiafSVHOX1DMgPDNSTTXJmXu34Spzj8j58PsU1fY0'
)

const ROLES = [
  { id: 'creator', label: 'Creator / Influencer', emoji: '🎬', desc: 'I create content & want brand deals' },
  { id: 'brand',   label: 'Brand / Business',     emoji: '🏢', desc: 'I want to work with creators' },
]

const STATS = [
  { value: '2,400+', label: 'creators on waitlist' },
  { value: '180+',   label: 'brands waiting' },
  { value: '12',     label: 'African countries' },
]

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

// Floating avatar blobs
const AVATARS = [
  { initials: 'AO', color: '#FF6B9D', top: '12%', left: '6%',  size: 48, delay: '0s' },
  { initials: 'CK', color: '#7c3aed', top: '28%', right: '5%', size: 44, delay: '0.4s' },
  { initials: 'FT', color: '#D4AF37', top: '60%', left: '4%',  size: 52, delay: '0.8s' },
  { initials: 'EM', color: '#22c55e', top: '75%', right: '6%', size: 40, delay: '0.2s' },
  { initials: 'NK', color: '#f59e0b', top: '45%', left: '8%',  size: 36, delay: '1.2s' },
  { initials: 'TB', color: '#06b6d4', top: '15%', right: '9%', size: 38, delay: '0.6s' },
]

function FloatingAvatar({ initials, color, top, left, right, size, delay }) {
  return (
    <div
      className="absolute rounded-full flex items-center justify-center text-white font-bold pointer-events-none select-none hidden lg:flex"
      style={{
        width: size, height: size,
        fontSize: size * 0.3,
        backgroundColor: color,
        top, left, right,
        animation: `float 6s ease-in-out infinite`,
        animationDelay: delay,
        opacity: 0.85,
        boxShadow: `0 8px 24px ${color}40`,
      }}
    >
      {initials}
    </div>
  )
}

export default function App() {
  const [role, setRole] = useState('creator')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState('idle') // idle | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [toast, setToast] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.includes('@')) { setErrorMsg('Enter a valid email'); return }
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase
      .from('waitlist')
      .insert([{ email: email.trim().toLowerCase(), name: name.trim(), role }])

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        // Already on waitlist
        setState('success')
      } else {
        setErrorMsg('Something went wrong. Please try again.')
      }
      return
    }

    setState('success')
  }

  const position = Math.floor(Math.random() * 400) + 800

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0020 0%, #1a0040 40%, #2d0060 70%, #0d0020 100%)' }}>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(2deg); }
          66% { transform: translateY(6px) rotate(-1deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,157,0.08) 0%, transparent 70%)' }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Floating avatars */}
      {AVATARS.map((a, i) => <FloatingAvatar key={i} {...a} />)}

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#4c1d95' }}>
            <ZapIcon />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Brandior</span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-wide uppercase"
          style={{ backgroundColor: 'rgba(250,129,18,0.15)', border: '1px solid rgba(250,129,18,0.3)', color: '#FA8112' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Coming Soon — Join the Waitlist
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-center leading-tight mb-6 max-w-3xl">
          <span className="text-white">Where Creators</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #FF6B9D, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            & Brands
          </span>
          <br />
          <span className="text-white">Grow Together</span>
        </h1>

        <p className="text-center text-base sm:text-lg mb-10 max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Africa's first platform built for creator-brand partnerships.
          Real deals. Real growth. Launching soon across Nigeria, Ghana, Kenya & beyond.
        </p>

        {/* Stats */}
        <div className="flex items-center gap-8 mb-10">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="w-full max-w-md">
          {state === 'success' ? (
            <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', animation: 'slide-up 0.5s ease' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
                <CheckIcon />
              </div>
              <h2 className="text-xl font-black text-white mb-2">You're on the list!</h2>
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                We'll notify you the moment Brandior goes live.
              </p>
              <p className="text-xs font-semibold" style={{ color: '#FA8112' }}>
                You're approximately #{position} in line 🎉
              </p>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Share with your network to move up the list</p>
                <div className="flex gap-2 justify-center">
                  <a href={`https://twitter.com/intent/tweet?text=I%20just%20joined%20the%20waitlist%20for%20Brandior%20%E2%80%94%20Africa%27s%20creator%20marketplace.%20Join%20me%3A%20https%3A%2F%2Fbrandior.africa`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    Share on X
                  </a>
                  <a href={`https://wa.me/?text=I%20just%20joined%20the%20waitlist%20for%20Brandior%20%E2%80%94%20Africa%27s%20creator%20marketplace.%20Join%20here%3A%20https%3A%2F%2Fbrandior.africa`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white transition-all"
                    style={{ backgroundColor: '#25D366', border: '1px solid #25D366' }}>
                    Share on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl p-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>

              {/* Role toggle */}
              <p className="text-xs font-semibold text-center mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>I am a...</p>
              <div className="flex gap-2 mb-6">
                {ROLES.map(r => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl text-center transition-all"
                    style={role === r.id
                      ? { backgroundColor: 'rgba(124,58,237,0.25)', border: '1.5px solid #7c3aed' }
                      : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-xl">{r.emoji}</span>
                    <span className="text-xs font-bold text-white">{r.label}</span>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.desc}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
                    placeholder="Email address *"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: `1px solid ${errorMsg ? '#FF6B9D' : 'rgba(255,255,255,0.1)'}` }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                    onBlur={e => e.target.style.borderColor = errorMsg ? '#FF6B9D' : 'rgba(255,255,255,0.1)'}
                  />
                  {errorMsg && <p className="text-xs mt-1.5" style={{ color: '#FF6B9D' }}>{errorMsg}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #FA8112, #f97316)', boxShadow: '0 8px 24px rgba(250,129,18,0.4)' }}>
                  {loading
                    ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <>Join the Waitlist — It's Free</>
                  }
                </button>
              </form>

              <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
                No spam. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>

        {/* Features teaser */}
        <div className="mt-14 max-w-2xl w-full">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>What's coming</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji: '🎯', title: 'Direct Brand Deals', desc: 'No middlemen. Connect directly with brands that match your niche.' },
              { emoji: '💰', title: 'Fair Pricing Tools', desc: 'Rate cards, proposal builder, and transparent payment protection.' },
              { emoji: '📊', title: 'Analytics & Growth', desc: 'Track campaign performance and grow your creator business.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl p-5 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-2xl block mb-3">{f.emoji}</span>
                <p className="text-sm font-bold text-white mb-1">{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © 2026 Brandior · Made in Africa 🌍
          </p>
        </div>
      </div>
    </div>
  )
}
