import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ruepnwhgehcwfeekkpjb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZXBud2hnZWhjd2ZlZWtrcGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjU2MzMsImV4cCI6MjA4OTk0MTYzM30.JQCiafSVHOX1DMgPDNSTTXJmXu34Spzj8j58PsU1fY0'
)

const ROLES = [
  { id: 'creator', label: 'Talent / Creator', emoji: '🎤', desc: 'Creator, influencer, musician, artist or talent' },
  { id: 'brand',   label: 'Brand / Business', emoji: '🏢', desc: 'I want to work with talents & creators' },
]

const CREATOR_INDUSTRIES = [
  'Beauty & Skincare', 'Fashion & Style', 'Food & Cooking', 'Tech & Gadgets',
  'Fitness & Wellness', 'Comedy & Entertainment', 'Finance & Business',
  'Travel & Lifestyle', 'Music & Arts', 'Education', 'Gaming', 'Parenting & Family',
  'Health & Medicine', 'Sports', 'Politics & News', 'Other',
]

const BRAND_INDUSTRIES = [
  'FMCG & Consumer Goods', 'Fashion & Apparel', 'Beauty & Personal Care',
  'Food & Beverage', 'Tech & Electronics', 'Finance & Fintech',
  'Health & Pharmaceuticals', 'Telecom', 'Real Estate', 'Education & EdTech',
  'Travel & Hospitality', 'Media & Entertainment', 'Retail & E-commerce',
  'Automotive', 'NGO & Non-profit', 'Other',
]

