import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, TrendingUp, DollarSign, Users } from 'lucide-react'

const gold = '#D4AF37'
const pink = '#FF6B9D'

const floatingCard1 = (
  <div className="glass rounded-2xl p-4 shadow-2xl w-56" style={{ animation: 'float 6s ease-in-out infinite' }}>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-brand-dark border border-white/15 flex items-center justify-center text-white font-bold text-sm">AS</div>
      <div>
        <p className="text-white text-sm font-semibold">Amara S.</p>
        <p className="text-white/40 text-xs">Beauty Talent</p>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/40 text-xs mb-0.5">Followers</p>
        <p className="text-white font-bold text-sm">284K</p>
      </div>
      <div>
        <p className="text-white/40 text-xs mb-0.5">Eng. Rate</p>
        <p className="text-emerald-400 font-bold text-sm">6.4%</p>
      </div>
      <div>
        <p className="text-white/40 text-xs mb-0.5">Earned</p>
        <p className="font-bold text-sm" style={{ color: pink }}>₦12M</p>
      </div>
    </div>
  </div>
)

const floatingCard2 = (
  <div className="glass rounded-2xl p-4 shadow-2xl w-60" style={{ animation: 'float 8s ease-in-out infinite 1s' }}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center">
        <TrendingUp className="w-4 h-4" style={{ color: pink }} />
      </div>
      <div>
        <p className="text-white text-sm font-semibold">Campaign Live!</p>
        <p className="text-emerald-400 text-xs font-medium">• Active now</p>
      </div>
    </div>
    <p className="text-white/50 text-xs mb-2">Summer Glow Collection</p>
    <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
      <div className="h-1.5 rounded-full" style={{ width: '68%', backgroundColor: `${pink}99` }} />
    </div>
    <div className="flex justify-between text-xs">
      <span className="text-white/40">17/25 talents</span>
      <span className="font-semibold" style={{ color: pink }}>₦4.2M left</span>
    </div>
  </div>
)

const floatingCard3 = (
  <div className="glass rounded-2xl p-3.5 shadow-2xl w-52" style={{ animation: 'float 7s ease-in-out infinite 2s' }}>
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center">
        <DollarSign className="w-3.5 h-3.5" style={{ color: pink }} />
      </div>
      <p className="text-white text-sm font-semibold">Payment Sent!</p>
    </div>
    <p className="text-3xl font-bold mb-1" style={{ color: pink }}>₦2,400,000</p>
    <p className="text-white/40 text-xs">For Instagram Reel campaign</p>
    <div className="flex gap-1 mt-2">
      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
      <span className="text-xs text-white/50 ml-1">Excellent work!</span>
    </div>
  </div>
)

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('brandiór_user'))
  useEffect(() => {
    const handler = () => setIsLoggedIn(!!localStorage.getItem('brandiór_user'))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20" style={{ background: 'linear-gradient(135deg, #000000 0%, #150030 40%, #3d0080 100%)' }}>

      {/* ── Video background ── */}
      {/* Replace /videos/hero-bg.mp4 with your actual video file placed in /public/videos/ */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Gradient overlay — keeps text legible and adds depth */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.90) 0%, rgba(13,0,32,0.80) 50%, rgba(45,0,96,0.75) 100%)' }} />

      <div className="max-w-7xl mx-auto px-6 w-full py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-8">

            {/* 1 — Headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-white">
              <span style={{ color: '#c084fc' }}>Built</span> for Brands.
              <br />
              <span style={{ color: '#c084fc' }}>Fueled by</span>
              <br />
              Creativity.
            </h1>

            {/* 2 — Sub-headline */}
            <p className="text-lg lg:text-xl text-white/55 leading-relaxed max-w-lg">
              We connect brands and entrepreneurs with talents who bring{' '}
              <span className="font-semibold" style={{ color: pink }}>visions</span> to life.
            </p>

            {/* 3 — Dual-path CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link to={isLoggedIn ? '/marketplace' : '/signup'}
                className="group flex items-center justify-center gap-2 bg-white text-brand-dark font-bold px-7 py-4 rounded-full hover:bg-brand-sand transition-colors text-sm">
                {isLoggedIn ? 'Go to Dashboard' : 'Grow Your Business'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to={isLoggedIn ? '/dashboard' : '/signup'}
                className="group flex items-center justify-center gap-2 border border-white/15 text-white/70 font-semibold px-7 py-4 rounded-full transition-all text-sm"
                onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}>
                <Users className="w-4 h-4" />
                {isLoggedIn ? 'Talent Dashboard' : 'Earn as a Talent'}
              </Link>
            </div>

            {/* 4 — Trust bar */}
            <div className="flex items-center gap-3 border-t border-white/5 pt-6">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-brand-dark border-2 border-brand-dark ring-1 ring-white/10 flex items-center justify-center text-white text-[10px] font-bold">
                    {['A', 'M', 'K', 'J', 'S'][i]}
                  </div>
                ))}
              </div>
              <p className="text-white/35 text-sm leading-snug">
                Join{' '}
                <span className="font-semibold" style={{ color: pink }}>500+ brands</span>
                {' '}and{' '}
                <span className="font-semibold" style={{ color: pink }}>1,000+ talents</span>
                {' '}already at home in the Hive.
              </p>
            </div>
          </div>

          {/* Right — floating UI cards */}
          <div className="relative hidden lg:flex items-center justify-center h-[520px]">
            <div className="absolute top-8 left-4">{floatingCard1}</div>
            <div className="absolute top-[160px] right-0">{floatingCard2}</div>
            <div className="absolute bottom-20 left-20">{floatingCard3}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
