import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Clock, Users, TrendingUp, ArrowRight, BadgeCheck, X, Star } from 'lucide-react'

const gigs = [
  {
    brand: 'GlowLab Skincare',
    initials: 'GL',
    verified: true,
    title: 'Instagram Skincare Routine Reel',
    budget: '₦350,000',
    budgetRange: '₦200K – ₦500K',
    budgetType: 'per post',
    niche: 'Beauty & Skincare',
    platform: 'Instagram',
    deadline: '5 days left',
    minFollowers: '50K+',
    engagement: '4%+',
    desc: 'We need a talent to showcase our new GlowSerum in a 30–60 second Instagram Reel. Must include product demo and personal review.',
    tags: ['Skincare', 'Reels', 'UGC'],
    accentColor: '#FF6B9D',
    featured: true,
  },
  {
    brand: 'PeakFit Nigeria',
    initials: 'PF',
    verified: true,
    title: 'YouTube Fitness Transformation Video',
    budget: '₦980,000',
    budgetRange: '₦700K – ₦1.2M',
    budgetType: 'per video',
    niche: 'Fitness & Health',
    platform: 'YouTube',
    deadline: '10 days left',
    minFollowers: '100K+',
    engagement: '3%+',
    desc: 'Looking for a fitness talent to document a 30-day challenge using PeakFit supplements. Long-form video (8–15 mins) with honest review.',
    tags: ['Fitness', 'YouTube', 'Long-form'],
    accentColor: '#c084fc',
    featured: false,
  },
  {
    brand: 'UrbanThread Africa',
    initials: 'UT',
    verified: false,
    title: 'Fashion Lookbook — Eid Collection',
    budget: '₦220,000',
    budgetRange: '₦150K – ₦300K',
    budgetType: 'per post',
    niche: 'Fashion & Style',
    platform: 'Instagram',
    deadline: '3 days left',
    minFollowers: '20K+',
    engagement: '5%+',
    desc: 'Showcase our Eid 2025 collection in a styled lookbook post. 3 feed photos + 5 stories. Creative freedom encouraged.',
    tags: ['Fashion', 'Eid', 'Lookbook'],
    accentColor: '#D4AF37',
    featured: false,
  },
  {
    brand: 'MindfulBrew Co.',
    initials: 'MB',
    verified: true,
    title: 'TikTok Morning Routine Integration',
    budget: '₦180,000',
    budgetRange: '₦100K – ₦250K',
    budgetType: 'per video',
    niche: 'Lifestyle & Wellness',
    platform: 'TikTok',
    deadline: '7 days left',
    minFollowers: '30K+',
    engagement: '6%+',
    desc: 'Integrate our herbal tea into your morning routine TikTok. Casual, authentic feel. No scripted lines — just show how you enjoy it.',
    tags: ['TikTok', 'Lifestyle', 'Wellness'],
    accentColor: '#FF6B9D',
    featured: false,
  },
  {
    brand: 'SwiftTech Gadgets',
    initials: 'ST',
    verified: true,
    title: 'Unboxing & Review — SwiftPad Pro',
    budget: '₦1,400,000',
    budgetRange: '₦1M – ₦2M',
    budgetType: 'per video',
    niche: 'Tech & Gaming',
    platform: 'YouTube',
    deadline: '14 days left',
    minFollowers: '200K+',
    engagement: '3%+',
    desc: 'In-depth unboxing and honest review of our new SwiftPad Pro tablet. 10–20 min video. Talent keeps the device after the campaign.',
    tags: ['Tech', 'Unboxing', 'Review'],
    accentColor: '#c084fc',
    featured: false,
  },
  {
    brand: 'BiteBliss Foods',
    initials: 'BB',
    verified: false,
    title: 'Recipe Creation — Afro-Fusion Series',
    budget: '₦290,000',
    budgetRange: '₦200K – ₦400K',
    budgetType: 'per post',
    niche: 'Food & Cooking',
    platform: 'Instagram',
    deadline: '8 days left',
    minFollowers: '25K+',
    engagement: '5%+',
    desc: 'Create 2 original recipes using BiteBliss spice blends. Shot in natural light, delivered as Reels. Recipe card included as a swipe post.',
    tags: ['Food', 'Recipe', 'Afro-Fusion'],
    accentColor: '#D4AF37',
    featured: false,
  },
]

