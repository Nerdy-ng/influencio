import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  Search, MapPin, Users, Heart, CheckCircle, Star, Filter,
  Zap, X, SlidersHorizontal,
  Lock, BadgeCheck, ArrowRight, Play,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import Navbar from '../components/Navbar'

const API = 'http://localhost:3001/api'

const pink = '#FF6B9D'
const darkPurple = '#4c1d95'
const purple = '#7c3aed'

const NICHES = [
  { label: 'Beauty & Skincare', emoji: '💄' },
  { label: 'Fashion & Style',   emoji: '👗' },
  { label: 'Food & Cooking',    emoji: '🍳' },
  { label: 'Tech & Gadgets',    emoji: '💻' },
  { label: 'Fitness & Wellness',emoji: '💪' },
  { label: 'Travel & Lifestyle',emoji: '✈️'  },
  { label: 'Entertainment',     emoji: '🎬' },
  { label: 'Comedy',            emoji: '😂' },
  { label: 'Music',             emoji: '🎵' },
  { label: 'Finance & Business',emoji: '💼' },
]

const NICHE_LABELS = NICHES.map(n => n.label)

const LOCATIONS = ['Lagos', 'Abuja', 'Accra, Ghana', 'Kumasi, Ghana', 'Nairobi, Kenya', 'Mombasa, Kenya']

const GENDERS = ['Male', 'Female', 'Non-binary']

const AGE_RANGES = [
  { label: '18–24', min: 18, max: 24 },
  { label: '25–34', min: 25, max: 34 },
  { label: '35–44', min: 35, max: 44 },
  { label: '45+',   min: 45, max: 99 },
]

const FOLLOWER_RANGES = [
  { label: 'Nano  · < 10K',    min: 0,      max: 9999   },
  { label: 'Micro · 10K–50K',  min: 10000,  max: 50000  },
  { label: 'Mid   · 50K–200K', min: 50001,  max: 200000 },
  { label: 'Macro · 200K–1M',  min: 200001, max: 1000000},
  { label: 'Mega  · 1M+',      min: 1000001,max: Infinity},
]

const CONTENT_TYPES = ['Photo', 'Video', 'Reels', 'Stories', 'Podcast', 'Tutorial', 'Music']

const LANGUAGES = ['English', 'French', 'Swahili', 'Hausa', 'Yoruba', 'Igbo', 'Twi', 'Amharic']

const TIERS = [
  { value: 'fast-rising', label: 'Fast Rising', color: '#22c55e', diamond: false, desc: 'New & climbing. Entry-level creators building their presence.' },
  { value: 'next-rated',  label: 'Next',        color: '#a78bfa', diamond: true,  desc: 'Gaining traction. Mid-tier creators with proven engagement.' },
  { value: 'top-rated',   label: 'Top',         color: '#D4AF37', diamond: true,  desc: 'The elite. High-demand creators brands seek out directly.' },
]

const PLATFORMS = [
  {
    value: 'Instagram',
    label: 'Instagram',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#igf)" />
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
        <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
        <defs>
          <linearGradient id="igf" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F9CE34"/><stop offset="0.35" stopColor="#EE2A7B"/><stop offset="1" stopColor="#6228D7"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: 'TikTok',
    label: 'TikTok',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4">
        <path fill="#69C9D0" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.94a8.2 8.2 0 004.79 1.53V7.02a4.85 4.85 0 01-1.02-.33z"/>
        <path fill="#EE1D52" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-6.13 8.38 6.34 6.34 0 005.34 4.21 6.34 6.34 0 007.1-6.27V8.94a8.2 8.2 0 004.79 1.53V7.02a4.87 4.87 0 01-1.79-.33z" opacity="0.5"/>
      </svg>
    ),
  },
  {
    value: 'YouTube',
    label: 'YouTube',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4">
        <rect x="1" y="5" width="22" height="14" rx="4" fill="#FF0000"/>
        <polygon points="10,8.5 16,12 10,15.5" fill="white"/>
      </svg>
    ),
  },
  {
    value: 'Twitter/X',
    label: 'Twitter / X',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
        <rect width="24" height="24" rx="5" fill="#000"/>
        <path d="M17.5 3h3l-6.5 7.5L21 21h-5.5l-4.5-5.5L5.5 21H2.5l7-8L3 3h5.5l4 5z" fill="white"/>
      </svg>
    ),
  },
  {
    value: 'Facebook',
    label: 'Facebook',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4">
        <rect width="24" height="24" rx="5" fill="#1877F2"/>
        <path d="M16 8h-2a1 1 0 00-1 1v2h3l-.5 3H13v7h-3v-7H8v-3h2V9a4 4 0 014-4h2v3z" fill="white"/>
      </svg>
    ),
  },
  {
    value: 'Snapchat',
    label: 'Snapchat',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4">
        <rect width="24" height="24" rx="5" fill="#FFFC00"/>
        <path d="M12 3.5c-2.5 0-4.5 2-4.5 4.5v1.5c-.5 0-1 .5-1 1s.5 1 1 1c-.5 1.5-2 2-2 2.5 0 .4.4.6 1 .8.5.2 1 .5 1.2 1 .2.5.5.7 1.3.7.4 0 1-.1 1.8-.4.4-.1.7-.2 1.2-.2s.8.1 1.2.2c.8.3 1.4.4 1.8.4.8 0 1.1-.2 1.3-.7.2-.5.7-.8 1.2-1 .6-.2 1-.4 1-.8 0-.5-1.5-1-2-2.5.5 0 1-.5 1-1s-.5-1-1-1V8c0-2.5-2-4.5-4.5-4.5z" fill="#222"/>
      </svg>
    ),
  },
  {
    value: 'LinkedIn',
    label: 'LinkedIn',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4">
        <rect width="24" height="24" rx="4" fill="#0A66C2"/>
        <path d="M7 9h2v8H7zm1-3a1.2 1.2 0 110 2.4A1.2 1.2 0 018 6zm4 3h2v1.1c.3-.5 1-1.1 2-1.1 2.2 0 2.5 1.5 2.5 3.4V17h-2v-4.1c0-.9-.3-1.4-1-1.4s-1.5.5-1.5 1.5V17h-2V9z" fill="white"/>
      </svg>
    ),
  },
]

