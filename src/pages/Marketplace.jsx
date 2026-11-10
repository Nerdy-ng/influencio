import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '');
import { Helmet } from 'react-helmet-async'
import {
  Search, Heart, CheckCircle, Star, Filter,
  X, SlidersHorizontal, ChevronDown,
  Lock, BadgeCheck, Play, Users,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import Navbar from '../components/Navbar'
import { useCreatorSearch, PAGE_SIZE } from '../hooks/useCreatorSearch'
import {
  NICHES, NICHE_LABELS, LOCATIONS, GENDERS, AGE_RANGES,
  FOLLOWER_RANGES, CONTENT_TYPES, LANGUAGES, SORT_OPTIONS,
  formatNGN, formatFollowers,
} from '../lib/creatorFilters'

const pink = '#F72585'
const darkPurple = '#4c1d95'
const purple = '#7c3aed'

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

export function TierBadge({ tier }) {
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

export function StarRating({ rating }) {
  const display = rating || 5
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className="w-3 h-3"
          style={{
            color: i <= Math.round(display) ? '#D4AF37' : '#e9d5ff',
            fill:  i <= Math.round(display) ? '#D4AF37' : 'none',
          }}
        />
      ))}
      <span className="text-[11px] ml-1 font-semibold" style={{ color: 'rgba(76,29,149,0.5)' }}>{Number(display).toFixed(1)}</span>
    </div>
  )
}

export function TalentCard({ talent, onGate, from = '/marketplace' }) {
  const navigate = useNavigate()
  const { toggle, isFav } = useFavorites()
  const faved = isFav(talent._id || talent.id)
  const videoRef = useRef(null)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const isRegistered = !!localStorage.getItem('brandiór_user')

  const handleView = (e) => {
    e.stopPropagation()
    if (!isRegistered) { onGate && onGate(); return }
    navigate(`/creators/${talent.handle || talent._id || talent.id}`, { state: { from } })
  }

  const handleCardClick = () => {
    if (!isRegistered) { onGate && onGate(); return }
    navigate(`/creators/${talent.handle || talent._id || talent.id}`, { state: { from } })
  }

  const avatarSrc = talent.avatar_url || talent.avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name || 'Talent')}&background=4c1d95&color=fff&size=400`

  const tierInfo = TIERS.find(x => x.value === talent.tier) || TIERS[0]

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer rounded-2xl overflow-hidden transition-all duration-200 flex flex-col"
      style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = '#c4b5fd' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.06)'; e.currentTarget.style.borderColor = '#e9d5ff' }}
    >
      {/* ── Photo — compact banner, not gallery ── */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ aspectRatio: '16/9' }}
        onMouseEnter={() => { if (videoRef.current && talent.featuredVideo) { videoRef.current.play().catch(() => {}); setVideoPlaying(true) } }}
        onMouseLeave={() => { if (videoRef.current && talent.featuredVideo) { videoRef.current.pause(); videoRef.current.currentTime = 0; setVideoPlaying(false) } }}
      >
        {talent.featuredVideo ? (
          <>
            <video ref={videoRef} src={talent.featuredVideo}
              className="absolute inset-0 w-full h-full object-cover"
              muted loop playsInline preload="metadata" poster={avatarSrc} />
            {!videoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(14,0,32,0.5)', backdropFilter: 'blur(4px)' }}>
                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                </div>
              </div>
            )}
          </>
        ) : (
          <img src={avatarSrc} alt={talent.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name || 'C')}&background=4c1d95&color=fff&size=400` }} />
        )}

        {/* Tier badge */}
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: 'rgba(14,0,32,0.55)', backdropFilter: 'blur(4px)', color: tierInfo.color, border: `1px solid ${tierInfo.color}50` }}>
          {tierInfo.diamond && <svg width="7" height="7" viewBox="0 0 24 24" fill={tierInfo.color}><path d="M12 2L2 9l10 13L22 9z" /></svg>}
          {tierInfo.label}
        </div>

        {/* Heart */}
        <button onClick={ev => { ev.stopPropagation(); toggle(talent) }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: faved ? 'rgba(255,107,157,0.35)' : 'rgba(14,0,32,0.4)', backdropFilter: 'blur(6px)' }}
          title={faved ? 'Remove from favorites' : 'Save creator'}>
          <Heart className="w-3 h-3" style={{ color: faved ? pink : '#fff' }} fill={faved ? pink : 'none'} />
        </button>
      </div>

      {/* ── Info panel ── */}
      <div className="p-4 flex flex-col gap-2 flex-1">

        {/* 1. Identity: name + verified | rating */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <p className="font-black text-sm truncate leading-snug" style={{ color: '#1e0040' }}>{talent.name}</p>
              {talent.completedCampaigns >= 10 && (
                <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: purple }}>
                  <BadgeCheck className="w-2 h-2 text-white" strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] leading-none" style={{ color: 'rgba(76,29,149,0.5)' }}>@{talent.handle}</p>
          </div>
          <div className="flex-shrink-0 pt-0.5">
            <StarRating rating={talent.avgRating} />
          </div>
        </div>

        {/* 2. Positioning: niche chips + availability */}
        <div className="flex items-center flex-wrap gap-1">
          {(talent.niches || []).slice(0, 2).map(n => {
            const nicheObj = NICHES.find(x => x.label === n)
            return (
              <span key={n} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: purple }}>
                {nicheObj ? nicheObj.emoji + ' ' : ''}{n}
              </span>
            )
          })}
          {talent.availableForHire && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(22,163,74,0.07)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.15)' }}>
              <span className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
              Available
            </span>
          )}
        </div>

        {/* 3. Proof: compact stats text */}
        <p className="text-[11px]" style={{ color: 'rgba(76,29,149,0.45)' }}>
          {formatFollowers(talent.totalFollowers)} followers
          {' · '}{Number(talent.avgEngagement || 0).toFixed(1)}% eng
          {' · '}{talent.completedCampaigns || 0} jobs
        </p>

        {/* 4. Commercial + action */}
        <div className="flex items-center justify-between gap-2 pt-2.5 mt-auto"
          style={{ borderTop: '1px solid rgba(124,58,237,0.08)' }}>
          <span className="text-sm font-black" style={{ color: purple }}>
            From {formatNGN(talent.minPrice)}
          </span>
          <button onClick={handleView}
            className="text-xs font-bold px-3.5 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: purple }}>
            View →
          </button>
        </div>
      </div>
    </div>
  )
}

