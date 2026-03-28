import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TrustBar from '../components/TrustBar'
import Footer from '../components/Footer'
import {
  ArrowRight, Star, Shield, BadgeCheck, BarChart2, Filter,
  Clock, TrendingUp, Building2, Target, Search, DollarSign,
  CheckCircle, Zap, ChevronDown, Users, Award,
} from 'lucide-react'

const pink       = '#FF6B9D'
const purple     = '#7c3aed'
const darkPurple = '#4c1d95'
const gold       = '#D4AF37'

/* ── Floating hero cards (brand perspective) ── */
const HeroCard1 = () => (
  <div className="glass rounded-2xl p-4 shadow-2xl w-60" style={{ animation: 'float 6s ease-in-out infinite' }}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center">
        <Search className="w-4 h-4" style={{ color: '#c084fc' }} />
      </div>
      <div>
        <p className="text-white text-sm font-semibold">Talent Discovery</p>
        <p className="text-emerald-400 text-xs font-medium">• 500+ verified creators</p>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div><p className="text-white/40 text-xs mb-0.5">Beauty</p><p className="text-white font-bold text-sm">47</p></div>
      <div><p className="text-white/40 text-xs mb-0.5">Fashion</p><p className="text-white font-bold text-sm">54</p></div>
      <div><p className="text-white/40 text-xs mb-0.5">Tech</p><p className="text-white font-bold text-sm">29</p></div>
    </div>
  </div>
)

const HeroCard2 = () => (
  <div className="glass rounded-2xl p-4 shadow-2xl w-56" style={{ animation: 'float 8s ease-in-out infinite 1s' }}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center">
        <Shield className="w-4 h-4" style={{ color: '#4ade80' }} />
      </div>
      <div>
        <p className="text-white text-sm font-semibold">Escrow Protected</p>
        <p className="text-emerald-400 text-xs font-medium">• Funds secured</p>
      </div>
    </div>
    <p className="text-white/50 text-xs mb-1">Campaign Budget</p>
    <p className="text-2xl font-bold mb-1" style={{ color: '#c084fc' }}>₦350,000</p>
    <p className="text-white/40 text-xs">Released on your approval ✓</p>
  </div>
)

const HeroCard3 = () => (
  <div className="glass rounded-2xl p-3.5 shadow-2xl w-52" style={{ animation: 'float 7s ease-in-out infinite 2s' }}>
    <p className="text-white text-xs font-semibold mb-2">Campaign Performance</p>
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="text-white/40 text-[10px]">ROAS</p>
        <p className="font-extrabold text-sm" style={{ color: gold }}>4.2×</p>
      </div>
      <div>
        <p className="text-white/40 text-[10px]">Reach</p>
        <p className="font-extrabold text-sm text-white">820K</p>
      </div>
      <div>
        <p className="text-white/40 text-[10px]">Eng.</p>
        <p className="font-extrabold text-sm text-emerald-400">6.1%</p>
      </div>
    </div>
    <div className="w-full bg-white/10 rounded-full h-1.5">
      <div className="h-1.5 rounded-full" style={{ width: '84%', background: 'linear-gradient(90deg, #7c3aed, #c084fc)' }} />
    </div>
    <p className="text-white/30 text-[10px] mt-1">Campaign goal: 84% complete</p>
  </div>
)

/* ── Data ── */
const STEPS = [
  { icon: Search,     step: '01', title: 'Browse & Filter Talents',  desc: 'Search 500+ verified African creators by niche, tier, follower count, location, and budget.' },
  { icon: Target,     step: '02', title: 'Place a Campaign Order',   desc: 'Select a package, fill in your brief, and submit. The talent reviews and accepts your campaign.' },
  { icon: Shield,     step: '03', title: 'Fund Escrow Securely',     desc: 'Payment is held in secure escrow — released only when you approve the delivered content.' },
  { icon: CheckCircle,step: '04', title: 'Receive & Approve Content',desc: 'Review deliverables, request revisions if needed, then approve to release payment.' },
]

