import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

const API = 'http://localhost:3001/api'
import { Helmet } from 'react-helmet-async'
import { slugify } from '../utils/slugify'
import {
  ArrowLeft, MapPin, Clock, DollarSign, Users,
  CheckCircle, Send, Briefcase, Calendar, BookmarkCheck, Bookmark,
  ChevronRight, X, Plus, Loader2,
} from 'lucide-react'
import Navbar from '../components/Navbar'

const pink = '#FF6B9D'
const purple = '#7c3aed'
const darkPurple = '#4c1d95'

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig3)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
      <defs>
        <linearGradient id="ig3" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
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

const PLATFORM_ICONS = {
  Instagram: <IgIcon />, TikTok: <TkIcon />, YouTube: <YtIcon />,
}

// Same mock data as JobListings — in a real app this would come from an API
const MOCK_JOBS = [
  {
    id: 'j1',
    brandId: null,
    brand: 'GlowUp Cosmetics',
    brandInitials: 'GC',
    brandColor: '#FF6B9D',
    brandLocation: 'Lagos, Nigeria',
    brandJobs: 12,
    brandRating: 4.8,
    title: 'Instagram Reel — Skincare Routine Feature',
    niche: 'Beauty & Skincare',
    platform: 'Instagram',
    contentType: 'Reel',
    budget: { min: 80000, max: 150000 },
    deadline: '2026-04-10',
    location: 'Lagos or Abuja (remote okay)',
    followersRequired: '5K+',
    description: `We're looking for an authentic beauty creator to feature our new GlowUp Serum in a 30–60 second skincare routine Reel on Instagram.\n\nThe content should feel natural and show a real skin transformation — we don't want overly produced or scripted videos. Your audience should trust your opinion and feel like you're genuinely recommending the product.\n\nThe serum will be shipped to you at no cost before the campaign. You'll have creative freedom on the routine, but the product must be featured prominently and used on camera.\n\nWe'll provide a promo code for your audience (10% off) which adds value to your followers and helps us track conversions.`,
    deliverables: [
      '1 × Instagram Reel (30–60 seconds)',
      '3 × Instagram Stories (day of posting)',
      'Product tag and brand mention in caption',
      'Promo code inclusion in caption',
      'Send raw footage within 3 days of posting',
    ],
    requirements: ['Female creator, aged 18–35', 'Beauty or skincare niche', '5K+ Instagram followers', '4%+ engagement rate', 'Based in Nigeria'],
    applicants: 14,
    isUrgent: true,
    postedAt: '2026-03-22',
  },
  {
    id: 'j2',
    brandId: null,
    brand: 'Tecno Mobile Nigeria',
    brandInitials: 'TM',
    brandColor: '#3b82f6',
    brandLocation: 'Lagos, Nigeria',
    brandJobs: 28,
    brandRating: 4.6,
    title: 'TikTok Viral Push — New Smartphone Unboxing',
    niche: 'Tech & Gadgets',
    platform: 'TikTok',
    contentType: 'Unboxing',
    budget: { min: 120000, max: 250000 },
    deadline: '2026-04-05',
    location: 'Nigeria (anywhere)',
    followersRequired: '10K+',
    description: `Create an engaging TikTok unboxing video of the Tecno Spark 30 Ultra. We want energy, humor, and honest reactions.\n\nTrending audio is welcome — pick something that fits your style. The phone will be yours to keep after the campaign as part of the deal.\n\nKey things to cover: unboxing experience, first impressions of the display and camera, one sample photo/video taken with the device, and your overall excitement about the product.\n\nWe do NOT want scripted reviews. Just be yourself and let your personality drive it.`,
    deliverables: [
      '1 × TikTok unboxing video (60–90 seconds)',
      'Product tag in video description',
      'Brand mention at least twice in the video',
      'Post within 72 hours of receiving the device',
    ],
    requirements: ['Tech or lifestyle niche', '10K+ TikTok followers', 'High video completion rate', 'Good camera quality setup'],
    applicants: 31,
    isUrgent: true,
    postedAt: '2026-03-21',
  },
  {
    id: 'j3',
    brandId: null,
    brand: 'Naija Bites',
    brandInitials: 'NB',
    brandColor: '#f97316',
    brandLocation: 'Lagos, Nigeria',
    brandJobs: 7,
    brandRating: 4.4,
    title: 'Food Review — Restaurant Campaign Series',
    niche: 'Food & Cooking',
    platform: 'Instagram',
    contentType: 'Talking Head',
    budget: { min: 60000, max: 100000 },
    deadline: '2026-04-20',
    location: 'Lagos',
    followersRequired: '3K+',
    description: `Visit our two Lagos locations — Victoria Island and Lekki Phase 1 — and create authentic food review content capturing the vibe, the food, and the experience.\n\nWe'll cover your meal in full and provide transport reimbursement (up to ₦10,000). You'll eat, experience, and share — simple as that.\n\nWe want content that feels like a recommendation from a friend, not a sponsored ad. Honest reactions only. If something doesn't sit right with you, we'd rather know privately than have it show on camera.`,
    deliverables: [
      '1 × Instagram Reel per location (30–45 seconds)',
      '3 × Instagram Stories per location',
      'Must tag @naijabites in all content',
      'Stories must include location sticker',
    ],
    requirements: ['Lagos-based creator', 'Food or lifestyle niche', '3K+ Instagram followers', 'Must show face on camera'],
    applicants: 8,
    isUrgent: false,
    postedAt: '2026-03-20',
  },
  {
    id: 'j4',
    brandId: null,
    brand: 'FitNaija',
    brandInitials: 'FN',
    brandColor: '#22c55e',
    brandLocation: 'Lagos, Nigeria',
    brandJobs: 5,
    brandRating: 4.9,
    title: 'YouTube Fitness Series — 4-Part Collaboration',
    niche: 'Fitness & Health',
    platform: 'YouTube',
    contentType: 'Tutorial',
    budget: { min: 350000, max: 600000 },
    deadline: '2026-05-01',
    location: 'Nigeria (remote)',
    followersRequired: '20K+',
    description: `We're looking for a fitness creator to partner with us on a 4-part YouTube series integrating the FitNaija app into your workout content.\n\nThis is a long-term partnership opportunity — if the series performs well, we'd love to continue collaborating. We'll provide full scripts if needed, or work with your content direction if you prefer more creative control.\n\nEach video should feature the FitNaija app naturally — showing tracking, workout logging, or meal planning features as part of your routine.`,
    deliverables: [
      '4 × YouTube videos (8–15 minutes each)',
      'App shown on screen for at least 90 seconds per video',
      'Download link in each video description',
      'End-screen CTA for app download',
      'Monthly performance report for each video',
    ],
    requirements: ['Fitness or health niche', '20K+ YouTube subscribers', 'Consistent upload schedule (weekly or bi-weekly)', 'Previous brand deal experience preferred'],
    applicants: 5,
    isUrgent: false,
    postedAt: '2026-03-19',
  },
  {
    id: 'j5',
    brandId: null,
    brand: 'Punchline Comedy',
    brandInitials: 'PC',
    brandColor: '#eab308',
    brandLocation: 'Lagos, Nigeria',
    brandJobs: 9,
    brandRating: 4.7,
    title: 'TikTok Comedy Skit — Show Promo',
    niche: 'Comedy & Entertainment',
    platform: 'TikTok',
    contentType: 'Comedy / Skit',
    budget: { min: 75000, max: 140000 },
    deadline: '2026-04-02',
    location: 'Nigeria (anywhere)',
    followersRequired: '8K+',
    description: `Write and perform a 30–45 second original comedy skit that naturally promotes our upcoming live show in Lagos on April 12th.\n\nWe're giving you full creative freedom — write your own concept, cast friends if needed, pick your setting. The only requirement is that the show date and ticket link appear naturally in the content (caption or a spoken line in the skit).\n\nBeing funny is literally the job requirement here. Make your audience laugh first; the promo is secondary.`,
    deliverables: [
      '1 × TikTok comedy skit (30–45 seconds)',
      'Show date mentioned in video or caption',
      'Ticket link in bio or Linktree for 7 days',
      'Must post before April 5th',
    ],
    requirements: ['Comedy content creator', '8K+ TikTok followers', 'Strong engagement on previous videos', 'Must be able to write and perform original content'],
    applicants: 22,
    isUrgent: true,
    postedAt: '2026-03-23',
  },
  {
    id: 'j6',
    brandId: null,
    brand: 'WealthUp Finance',
    brandInitials: 'WF',
    brandColor: '#10b981',
    brandLocation: 'Lagos, Nigeria',
    brandJobs: 6,
    brandRating: 4.5,
    title: 'Instagram Carousel — Investment Tips for Gen Z',
    niche: 'Finance & Business',
    platform: 'Instagram',
    contentType: 'Tutorial',
    budget: { min: 90000, max: 180000 },
    deadline: '2026-04-15',
    location: 'Nigeria (remote)',
    followersRequired: '7K+',
    description: `Create a 7-slide Instagram carousel breaking down beginner investment tips for Gen Z Nigerians. The goal is to make finance feel approachable, not overwhelming.\n\nOur team will provide the key points and an infographic template. You'll adapt the language to match your voice and your audience's style. Clear, simple, relatable — that's the brief.\n\nWe want to be associated with creators who are trusted by their communities — your credibility matters more than your follower count here.`,
    deliverables: [
      '1 × Instagram carousel (7 slides minimum)',
      'WealthUp logo on final slide',
      'Download CTA and app link in caption',
      'Must not contradict any financial claims we provide',
    ],
    requirements: ['Finance or business niche', '7K+ Instagram followers', 'Trusted, credible voice in your community', 'No history of controversial or misleading posts'],
    applicants: 11,
    isUrgent: false,
    postedAt: '2026-03-18',
  },
  {
    id: 'j7',
    brandId: null,
    brand: 'Ada Collections',
    brandInitials: 'AC',
    brandColor: '#a78bfa',
    brandLocation: 'Lagos, Nigeria',
    brandJobs: 15,
    brandRating: 4.9,
    title: 'Fashion Lookbook — New Season Styles',
    niche: 'Fashion & Style',
    platform: 'Instagram',
    contentType: 'Aesthetic',
    budget: { min: 100000, max: 200000 },
    deadline: '2026-04-08',
    location: 'Lagos',
    followersRequired: '10K+',
    description: `We're launching our new season collection and want 3 outfits styled and shot by a Lagos-based fashion creator.\n\nYou'll receive the items as a gift (no returns needed) plus the paid rate. We want full creative control on your end — choose your locations, your angles, your mood. Just keep the styling clean and the pieces as the focus.\n\nA Reel showing the 3 looks (outfit change format works great) plus 5 polished feed photos across the 3 outfits.`,
    deliverables: [
      '1 × Instagram Reel (outfit change format, 30–60 seconds)',
      '5 × feed photos (minimum 1 per outfit)',
      'Tag @adacollections in all posts',
      'Send raw files within 5 days of posting',
      'Must not post for competing fashion brands within 2 weeks',
    ],
    requirements: ['Fashion or lifestyle niche', 'Lagos-based creator', '10K+ Instagram followers', '5%+ engagement rate preferred', 'Clean, aesthetic feed'],
    applicants: 19,
    isUrgent: true,
    postedAt: '2026-03-22',
  },
  {
    id: 'j8',
    brandId: null,
    brand: 'TravelNaija',
    brandInitials: 'TN',
    brandColor: '#06b6d4',
    brandLocation: 'Lagos, Nigeria',
    brandJobs: 11,
    brandRating: 4.6,
    title: 'YouTube Vlog — Hidden Gems of Nigeria Series',
    niche: 'Travel',
    platform: 'YouTube',
    contentType: 'Vlog',
    budget: { min: 200000, max: 400000 },
    deadline: '2026-04-25',
    location: 'Nigeria (travel required)',
    followersRequired: '15K+',
    description: `We'll fully fund a 3-day trip to any destination within Nigeria of your choice. In return, create a 10–15 minute YouTube vlog that explores the culture, food, people, and hidden gems of that location.\n\nThis is part of an ongoing series celebrating underrated Nigerian destinations. We want authentic storytelling — show the real experience, not just the highlights. Include at least one local food experience and one interaction with a community member or local business.\n\nAll flights, hotel, and daily expenses are covered. The payment is on top of that.`,
    deliverables: [
      '1 × YouTube vlog (10–15 minutes)',
      'TravelNaija mentioned in intro and outro',
      'Website link in video description',
      'At least 3 location-specific B-roll clips',
      'Submit final edit within 14 days of return',
    ],
    requirements: ['Travel or lifestyle niche', '15K+ YouTube subscribers', 'Strong videography and storytelling skills', 'Comfortable travelling solo or with a small crew'],
    applicants: 7,
    isUrgent: false,
    postedAt: '2026-03-17',
  },
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

export default function JobDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  // Support both slug format (title-id) and legacy id-only format
  const job = MOCK_JOBS.find(j => slug === j.id || slug.endsWith(`-${j.id}`) || slug === `${slugify(j.title)}-${j.id}`)

  const [message, setMessage] = useState('')
  const [rate, setRate] = useState('')
  const [rateCardMode, setRateCardMode] = useState(false)
  const [rateCard, setRateCard] = useState([{ platform: '', deliverable: '', price: '' }])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  function addRateRow() {
    setRateCard(r => [...r, { platform: '', deliverable: '', price: '' }])
  }
  function updateRateRow(i, field, val) {
    setRateCard(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  }
  function removeRateRow(i) {
    setRateCard(r => r.filter((_, idx) => idx !== i))
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 50%, #e9d5ff 100%)' }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: '#1e0040' }}>Job not found.</p>
          <Link to="/jobs" className="text-sm font-medium" style={{ color: purple }}>← Back to job board</Link>
        </div>
      </div>
    )
  }

  const deadlineText = daysLeft(job.deadline)
  const isExpiring = deadlineText !== 'Expired' && parseInt(deadlineText) <= 3

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim() || submitting) return
    setSubmitting(true)
    const talentId = localStorage.getItem('brandiór_user')
    try {
      await fetch(`${API}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          brandId: job.brandId,
          talentId: talentId || 'talent_demo',
          message,
          rate: rateCardMode ? null : (rate || null),
          rateCard: rateCardMode ? rateCard : null,
        }),
      })
    } catch { /* server may be offline — still show success to user */ }
    setSubmitting(false)
    setSubmitted(true)
  }

  const jobSlug = `${slugify(job.title)}-${job.id}`

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 50%, #e9d5ff 100%)' }}>
      <Helmet>
        <title>{job.title} | {job.niche} Job | Brandior</title>
        <meta name="description" content={`${job.description.slice(0, 150)}... Apply on Brandior.`} />
        <meta property="og:title" content={`${job.title} | Brandior`} />
        <meta property="og:description" content={job.description.slice(0, 150)} />
        <meta property="og:url" content={`https://brandior.africa/jobs/${jobSlug}`} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://brandior.africa/jobs/${jobSlug}`} />
      </Helmet>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24">

        {/* Back link */}
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
          style={{ color: purple }}>
          <ArrowLeft className="w-4 h-4" /> Back to job board
        </Link>

        {/* ── Top row: details + meta ── */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">

          {/* Left: job details */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Header card */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', border: '1.5px solid #e9d5ff' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div>
                    <h1 className="text-xl font-black leading-snug" style={{ color: '#000000' }}>{job.title}</h1>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Posted {job.postedAt} · {job.applicants} proposals</p>
                  </div>
                </div>
                <button onClick={() => setSaved(v => !v)}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ backgroundColor: saved ? '#f3e8ff' : '#f5f3ff' }}>
                  {saved
                    ? <BookmarkCheck className="w-4 h-4" style={{ color: purple }} />
                    : <Bookmark className="w-4 h-4" style={{ color: '#a78bfa' }} />
                  }
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#f3e8ff', color: purple }}>
                  {PLATFORM_ICONS[job.platform] || <Briefcase className="w-3 h-3" />}
                  {job.platform}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#f3e8ff', color: purple }}>
                  {job.contentType}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: job.brandColor + '18', color: job.brandColor }}>
                  {job.niche}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', border: '1.5px solid #e9d5ff' }}>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#1e0040' }}>About this campaign</h2>
              {job.description.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm leading-relaxed mb-3 last:mb-0" style={{ color: '#000000' }}>{para}</p>
              ))}
            </div>

            {/* Deliverables */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', border: '1.5px solid #e9d5ff' }}>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#1e0040' }}>Deliverables</h2>
              <ul className="space-y-2.5">
                {job.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#000000' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', border: '1.5px solid #e9d5ff' }}>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#1e0040' }}>Requirements</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#000000' }}>
                    <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: purple }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: budget + brand */}
          <div className="lg:w-72 flex-shrink-0 space-y-5">

            {/* Budget & meta */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1.5px solid #e9d5ff' }}>
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid #f3e8ff' }}>
                <p className="text-xs text-gray-400 mb-1">Budget</p>
                <p className="text-2xl font-black" style={{ color: '#16a34a' }}>
                  {formatNGN(job.budget.min)} – {formatNGN(job.budget.max)}
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5" style={{ color: '#4b5563' }}>
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                  {job.location}
                </div>
                <div className="flex items-center gap-2.5" style={{ color: '#4b5563' }}>
                  <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                  {job.followersRequired} followers minimum
                </div>
                <div className="flex items-center gap-2.5" style={{ color: isExpiring || deadlineText === 'Expired' ? '#f97316' : '#4b5563' }}>
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: isExpiring || deadlineText === 'Expired' ? '#f97316' : '#a78bfa' }} />
                  Deadline: {job.deadline} ({deadlineText})
                </div>
                <div className="flex items-center gap-2.5" style={{ color: '#4b5563' }}>
                  <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                  {job.applicants} proposals submitted
                </div>
              </div>
            </div>

            {/* Brand info */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1.5px solid #e9d5ff' }}>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#1e0040' }}>About the brand</h3>
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="font-bold" style={{ color: '#1e0040' }}>{job.brandJobs}</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Campaigns posted</p>
                </div>
                <div>
                  <p className="font-bold" style={{ color: '#1e0040' }}>{job.brandRating} ★</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Avg. rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Full-width proposal form ── */}
        <div className="rounded-2xl p-8" style={{ backgroundColor: '#fff', border: '1.5px solid #e9d5ff' }}>
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#16a34a' }} />
              <p className="font-black text-lg mb-1" style={{ color: '#1e0040' }}>Proposal sent!</p>
              <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
                Your proposal will be reviewed and you'll be contacted shortly.
              </p>
              <Link to="/jobs"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full"
                style={{ backgroundColor: purple, color: '#fff' }}>
                <ArrowLeft className="w-4 h-4" /> Browse more jobs
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-black mb-6" style={{ color: '#1e0040' }}>Send a Proposal</h3>

              {/* Rate section */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold" style={{ color: '#4b5563' }}>Your rate</label>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ backgroundColor: '#f3eeff' }}>
                    <button type="button" onClick={() => setRateCardMode(false)}
                      className="text-xs font-semibold px-3 py-1 rounded-md transition-all"
                      style={!rateCardMode ? { backgroundColor: '#fff', color: darkPurple, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: '#9ca3af' }}>
                      Single rate
                    </button>
                    <button type="button" onClick={() => setRateCardMode(true)}
                      className="text-xs font-semibold px-3 py-1 rounded-md transition-all"
                      style={rateCardMode ? { backgroundColor: '#fff', color: darkPurple, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: '#9ca3af' }}>
                      Rate card
                    </button>
                  </div>
                </div>

                {!rateCardMode ? (
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={rate}
                        onChange={e => setRate(e.target.value)}
                        placeholder={`e.g. ${formatNGN(job.budget.min)}`}
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                        style={{ border: '1.5px solid #e9d5ff', color: '#1e0040', backgroundColor: '#faf5ff' }}
                        onFocus={e => e.target.style.borderColor = purple}
                        onBlur={e => e.target.style.borderColor = '#e9d5ff'}
                      />
                    </div>
                    <p className="text-xs pb-3" style={{ color: '#9ca3af' }}>
                      Budget: <span className="font-semibold" style={{ color: '#16a34a' }}>{formatNGN(job.budget.min)}–{formatNGN(job.budget.max)}</span>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #e9d5ff' }}>
                    <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-gray-400 px-3 py-2" style={{ backgroundColor: '#faf5ff' }}>
                      <span className="col-span-4">Platform</span>
                      <span className="col-span-5">Deliverable</span>
                      <span className="col-span-2 text-right">Rate (₦)</span>
                      <span className="col-span-1" />
                    </div>
                    {rateCard.map((row, i) => (
                      <div key={i} className="grid grid-cols-12 gap-1 px-2 py-1.5 border-t" style={{ borderColor: '#e9d5ff' }}>
                        <input value={row.platform} onChange={e => updateRateRow(i, 'platform', e.target.value)}
                          placeholder="Instagram" className="col-span-4 text-xs px-2 py-1.5 rounded-lg bg-white focus:outline-none"
                          style={{ border: '1px solid #e9d5ff', color: '#1e0040' }} />
                        <input value={row.deliverable} onChange={e => updateRateRow(i, 'deliverable', e.target.value)}
                          placeholder="1 Reel (60s)" className="col-span-5 text-xs px-2 py-1.5 rounded-lg bg-white focus:outline-none"
                          style={{ border: '1px solid #e9d5ff', color: '#1e0040' }} />
                        <input value={row.price} onChange={e => updateRateRow(i, 'price', e.target.value)}
                          placeholder="50000" type="number" className="col-span-2 text-xs px-2 py-1.5 rounded-lg bg-white focus:outline-none text-right"
                          style={{ border: '1px solid #e9d5ff', color: '#1e0040' }} />
                        <button type="button" onClick={() => removeRateRow(i)}
                          className="col-span-1 flex items-center justify-center text-gray-300 hover:text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addRateRow}
                      className="w-full text-xs font-semibold py-2 flex items-center justify-center gap-1 transition-colors border-t"
                      style={{ borderColor: '#e9d5ff', color: purple }}>
                      <Plus className="w-3.5 h-3.5" /> Add row
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4b5563' }}>
                  Cover message <span style={{ color: '#7c3aed' }}>*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={7}
                  placeholder="I'd love to collaborate on this campaign. Here's why I'm a great fit…"
                  className="w-full rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none transition-colors"
                  style={{ border: '1.5px solid #e9d5ff', color: '#1e0040', backgroundColor: '#faf5ff' }}
                  onFocus={e => e.target.style.borderColor = purple}
                  onBlur={e => e.target.style.borderColor = '#e9d5ff'}
                />
                <p className="text-right text-xs mt-1.5" style={{ color: message.length > 500 ? '#f97316' : '#9ca3af' }}>
                  {message.length}/500
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: '#9ca3af' }}>
                  Your profile will be shared with the brand when you apply.
                </p>
                <button type="submit"
                  disabled={!message.trim() || submitting}
                  className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all"
                  style={{
                    backgroundColor: message.trim() && !submitting ? purple : '#e9d5ff',
                    color: message.trim() && !submitting ? '#fff' : '#a78bfa',
                    cursor: message.trim() && !submitting ? 'pointer' : 'not-allowed',
                  }}>
                  {submitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
                  {submitting ? 'Submitting…' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