export function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const selected = SORT_OPTIONS.find(o => o.value === value) || SORT_OPTIONS[0]
  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-semibold transition-all"
        style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid #e9d5ff', color: '#4c1d95', backgroundColor: '#fff' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.04)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = open ? '#c4b5fd' : '#e9d5ff'; e.currentTarget.style.backgroundColor = open ? 'rgba(124,58,237,0.04)' : '#fff' }}
      >
        {selected.label}
        <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(76,29,149,0.5)', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 rounded-xl overflow-hidden py-1" style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 6px 24px rgba(124,58,237,0.12)', minWidth: '168px' }}>
          {SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{
                color: o.value === value ? purple : '#4c1d95',
                backgroundColor: o.value === value ? 'rgba(124,58,237,0.06)' : 'transparent',
                fontWeight: o.value === value ? '700' : '500',
              }}
              onMouseEnter={e => { if (o.value !== value) e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.03)' }}
              onMouseLeave={e => { if (o.value !== value) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse flex flex-col" style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
      <div style={{ aspectRatio: '16/9', backgroundColor: '#ede9fe' }} />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex justify-between gap-2">
          <div>
            <div className="h-3 rounded-full mb-1.5" style={{ backgroundColor: '#e9d5ff', width: '104px' }} />
            <div className="h-2 rounded-full" style={{ backgroundColor: '#f3eeff', width: '72px' }} />
          </div>
          <div className="h-2.5 rounded-full" style={{ backgroundColor: '#f3eeff', width: '64px' }} />
        </div>
        <div className="flex gap-1">
          <div className="h-4 w-16 rounded-full" style={{ backgroundColor: '#f3eeff' }} />
          <div className="h-4 w-14 rounded-full" style={{ backgroundColor: '#f3eeff' }} />
        </div>
        <div className="h-2.5 rounded-full" style={{ backgroundColor: '#f3eeff', width: '85%' }} />
        <div className="flex items-center justify-between gap-2 pt-2.5 mt-auto" style={{ borderTop: '1px solid rgba(124,58,237,0.08)' }}>
          <div className="h-3.5 rounded-full" style={{ backgroundColor: '#e9d5ff', width: '80px' }} />
          <div className="h-6 w-14 rounded-lg" style={{ backgroundColor: '#ede9fe' }} />
        </div>
      </div>
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(124,58,237,0.2)', border: '1px solid rgba(192,132,252,0.3)' }}>
          <Lock className="w-8 h-8" style={{ color: '#c084fc' }} />
        </div>

        <h2 className="text-xl font-extrabold text-white mb-3">Join to View Full Profiles</h2>
        <p className="text-sm mb-7" style={{ color: '#a78bfa', lineHeight: '1.6' }}>
          Create a free account to hire creators, view rates, and run campaigns with payment protection.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link
            to="/signup"
            className="w-full py-3 rounded-full font-bold text-white text-sm transition-colors text-center"
            style={{ backgroundColor: '#4c1d95' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3b0764'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4c1d95'}
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

export function FilterSidebar({
  selectedNiches, selectedPlatforms, minPrice, setMinPrice, maxPrice, setMaxPrice,
  selectedTiers, availableOnly, setAvailableOnly,
  selectedLocations, selectedGenders, selectedAgeRanges, selectedFollowerRanges,
  selectedContentTypes, selectedLanguages,
  toggleNiche, toggleTier, togglePlatform, toggleLocation, toggleGender,
  toggleAge, toggleFollower, toggleContent, toggleLanguage,
  resetFilters, fetchTalents, setVisibleCount,
  hideReset = false,
}) {
  return (
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
        onClick={() => { setVisibleCount(PAGE_SIZE); fetchTalents() }}
        className="w-full py-2.5 rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: darkPurple }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3b0764'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = darkPurple}
      >
        Apply Filters
      </button>
    </div>
  )
}

export default function Marketplace() {
  const [gateOpen, setGateOpen] = useState(false)
  const hook = useCreatorSearch()
  const {
    talents, total, loading, error,
    search, setSearch,
    sort, setSort,
    visibleCount, setVisibleCount,
    mobileFiltersOpen, setMobileFiltersOpen,
    sentinelRef,
    resetFilters, fetchTalents,
    activeFilterCount,
  } = hook

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f3eeff' }}>
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

      {/* Page header — compact */}
      <div
        className="pt-24 pb-8 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f5f0ff 0%, #ede9fe 55%, #f0ebff 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.18) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: purple, border: '1px solid rgba(124,58,237,0.18)' }}
          >
            Talent Marketplace
          </span>
          <h1 className="text-3xl sm:text-5xl font-black mb-2 leading-tight" style={{ color: '#1e0040' }}>
            Find{' '}
            <span style={{ color: pink }}>Creators</span>
          </h1>
          <p className="text-sm" style={{ color: 'rgba(76,29,149,0.6)' }}>
            Browse 500+ verified creators ready to amplify your brand
          </p>
        </div>
      </div>

      {/* Search + controls bar */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e9d5ff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(76,29,149,0.4)' }} />
            <input
              type="text"
              placeholder="Search by name, handle or niche..."
              value={search}
              onChange={e => { setSearch(stripInjection(e.target.value)); setVisibleCount(PAGE_SIZE) }}
              className="w-full text-sm focus:outline-none transition-all"
              style={{ paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', borderRadius: '0.75rem', border: '1px solid #e9d5ff', color: '#1e0040', backgroundColor: '#faf8ff' }}
              onFocus={e => { e.target.style.borderColor = '#c4b5fd'; e.target.style.boxShadow = '0 0 0 3px rgba(196,181,253,0.2)' }}
              onBlur={e => { e.target.style.borderColor = '#e9d5ff'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="relative flex items-center gap-2 text-sm font-semibold transition-all flex-shrink-0"
            style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid #e9d5ff', color: '#4c1d95', backgroundColor: '#fff' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.backgroundColor = '#fff' }}
          >
            <SlidersHorizontal className="w-4 h-4" style={{ color: purple }} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: pink }}>
                {activeFilterCount}
              </span>
            )}
          </button>
          <SortDropdown value={sort} onChange={v => { setSort(v); setVisibleCount(PAGE_SIZE) }} />
        </div>
      </div>

      {/* Filter drawer */}
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
            <FilterSidebar {...hook} hideReset />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{ backgroundColor: '#f3eeff' }}>
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {!loading && (
              <p className="text-xs mb-5" style={{ color: 'rgba(76,29,149,0.45)' }}>
                {total} creator{total !== 1 ? 's' : ''} found
              </p>
            )}

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
                  <TalentCard key={c._id || c.id} talent={c} onGate={() => setGateOpen(true)} from="/marketplace" />
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
