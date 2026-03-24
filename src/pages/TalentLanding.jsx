import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TrustBar from '../components/TrustBar'
import Footer from '../components/Footer'
import {
  ArrowRight, Star, TrendingUp, DollarSign, Shield, BadgeCheck,
  Wallet, Users, BarChart2, Award, Gift, UserCircle, Search,
  CheckCircle, Zap, ChevronDown,
} from 'lucide-react'

const pink       = '#FF6B9D'
const purple     = '#7c3aed'
const darkPurple = '#4c1d95'
const gold       = '#D4AF37'

/* ── Floating hero cards (same glass style as homepage) ── */
const HeroCard1 = () => (
  <div className="glass rounded-2xl p-4 shadow-2xl w-56" style={{ animation: 'float 6s ease-in-out infinite' }}>
    <div className="flex items-center gap-3 mb-3">
      <img src="https://i.pravatar.cc/150?u=adaeze_okafor" alt="Adaeze" className="w-10 h-10 rounded-full object-cover border border-white/15" />
      <div>
        <p className="text-white text-sm font-semibold">Adaeze O.</p>
        <p className="text-white/40 text-xs">Beauty · Lagos</p>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div><p className="text-white/40 text-xs mb-0.5">Followers</p><p className="text-white font-bold text-sm">82K</p></div>
      <div><p className="text-white/40 text-xs mb-0.5">Eng. Rate</p><p className="text-emerald-400 font-bold text-sm">4.2%</p></div>
      <div><p className="text-white/40 text-xs mb-0.5">Earned</p><p className="font-bold text-sm" style={{ color: pink }}>₦4.8M</p></div>
    </div>
  </div>
)

const HeroCard2 = () => (
  <div className="glass rounded-2xl p-4 shadow-2xl w-60" style={{ animation: 'float 8s ease-in-out infinite 1s' }}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center">
        <DollarSign className="w-4 h-4" style={{ color: pink }} />
      </div>
      <div>
        <p className="text-white text-sm font-semibold">New Offer!</p>
        <p className="text-emerald-400 text-xs font-medium">• Just arrived</p>
      </div>
    </div>
    <p className="text-white/50 text-xs mb-1">GlowUp Cosmetics</p>
    <p className="text-2xl font-bold mb-1" style={{ color: pink }}>₦350,000</p>
    <p className="text-white/40 text-xs">Instagram Reel + Story bundle</p>
  </div>
)