const NICHES = [
  { label: 'Beauty & Skincare', emoji: '💄', count: '47 creators' },
  { label: 'Food & Cooking',    emoji: '🍽️', count: '38 creators' },
  { label: 'Tech & Gadgets',    emoji: '📱', count: '29 creators' },
  { label: 'Fashion & Style',   emoji: '👗', count: '54 creators' },
  { label: 'Fitness & Health',  emoji: '💪', count: '33 creators' },
  { label: 'Comedy & Skits',    emoji: '😂', count: '41 creators' },
  { label: 'Finance & Business',emoji: '💼', count: '22 creators' },
  { label: 'Travel & Lifestyle',emoji: '✈️', count: '19 creators' },
]

const FEATURES = [
  { icon: Shield,    title: 'Escrow Payment Protection', desc: 'Funds are locked until you approve the content. Zero risk of paying for work that doesn\'t meet your brief.' },
  { icon: BadgeCheck,title: 'Verified Creator Network',  desc: 'Every creator on Brandiór is vetted. View real follower counts, engagement rates, and completed campaigns.' },
  { icon: Filter,    title: 'Advanced Search & Filters', desc: 'Filter by niche, tier, platform, price range, location, and availability to find your perfect match.' },
  { icon: BarChart2, title: 'Campaign Dashboard',        desc: 'Manage all active, pending, and completed campaigns from one clean brand dashboard.' },
  { icon: Clock,     title: 'Fast Turnaround',           desc: 'Most campaigns go from brief to delivery in 3–7 days. Rush options available for urgent campaigns.' },
  { icon: TrendingUp,title: 'Performance Insights',      desc: 'Track campaign performance, creator ratings, and spend history to optimise future campaigns.' },
]

const TESTIMONIALS = [
  {
    brand: 'GlowUp Cosmetics', role: 'Head of Marketing', name: 'Chinyere Obi',
    avatar: 'https://i.pravatar.cc/150?u=chinyere_obi',
    quote: "We ran 12 campaigns last quarter through Brandiór. The escrow system gave us confidence and every creator delivered on time. Our ROAS was 4.2x.",
    spent: '₦2.4M', campaigns: 12,
  },
  {
    brand: 'Tecno Mobile Africa', role: 'Digital Marketing Lead', name: 'Emeka Eke',
    avatar: 'https://i.pravatar.cc/150?u=emeka_eke_brand',
    quote: "The talent discovery is incredible. We found micro-creators across cities with insane engagement rates that we never would have discovered on our own.",
    spent: '₦8.1M', campaigns: 31,
  },
  {
    brand: 'FitAfrica App', role: 'Founder & CEO', name: 'Aisha Bello',
    avatar: 'https://i.pravatar.cc/150?u=aisha_bello_brand',
    quote: "As a startup, we needed affordable talent with real audiences. Brandiór's tier system helped us find rising creators at great rates who delivered amazing results.",
    spent: '₦540K', campaigns: 6,
  },
]

const STATS = [
  { value: '500+',   label: 'Verified Creators' },
  { value: '98%',    label: 'On-Time Delivery' },
  { value: '₦120M+', label: 'Campaigns Managed' },
  { value: '4.8★',   label: 'Avg. Brand Rating' },
]

const PACKAGES = [
  { type: 'Instagram Reel',      from: '₦25,000', badge: 'Most Popular',    badgeColor: pink },
  { type: 'TikTok Video',        from: '₦20,000', badge: 'High Reach',      badgeColor: '#22c55e' },
  { type: 'YouTube Integration', from: '₦75,000', badge: 'Premium',         badgeColor: gold },
  { type: 'Story Feature',       from: '₦8,000',  badge: 'Budget-Friendly', badgeColor: '#3b82f6' },
]

const FAQS = [
  { q: 'Do I need a subscription to run campaigns?',   a: 'No — Brandiór is pay-per-campaign. There are no monthly fees. You only pay when you hire a creator.' },
  { q: 'How does escrow work?',                        a: 'When you place a campaign order, funds are held securely. They\'re only released to the creator after you review and approve the deliverables.' },
  { q: 'Can I request revisions?',                     a: 'Yes. Most creators include 1–2 free revision rounds. You can request changes before approving and releasing escrow.' },
  { q: 'How do I find the right creator for my brand?',a: 'Use our advanced filters to search by niche, platform, follower count, tier, location, and price range. Every creator\'s profile shows real stats and past campaign work.' },
]

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: purple }}>FAQ</p>
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