function SignupModal({ gig, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-dark/30 hover:text-brand-dark transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4" style={{ backgroundColor: gig.accentColor }}>
            {gig.initials}
          </div>
          <p className="text-brand-dark/50 text-xs mb-1">{gig.brand} · {gig.platform}</p>
          <h3 className="text-xl font-black text-brand-dark leading-snug">{gig.title}</h3>
          <p className="font-black text-2xl mt-2" style={{ color: gig.accentColor }}>{gig.budget}</p>
          <p className="text-brand-dark/30 text-xs">{gig.budgetRange} · {gig.budgetType}</p>
        </div>

        <div className="flex items-center gap-2 bg-brand-dark/3 rounded-xl p-3 mb-6">
          <Star className="w-4 h-4 flex-shrink-0" style={{ color: gig.accentColor }} />
          <p className="text-brand-dark/60 text-xs">Join as a talent to apply for this gig and hundreds more like it.</p>
        </div>

        <Link to="/signup"
          className="block text-center w-full py-3.5 rounded-full font-bold text-white text-sm mb-3 transition-all"
          style={{ backgroundColor: '#4c1d95' }}>
          Join as a Talent — It's Free
        </Link>
        <p className="text-center text-brand-dark/30 text-xs">Already have an account? <Link to="/login" className="font-semibold" style={{ color: gig.accentColor }}>Log in</Link></p>
      </div>
    </div>
  )
}

function GigCard({ gig, onApply }) {
  return (
    <div
      onClick={onApply}
      className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
      style={{
        backgroundColor: gig.featured ? `${gig.accentColor}12` : '#fff',
        border: `1px solid ${gig.featured ? gig.accentColor + '40' : '#e9d5ff'}`,
        boxShadow: gig.featured ? `0 8px 32px ${gig.accentColor}18` : '0 2px 12px rgba(192,132,252,0.08)',
      }}
    >
      {gig.featured && (
        <div className="absolute -top-3 left-5">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1 rounded-full"
            style={{ backgroundColor: gig.accentColor }}>
            <Zap className="w-3 h-3" /> Featured
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: gig.accentColor }}>
            {gig.initials}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-brand-dark font-semibold text-sm">{gig.brand}</p>
              {gig.verified && <BadgeCheck className="w-3.5 h-3.5" style={{ color: gig.accentColor }} />}
            </div>
            <p className="text-brand-dark/40 text-xs">{gig.platform} · {gig.niche}</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0"
          style={{ color: gig.accentColor, backgroundColor: `${gig.accentColor}15`, border: `1px solid ${gig.accentColor}30` }}>
          {gig.niche}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-brand-dark font-bold text-base leading-snug">{gig.title}</h3>

      {/* Desc */}
      <p className="text-brand-dark/50 text-xs leading-relaxed">{gig.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {gig.tags.map(t => (
          <span key={t} className="text-[10px] text-brand-dark/40 bg-brand-dark/5 rounded-full px-2 py-0.5">{t}</span>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-brand-dark/50 border-t pt-3" style={{ borderColor: `${gig.accentColor}20` }}>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {gig.minFollowers}</span>
        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {gig.engagement}</span>
        <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" /> {gig.deadline}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-black text-lg" style={{ color: gig.accentColor }}>{gig.budget}</p>
          <p className="text-brand-dark/35 text-[10px]">{gig.budgetRange} · {gig.budgetType}</p>
        </div>
        <button onClick={e => { e.stopPropagation(); onApply() }} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white transition-all"
          style={{ backgroundColor: gig.accentColor }}>
          Apply Now <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default function FeaturedJobs() {
  const navigate = useNavigate()
  const [activeGig, setActiveGig] = useState(null)
  const isLoggedIn = !!localStorage.getItem('brandiór_user')

  function handleApply(gig) {
    if (isLoggedIn) { navigate('/dashboard?tab=overview'); return }
    setActiveGig(gig)
  }

  return (
    <section id="pricing" className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B9D' }}>Opportunities</p>
          <h2 className="text-4xl lg:text-5xl font-black text-brand-dark mb-5">Featured Jobs</h2>
          <p className="text-brand-dark/50 max-w-lg mx-auto text-lg">
            Discover top brand campaigns and talent opportunities on Brandiór.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig, i) => <GigCard key={i} gig={gig} onApply={() => handleApply(gig)} />)}
        </div>
        {activeGig && <SignupModal gig={activeGig} onClose={() => setActiveGig(null)} />}

        <p className="text-center text-brand-dark/30 text-sm mt-10">
          Hundreds more opportunities inside.{' '}
          <a href="#" className="font-semibold hover:underline" style={{ color: '#FF6B9D' }}>
            Browse all gigs →
          </a>
        </p>
      </div>
    </section>
  )
}