const STATS = [
  { value: '2,400+', label: 'talents on waitlist' },
  { value: '180+',   label: 'brands waiting' },
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

// Young modern African talents — Nigerian, Ghanaian, Kenyan photographers
const AVATARS = [
  { photo: 'https://images.unsplash.com/photo-1770283553785-6f7087aa8e21?w=120&h=120&fit=crop&crop=face', name: 'Fatima', top: '58%', left: '4%',  size: 62, delay: '0.8s' },
  { photo: 'https://images.unsplash.com/photo-1771736822504-1c7130066984?w=120&h=120&fit=crop&crop=face', name: 'Emeka',  top: '72%', right: '6%', size: 50, delay: '0.2s' },
  { photo: 'https://images.unsplash.com/photo-1723922970319-6f92727e13cf?w=120&h=120&fit=crop&crop=face', name: 'Ngozi',  top: '44%', left: '7%',  size: 48, delay: '1.2s' },
  { photo: 'https://images.unsplash.com/photo-1772240628400-fc6d6c88c057?w=120&h=120&fit=crop&crop=face', name: 'Tunde',  top: '16%', right: '8%', size: 54, delay: '0.6s' },
]

function FloatingAvatar({ photo, name, top, left, right, size, delay }) {
  return (
    <div
      className="absolute pointer-events-none select-none hidden lg:block"
      style={{ top, left, right, animation: `float 6s ease-in-out infinite`, animationDelay: delay }}>
      <img
        src={photo}
        alt={name}
        className="rounded-full object-cover"
        style={{
          width: size, height: size,
          border: '3px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  )
}

export default function App() {
  const [role, setRole] = useState('creator')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const industries = role === 'creator' ? CREATOR_INDUSTRIES : BRAND_INDUSTRIES

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.includes('@')) { setErrorMsg('Enter a valid email'); return }
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase
      .from('waitlist')
      .insert([{ email: email.trim().toLowerCase(), name: name.trim(), role, industry }])

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        setState('success')
      } else {
        setErrorMsg('Something went wrong. Please try again.')
      }
      return
    }

    // Send welcome email via Vercel serverless function
    fetch('/api/send-waitlist-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), role, industry }),
    }).catch(() => {}) // fail silently — don't block the success screen

    setState('success')
  }

  const position = Math.floor(Math.random() * 400) + 800

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d0020' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&family=Open+Sans:wght@400;500;600&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .font-jakarta { font-family: 'Open Sans', sans-serif; }
        .font-playfair { font-family: 'Roboto', sans-serif; }
      `}</style>

      {/* Top brand color bar */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#FA8112' }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(192,132,252,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Floating avatars */}
      {AVATARS.map((a, i) => <FloatingAvatar key={i} {...a} />)}

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#4c1d95' }}>
            <ZapIcon />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Brandior</span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10 text-xs font-semibold tracking-wide uppercase"
          style={{ backgroundColor: 'rgba(250,129,18,0.12)', border: '1px solid rgba(250,129,18,0.35)', color: '#FA8112' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Coming Soon — Join the Waitlist
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-center leading-[1.1] mb-5 max-w-2xl">
          <span className="text-white">Don't Shine in the Dark.</span>
          <br />
          <span style={{ color: '#FA8112' }}>Get SEEN.</span>
        </h1>

        {/* Subheadline block */}
        <div className="text-center max-w-lg mb-10 space-y-3">
          <p className="font-jakarta text-base sm:text-lg leading-relaxed text-white">
            Running a business is demanding. Staying creative is a challenge.
          </p>
<div className="pt-1">
            <p className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: '#c084fc', fontFamily: "'Roboto', sans-serif" }}>Brandior Is The Bridge.</p>
            <p className="text-sm mt-1 leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif", color: 'rgba(255,255,255,0.5)' }}>
              A platform where businesses of all sizes and creators connect, collaborate, and conquer together.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="w-full max-w-md">
          {state === 'success' ? (
            <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.5)', backdropFilter: 'blur(20px)', animation: 'slide-up 0.5s ease' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
                <CheckIcon />
              </div>
              <h2 className="text-xl font-black text-white mb-2">You're on the list!</h2>
              <p className="text-sm mb-2 text-white">
                We'll notify you the moment Brandior goes live.
              </p>
              <p className="text-xs font-semibold" style={{ color: '#FA8112' }}>
                You're approximately #{position} in line 🎉
              </p>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-xs mb-3 text-white">Share with your network to move up the list</p>
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
            <div className="rounded-3xl p-8" style={{ backgroundColor: 'rgba(76,29,149,0.2)', border: '1px solid #7c3aed', backdropFilter: 'blur(20px)' }}>

              {/* Role toggle */}
              <div className="relative flex mb-6 rounded-2xl p-1" style={{ backgroundColor: 'rgba(76,29,149,0.6)', border: '1.5px solid #7c3aed' }}>
                {/* Sliding pill */}
                <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-transform duration-300 ease-in-out"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.35), rgba(236,72,153,0.2))',
                    border: '1.5px solid #ec4899',
                    transform: role === 'creator' ? 'translateX(0)' : 'translateX(calc(100% + 8px))',
                  }} />
                {ROLES.map(r => (
                  <button key={r.id} type="button" onClick={() => { setRole(r.id); setIndustry('') }}
                    className="relative flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-center z-10">
                    <span className="text-xl">{r.emoji}</span>
                    <span className="text-xs font-bold text-white">{r.label}</span>
                    <span className="text-[10px] text-white">{r.desc}</span>
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
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(124,58,237,0.5)' }}
                  onFocus={e => e.target.style.borderColor = '#c084fc'}
                  onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                />
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
                    placeholder="Email address *"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: `1px solid ${errorMsg ? '#FF6B9D' : 'rgba(124,58,237,0.5)'}` }}
                    onFocus={e => e.target.style.borderColor = '#c084fc'}
                    onBlur={e => e.target.style.borderColor = errorMsg ? '#FF6B9D' : 'rgba(124,58,237,0.5)'}
                  />
                  {errorMsg && <p className="text-xs mt-1.5" style={{ color: '#FF6B9D' }}>{errorMsg}</p>}
                </div>

                <div className="relative">
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all appearance-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(124,58,237,0.5)',
                      color: industry ? '#fff' : 'rgba(255,255,255,0.3)',
                    }}
                    onFocus={e => e.target.style.borderColor = '#c084fc'}
                    onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                  >
                    <option value="" disabled style={{ backgroundColor: '#1a0040' }}>
                      {role === 'creator' ? 'Your niche or field' : 'Your industry'}
                    </option>
                    {industries.map(ind => (
                      <option key={ind} value={ind} style={{ backgroundColor: '#1a0040', color: '#fff' }}>{ind}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
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

              <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                No spam. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-0 mt-10 mb-4">
          {STATS.map((s, i) => (
            <>
              <div key={s.label} className="text-center px-10">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs mt-0.5 text-white">{s.label}</p>
              </div>
              {i < STATS.length - 1 && (
                <div key={`divider-${i}`} className="w-px h-8 self-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              )}
            </>
          ))}
        </div>

        {/* Pitch section */}
        <div className="mt-10 max-w-xl w-full rounded-2xl p-7 text-center">
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            No agency friction. Just human-led partnerships that drive real growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 text-left">
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#FA8112' }}>For SMBs</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Access a curated pool of talent ready to scale your brand.
              </p>
            </div>
            <div className="w-px hidden sm:block" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>For Micro-Talent</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Get seen by brands that value your voice, not just your follower count.
              </p>
            </div>
          </div>
        </div>

        {/* Features teaser */}
        <div className="mt-14 max-w-2xl w-full">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6 text-white">What's coming</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji: '🎯', title: 'Direct Brand Deals', desc: 'No middlemen. Connect directly with brands that match your niche.' },
              { emoji: '💰', title: 'Fair Pricing Tools', desc: 'Rate cards, custom pricing, and transparent payment protection.' },
              { emoji: '📊', title: 'Analytics & Growth', desc: 'Track campaign performance and grow your business.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl p-5 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.3)' }}>
                <span className="text-2xl block mb-3">{f.emoji}</span>
                <p className="text-sm font-bold text-white mb-1">{f.title}</p>
                <p className="text-xs leading-relaxed text-white">{f.desc}</p>
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