export default function BrandLanding() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #150030 40%, #3d0080 100%)' }}>
        {/* dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* purple glow */}
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-15 -translate-y-1/4"
          style={{ background: `radial-gradient(circle, ${purple} 0%, transparent 70%)` }} />

        <div className="max-w-7xl mx-auto px-6 w-full py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.35)' }}>
                <Building2 className="w-3 h-3" /> For African Brands
              </span>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-white">
                <span style={{ color: '#c084fc' }}>Africa's Most</span><br />
                Trusted Creator<br />
                <span style={{ color: gold }}>Marketplace.</span>
              </h1>
              <p className="text-lg text-white/55 leading-relaxed max-w-lg">
                Connect with 500+ verified African creators. Run campaigns with full escrow protection, real analytics, and zero payment risk.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link to="/marketplace"
                  className="group flex items-center justify-center gap-2 font-bold px-7 py-4 rounded-full text-white transition-all text-sm hover:scale-105"
                  style={{ backgroundColor: purple, boxShadow: `0 8px 30px ${purple}55` }}>
                  Browse Creators
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/for-talents"
                  className="flex items-center justify-center gap-2 border border-white/15 text-white/70 font-semibold px-7 py-4 rounded-full transition-all text-sm"
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c084fc'; e.currentTarget.style.color = '#c084fc' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}>
                  I'm a Creator →
                </Link>
              </div>
              <div className="flex items-center gap-3 border-t border-white/5 pt-6">
                <div className="flex -space-x-2">
                  {['G','T','F','A','N'].map((l, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: darkPurple, borderColor: '#150030' }}>{l}</div>
                  ))}
                </div>
                <p className="text-white/35 text-sm">
                  Join <span className="font-semibold" style={{ color: '#c4b5fd' }}>200+ brands</span> already running campaigns on Brandiór
                </p>
              </div>
            </div>
            {/* Floating cards */}
            <div className="relative hidden lg:flex items-center justify-center h-[520px]">
              <div className="absolute top-8 right-8"><HeroCard1 /></div>
              <div className="absolute top-[180px] left-0"><HeroCard2 /></div>
              <div className="absolute bottom-16 right-16"><HeroCard3 /></div>
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
              <p className="text-3xl font-black mb-1" style={{ color: '#c4b5fd' }}>{s.value}</p>
              <p className="text-sm text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-white py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: purple }}>How It Works</p>
            <h2 className="text-4xl lg:text-5xl font-black text-brand-dark mb-4">Run a Campaign in 4 Steps</h2>
            <p className="text-brand-dark/50 max-w-xl mx-auto text-lg">From brief to delivered content — simple, secure, and fast.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px bg-brand-dark/8 z-0" />
            {STEPS.map((s, i) => (
              <div key={i} className="relative z-10 card-hover">
                <div className="rounded-2xl p-7 shadow-sm" style={{ backgroundColor: '#e9d5ff', border: '1px solid rgba(192,132,252,0.4)' }}>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#c084fc' }}>
                      <s.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-black" style={{ color: 'rgba(107,33,168,0.25)' }}>{s.step}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#3b0764' }}>{s.title}</h3>
                  <div className="w-8 h-0.5 rounded-full mb-3" style={{ backgroundColor: '#c084fc' }} />
                  <p className="leading-relaxed text-sm" style={{ color: 'rgba(59,7,100,0.6)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CREATOR NICHES ── */}
      <section className="py-28 px-6" style={{ background: 'linear-gradient(135deg, #0d0020 0%, #1e0a3c 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#c084fc' }}>Creator Categories</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Find Creators in Every Niche</h2>
            <p className="text-white/40 max-w-xl mx-auto">From beauty to finance — verified creators in every major category.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {NICHES.map(n => (
              <Link key={n.label} to="/marketplace"
                className="p-5 rounded-2xl text-center transition-all hover:scale-105 group"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,132,252,0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,132,252,0.5)'; e.currentTarget.style.backgroundColor = 'rgba(192,132,252,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(192,132,252,0.2)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}>
                <span className="text-3xl block mb-2">{n.emoji}</span>
                <p className="font-bold text-white text-sm">{n.label}</p>
                <p className="text-xs text-white/40 mt-1">{n.count}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/marketplace"
              className="inline-flex items-center gap-2 text-sm font-bold px-7 py-3.5 rounded-full text-white transition-all hover:scale-105"
              style={{ backgroundColor: purple, boxShadow: `0 8px 30px ${purple}44` }}>
              Browse All Creators <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CAMPAIGN PACKAGES ── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: purple }}>Campaign Types</p>
            <h2 className="text-4xl lg:text-5xl font-black text-brand-dark">Every Format. Every Budget.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PACKAGES.map(p => (
              <div key={p.type} className="p-6 rounded-2xl border border-brand-dark/8 card-hover">
                {p.badge && (
                  <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-3 text-white"
                    style={{ backgroundColor: p.badgeColor }}>
                    {p.badge}
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#e9d5ff' }}>
                  <Zap className="w-5 h-5" style={{ color: darkPurple }} />
                </div>
                <p className="font-extrabold text-brand-dark mb-1">{p.type}</p>
                <p className="text-2xl font-black mt-2" style={{ color: darkPurple }}>{p.from}</p>
                <p className="text-xs text-brand-dark/40 mt-0.5">starting from</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 px-6" style={{ background: 'linear-gradient(135deg, #150030 0%, #0d0020 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#c084fc' }}>Platform Features</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white">Built for Brands That<br />Mean Business</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl glass">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(124,58,237,0.25)' }}>
                  <f.icon className="w-5 h-5" style={{ color: '#c4b5fd' }} />
                </div>
                <p className="font-extrabold text-white mb-1">{f.title}</p>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: purple }}>Brand Stories</p>
            <h2 className="text-4xl lg:text-5xl font-black text-brand-dark">Brands That Trust Brandiór</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.brand} className="rounded-3xl p-6 border border-brand-dark/8 card-hover">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5" style={{ color: gold, fill: gold }} />
                  ))}
                </div>
                <p className="text-brand-dark/70 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-brand-dark text-sm">{t.name}</p>
                    <p className="text-xs text-brand-dark/40">{t.role} · {t.brand}</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-brand-dark/5">
                  <div>
                    <p className="font-extrabold text-sm" style={{ color: darkPurple }}>{t.spent}</p>
                    <p className="text-[10px] text-brand-dark/40">total spend</p>
                  </div>
                  <div>
                    <p className="font-extrabold text-sm" style={{ color: darkPurple }}>{t.campaigns}</p>
                    <p className="text-[10px] text-brand-dark/40">campaigns</p>
                  </div>
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
          <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#c4b5fd' }}>Ready to grow?</p>
          <h2 className="text-5xl font-black text-white mb-5 leading-tight">
            Your First Campaign<br />
            Starts <span style={{ color: '#c084fc' }}>Here.</span>
          </h2>
          <p className="text-white/50 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Browse verified creators, set your budget, and run your first campaign in minutes. No subscription needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/marketplace"
              className="group flex items-center justify-center gap-2 bg-white text-brand-dark font-bold px-9 py-4 rounded-full hover:bg-purple-50 transition-colors text-sm">
              Browse Creators
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login?role=brand"
              className="flex items-center justify-center gap-2 border border-white/15 text-white/70 font-semibold px-9 py-4 rounded-full transition-all text-sm"
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c084fc'; e.currentTarget.style.color = '#c084fc' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}>
              Already have an account? Log in
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {['No subscription', 'Pay per campaign', 'Escrow protected', 'Full analytics'].map(item => (
              <span key={item} className="flex items-center gap-1.5 text-white/30 text-sm">
                <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: '#c084fc' }} />
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