const HeroCard3 = () => (
  <div className="glass rounded-2xl p-3.5 shadow-2xl w-52" style={{ animation: 'float 7s ease-in-out infinite 2s' }}>
    <p className="text-white text-xs font-semibold mb-2">Your Tier Progress</p>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#3b82f618', color: '#3b82f6', border: '1px solid #3b82f640' }}>Next Rated</span>
      <ArrowRight className="w-3 h-3 text-white/30" />
      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${gold}18`, color: gold, border: `1px solid ${gold}40` }}>Top Rated</span>
    </div>
    <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
      <div className="h-1.5 rounded-full" style={{ width: '72%', backgroundColor: gold }} />
    </div>
    <p className="text-white/40 text-[10px]">8 more campaigns to unlock</p>
  </div>
)

/* ── Data ── */
const STEPS = [
  { icon: UserCircle, step: '01', title: 'Build Your Profile',   desc: 'Showcase your niche, audience stats, content portfolio, and rates. Your media kit is auto-generated.' },
  { icon: Search,     step: '02', title: 'Get Discovered',       desc: 'Brands search and filter by niche, tier, and budget. Your profile appears in front of the right buyers.' },
  { icon: DollarSign, step: '03', title: 'Create & Get Paid',    desc: 'Accept campaign briefs, deliver your content, and receive secure escrow payment — automatically released on approval.' },
]

const TIERS = [
  { name: 'Fast Rising', emoji: '⭐', color: '#22c55e', bg: '#22c55e18', border: '#22c55e40', desc: 'New creators building their presence', perks: ['Profile listed on Brandiór', 'Entry-level gig access', 'Talent community'] },
  { name: 'Next Rated',  emoji: '⚡', color: '#3b82f6', bg: '#3b82f618', border: '#3b82f640', desc: 'Growing creators with real traction',  perks: ['Priority in brand searches', 'Mid-tier gig access', 'Verified badge eligibility'], hot: false },
  { name: 'Top Rated',   emoji: '👑', color: gold,      bg: `${gold}18`, border: `${gold}40`, desc: 'Elite creators brands seek directly',  perks: ['Featured in discovery', 'Premium gig access', 'Dedicated talent manager'], hot: true },
]

const FEATURES = [
  { icon: Shield,     title: 'Escrow Protection',   desc: 'Payment is locked before you start. No ghosting, no delays — guaranteed.' },
  { icon: BadgeCheck, title: 'Verified Badge',       desc: 'Complete campaigns and earn your badge. Stand out in every brand search.' },
  { icon: TrendingUp, title: 'Tier Progression',     desc: 'Climb from Fast Rising to Top Rated and unlock bigger brand deals.' },
  { icon: BarChart2,  title: 'Earnings Dashboard',   desc: 'Track campaigns, income, engagement, and ratings all in one place.' },
  { icon: Wallet,     title: 'Fast Payouts',          desc: 'Withdraw via bank transfer or Paystack. Minimum payout ₦5,000.' },
  { icon: Users,      title: 'Creator Community',    desc: 'Connect with other African creators. Share tips, collab, and grow.' },
]

const TESTIMONIALS = [
  { name: 'Adaeze Okafor', handle: '@adaeze.creates', niche: 'Beauty & Skincare', avatar: 'https://i.pravatar.cc/150?u=adaeze_okafor', quote: 'Brandiór changed everything. I went from 2 brand deals a year to 3 a month. Escrow means I never chase payments.', earnings: '₦1.2M', period: '6 months' },
  { name: 'Tunde Bakare',  handle: '@tundebakare',    niche: 'Tech & Gadgets',    avatar: 'https://i.pravatar.cc/150?u=tunde_bakare',   quote: "I'm Top Rated now and brands reach out to me — not the other way around. The tier system actually works.",   earnings: '₦3.4M', period: '1 year' },
  { name: 'Chiamaka Eze',  handle: '@chiamaka.tv',    niche: 'Food & Cooking',    avatar: 'https://i.pravatar.cc/150?u=chiamaka_eze',   quote: 'The profile builder made me look so professional. My rates doubled since I joined and brands take me seriously.', earnings: '₦890K', period: '4 months' },
]

const STATS = [
  { value: '500+',   label: 'Active Creators' },
  { value: '₦120M+', label: 'Paid to Creators' },
  { value: '1,200+', label: 'Campaigns Done' },
  { value: '4.8★',   label: 'Avg. Creator Rating' },
]

/* ── FAQ ── */
const FAQS = [
  { q: 'Is it free to join?',                   a: 'Yes — creating a profile is completely free. Brandiór takes a 10% platform fee only when you complete a paid campaign.' },
  { q: 'How do I get paid?',                     a: 'Payment is held in escrow when a brand places an order. Once you deliver and the brand approves, funds are released within 24 hours.' },
  { q: 'How do I move up tiers?',                a: 'Complete campaigns, maintain a high rating, and grow your followers. The platform automatically upgrades your tier when you hit the criteria.' },
  { q: 'What platforms are supported?',          a: 'Instagram, TikTok, YouTube, Twitter/X, Facebook, and Snapchat. You can connect all your accounts to your profile.' },
]

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: pink }}>FAQ</p>
          <h2 className="text-3xl font-black text-brand-dark">Got Questions?</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-brand-dark/8">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                style={{ backgroundColor: open === i ? '#f3e8ff' : 'white' }}>
                <span className="font-semibold text-brand-dark text-sm">{f.q}</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform text-brand-dark/40 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <div className="px-5 pb-4 text-sm text-brand-dark/60 leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function TalentLanding() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('brandiór_user'))
  useEffect(() => {
    const handler = () => setIsLoggedIn(!!localStorage.getItem('brandiór_user'))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #150030 40%, #3d0080 100%)' }}>
        {/* dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* pink glow */}
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-15 -translate-y-1/4"
          style={{ background: `radial-gradient(circle, ${pink} 0%, transparent 70%)` }} />

        <div className="max-w-7xl mx-auto px-6 w-full py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${pink}22`, color: pink, border: `1px solid ${pink}44` }}>
                <Zap className="w-3 h-3" /> For African Creators
              </span>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-white">
                <span style={{ color: '#c084fc' }}>Turn Your</span><br />
                Content Into<br />
                a <span style={{ color: pink }}>Career.</span>
              </h1>
              <p className="text-lg text-white/55 leading-relaxed max-w-lg">
                Join 500+ African creators earning consistently from brand campaigns. Build your profile, get discovered, and get paid — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link to={isLoggedIn ? '/dashboard' : '/signup'}
                  className="group flex items-center justify-center gap-2 font-bold px-7 py-4 rounded-full text-white transition-all text-sm hover:scale-105"
                  style={{ backgroundColor: pink, boxShadow: `0 8px 30px ${pink}55` }}>
                  {isLoggedIn ? 'Go to Dashboard' : 'Create Free Profile'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/for-brands"
                  className="flex items-center justify-center gap-2 border border-white/15 text-white/70 font-semibold px-7 py-4 rounded-full transition-all text-sm"
                  onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}>
                  I'm a Brand →
                </Link>
              </div>
              <div className="flex items-center gap-3 border-t border-white/5 pt-6">
                <div className="flex -space-x-2">
                  {['A','T','C','N','F'].map((l, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: darkPurple, borderColor: '#150030' }}>{l}</div>
                  ))}
                </div>
                <p className="text-white/35 text-sm">
                  Join <span className="font-semibold" style={{ color: pink }}>500+ creators</span> already earning on Brandiór
                </p>
              </div>
            </div>
            {/* Floating cards */}
            <div className="relative hidden lg:flex items-center justify-center h-[520px]">
              <div className="absolute top-8 left-4"><HeroCard1 /></div>
              <div className="absolute top-[160px] right-0"><HeroCard2 /></div>
              <div className="absolute bottom-20 left-20"><HeroCard3 /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <TrustBar />

      {/* ── STATS ── */}
      <section className="py-16 px-6" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black mb-1" style={{ color: pink }}>{s.value}</p>
              <p className="text-sm text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-white py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: pink }}>How It Works</p>
            <h2 className="text-4xl lg:text-5xl font-black text-brand-dark mb-4">From Sign-Up to Paid</h2>
            <p className="text-brand-dark/50 max-w-xl mx-auto text-lg">Three steps between you and your first brand deal.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-brand-dark/8 z-0" />
            {STEPS.map((s, i) => (
              <div key={i} className="relative z-10 card-hover">
                <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: '#e9d5ff', border: '1px solid rgba(192,132,252,0.4)' }}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#c084fc' }}>
                      <s.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-4xl font-black" style={{ color: 'rgba(107,33,168,0.25)' }}>{s.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#3b0764' }}>{s.title}</h3>
                  <div className="w-8 h-0.5 rounded-full mb-3" style={{ backgroundColor: '#c084fc' }} />
                  <p className="leading-relaxed text-sm" style={{ color: 'rgba(59,7,100,0.6)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIER SYSTEM ── */}
      <section className="py-28 px-6" style={{ background: 'linear-gradient(135deg, #0d0020 0%, #1e0a3c 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#c084fc' }}>Tier System</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">The More You Create,<br />The More You Earn</h2>
            <p className="text-white/40 max-w-xl mx-auto">Level up through our tier system and unlock higher-paying campaigns and premium perks.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TIERS.map(t => (
              <div key={t.name}
                className={`rounded-3xl p-7 relative ${t.hot ? 'ring-2 scale-105' : ''}`}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${t.border}`,
                  ringColor: t.hot ? gold : undefined,
                }}>
                {t.hot && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: gold }}>Most Rewarded</span>
                )}
                <p className="text-2xl mb-1">{t.emoji}</p>
                <p className="text-xl font-extrabold mb-1" style={{ color: t.color }}>{t.name}</p>
                <p className="text-sm text-white/40 mb-5">{t.desc}</p>
                <ul className="space-y-2.5">
                  {t.perks.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: t.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: pink }}>Platform Features</p>
            <h2 className="text-4xl lg:text-5xl font-black text-brand-dark">Everything You Need to Grow</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-brand-dark/8 card-hover">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#e9d5ff' }}>
                  <f.icon className="w-5 h-5" style={{ color: darkPurple }} />
                </div>
                <p className="font-extrabold text-brand-dark mb-1">{f.title}</p>
                <p className="text-sm text-brand-dark/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 px-6" style={{ background: 'linear-gradient(135deg, #150030 0%, #0d0020 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: pink }}>Creator Stories</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white">Real Creators. Real Earnings.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="glass rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2" style={{ ringColor: pink }} />
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs" style={{ color: pink }}>{t.handle}</p>
                    <p className="text-xs text-white/40">{t.niche}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-2 border-t border-white/5 pt-4">
                  <span className="text-xl font-extrabold" style={{ color: gold }}>{t.earnings}</span>
                  <span className="text-xs text-white/30">earned in {t.period}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── CTA ── */}
      <section className="py-28 px-6" style={{ backgroundColor: '#1e0a3c' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: pink }}>Ready to start?</p>
          <h2 className="text-5xl font-black text-white mb-5 leading-tight">
            Your First Brand Deal<br />
            Starts <span style={{ color: pink }}>Here.</span>
          </h2>
          <p className="text-white/50 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Free to join. Set up your profile in under 5 minutes and start receiving brand offers today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={isLoggedIn ? '/dashboard' : '/signup'}
              className="group flex items-center justify-center gap-2 bg-white text-brand-dark font-bold px-9 py-4 rounded-full hover:bg-brand-sand transition-colors text-sm">
              {isLoggedIn ? 'Go to Dashboard' : 'Create Your Free Profile'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!isLoggedIn && <Link to="/login"
              className="flex items-center justify-center gap-2 border border-white/15 text-white/70 font-semibold px-9 py-4 rounded-full transition-all text-sm"
              onMouseEnter={e => { e.currentTarget.style.borderColor = pink; e.currentTarget.style.color = pink }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}>
              Already have an account? Log in
            </Link>}
          </div>
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {['Free to join', 'No hidden fees', 'Payouts in 24h', 'Escrow protected'].map(item => (
              <span key={item} className="flex items-center gap-1.5 text-white/30 text-sm">
                <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: pink }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
