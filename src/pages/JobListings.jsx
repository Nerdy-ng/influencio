import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, MapPin, Clock, DollarSign, Users, Filter, X,
  Instagram, Briefcase, ChevronRight, Bookmark, BookmarkCheck,
  Star, ExternalLink,
} from 'lucide-react'
import Navbar from '../components/Navbar'

const purple = '#c084fc'
const gold = '#D4AF37'

// SVG platform icons
function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig2)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
      <defs>
        <linearGradient id="ig2" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9CE34"/><stop offset="0.35" stopColor="#EE2A7B"/><stop offset="1" stopColor="#6228D7"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
function TkIcon() {
  return (
    <svg viewBox="0 0 448 512" className="w-4 h-4">
      <path fill="#69C9D0" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" transform="translate(-12,0)"/>
      <path fill="#EE1D52" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" transform="translate(12,0)"/>
      <path fill="#010101" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
    </svg>
  )
}
function YtIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FF0000">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/>
    </svg>
  )
}
function TwIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#000000">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

const PLATFORM_ICONS = {
  Instagram: <IgIcon />, TikTok: <TkIcon />, YouTube: <YtIcon />, 'Twitter/X': <TwIcon />,
}

const MOCK_JOBS = [
  {
    id: 'j1',
    brand: 'GlowUp Cosmetics',
    brandLogo: null,
    brandInitials: 'GC',
    brandColor: '#FF6B9D',
    title: 'Instagram Reel — Skincare Routine Feature',
    niche: 'Beauty & Skincare',
    platform: 'Instagram',
    contentType: 'Reel',
    budget: { min: 80000, max: 150000 },
    deadline: '2026-04-10',
    location: 'Lagos or Abuja (remote okay)',
    followersRequired: '5K+',
    description: 'We\'re looking for a beauty creator to feature our new GlowUp Serum in a 30-60s skincare routine Reel. Must be authentic and show real skin transformation.',
    requirements: ['Female, 18–35', 'Beauty/skincare niche', '5K+ Instagram followers', '4%+ engagement rate'],
    applicants: 14,
    isUrgent: true,
    postedAt: '2026-03-22',
  },
  {
    id: 'j2',
    brand: 'Tecno Mobile Nigeria',
    brandLogo: null,
    brandInitials: 'TM',
    brandColor: '#3b82f6',
    title: 'TikTok Viral Push — New Smartphone Unboxing',
    niche: 'Tech & Gadgets',
    platform: 'TikTok',
    contentType: 'Unboxing',
    budget: { min: 120000, max: 250000 },
    deadline: '2026-04-05',
    location: 'Nigeria (anywhere)',
    followersRequired: '10K+',
    description: 'Create an engaging TikTok unboxing video of the Tecno Spark 30 Ultra. We want energy, humor, and honest reactions. Trending audio welcome.',
    requirements: ['Tech or lifestyle niche', '10K+ TikTok followers', 'High video completion rate', 'Good camera quality'],
    applicants: 31,
    isUrgent: true,
    postedAt: '2026-03-21',
  },
  {
    id: 'j3',
    brand: 'Naija Bites',
    brandLogo: null,
    brandInitials: 'NB',
    brandColor: '#f97316',
    title: 'Food Review — Restaurant Campaign Series',
    niche: 'Food & Cooking',
    platform: 'Instagram',
    contentType: 'Talking Head',
    budget: { min: 60000, max: 100000 },
    deadline: '2026-04-20',
    location: 'Lagos',
    followersRequired: '3K+',
    description: 'Visit our Lagos locations (Victoria Island & Lekki) and create authentic food review content. 1 Reel + 3 Stories per location. Meal & transport provided.',
    requirements: ['Lagos-based', 'Food/lifestyle niche', '3K+ Instagram followers', 'Must show face on camera'],
    applicants: 8,
    isUrgent: false,
    postedAt: '2026-03-20',
  },
  {
    id: 'j4',
    brand: 'FitNaija',
    brandLogo: null,
    brandInitials: 'FN',
    brandColor: '#22c55e',
    title: 'YouTube Fitness Series — 4-Part Collaboration',
    niche: 'Fitness & Health',
    platform: 'YouTube',
    contentType: 'Tutorial',
    budget: { min: 350000, max: 600000 },
    deadline: '2026-05-01',
    location: 'Nigeria (remote)',
    followersRequired: '20K+',
    description: 'Looking for a fitness creator to partner on a 4-part YouTube series integrating the FitNaija app. Long-term partnership potential. Scripts provided.',
    requirements: ['Fitness/health niche', '20K+ YouTube subscribers', 'Consistent upload schedule', 'Previous brand deals preferred'],
    applicants: 5,
    isUrgent: false,
    postedAt: '2026-03-19',
  },
  {
    id: 'j5',
    brand: 'Punchline Comedy',
    brandLogo: null,
    brandInitials: 'PC',
    brandColor: '#eab308',
    title: 'TikTok Comedy Skit — Show Promo',
    niche: 'Comedy & Entertainment',
    platform: 'TikTok',
    contentType: 'Comedy / Skit',
    budget: { min: 75000, max: 140000 },
    deadline: '2026-04-02',
    location: 'Nigeria (anywhere)',
    followersRequired: '8K+',
    description: 'Write and perform a 30–45s comedy skit promoting our upcoming live show in Lagos. Creative freedom guaranteed — just include our show date naturally.',
    requirements: ['Comedy niche', '8K+ TikTok followers', 'Strong engagement', 'Funny is a requirement 😄'],
    applicants: 22,
    isUrgent: true,
    postedAt: '2026-03-23',
  },
  {
    id: 'j6',
    brand: 'WealthUp Finance',
    brandLogo: null,
    brandInitials: 'WF',
    brandColor: '#10b981',
    title: 'Instagram Carousel — Investment Tips for Gen Z',
    niche: 'Finance & Business',
    platform: 'Instagram',
    contentType: 'Tutorial',
    budget: { min: 90000, max: 180000 },
    deadline: '2026-04-15',
    location: 'Nigeria (remote)',
    followersRequired: '7K+',
    description: 'Create a 7-slide carousel breaking down beginner investment tips. We want clear, approachable language. Full brief + infographics provided by our team.',
    requirements: ['Finance/business niche', '7K+ Instagram followers', 'Must be credible/trusted voice', 'No controversial content history'],
    applicants: 11,
    isUrgent: false,
    postedAt: '2026-03-18',
  },
  {
    id: 'j7',
    brand: 'Ada Collections',
    brandLogo: null,
    brandInitials: 'AC',
    brandColor: '#a78bfa',
    title: 'Fashion Lookbook — New Season Styles',
    niche: 'Fashion & Style',
    platform: 'Instagram',
    contentType: 'Aesthetic',
    budget: { min: 100000, max: 200000 },
    deadline: '2026-04-08',
    location: 'Lagos',
    followersRequired: '10K+',
    description: 'Model and style 3 outfits from our new collection. 1 Reel + 5 feed photos. Items gifted + paid rate. Great engagement required. DM us your portfolio too.',
    requirements: ['Fashion niche', 'Lagos-based', '10K+ Instagram followers', '5%+ engagement rate preferred'],
    applicants: 19,
    isUrgent: true,
    postedAt: '2026-03-22',
  },
  {
    id: 'j8',
    brand: 'TravelNaija',
    brandLogo: null,
    brandInitials: 'TN',
    brandColor: '#06b6d4',
    title: 'YouTube Vlog — Hidden Gems of Nigeria Series',
    niche: 'Travel',
    platform: 'YouTube',
    contentType: 'Vlog',
    budget: { min: 200000, max: 400000 },
    deadline: '2026-04-25',
    location: 'Nigeria (travel required)',
    followersRequired: '15K+',
    description: 'We\'ll fund a 3-day trip to a location of your choice (within Nigeria). Create a 10–15min vlog exploring the culture, food, and hidden gems. Full trip covered.',
    requirements: ['Travel/lifestyle niche', '15K+ YouTube subscribers', 'High quality videography', 'Storytelling ability'],
    applicants: 7,
    isUrgent: false,
    postedAt: '2026-03-17',
  },
]

