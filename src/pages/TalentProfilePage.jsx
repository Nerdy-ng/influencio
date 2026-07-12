import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '');
import { supabase } from '../lib/supabase'
import { Helmet } from 'react-helmet-async'
import {
  ChevronLeft, MapPin, Star, CheckCircle, Users, Heart,
  RefreshCw, Shield, ExternalLink, Zap, MessageCircle, Loader2,
  BadgeCheck, ThumbsUp, MessageSquare, TrendingUp,
  Send, X, ChevronDown,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

async function fetchReviews(talentId) {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('talent_id', talentId)
    .order('created_at', { ascending: false })
  const reviews = data || []
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5
  return { reviews, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length }
}

const pink = '#FF6B9D'
const darkPurple = '#4c1d95'
const purple = '#7c3aed'

function formatNGN(n) {
  return '₦' + Number(n || 0).toLocaleString('en')
}

function formatFollowers(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

const TIERS = {
  'fast-rising': { label: 'Fast Rising', color: '#22c55e', bg: '#22c55e18' },
  'next-rated': { label: 'Next Rated', color: '#3b82f6', bg: '#3b82f618' },
  'top-rated': { label: 'Top Rated', color: '#D4AF37', bg: '#D4AF3718' },
}

function TierBadge({ tier, size = 'sm' }) {
  const t = TIERS[tier] || TIERS['fast-rising']
  return (
    <span
      className={`font-bold rounded-full px-2.5 py-1 border ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
      style={{ backgroundColor: t.bg, color: t.color, borderColor: t.color + '40' }}
    >
      {t.label}
    </span>
  )
}

function StarRating({ rating, size = 'sm' }) {
  const display = rating || 5
  const w = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={w}
          style={{ color: i <= Math.round(display) ? '#D4AF37' : '#d1d5db', fill: i <= Math.round(display) ? '#D4AF37' : 'none' }}
        />
      ))}
      <span className={`ml-1 font-semibold ${size === 'lg' ? 'text-base' : 'text-sm'} text-gray-600`}>
        {Number(display).toFixed(1)}
      </span>
    </div>
  )
}

const PLATFORM_COLORS = {
  Instagram: { bg: '#E1306C', label: 'Instagram' },
  TikTok: { bg: '#010101', label: 'TikTok' },
  YouTube: { bg: '#FF0000', label: 'YouTube' },
  Twitter: { bg: '#1DA1F2', label: 'Twitter / X' },
  Facebook: { bg: '#1877F2', label: 'Facebook' },
  Snapchat: { bg: '#FFFC00', label: 'Snapchat' },
}

// Full mock talent for offline/dev mode
const MOCK_CREATOR = {
  _id: 'talent_1',
  name: 'Adaeze Okafor',
  handle: 'adaeze_glam',
  location: 'Lagos',
  tier: 'top-rated',
  avgRating: 4.9,
  totalFollowers: 280000,
  avgEngagement: 4.2,
  completedCampaigns: 89,
  minPrice: 75000,
  availableForHire: true,
  bio: 'African beauty and lifestyle talent with a passion for authentic storytelling. I create content that connects brands with real African women. Certified makeup artist, skincare enthusiast, and brand collaborator since 2019.',
  niches: ['Beauty & Skincare', 'Fashion & Style', 'Travel & Lifestyle'],
  contentStyles: ['Tutorial', 'Talking Head', 'Aesthetic', 'Review'],
  platforms: [
    { name: 'Instagram', followers: 185000, engagement: 4.8 },
    { name: 'TikTok', followers: 72000, engagement: 6.1 },
    { name: 'YouTube', followers: 23000, engagement: 3.2 },
  ],
}

// ── Default rate card (mirrors mobile's CreatorProfileScreen.tsx fallback) ───
const DEFAULT_CONTENT_TYPES = [
  { id: 'influencer', label: 'Influencer Post', icon: 'megaphone', color: '#F72585', desc: 'Creator posts on their social channels', enabled: true },
  { id: 'ugc', label: 'UGC Content', icon: 'camera', color: '#7c3aed', desc: 'Creator delivers content for you to post', enabled: true },
]

const DEFAULT_DURATIONS = [
  { id: 'd1', label: 'Up to 30s',   price: 20000  },
  { id: 'd2', label: '31s – 60s',   price: 35000  },
  { id: 'd3', label: '1 – 3 mins',  price: 55000  },
  { id: 'd4', label: '3 – 10 mins', price: 90000  },
  { id: 'd5', label: '10+ mins',    price: 150000 },
]

const DEFAULT_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E4405F', enabled: true,  fee: 20000 },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101', enabled: true,  fee: 15000 },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000', enabled: true,  fee: 40000 },
  { id: 'x',         label: 'X',         color: '#1DA1F2', enabled: false, fee: 10000 },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', enabled: false, fee: 10000 },
]

const DEFAULT_ADDONS = [
  { id: 'script', label: 'Script Writing', desc: 'Creator researches & writes the full script', color: '#3b82f6', enabled: true, price: 20000 },
]

// ── Rate Card ordering widget ─────────────────────────────────────────────────
function RateCardOrder({ talent, isPreview, navigate }) {
  const creatorId = talent._id || talent.id

  const [contentTypes, setContentTypes] = useState(DEFAULT_CONTENT_TYPES)
  const [durationOptions, setDurationOptions] = useState(DEFAULT_DURATIONS)
  const [platformOptions, setPlatformOptions] = useState(DEFAULT_PLATFORMS.filter(p => p.enabled))
  const [addonOptions, setAddonOptions] = useState(DEFAULT_ADDONS)

  const [selectedType, setSelectedType] = useState(DEFAULT_CONTENT_TYPES[0].id)
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATIONS[0].id)
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram'])
  const [activeAddons, setActiveAddons] = useState([])

  useEffect(() => {
    if (!creatorId) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('creator_id', creatorId)
        .maybeSingle()
      if (!data || cancelled) return
      const types = (data.content_types || []).filter(t => t.enabled)
      const platforms = (data.platforms || []).filter(p => p.enabled)
      const addons = (data.addons || []).filter(a => a.enabled)
      if (types.length) { setContentTypes(types); setSelectedType(types[0].id) }
      if (data.durations?.length) { setDurationOptions(data.durations); setSelectedDuration(data.durations[0].id) }
      if (platforms.length) { setPlatformOptions(platforms); setSelectedPlatforms([platforms[0].id]) }
      setAddonOptions(addons)
    })()
    return () => { cancelled = true }
  }, [creatorId])

  const isInfluencer = selectedType === 'influencer'
  const durationItem = durationOptions.find(d => d.id === selectedDuration) || durationOptions[0]
  const addonItems = addonOptions.filter(a => activeAddons.includes(a.id))
  const prodCost = durationItem.price
  const postingCost = isInfluencer
    ? platformOptions.filter(p => selectedPlatforms.includes(p.id)).reduce((s, p) => s + p.fee, 0)
    : 0
  const total = prodCost + postingCost + addonItems.reduce((s, a) => s + a.price, 0)

  function togglePlatform(id) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(x => x !== id) : prev) : [...prev, id]
    )
  }

  function toggleAddon(id) {
    setActiveAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function goToCollab() {
    const typeLabel = contentTypes.find(t => t.id === selectedType)?.label
    const breakdown = [
      { label: `Production (${durationItem.label})`, amount: prodCost },
      ...(isInfluencer
        ? platformOptions.filter(p => selectedPlatforms.includes(p.id)).map(p => ({ label: `${p.label} posting`, amount: p.fee }))
        : []),
      ...addonItems.map(a => ({ label: a.label, amount: a.price })),
    ]
    navigate('/collab/brief', {
      state: {
        creator: talent,
        creatorId,
        contentType: selectedType,
        total,
        typeLabel,
        durationLabel: durationItem.label,
        platforms: isInfluencer ? platformOptions.filter(p => selectedPlatforms.includes(p.id)).map(p => p.label) : [],
        breakdown,
      },
    })
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Rate Card</h2>
      </div>

      <div className="p-5 space-y-5">
        {/* Content type */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">What do you need?</p>
          <div className="grid grid-cols-2 gap-2.5">
            {contentTypes.map(t => {
              const active = selectedType === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className="text-left rounded-2xl p-3.5 border-2 transition-colors"
                  style={{ borderColor: active ? t.color : '#f3f4f6', backgroundColor: active ? t.color + '0f' : '#fff' }}
                >
                  <p className="text-sm font-bold" style={{ color: active ? t.color : '#1f2937' }}>{t.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Duration */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Video Duration</p>
          <div className="flex flex-wrap gap-2">
            {durationOptions.map(d => {
              const active = selectedDuration === d.id
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDuration(d.id)}
                  className="px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors"
                  style={active
                    ? { backgroundColor: darkPurple, borderColor: darkPurple, color: '#fff' }
                    : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
                >
                  {d.label} · {formatNGN(d.price)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Platforms (influencer only) */}
        {isInfluencer && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Where should they post?</p>
            <p className="text-[11px] text-gray-400 mb-2.5">Each platform adds its posting fee on top of production</p>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map(p => {
                const active = selectedPlatforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-colors"
                    style={{ borderColor: active ? p.color : '#f3f4f6', backgroundColor: active ? p.color + '10' : '#fff', color: active ? p.color : '#6b7280' }}
                  >
                    {p.label} <span className="font-normal">+{formatNGN(p.fee)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {addonOptions.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Add-ons</p>
            <div className="space-y-2">
              {addonOptions.map(a => {
                const on = activeAddons.includes(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAddon(a.id)}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl border-2 px-3.5 py-3 text-left transition-colors"
                    style={{ borderColor: on ? (a.color || purple) : '#f3f4f6' }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: on ? (a.color || purple) : '#1f2937' }}>{a.label}</p>
                      {a.desc && <p className="text-[11px] text-gray-400 truncate">{a.desc}</p>}
                    </div>
                    <span className="text-xs font-bold flex-shrink-0" style={{ color: on ? (a.color || purple) : '#9ca3af' }}>+{formatNGN(a.price)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Price summary */}
        <div className="rounded-2xl border border-gray-100 p-4 space-y-2" style={{ backgroundColor: '#faf5ff' }}>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Production ({durationItem.label})</span>
            <span className="font-semibold text-gray-700">{formatNGN(prodCost)}</span>
          </div>
          {isInfluencer && platformOptions.filter(p => selectedPlatforms.includes(p.id)).map(p => (
            <div key={p.id} className="flex justify-between text-xs text-gray-500">
              <span>{p.label} posting</span>
              <span className="font-semibold text-gray-700">+{formatNGN(p.fee)}</span>
            </div>
          ))}
          {addonItems.map(a => (
            <div key={a.id} className="flex justify-between text-xs text-gray-500">
              <span>{a.label}</span>
              <span className="font-semibold text-gray-700">+{formatNGN(a.price)}</span>
            </div>
          ))}
          <div className="border-t border-purple-100 pt-2 flex justify-between items-center">
            <span className="text-sm font-extrabold text-gray-900">Total</span>
            <span className="text-lg font-extrabold" style={{ color: darkPurple }}>{formatNGN(total)}</span>
          </div>
        </div>

        {!isPreview && (
          <button
            onClick={goToCollab}
            className="w-full py-3.5 rounded-2xl text-white text-sm font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: darkPurple }}
          >
            Collab
          </button>
        )}
      </div>
    </div>
  )
}

// ── Quick Stats sidebar card ─────────────────────────────────────────────────
function QuickStats({ talent: c }) {
  const [reviewCount, setReviewCount] = useState(c.reviewCount || null)
  const [liveRating, setLiveRating] = useState(c.avgRating || 0)

  useEffect(() => {
    const tid = c._id || c.id
    if (!tid) return
    fetchReviews(tid).then(d => {
      setReviewCount(d.reviewCount)
      if (d.avgRating) setLiveRating(d.avgRating)
    })
  }, [c._id, c.id])

  // Derive response rate: top-rated = 98%, next-rated = 95%, fast-rising = 90%
  const responseRate = c.tier === 'top-rated' ? '98%' : c.tier === 'next-rated' ? '95%' : '90%'
  const isVerified = c.tier === 'top-rated' || c.tier === 'next-rated' || (c.completedCampaigns || 0) >= 5

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            Total Followers
          </div>
          <span className="font-bold text-gray-800">{formatFollowers(c.totalFollowers)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Heart className="w-4 h-4" />
            Avg. Engagement
          </div>
          <span className="font-bold" style={{ color: pink }}>{Number(c.avgEngagement || 0).toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4" />
            Campaigns Done
          </div>
          <span className="font-bold text-gray-800">{c.completedCampaigns || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Star className="w-4 h-4" />
            Rating
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-800">{Number(liveRating).toFixed(1)}</span>
            {reviewCount !== null && (
              <span className="text-xs text-gray-400">({reviewCount})</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MessageSquare className="w-4 h-4" />
            Response Rate
          </div>
          <span className="font-bold text-gray-800">{responseRate}</span>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {isVerified ? (
              <>
                <BadgeCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#3b82f6' }} />
                <span className="text-xs text-gray-600">Identity & platform verified</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 flex-shrink-0 text-gray-300" />
                <span className="text-xs text-gray-400">Verification pending</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Verified badge ──────────────────────────────────────────────────────────
function VerifiedBadge({ tier, campaigns }) {
  const isVerified = tier === 'top-rated' || tier === 'next-rated' || (campaigns || 0) >= 5
  if (!isVerified) return null
  return (
    <span className="relative group inline-flex items-center">
      <BadgeCheck className="w-5 h-5" style={{ color: '#3b82f6' }} />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex whitespace-nowrap text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg z-10 pointer-events-none"
        style={{ backgroundColor: '#1e0040', color: 'white' }}>
        Verified creator · {campaigns || 0}+ campaigns on Brandior
      </span>
    </span>
  )
}

// ── Reviews section ──────────────────────────────────────────────────────────
function ReviewsSection({ talentId }) {
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(5)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!talentId) return
    fetchReviews(talentId).then(d => {
      setReviews(d.reviews)
      setAvgRating(d.avgRating)
      setReviewCount(d.reviewCount)
    }).finally(() => setLoading(false))
  }, [talentId])

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days > 60) return new Date(dateStr).toLocaleDateString('en', { month: 'short', year: 'numeric' })
    if (days > 30) return '1 month ago'
    if (days > 0) return `${days}d ago`
    return 'Today'
  }

  if (loading) return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-40 mb-4" />
      {[1,2].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl mb-3" />)}
    </div>
  )

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">Brand Reviews</h2>
          {reviewCount > 0 && (
            <span className="text-sm font-medium px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>
              {reviewCount} review{reviewCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4" style={{ fill: '#D4AF37', color: '#D4AF37' }} />
            <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">/ 5</span>
          </div>
        )}
      </div>

      {/* Rating bar breakdown */}
      {reviewCount > 0 && (
        <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: '#faf5ff' }}>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
              <div className="flex justify-center mt-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3.5 h-3.5"
                    style={{ fill: i <= Math.round(avgRating) ? '#D4AF37' : '#e5e7eb',
                      color: i <= Math.round(avgRating) ? '#D4AF37' : '#e5e7eb' }} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{reviewCount} brands</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(star => {
                const count = reviews.filter(r => r.rating === star).length
                const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-3">{star}</span>
                    <Star className="w-3 h-3 flex-shrink-0" style={{ fill: '#D4AF37', color: '#D4AF37' }} />
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: '#D4AF37' }} />
                    </div>
                    <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review cards */}
      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium text-gray-400">No reviews yet</p>
          <p className="text-xs text-gray-300 mt-1">Be the first brand to leave a review after your campaign</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="rounded-2xl p-4" style={{ backgroundColor: '#fafafa', border: '1px solid #f3f4f6' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: darkPurple }}>
                    {review.brandInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.brandName}</p>
                    {review.campaignType && (
                      <p className="text-xs text-gray-400">{review.campaignType}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5"
                      style={{ fill: i <= review.rating ? '#D4AF37' : '#e5e7eb',
                        color: i <= review.rating ? '#D4AF37' : '#e5e7eb' }} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">{review.comment}</p>
              <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Live Rating (fetches real review stats) ──────────────────────────────────
function LiveRating({ talentId, fallbackRating }) {
  const [rating, setRating] = useState(fallbackRating || 5)
  const [count, setCount] = useState(null)

  useEffect(() => {
    if (!talentId) return
    fetchReviews(talentId).then(d => {
        setRating(d.avgRating || 5)
        if (typeof d.reviewCount === 'number') setCount(d.reviewCount)
      })
      .catch(() => {})
  }, [talentId])

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className="w-5 h-5"
            style={{ color: i <= Math.round(rating) ? '#D4AF37' : '#d1d5db',
              fill: i <= Math.round(rating) ? '#D4AF37' : 'none' }} />
        ))}
        <span className="ml-1 font-bold text-base text-gray-700">{Number(rating).toFixed(1)}</span>
      </div>
      {count !== null && (
        <span className="text-sm text-gray-400">({count} review{count !== 1 ? 's' : ''})</span>
      )}
    </div>
  )
}

function SkeletonProfile() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-3xl p-6 md:p-8 mb-6">
        <div className="flex flex-wrap gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200" />
          <div className="flex-1 min-w-0 space-y-3">
            <div className="h-7 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="h-4 bg-gray-100 rounded w-40" />
            <div className="flex gap-2">
              <div className="h-6 w-24 rounded-full bg-gray-100" />
              <div className="h-6 w-24 rounded-full bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-56 bg-gray-100 rounded-3xl" />)}
        </div>
        <div className="h-64 bg-gray-100 rounded-3xl" />
      </div>
    </div>
  )
}

export default function TalentProfilePage() {
  const { talentId, handle } = useParams()
  const profileId = handle || talentId
  const navigate = useNavigate()
  const [talent, setTalent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPreview, setIsPreview] = useState(false)
  const [messaging, setMessaging] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const chatBottomRef = useRef(null)
  const { toggle, isFav } = useFavorites()

  // Custom offer state
  const TIMELINES_LIST = ['Less than a week', '1 week', '2 weeks', '1 month', '2 months', '3 months']
  const CONTENT_TYPES_LIST = ['Instagram Reel', 'TikTok Video', 'YouTube Video', 'Instagram Stories', 'Photo Post', 'Blog Post', 'Podcast Mention', 'UGC (unposted)']
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerForm, setOfferForm] = useState({ title: '', brief: '', budget: '', timeline: '', deliverables: [] })
  const [offerSending, setOfferSending] = useState(false)
  const [offerSent, setOfferSent] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)

  function toggleDeliverable(ct) {
    setOfferForm(f => ({ ...f, deliverables: f.deliverables.includes(ct) ? f.deliverables.filter(x => x !== ct) : [...f.deliverables, ct] }))
  }

  async function sendCustomOffer(e) {
    e.preventDefault()
    if (!offerForm.title.trim() || offerForm.brief.trim().length < 20 || !offerForm.budget || offerForm.deliverables.length === 0) return
    setOfferSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setOfferSending(false); return }
    await supabase.from('custom_offers').insert({
      brand_id: user.id,
      creator_id: talent._id || talent.id,
      title: offerForm.title.trim(),
      brief: offerForm.brief.trim(),
      deliverables: offerForm.deliverables,
      budget: parseFloat(offerForm.budget.replace(/,/g, '')),
      timeline: offerForm.timeline || null,
    })
    setOfferSending(false)
    setOfferSent(true)
    setTimeout(() => { setShowOfferModal(false); setOfferSent(false); setOfferForm({ title: '', brief: '', budget: '', timeline: '', deliverables: [] }) }, 2200)
  }

  const canSendOffer = offerForm.title.trim().length > 0 && offerForm.brief.trim().length >= 20 && offerForm.budget.length > 0 && offerForm.deliverables.length > 0

  function openChat() {
    setChatOpen(true)
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function startConversation() { openChat() }

  async function sendChatMessage(e) {
    e.preventDefault()
    const text = chatInput.trim()
    if (!text) return
    setChatInput('')
    setChatSending(true)
    const msg = { id: Date.now(), text, from: 'brand', sentAt: new Date().toISOString() }
    setChatMessages(prev => [...prev, msg])
    // Create or find conversation in Supabase
    try {
      const brandId = localStorage.getItem('brandiór_user') || 'brand_demo'
      const brandName = localStorage.getItem('brandiór_brand_name') || 'Brand'
      const talentId = talent?._id || talent?.id || profileId
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('brand_id', brandId)
        .eq('talent_id', talentId)
        .maybeSingle()
      if (!existing) {
        await supabase.from('conversations').insert({
          brand_id: brandId,
          talent_id: talentId,
          brand_name: brandName,
          talent_name: talent?.name || 'Creator',
          talent_avatar: talent?.avatar || null,
          last_message: null,
          last_message_at: new Date().toISOString(),
          unread_brand: 0,
          unread_talent: 0,
        })
      }
    } catch { /* silent */ }
    setChatSending(false)
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)

      // Preview mode: load own profile from localStorage
      if (profileId === 'preview') {
        setIsPreview(true)
        try {
          const saved = localStorage.getItem('brandiór_preview_profile')
          if (saved) {
            if (!cancelled) setTalent(JSON.parse(saved))
          } else {
            if (!cancelled) setTalent(MOCK_CREATOR)
          }
        } catch {
          if (!cancelled) setTalent(MOCK_CREATOR)
        } finally {
          if (!cancelled) setLoading(false)
        }
        return
      }

      try {
        const { data: p, error: err } = await supabase
          .from('profiles')
          .select('*')
          .or(`handle.eq.${profileId},id.eq.${profileId}`)
          .maybeSingle()
        if (err || !p) throw new Error('Not found')
        if (!cancelled) setTalent({
          _id: p.id,
          id: p.id,
          name: p.full_name,
          handle: p.handle,
          location: p.location,
          bio: p.bio,
          avatar: p.avatar_url,
          niches: p.niches || [],
          tier: p.tier,
          avgRating: p.avg_rating,
          totalFollowers: p.total_followers,
          avgEngagement: p.avg_engagement,
          completedCampaigns: p.completed_campaigns,
          availableForHire: p.available_for_hire,
          platforms: p.platforms || [],
        })
      } catch {
        if (!cancelled) setTalent(MOCK_CREATOR)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [profileId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="h-8 w-40 bg-gray-200 rounded-lg mb-6 animate-pulse" />
          <SkeletonProfile />
        </div>
      </div>
    )
  }

  if (error && !talent) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-gray-500 mb-4">Could not load this talent's profile.</p>
          <button onClick={() => navigate('/marketplace')} className="px-6 py-2.5 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: darkPurple }}>
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  const c = talent

  const creatorHandle = talent.handle || profileId
  const creatorNiches = Array.isArray(talent.niches) ? talent.niches.join(', ') : ''

  return (
    <>
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{talent.name} — {creatorNiches} Creator | Brandior</title>
        <meta name="description" content={`Hire ${talent.name}, a ${creatorNiches} creator on Brandior. Based in ${talent.location || 'Africa'}.`} />
        <meta property="og:title" content={`${talent.name} | Brandior Creator`} />
        <meta property="og:description" content={`Hire ${talent.name} for your next campaign. ${creatorNiches} creator on Brandior.`} />
        <meta property="og:url" content={`https://brandior.africa/creators/${creatorHandle}`} />
        <meta property="og:type" content="profile" />
        {talent.avatar && <meta property="og:image" content={talent.avatar} />}
        <link rel="canonical" href={`https://brandior.africa/creators/${creatorHandle}`} />
      </Helmet>
      <Navbar />

      {/* Preview banner */}
      {isPreview && (
        <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 text-sm font-medium text-white" style={{ backgroundColor: '#7c3aed' }}>
          <span>👁 Preview — this is how brands see your profile</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        {!isPreview && (
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
        )}

        {/* Profile header — clean card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Top strip */}
          <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg, #0d0020 0%, #3b0764 100%)' }} />

          <div className="px-6 md:px-8 pb-6">
            {/* Avatar row */}
            <div className="flex flex-wrap items-end justify-between gap-4 -mt-12 mb-4">
              <div className="relative">
                <img
                  src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=7c3aed&color=fff&size=96`}
                  alt={c.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=7c3aed&color=fff&size=96` }}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 ring-2 ring-white" />
              </div>
              {!isPreview && (
                <div className="flex items-center gap-2 pb-1">
                  <button
                    onClick={() => toggle(c)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all"
                    style={{
                      backgroundColor: isFav(c._id || c.id) ? '#fff0f5' : 'white',
                      borderColor: isFav(c._id || c.id) ? pink : '#e5e7eb',
                      color: isFav(c._id || c.id) ? pink : '#6b7280',
                    }}
                  >
                    <Heart className="w-3.5 h-3.5" fill={isFav(c._id || c.id) ? pink : 'none'}
                      style={{ color: isFav(c._id || c.id) ? pink : '#6b7280' }} />
                    {isFav(c._id || c.id) ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={openChat}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors"
                    style={{ backgroundColor: darkPurple }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Message {c.name.split(' ')[0]}
                  </button>
                </div>
              )}
            </div>

            {/* Name + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-gray-900">{c.name}</h1>
              <VerifiedBadge tier={c.tier} campaigns={c.completedCampaigns} />
              <TierBadge tier={c.tier} size="sm" />
              {c.availableForHire
                ? <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Available</span>
                : <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Unavailable</span>
              }
            </div>

            <p className="text-sm text-gray-400 mb-1">@{c.handle}</p>

            <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{c.location}</span>
            </div>

            <LiveRating talentId={c._id || c.id} fallbackRating={c.avgRating} />

            {c.bio && <p className="text-sm text-gray-600 leading-relaxed mt-3 max-w-2xl">{c.bio}</p>}

            {/* Niches */}
            {c.niches?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {c.niches.map(n => (
                  <span key={n} className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#f3e8ff', color: purple }}>{n}</span>
                ))}
              </div>
            )}

            {/* Social platforms */}
            {c.platforms?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {c.platforms.map(p => {
                  const pc = PLATFORM_COLORS[p.name] || { bg: '#6b7280', label: p.name }
                  return (
                    <div key={p.name} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: pc.bg }}>{p.name[0]}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{formatFollowers(p.followers)}</p>
                        <p className="text-[10px] text-gray-400">{pc.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2-col lower section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — rate card + chat + reviews */}
          <div className="lg:col-span-2 space-y-5">

            {/* Rate Card */}
            <RateCardOrder talent={c} isPreview={isPreview} navigate={navigate} />

            {/* Custom Offer CTA */}
            {!isPreview && (
              <button onClick={() => setShowOfferModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #FF6B9D)', color: '#fff', border: 'none' }}>
                <Send className="w-4 h-4" />
                Send a Custom Offer
              </button>
            )}

            {/* Inline chat box */}
            {!isPreview && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #0d0020, #3b0764)' }}>
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                    {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" /> : c.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">Message {c.name.split(' ')[0]}</p>
                    <p className="text-purple-300 text-xs">Discuss your project directly</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online
                  </span>
                </div>

                {/* Messages */}
                <div className="overflow-y-auto px-4 py-4 space-y-2" style={{ minHeight: 180, maxHeight: 300, backgroundColor: '#faf5ff' }}>
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <MessageCircle className="w-8 h-8 mb-2" style={{ color: '#c084fc' }} />
                      <p className="text-sm font-semibold text-gray-600">Start the conversation</p>
                      <p className="text-xs text-gray-400 mt-1">Introduce yourself and share what you're looking for</p>
                    </div>
                  ) : chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === 'brand' ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%] px-3.5 py-2 rounded-2xl text-sm"
                        style={msg.from === 'brand'
                          ? { backgroundColor: '#4c1d95', color: '#fff', borderBottomRightRadius: 4 }
                          : { backgroundColor: '#fff', color: '#1a0030', border: '1px solid #e9d5ff', borderBottomLeftRadius: 4 }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendChatMessage} className="flex items-center gap-2 px-4 py-3 border-t" style={{ borderColor: '#f3e8ff' }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(stripInjection(e.target.value))}
                    placeholder={`Message ${c.name?.split(' ')[0]}…`}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: '#f3e8ff', color: '#1a0030' }}
                  />
                  <button type="submit" disabled={!chatInput.trim() || chatSending}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-opacity disabled:opacity-40"
                    style={{ backgroundColor: darkPurple }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                  </button>
                </form>
              </div>
            )}

            {/* Reviews */}
            <ReviewsSection talentId={c._id || c.id} />
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            <QuickStats talent={c} />

            <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg, #f9f5ff, #fdf4ff)' }}>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Why work with {c.name.split(' ')[0]}?</h3>
              <ul className="space-y-2.5">
                {[
                  { icon: Shield, text: 'Escrow payment — funds held until you approve' },
                  { icon: CheckCircle, text: `${c.completedCampaigns || 0}+ completed campaigns` },
                  { icon: RefreshCw, text: 'Revisions included in every package' },
                  { icon: ExternalLink, text: 'Verified African talent' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-xs text-gray-600">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: purple }} />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Escrow Protected</p>
                <p className="text-xs text-green-600 mt-0.5">Payment held securely until you approve deliverables.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Custom Offer Modal ── */}
    {talent && showOfferModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
        <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff', maxHeight: '90vh', overflowY: 'auto' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e9d5ff' }}>
            <div>
              <p className="font-black text-gray-900">Send Custom Offer</p>
              <p className="text-xs text-gray-400 mt-0.5">Direct offer to {c.name}</p>
            </div>
            <button onClick={() => { setShowOfferModal(false); setOfferSent(false) }} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {offerSent ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF6B9D)' }}>
                <Send className="w-7 h-7 text-white" />
              </div>
              <p className="font-black text-gray-900 text-xl mb-2">Offer Sent! 🎉</p>
              <p className="text-gray-500 text-sm">
                Your custom offer has been sent to <span className="font-bold" style={{ color: purple }}>{c.name}</span>. They'll be notified and can accept or decline.
              </p>
            </div>
          ) : (
            <form onSubmit={sendCustomOffer} className="px-6 py-5 space-y-4">
              {/* Creator strip */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#f9f5ff' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ backgroundColor: darkPurple }}>
                  {c.name?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.niche || c.primaryNiche || 'Creator'}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${purple}15`, color: purple }}>
                  <Zap className="w-3 h-3" /> Direct
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Project title *</label>
                <input type="text" required value={offerForm.title} onChange={e => setOfferForm(f => ({ ...f, title: stripInjection(e.target.value) }))}
                  placeholder="e.g. Summer Glow UGC Campaign"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 outline-none"
                  style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }} />
              </div>

              {/* Brief */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Brief * <span className="normal-case font-normal text-gray-400">(min 20 chars)</span></label>
                <textarea required rows={4} value={offerForm.brief} onChange={e => setOfferForm(f => ({ ...f, brief: stripInjection(e.target.value) }))}
                  placeholder="Describe your campaign goals, tone, target audience, and specific requirements…"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 outline-none resize-none"
                  style={{ border: `1px solid ${offerForm.brief.length > 0 && offerForm.brief.length < 20 ? '#ef4444' : '#e9d5ff'}`, backgroundColor: '#f9f5ff' }} />
                <p className={`text-[10px] mt-0.5 ${offerForm.brief.length > 0 && offerForm.brief.length < 20 ? 'text-red-500' : 'text-gray-300'}`}>{offerForm.brief.length} / 20 min</p>
              </div>

              {/* Deliverables */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Deliverables *</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES_LIST.map(ct => {
                    const active = offerForm.deliverables.includes(ct)
                    return (
                      <button key={ct} type="button" onClick={() => toggleDeliverable(ct)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          backgroundColor: active ? darkPurple : '#f9f5ff',
                          color: active ? '#fff' : '#6b7280',
                          border: `1px solid ${active ? darkPurple : '#e9d5ff'}`,
                        }}>
                        {active && <CheckCircle className="w-3 h-3 inline mr-1" />}{ct}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Your offer (₦) *</label>
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                  <span className="px-3 text-sm font-bold text-gray-400">₦</span>
                  <input type="text" inputMode="numeric" required value={offerForm.budget}
                    onChange={e => setOfferForm(f => ({ ...f, budget: e.target.value.replace(/[^\d,]/g, '') }))}
                    placeholder="e.g. 150,000"
                    className="flex-1 px-2 py-2.5 text-sm text-gray-800 bg-transparent outline-none font-semibold" />
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Timeline</label>
                <button type="button" onClick={() => setTimelineOpen(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff' }}>
                  <span className={offerForm.timeline ? 'text-gray-800 font-medium' : 'text-gray-400'}>{offerForm.timeline || 'Select a timeline…'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${timelineOpen ? 'rotate-180' : ''}`} />
                </button>
                {timelineOpen && (
                  <div className="absolute z-10 w-full mt-1 rounded-xl bg-white shadow-xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
                    {TIMELINES_LIST.map(t => (
                      <button key={t} type="button" onClick={() => { setOfferForm(f => ({ ...f, timeline: t })); setTimelineOpen(false) }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 transition-colors flex items-center justify-between"
                        style={{ color: offerForm.timeline === t ? purple : '#374151', fontWeight: offerForm.timeline === t ? '700' : '400' }}>
                        {t}{offerForm.timeline === t && <CheckCircle className="w-4 h-4" style={{ color: purple }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={!canSendOffer || offerSending}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: canSendOffer && !offerSending ? 'linear-gradient(135deg, #7c3aed, #FF6B9D)' : '#9ca3af' }}>
                {offerSending
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send Custom Offer</>}
              </button>
            </form>
          )}
        </div>
      </div>
    )}
    </>
  )
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: darkPurple }}>
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: darkPurple }}>Brandior</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/marketplace" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Marketplace
          </Link>
          <Link
            to="/brand-dashboard"
            className="text-sm font-semibold px-4 py-2 rounded-full text-white"
            style={{ backgroundColor: darkPurple }}
          >
            My Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}