const SORT_OPTIONS = [
  { value: 'relevant',       label: 'Most Relevant'   },
  { value: 'highest-rated',  label: 'Highest Rated'   },
  { value: 'lowest-price',   label: 'Lowest Price'    },
  { value: 'most-campaigns', label: 'Most Campaigns'  },
]

function formatNGN(amount) {
  if (!amount && amount !== 0) return '₦0'
  return '₦' + Number(amount).toLocaleString('en')
}

function formatFollowers(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function TierBadge({ tier }) {
  const t = TIERS.find(x => x.value === tier) || TIERS[0]
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
      style={{ backgroundColor: t.color + '22', color: t.color, borderColor: t.color + '55' }}
    >
      {t.diamond
        ? <svg width="10" height="10" viewBox="0 0 24 24" fill={t.color}><path d="M12 2L2 9l10 13L22 9z" /></svg>
        : t.label
      }
    </span>
  )
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          style={{
            color: i <= Math.round(rating) ? '#D4AF37' : '#4a3070',
            fill:  i <= Math.round(rating) ? '#D4AF37' : 'none',
          }}
        />
      ))}
      <span className="text-xs text-purple-300 ml-1">{Number(rating || 0).toFixed(1)}</span>
    </div>
  )
}

export function TalentCard({ talent, onGate }) {
  const navigate = useNavigate()
  const { toggle, isFav } = useFavorites()
  const faved = isFav(talent._id || talent.id)
  const videoRef = useRef(null)
  const [videoPlaying, setVideoPlaying] = useState(false)

  const isRegistered = !!localStorage.getItem('brandiór_user')

  const handleView = (e) => {
    e.stopPropagation()
    if (!isRegistered) { onGate && onGate(); return }
    navigate(`/creators/${talent.handle || talent._id || talent.id}`)
  }

  const handleCardClick = () => {
    if (!isRegistered) { onGate && onGate(); return }
    navigate(`/creators/${talent.handle || talent._id || talent.id}`)
  }

  const handleMouseEnter = (e) => {
    e.currentTarget.style.boxShadow = '0 12px 36px rgba(124,58,237,0.30)'
    e.currentTarget.style.transform = 'translateY(-4px)'
    if (videoRef.current && talent.featuredVideo) {
      videoRef.current.play().catch(() => {})
      setVideoPlaying(true)
    }
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,58,237,0.12)'
    e.currentTarget.style.transform = 'translateY(0)'
    if (videoRef.current && talent.featuredVideo) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setVideoPlaying(false)
    }
  }

  const avatarSrc = talent.avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name || 'Talent')}&background=4c1d95&color=fff&size=300`

  return (
    <div
      onClick={handleCardClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        aspectRatio: '3/4',
        boxShadow: '0 2px 8px rgba(124,58,237,0.12)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Full-bleed media (video or photo) ── */}
      {talent.featuredVideo ? (
        <>
          <video
            ref={videoRef}
            src={talent.featuredVideo}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster={avatarSrc}
          />
          {/* Play hint shown before first hover */}
          {!videoPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </>
      ) : (
        <img
          src={avatarSrc}
          alt={talent.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name || 'C')}&background=4c1d95&color=fff&size=300` }}
        />
      )}

      {/* ── Scrim so text is readable ── */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 35%, transparent 48%, rgba(10,0,30,0.82) 75%, rgba(10,0,30,0.97) 100%)' }} />

      {/* ── Top row: tier badge + heart ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <TierBadge tier={talent.tier} />
        <button
          onClick={ev => { ev.stopPropagation(); toggle(talent) }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: faved ? 'rgba(255,107,157,0.30)' : 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
          title={faved ? 'Remove from favorites' : 'Save talent'}
        >
          <Heart className="w-4 h-4" style={{ color: faved ? pink : '#ffffff' }} fill={faved ? pink : 'none'} />
        </button>
      </div>

      {/* ── Bottom overlay: identity + metrics ── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-4 flex flex-col gap-2">
        {/* Name + handle */}
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-white text-sm leading-tight truncate">{talent.name}</p>
            {talent.completedCampaigns >= 10 && (
              <BadgeCheck className="w-4 h-4 flex-shrink-0 text-blue-300" />
            )}
          </div>
          <p className="text-xs" style={{ color: '#d8b4fe' }}>@{talent.handle}</p>
        </div>

        {/* Niche pills */}
        <div className="flex flex-wrap gap-1">
          {(talent.niches || []).slice(0, 2).map(n => {
            const nicheObj = NICHES.find(x => x.label === n)
            return (
              <span key={n} className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(192,132,252,0.22)', color: '#e9d5ff', backdropFilter: 'blur(4px)' }}>
                {nicheObj ? nicheObj.emoji + ' ' : ''}{n}
              </span>
            )
          })}
          {(talent.niches || []).length > 2 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#e9d5ff' }}>
              +{talent.niches.length - 2}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-xl py-1.5 px-1" style={{ backgroundColor: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(6px)' }}>
            <p className="text-xs font-bold text-white">{formatFollowers(talent.totalFollowers)}</p>
            <p style={{ fontSize: '10px', color: '#d8b4fe' }}>Followers</p>
          </div>
          <div className="rounded-xl py-1.5 px-1" style={{ backgroundColor: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(6px)' }}>
            <p className="text-xs font-bold text-white">{Number(talent.avgEngagement || 0).toFixed(1)}%</p>
            <p style={{ fontSize: '10px', color: '#f9a8d4' }}>Engagement</p>
          </div>
          <div className="rounded-xl py-1.5 px-1" style={{ backgroundColor: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(6px)' }}>
            <p className="text-xs font-bold text-white">{talent.completedCampaigns || 0}</p>
            <p style={{ fontSize: '10px', color: '#fde68a' }}>Jobs Done</p>
          </div>
        </div>

        {/* Rating + available + price/CTA */}
        <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex flex-col gap-0.5">
            <StarRating rating={talent.avgRating} />
            {talent.availableForHire && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: '#86efac' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Available
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xs font-bold" style={{ color: '#f9a8d4' }}>From {formatNGN(talent.minPrice)}</p>
            <button
              onClick={handleView}
              className="text-[11px] font-semibold px-3 py-1 rounded-full text-white transition-colors"
              style={{ backgroundColor: 'rgba(124,58,237,0.85)', backdropFilter: 'blur(6px)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.85)'}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ aspectRatio: '3/4', backgroundColor: '#e9d5ff' }}>
      <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)' }} />
    </div>
  )
}

function RegistrationModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-8 flex flex-col items-center text-center"
        style={{ backgroundColor: '#0d0020', border: '1px solid rgba(192,132,252,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Lock icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(124,58,237,0.2)', border: '1px solid rgba(192,132,252,0.3)' }}>
          <Lock className="w-8 h-8" style={{ color: '#c084fc' }} />
        </div>

        <h2 className="text-xl font-extrabold text-white mb-3">Join to View Full Profiles</h2>
        <p className="text-sm mb-7" style={{ color: '#a78bfa', lineHeight: '1.6' }}>
          Create a free account to hire creators, view rates, and run campaigns with escrow protection.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link
            to="/signup"
            className="w-full py-3 rounded-full font-bold text-white text-sm transition-colors text-center"
            style={{ backgroundColor: pink }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e85d8a'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = pink}
          >
            Create Free Account
          </Link>
          <Link
            to="/login"
            className="w-full py-3 rounded-full font-semibold text-white text-sm text-center transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

// Mock data fallback when API is unavailable
const MOCK_CREATORS = Array.from({ length: 12 }, (_, i) => ({
  _id: `talent_${i + 1}`,
  name: ['Adaeze Okafor', 'Chidi Nwosu', 'Fatimah Abdullahi', 'Emeka Eze', 'Ngozi Obi', 'Tunde Bakare',
    'Amaka Igwe', 'Femi Adeyemi', 'Chisom Okonkwo', 'Uche Nwachukwu', 'Bisi Alabi', 'Kemi Adeleke'][i],
  handle: ['adaeze_glam', 'chidi_tech', 'fatimah_style', 'emeka_eats', 'ngozi_fit', 'tunde_comedy',
    'amaka_luxe', 'femi_finance', 'chisom_travel', 'uche_music', 'bisi_beauty', 'kemi_hustle'][i],
  location: ['Lagos', 'Accra, Ghana', 'Nairobi, Kenya', 'Abuja', 'Nairobi, Kenya', 'Kumasi, Ghana',
    'Lagos', 'Accra, Ghana', 'Nairobi, Kenya', 'Lagos', 'Mombasa, Kenya', 'Accra, Ghana'][i],
  niches: [
    ['Beauty & Skincare', 'Fashion & Style'],
    ['Tech & Gadgets', 'Finance & Business'],
    ['Fashion & Style', 'Travel & Lifestyle'],
    ['Food & Cooking', 'Entertainment'],
    ['Fitness & Wellness'],
    ['Comedy', 'Entertainment'],
    ['Fashion & Style', 'Beauty & Skincare'],
    ['Finance & Business'],
    ['Travel & Lifestyle', 'Entertainment'],
    ['Music', 'Entertainment'],
    ['Beauty & Skincare'],
    ['Finance & Business', 'Fitness & Wellness'],
  ][i],
  tier: ['fast-rising', 'next-rated', 'top-rated', 'next-rated', 'top-rated', 'next-rated',
    'top-rated', 'fast-rising', 'next-rated', 'top-rated', 'fast-rising', 'next-rated'][i],
  avgRating: [4.8, 4.5, 4.9, 4.3, 4.7, 4.6, 5.0, 4.1, 4.4, 4.8, 3.9, 4.2][i],
  totalFollowers: [125000, 45000, 280000, 62000, 189000, 310000, 95000, 28000, 74000, 420000, 18000, 55000][i],
  avgEngagement: [4.2, 5.1, 3.8, 6.3, 4.9, 5.5, 3.2, 7.1, 4.7, 3.1, 8.2, 5.8][i],
  completedCampaigns: [47, 23, 89, 31, 64, 112, 38, 11, 29, 143, 7, 19][i],
  minPrice: [25000, 15000, 75000, 18000, 45000, 100000, 55000, 10000, 22000, 150000, 8000, 20000][i],
  availableForHire: [true, true, false, true, true, false, true, true, true, false, true, true][i],
  gender: ['Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Female'][i],
  age: [24, 28, 31, 26, 29, 33, 27, 35, 23, 32, 22, 30][i],
  languages: [
    ['English', 'Yoruba'], ['English', 'Igbo'], ['English', 'Swahili'], ['English', 'Igbo'],
    ['English', 'Swahili'], ['English', 'Twi'], ['English', 'Yoruba'], ['English', 'Yoruba'],
    ['English', 'Igbo'], ['English', 'Igbo'], ['English', 'Swahili'], ['English', 'Twi'],
  ][i],
  contentTypes: [
    ['Reels', 'Photo'], ['Video', 'Tutorial'], ['Photo', 'Stories'], ['Video', 'Reels'],
    ['Video', 'Stories'], ['Video', 'Reels'], ['Photo', 'Reels', 'Stories'], ['Video', 'Podcast'],
    ['Photo', 'Stories', 'Video'], ['Video', 'Music'], ['Reels', 'Photo'], ['Video', 'Podcast'],
  ][i],
  platforms: [
    ['Instagram', 'TikTok'],
    ['YouTube', 'Twitter/X', 'LinkedIn'],
    ['Instagram', 'TikTok', 'YouTube'],
    ['TikTok', 'Instagram'],
    ['Instagram', 'YouTube'],
    ['TikTok', 'YouTube', 'Facebook'],
    ['Instagram', 'Snapchat'],
    ['LinkedIn', 'Twitter/X'],
    ['Instagram', 'TikTok', 'Snapchat'],
    ['YouTube', 'Instagram', 'Twitter/X'],
    ['TikTok', 'Instagram'],
    ['LinkedIn', 'Twitter/X', 'Instagram'],
  ][i],
  featuredVideo: [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ][i], // set by talent via dashboard
}))

export default function Marketplace() {
  const [talents, setTalents] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gateOpen, setGateOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [selectedNiches, setSelectedNiches] = useState([])
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedTiers, setSelectedTiers] = useState([])
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState([])
  const [selectedGenders, setSelectedGenders] = useState([])
  const [selectedAgeRanges, setSelectedAgeRanges] = useState([])
  const [selectedFollowerRanges, setSelectedFollowerRanges] = useState([])
  const [selectedContentTypes, setSelectedContentTypes] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [sort, setSort] = useState('relevant')
  const [visibleCount, setVisibleCount] = useState(9)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const sentinelRef = useRef(null)

  const PAGE_SIZE = 9

  // Admin ranking algorithm — reads saved config from localStorage
  const applyAdminRanking = (list) => {
    const TIER_SCORE_MAP = { 'top-rated': 1.0, 'next-rated': 0.6, 'fast-rising': 0.25 }
    let weights, rules
    try {
      weights = JSON.parse(localStorage.getItem('brandior_ranking_config_weights')) || { rating: 20, campaigns: 20, followers: 15, engagement: 20, tier: 15, verified: 5, profilePct: 5 }
      rules   = JSON.parse(localStorage.getItem('brandior_ranking_config_rules'))   || {}
    } catch {
      weights = { rating: 20, campaigns: 20, followers: 15, engagement: 20, tier: 15, verified: 5, profilePct: 5 }
      rules   = {}
    }
    const total = Object.values(weights).reduce((s, v) => s + v, 0) || 1
    function score(c) {
      const signals = {
        rating:     (c.avgRating || 0) / 5,
        campaigns:  Math.min(c.completedCampaigns || 0, 100) / 100,
        followers:  Math.min(c.totalFollowers || 0, 500000) / 500000,
        engagement: Math.min(c.avgEngagement || 0, 10) / 10,
        tier:       TIER_SCORE_MAP[c.tier] || 0,
        verified:   c.verified ? 1 : 0,
        profilePct: 0.7,
      }
      let s = 0
      for (const key of Object.keys(signals)) s += (signals[key] * (weights[key] || 0)) / total
      if (rules.pinVerified && c.verified)            s = Math.min(s + 0.1, 1)
      if (rules.highEngagementBoost && (c.avgEngagement || 0) > 7) s = Math.min(s + 0.05, 1)
      return s
    }
    return [...list].sort((a, b) => score(b) - score(a))
  }

  const fetchTalents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedNiches.length) params.set('niches', selectedNiches.join(','))
      if (selectedPlatforms.length) params.set('platforms', selectedPlatforms.join(','))
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (selectedTiers.length) params.set('tiers', selectedTiers.join(','))
      if (availableOnly) params.set('availableOnly', 'true')
      params.set('sort', sort)

      const res = await fetch(`${API}/talents?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch talents')
      const data = await res.json()
      setTalents(data.talents || data)
      setTotal(data.total || (data.talents || data).length)
    } catch {
      let filtered = MOCK_CREATORS.filter(c => {
        if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.handle.toLowerCase().includes(search.toLowerCase())) return false
        if (selectedNiches.length && !selectedNiches.some(n => c.niches.includes(n))) return false
        if (selectedPlatforms.length && !selectedPlatforms.some(p => (c.platforms || []).includes(p))) return false
        if (minPrice && c.minPrice < Number(minPrice)) return false
        if (maxPrice && c.minPrice > Number(maxPrice)) return false
        if (selectedTiers.length && !selectedTiers.includes(c.tier)) return false
        if (availableOnly && !c.availableForHire) return false
        if (selectedLocations.length && !selectedLocations.includes(c.location)) return false
        if (selectedGenders.length && !selectedGenders.includes(c.gender)) return false
        if (selectedAgeRanges.length && !selectedAgeRanges.some(r => c.age >= r.min && c.age <= r.max)) return false
        if (selectedFollowerRanges.length && !selectedFollowerRanges.some(r => c.totalFollowers >= r.min && c.totalFollowers <= r.max)) return false
        if (selectedContentTypes.length && !selectedContentTypes.some(ct => (c.contentTypes || []).includes(ct))) return false
        if (selectedLanguages.length && !selectedLanguages.some(l => (c.languages || []).includes(l))) return false
        return true
      })
      if (sort === 'relevant')       filtered = applyAdminRanking(filtered)
      else if (sort === 'highest-rated') filtered.sort((a, b) => b.avgRating - a.avgRating)
      else if (sort === 'lowest-price') filtered.sort((a, b) => a.minPrice - b.minPrice)
      else if (sort === 'most-campaigns') filtered.sort((a, b) => b.completedCampaigns - a.completedCampaigns)
      setTotal(filtered.length)
      setTalents(filtered)
    } finally {
      setLoading(false)
    }
  }, [search, selectedNiches, selectedPlatforms, minPrice, maxPrice, selectedTiers, availableOnly,
      selectedLocations, selectedGenders, selectedAgeRanges, selectedFollowerRanges, selectedContentTypes, selectedLanguages,
      sort])

  useEffect(() => { fetchTalents() }, [fetchTalents])

  // Re-apply ranking when admin saves a new algorithm
  useEffect(() => {
    function onRankingUpdated() { fetchTalents() }
    window.addEventListener('brandior:rankings-updated', onRankingUpdated)
    return () => window.removeEventListener('brandior:rankings-updated', onRankingUpdated)
  }, [fetchTalents])

  // Reset visible count when filters/sort change
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [
    search, selectedNiches, selectedPlatforms, minPrice, maxPrice,
    selectedTiers, availableOnly, selectedLocations, selectedGenders,
    selectedAgeRanges, selectedFollowerRanges, selectedContentTypes, selectedLanguages, sort,
  ])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading && visibleCount < talents.length) {
        setVisibleCount(c => c + PAGE_SIZE)
      }
    }, { threshold: 0.1 })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading, visibleCount, talents.length])

  const toggleNiche    = n => setSelectedNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const toggleTier     = t => setSelectedTiers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  const togglePlatform = p => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  const toggleLocation = l => setSelectedLocations(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])
  const toggleGender   = g => setSelectedGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  const toggleAge      = a => setSelectedAgeRanges(prev => prev.some(r => r.label === a.label) ? prev.filter(r => r.label !== a.label) : [...prev, a])
  const toggleFollower = f => setSelectedFollowerRanges(prev => prev.some(r => r.label === f.label) ? prev.filter(r => r.label !== f.label) : [...prev, f])
  const toggleContent  = c => setSelectedContentTypes(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const toggleLanguage = l => setSelectedLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])

  const resetFilters = () => {
    setSelectedNiches([])
    setSelectedPlatforms([])
    setMinPrice('')
    setMaxPrice('')
    setSelectedTiers([])
    setAvailableOnly(false)
    setSelectedLocations([])
    setSelectedGenders([])
    setSelectedAgeRanges([])
    setSelectedFollowerRanges([])
    setSelectedContentTypes([])
    setSelectedLanguages([])
    setVisibleCount(PAGE_SIZE)
  }

  const FilterSidebar = ({ hideReset = false }) => (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">Filters</h3>
        {!hideReset && (
          <button onClick={resetFilters} className="text-xs font-medium hover:underline" style={{ color: '#c084fc' }}>
            Reset
          </button>
        )}
      </div>

      {/* Niche */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Niche</p>
        <div className="flex flex-wrap gap-1.5">
          {NICHE_LABELS.map(n => (
            <button
              key={n}
              onClick={() => toggleNiche(n)}
              className="text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={
                selectedNiches.includes(n)
                  ? { backgroundColor: darkPurple, color: 'white', borderColor: darkPurple }
                  : { backgroundColor: 'rgba(233,213,255,0.1)', color: '#e9d5ff', borderColor: 'rgba(192,132,252,0.25)' }
              }
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Platform</p>
        <div className="flex flex-col gap-1.5">
          {PLATFORMS.map(p => {
            const active = selectedPlatforms.includes(p.value)
            return (
              <button
                key={p.value}
                onClick={() => togglePlatform(p.value)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left"
                style={active
                  ? { backgroundColor: 'rgba(124,58,237,0.35)', color: 'white', border: '1px solid rgba(192,132,252,0.5)' }
                  : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#c4b5fd', border: '1px solid rgba(192,132,252,0.15)' }
                }
              >
                <p.icon />
                {p.label}
                {active && <CheckCircle className="w-3.5 h-3.5 ml-auto text-purple-300" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Price Range</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#a78bfa' }}>₦</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-white placeholder-purple-400"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(192,132,252,0.25)' }}
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#a78bfa' }}>₦</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-white placeholder-purple-400"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(192,132,252,0.25)' }}
            />
          </div>
        </div>
      </div>

      {/* Tier */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Tier</p>
        <div className="flex flex-col gap-2">
          {TIERS.map(t => {
            const active = selectedTiers.includes(t.value)
            return (
              <button key={t.value} onClick={() => toggleTier(t.value)}
                className="flex items-start gap-3 p-3 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: active ? `${t.color}18` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? t.color + '55' : 'rgba(192,132,252,0.15)'}`,
                }}>
                {/* Colour dot / diamond */}
                <span className="mt-0.5 flex-shrink-0">
                  {t.diamond
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill={t.color}><path d="M12 2L2 9l10 13L22 9z"/></svg>
                    : <span className="inline-block w-2.5 h-2.5 rounded-full mt-0.5" style={{ backgroundColor: t.color }} />
                  }
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-none mb-1" style={{ color: t.color }}>{t.label}</p>
                  <p className="text-[11px] leading-snug" style={{ color: 'rgba(233,213,255,0.5)' }}>{t.desc}</p>
                </div>
                {active && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 ml-auto" style={{ color: t.color }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Location</p>
        <div className="flex flex-wrap gap-1.5">
          {LOCATIONS.map(l => (
            <button key={l} onClick={() => toggleLocation(l)}
              className="text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={selectedLocations.includes(l)
                ? { backgroundColor: darkPurple, color: 'white', borderColor: darkPurple }
                : { backgroundColor: 'rgba(233,213,255,0.1)', color: '#e9d5ff', borderColor: 'rgba(192,132,252,0.25)' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Gender</p>
        <div className="flex gap-2">
          {GENDERS.map(g => (
            <button key={g} onClick={() => toggleGender(g)}
              className="flex-1 text-xs py-1.5 rounded-xl border transition-colors font-medium"
              style={selectedGenders.includes(g)
                ? { backgroundColor: darkPurple, color: 'white', borderColor: darkPurple }
                : { backgroundColor: 'rgba(233,213,255,0.1)', color: '#e9d5ff', borderColor: 'rgba(192,132,252,0.25)' }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Creator Age</p>
        <div className="grid grid-cols-2 gap-1.5">
          {AGE_RANGES.map(a => (
            <button key={a.label} onClick={() => toggleAge(a)}
              className="text-xs py-1.5 px-3 rounded-xl border transition-colors font-medium"
              style={selectedAgeRanges.some(r => r.label === a.label)
                ? { backgroundColor: darkPurple, color: 'white', borderColor: darkPurple }
                : { backgroundColor: 'rgba(233,213,255,0.1)', color: '#e9d5ff', borderColor: 'rgba(192,132,252,0.25)' }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Follower Range */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Audience Size</p>
        <div className="flex flex-col gap-1.5">
          {FOLLOWER_RANGES.map(f => (
            <button key={f.label} onClick={() => toggleFollower(f)}
              className="text-xs px-3 py-1.5 rounded-xl border transition-colors font-medium text-left"
              style={selectedFollowerRanges.some(r => r.label === f.label)
                ? { backgroundColor: darkPurple, color: 'white', borderColor: darkPurple }
                : { backgroundColor: 'rgba(233,213,255,0.1)', color: '#e9d5ff', borderColor: 'rgba(192,132,252,0.25)' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Type */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Content Type</p>
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map(ct => (
            <button key={ct} onClick={() => toggleContent(ct)}
              className="text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={selectedContentTypes.includes(ct)
                ? { backgroundColor: darkPurple, color: 'white', borderColor: darkPurple }
                : { backgroundColor: 'rgba(233,213,255,0.1)', color: '#e9d5ff', borderColor: 'rgba(192,132,252,0.25)' }}>
              {ct}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#e9d5ff' }}>Language</p>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map(l => (
            <button key={l} onClick={() => toggleLanguage(l)}
              className="text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={selectedLanguages.includes(l)
                ? { backgroundColor: darkPurple, color: 'white', borderColor: darkPurple }
                : { backgroundColor: 'rgba(233,213,255,0.1)', color: '#e9d5ff', borderColor: 'rgba(192,132,252,0.25)' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Available only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setAvailableOnly(!availableOnly)}
            className="w-9 h-5 rounded-full relative transition-colors cursor-pointer flex-shrink-0"
            style={{ backgroundColor: availableOnly ? darkPurple : 'rgba(255,255,255,0.15)' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
              style={{ transform: availableOnly ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </div>
          <span className="text-sm" style={{ color: '#e9d5ff' }}>Available for hire only</span>
        </label>
      </div>

      <button
        onClick={() => { setPage(1); fetchTalents() }}
        className="w-full py-2.5 rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: darkPurple }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3b0764'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = darkPurple}
      >
        Apply Filters
      </button>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf5ff' }}>
      <Helmet>
        <title>Find Creators & Influencers in Nigeria | Brandior</title>
        <meta name="description" content="Browse verified African creators and influencers for your brand campaigns. Filter by niche, platform, location and budget on Brandior." />
        <meta property="og:title" content="Find Creators & Influencers in Nigeria | Brandior" />
        <meta property="og:description" content="Browse verified African creators for your brand campaigns on Brandior." />
        <meta property="og:url" content="https://brandior.africa/marketplace" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://brandior.africa/marketplace" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <div
        className="pt-28 pb-14 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #150030 50%, #3d0080 100%)' }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.07,
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(192,132,252,0.15)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.3)' }}
          >
            Talent Marketplace
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            <span className="text-white">Find </span>
            <span style={{ color: pink }}>Africa's Best</span>
            <span className="text-white"> Creators</span>
          </h1>
          <p className="mb-6 text-base" style={{ color: '#c4b5fd' }}>
            Browse 500+ verified African talents ready to amplify your brand
          </p>

          {/* Post a Job CTA */}
          <div className="inline-flex items-center gap-3 mb-8 px-5 py-3 rounded-2xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="text-sm text-white/70">Have a campaign in mind?</span>
            <Link to="/post-job"
              className="inline-flex items-center gap-1.5 text-sm font-black px-4 py-2 rounded-full transition-all"
              style={{ backgroundColor: '#FA8112', color: '#fff', boxShadow: '0 4px 16px rgba(250,129,18,0.45)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e07010'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FA8112'}>
              + Post a Job
            </Link>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#a78bfa' }} />
            <input
              type="text"
              placeholder="Search by name, handle, or niche..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full py-4 text-base bg-white focus:outline-none transition-shadow"
              style={{
                borderRadius: '9999px',
                paddingLeft: '3rem',
                paddingRight: '4rem',
                boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
                color: '#1a0040',
              }}
            />
            {/* Filter hamburger inside search bar */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition-colors"
              style={{ backgroundColor: darkPurple }}
              title="Open filters"
            >
              <SlidersHorizontal className="w-4 h-4 text-white" />
              {(selectedNiches.length + selectedPlatforms.length + selectedTiers.length + selectedLocations.length +
                selectedGenders.length + selectedAgeRanges.length + selectedFollowerRanges.length +
                selectedContentTypes.length + selectedLanguages.length + (availableOnly ? 1 : 0)) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: pink }}>
                  {selectedNiches.length + selectedPlatforms.length + selectedTiers.length + selectedLocations.length +
                   selectedGenders.length + selectedAgeRanges.length + selectedFollowerRanges.length +
                   selectedContentTypes.length + selectedLanguages.length + (availableOnly ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Filter drawer — slides in from the right */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="h-full w-80 overflow-y-auto p-6 flex flex-col"
            style={{
              backgroundColor: '#0d0020',
              borderLeft: '1px solid rgba(192,132,252,0.2)',
              animation: 'slideInRight 0.25s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(192,132,252,0.1)' }}>
                <X className="w-4 h-4" style={{ color: '#a78bfa' }} />
              </button>
            </div>
            <FilterSidebar hideReset />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{ backgroundColor: '#faf5ff' }}>
        <div className="flex gap-6">
          {/* Talent grid — full width, no sidebar */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-sm" style={{ color: '#6b21a8' }}>
                {loading ? 'Loading...' : `Showing ${total} talent${total !== 1 ? 's' : ''}`}
              </p>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1) }}
                className="text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-300"
                style={{ backgroundColor: '#fff', border: '1px solid rgba(124,58,237,0.2)', color: '#4c1d95' }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Error state */}
            {error && !loading && talents.length === 0 && (
              <div className="text-center py-16">
                <p className="mb-4" style={{ color: '#a78bfa' }}>Failed to load talents</p>
                <button
                  onClick={fetchTalents}
                  className="px-6 py-2 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: darkPurple }}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {loading && visibleCount === PAGE_SIZE
                ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                : talents.slice(0, visibleCount).map(c => (
                  <TalentCard key={c._id || c.id} talent={c} onGate={() => setGateOpen(true)} />
                ))
              }
            </div>

            {/* Empty state */}
            {!loading && talents.length === 0 && !error && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(124,58,237,0.15)' }}>
                  <Users className="w-9 h-9" style={{ color: purple }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#3b0764' }}>No talents found</h3>
                <p className="text-sm mb-5" style={{ color: '#7c3aed' }}>Try adjusting your filters or search terms</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: darkPurple }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-8">
              {visibleCount < talents.length && (
                <div className="flex items-center gap-2 text-sm" style={{ color: '#a78bfa' }}>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Loading more…
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration gate modal */}
      {gateOpen && <RegistrationModal onClose={() => setGateOpen(false)} />}
    </div>
  )
}