const NICHES = ['All Niches', 'Beauty & Skincare', 'Fashion & Style', 'Food & Cooking', 'Tech & Gadgets', 'Fitness & Health', 'Travel', 'Comedy & Entertainment', 'Finance & Business', 'Music', 'Gaming', 'Lifestyle']
const PLATFORMS = ['All Platforms', 'Instagram', 'TikTok', 'YouTube', 'Twitter/X']
const BUDGETS = [
  { label: 'Any budget', min: 0, max: Infinity },
  { label: '₦0 – ₦100K', min: 0, max: 100000 },
  { label: '₦100K – ₦250K', min: 100000, max: 250000 },
  { label: '₦250K – ₦500K', min: 250000, max: 500000 },
  { label: '₦500K+', min: 500000, max: Infinity },
]

function formatNGN(n) {
  if (n >= 1000000) return '₦' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '₦' + (n / 1000).toFixed(0) + 'K'
  return '₦' + n
}

function daysLeft(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now()
  const days = Math.ceil(diff / 86400000)
  if (days < 0) return 'Expired'
  if (days === 0) return 'Last day!'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

function JobCard({ job, saved, onToggleSave }) {
  const deadlineText = daysLeft(job.deadline)
  const isExpiring = deadlineText !== 'Expired' && parseInt(deadlineText) <= 3

  return (
    <div className="p-6 rounded-2xl transition-all hover:shadow-md"
      style={{ backgroundColor: '#f3e8ff', border: '1.5px solid #e9d5ff' }}>
      <div className="flex items-start justify-between gap-4">

        {/* Left: all job info */}
        <div className="flex-1 min-w-0">
          {/* Time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">Posted {job.postedAt}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold mb-1 leading-snug">
            <Link to={`/jobs/${job.id}`} style={{ color: '#1e0040' }}
              onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.color = '#1e0040'}>
              {job.title}
            </Link>
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: '#4b5563' }}>
            {job.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
              <span title={job.platform}>
                {PLATFORM_ICONS[job.platform] || <Briefcase className="w-3 h-3" />}
              </span>
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: job.brandColor + '18', color: job.brandColor }}>
              {job.niche}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: '#9ca3af' }}>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.followersRequired} followers</span>
            <span>{job.applicants} proposals</span>
          </div>
        </div>

        {/* Right: budget + actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Budget</p>
            <p className="text-base font-bold" style={{ color: '#000000' }}>
              {formatNGN(job.budget.min)} – {formatNGN(job.budget.max)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onToggleSave(job.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: saved ? '#f3e8ff' : '#f5f3ff' }}>
              {saved
                ? <BookmarkCheck className="w-4 h-4" style={{ color: purple }} />
                : <Bookmark className="w-4 h-4" style={{ color: '#a78bfa' }} />
              }
            </button>
            <Link to={`/jobs/${job.id}`}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all"
              style={{ backgroundColor: '#7c3aed', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7c3aed'}>
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildSuggestions(query) {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()
  const seen = new Set()
  const results = []

  MOCK_JOBS.forEach(j => {
    const texts = [
      j.title, j.description, j.niche, j.platform,
      j.contentType, j.location, ...(j.requirements || []),
    ]

    texts.forEach(text => {
      if (!text) return
      const clean = text.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
      const words = clean.split(' ').filter(w => w.length >= 3)

      // single words
      words.forEach(w => {
        const key = w.toLowerCase()
        if (key.includes(q) && !seen.has(key)) {
          seen.add(key)
          results.push(w.toLowerCase())
        }
      })

      // 2-word phrases
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`.toLowerCase()
        if (phrase.includes(q) && !seen.has(phrase)) {
          seen.add(phrase)
          results.push(phrase)
        }
      }

      // 3-word phrases
      for (let i = 0; i < words.length - 2; i++) {
        const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`.toLowerCase()
        if (phrase.includes(q) && !seen.has(phrase)) {
          seen.add(phrase)
          results.push(phrase)
        }
      }
    })
  })

  // Sort: starts-with first, then contains
  return results
    .sort((a, b) => {
      const aStarts = a.startsWith(q)
      const bStarts = b.startsWith(q)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return a.length - b.length
    })
    .slice(0, 7)
}

export default function JobListings() {
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('All Niches')
  const [platform, setPlatform] = useState('All Platforms')
  const [budgetIdx, setBudgetIdx] = useState(0)
  const [saved, setSaved] = useState(new Set())
  const [appliedSearch, setAppliedSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [openSections, setOpenSections] = useState({ niche: true, platform: true, budget: true })
  function toggleSection(key) { setOpenSections(s => ({ ...s, [key]: !s[key] })) }
  const searchRef = useRef(null)

  const suggestions = buildSuggestions(search)

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggleSave(id) {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const budget = BUDGETS[budgetIdx]

  const filtered = MOCK_JOBS.filter(j => {
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase()
      const searchable = [
        j.title,
        j.niche,
        j.platform,
        j.contentType,
        j.location,
        j.description,
        ...j.requirements,
      ].join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }
    if (niche !== 'All Niches' && j.niche !== niche) return false
    if (platform !== 'All Platforms' && j.platform !== platform) return false
    if (j.budget.max < budget.min || j.budget.min > budget.max) return false
    return true
  })

  const activeFilters = (niche !== 'All Niches' ? 1 : 0) + (platform !== 'All Platforms' ? 1 : 0) +
    (budgetIdx > 0 ? 1 : 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4" style={{ color: '#7c3aed' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#7c3aed' }}>Job Board</span>
          </div>
          <h1 className="text-3xl font-black mb-1" style={{ color: '#1e0040' }}>Brand Campaigns</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Discover paid collaborations posted by brands looking for creators like you.</p>
        </div>

        <div className="flex gap-6 items-start">

          {/* ── Left sidebar: always visible on desktop ── */}
          <aside className="hidden lg:block flex-shrink-0 sticky top-24" style={{ width: '210px' }}>
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#faf5ff', border: '1.5px solid #e9d5ff' }}>

              {activeFilters > 0 && (
                <button onClick={() => { setNiche('All Niches'); setPlatform('All Platforms'); setBudgetIdx(0) }}
                  className="flex items-center gap-1.5 text-xs font-semibold mb-4"
                  style={{ color: '#ef4444' }}>
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}

              {/* Niche */}
              <div className="mb-1">
                <button onClick={() => toggleSection('niche')}
                  className="flex items-center justify-between w-full py-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#7c3aed' }}>
                  Niche
                  <ChevronRight className="w-3.5 h-3.5 transition-transform" style={{ transform: openSections.niche ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                </button>
                {openSections.niche && (
                  <div className="flex flex-col gap-0.5 mt-1 mb-4">
                    {NICHES.map(n => (
                      <button key={n} onClick={() => setNiche(n)}
                        className="text-left text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{ backgroundColor: niche === n ? '#7c3aed' : 'transparent', color: niche === n ? '#fff' : '#4b5563' }}
                        onMouseEnter={e => { if (niche !== n) e.currentTarget.style.backgroundColor = '#ede9fe' }}
                        onMouseLeave={e => { if (niche !== n) e.currentTarget.style.backgroundColor = 'transparent' }}>
                        {n === 'All Niches' ? 'All Niches' : n}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ height: '1px', backgroundColor: '#e9d5ff', margin: '2px 0 6px' }} />

              {/* Platform */}
              <div className="mb-1">
                <button onClick={() => toggleSection('platform')}
                  className="flex items-center justify-between w-full py-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#7c3aed' }}>
                  Platform
                  <ChevronRight className="w-3.5 h-3.5 transition-transform" style={{ transform: openSections.platform ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                </button>
                {openSections.platform && (
                  <div className="flex flex-col gap-0.5 mt-1 mb-4">
                    {PLATFORMS.map(p => (
                      <button key={p} onClick={() => setPlatform(p)}
                        className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{ backgroundColor: platform === p ? '#7c3aed' : 'transparent', color: platform === p ? '#fff' : '#4b5563' }}
                        onMouseEnter={e => { if (platform !== p) e.currentTarget.style.backgroundColor = '#ede9fe' }}
                        onMouseLeave={e => { if (platform !== p) e.currentTarget.style.backgroundColor = 'transparent' }}>
                        {p !== 'All Platforms' && <span className="flex-shrink-0">{PLATFORM_ICONS[p]}</span>}
                        {p === 'All Platforms' ? 'All Platforms' : p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ height: '1px', backgroundColor: '#e9d5ff', margin: '2px 0 6px' }} />

              {/* Budget */}
              <div>
                <button onClick={() => toggleSection('budget')}
                  className="flex items-center justify-between w-full py-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#7c3aed' }}>
                  Budget
                  <ChevronRight className="w-3.5 h-3.5 transition-transform" style={{ transform: openSections.budget ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                </button>
                {openSections.budget && (
                  <div className="flex flex-col gap-0.5 mt-1">
                    {BUDGETS.map((b, i) => (
                      <button key={b.label} onClick={() => setBudgetIdx(i)}
                        className="text-left text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{ backgroundColor: budgetIdx === i ? '#16a34a' : 'transparent', color: budgetIdx === i ? '#fff' : '#4b5563' }}
                        onMouseEnter={e => { if (budgetIdx !== i) e.currentTarget.style.backgroundColor = '#dcfce7' }}
                        onMouseLeave={e => { if (budgetIdx !== i) e.currentTarget.style.backgroundColor = 'transparent' }}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* ── Main: search + jobs ── */}
          <div className="flex-1 min-w-0">

            {/* Search + mobile filter toggle */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1" ref={searchRef}>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: '#a78bfa' }} />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search jobs, niches, platforms…"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: '#fff', border: '1.5px solid #e9d5ff', color: '#1e0040' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { setAppliedSearch(search); setShowSuggestions(false) }
                    if (e.key === 'Escape') { setShowSuggestions(false) }
                  }}
                />
                {search && (
                  <button onClick={() => { setSearch(''); setAppliedSearch(''); setShowSuggestions(false) }} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#a78bfa' }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl shadow-xl overflow-hidden z-50"
                    style={{ backgroundColor: '#fff', border: '1.5px solid #e9d5ff' }}>
                    {suggestions.map((s, i) => (
                      <button key={i}
                        onMouseDown={e => { e.preventDefault(); setSearch(s); setAppliedSearch(s); setShowSuggestions(false) }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors"
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#faf5ff'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#c084fc' }} />
                        <span className="text-sm font-medium" style={{ color: '#1e0040' }}>{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile filter toggle */}
              <button onClick={() => setShowFilters(v => !v)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all lg:hidden"
                style={{
                  backgroundColor: showFilters || activeFilters > 0 ? '#7c3aed' : '#fff',
                  border: '1.5px solid #e9d5ff',
                  color: showFilters || activeFilters > 0 ? '#fff' : '#7c3aed',
                }}>
                <Filter className="w-4 h-4" />
                Filters
                {activeFilters > 0 && (
                  <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>{activeFilters}</span>
                )}
              </button>
            </div>

            {/* Mobile expanded filters */}
            {showFilters && (
              <div className="lg:hidden rounded-2xl p-5 mb-4 grid sm:grid-cols-3 gap-4"
                style={{ backgroundColor: '#faf5ff', border: '1.5px solid #e9d5ff' }}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7c3aed' }}>Niche</p>
                  <div className="flex flex-wrap gap-1.5">
                    {NICHES.map(n => (
                      <button key={n} onClick={() => setNiche(n)}
                        className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                        style={{ backgroundColor: niche === n ? '#7c3aed' : '#f5f3ff', color: niche === n ? '#fff' : '#7c3aed' }}>
                        {n === 'All Niches' ? 'All' : n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7c3aed' }}>Platform</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORMS.map(p => (
                      <button key={p} onClick={() => setPlatform(p)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                        style={{ backgroundColor: platform === p ? '#7c3aed' : '#f5f3ff', color: platform === p ? '#fff' : '#7c3aed' }}>
                        {p === 'All Platforms' ? 'All' : <span title={p}>{PLATFORM_ICONS[p]}</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7c3aed' }}>Budget</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BUDGETS.map((b, i) => (
                      <button key={b.label} onClick={() => setBudgetIdx(i)}
                        className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                        style={{ backgroundColor: budgetIdx === i ? '#16a34a' : '#f0fdf4', color: budgetIdx === i ? '#fff' : '#16a34a' }}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {saved.size > 0 && (
              <div className="flex justify-end mb-2">
                <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#7c3aed' }}>
                  <BookmarkCheck className="w-3.5 h-3.5" /> {saved.size} saved
                </span>
              </div>
            )}

            {/* Job list */}
            <div className="flex flex-col gap-4">
              {filtered.length > 0 ? (
                filtered.map(job => (
                  <JobCard key={job.id} job={job} saved={saved.has(job.id)} onToggleSave={toggleSave} />
                ))
              ) : (
                <div className="text-center py-20">
                  <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: '#e9d5ff' }} />
                  <p className="font-medium" style={{ color: '#9ca3af' }}>No campaigns match your filters.</p>
                  <button onClick={() => { setSearch(''); setAppliedSearch(''); setNiche('All Niches'); setPlatform('All Platforms'); setBudgetIdx(0) }}
                    className="mt-4 text-sm font-semibold" style={{ color: '#7c3aed' }}>
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
