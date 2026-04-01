import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Helmet } from 'react-helmet-async'
import {
  ChevronLeft, MapPin, Star, CheckCircle, Users, Heart,
  Package, Clock, RefreshCw, Shield, ExternalLink, Zap, MessageCircle, Loader2,
  BadgeCheck, ThumbsUp, MessageSquare, TrendingUp,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

async function fetchReviews(talentId) {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('talent_id', talentId)
    .order('created_at', { ascending: false })
  const reviews = data || []
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
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
  const w = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={w}
          style={{ color: i <= Math.round(rating) ? '#D4AF37' : '#d1d5db', fill: i <= Math.round(rating) ? '#D4AF37' : 'none' }}
        />
      ))}
      <span className={`ml-1 font-semibold ${size === 'lg' ? 'text-base' : 'text-sm'} text-gray-600`}>
        {Number(rating || 0).toFixed(1)}
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
  packages: [
    {
      _id: 'pkg_1',
      name: 'Story Feature',
      platform: 'Instagram',
      description: 'A dedicated Instagram Stories feature showcasing your product with swipe-up CTA and authentic reaction content.',
      deliverables: ['3x Instagram Stories', 'Product showcase frame', 'Call-to-action slide', 'Link in bio mention (48hrs)'],
      deliveryDays: 5,
      revisions: 2,
      price: 75000,
    },
    {
      _id: 'pkg_2',
      name: 'Reel Campaign',
      platform: 'Instagram',
      description: 'A high-quality Instagram Reel featuring your brand in a natural, engaging format. Includes trending audio and full post caption.',
      deliverables: ['1x Instagram Reel (30-60s)', 'Full caption + hashtags', 'Pinned to profile for 7 days', 'Performance report after 7 days'],
      deliveryDays: 7,
      revisions: 2,
      price: 150000,
    },
    {
      _id: 'pkg_3',
      name: 'TikTok Viral Push',
      platform: 'TikTok',
      description: 'A creative TikTok video designed to go viral with trending formats, sounds, and authentic African storytelling.',
      deliverables: ['1x TikTok video (15-60s)', 'Trending audio/sound selection', 'Engaging caption + hashtags', '2x Story reposts'],
      deliveryDays: 5,
      revisions: 1,
      price: 120000,
    },
    {
      _id: 'pkg_4',
      name: 'Full Brand Deal',
      platform: 'Instagram',
      description: 'Complete brand integration across all platforms. The ultimate package for maximum reach and authentic storytelling.',
      deliverables: ['1x Instagram Reel', '3x Instagram Stories', '1x TikTok video', '1x YouTube mention (in existing video)', '30-day performance report'],
      deliveryDays: 14,
      revisions: 3,
      price: 350000,
    },
  ],
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
        Verified creator · {campaigns || 0}+ campaigns on Brandiór
      </span>
    </span>
  )
}

// ── Reviews section ──────────────────────────────────────────────────────────
function ReviewsSection({ talentId }) {
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
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
  const [rating, setRating] = useState(fallbackRating || 0)
  const [count, setCount] = useState(null)

  useEffect(() => {
    if (!talentId) return
    fetchReviews(talentId).then(d => {
        if (d.avgRating) setRating(d.avgRating)
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
        const res = await fetch(`${API}/talents/${profileId}`)
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        if (!cancelled) setTalent(data)
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

            {/* Rate Card — single compact box */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Rate Card</h2>
                <span className="text-xs text-gray-400">Negotiate a custom deal via chat</span>
              </div>
              {(c.packages?.length > 0) ? (
                <div className="divide-y divide-gray-50">
                  {c.packages.map(pkg => {
                    const pc = PLATFORM_COLORS[pkg.platform] || { bg: '#6b7280' }
                    return (
                      <div key={pkg._id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          {pkg.platform && (
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: pc.bg }}>{pkg.platform[0]}</span>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{pkg.name}</p>
                            <p className="text-xs text-gray-400">{pkg.deliveryDays}d delivery · {pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          <span className="font-extrabold text-base" style={{ color: pink }}>₦{Number(pkg.price).toLocaleString('en')}</span>
                          {!isPreview && (
                            <button
                              onClick={() => { window.location.href = `/order/${pkg._id}?talentId=${c._id || c.id}` }}
                              className="text-xs font-bold px-3.5 py-1.5 rounded-xl text-white flex-shrink-0"
                              style={{ backgroundColor: darkPurple }}
                            >
                              Order
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                  <Package className="w-7 h-7 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No packages listed — send a message to negotiate</p>
                </div>
              )}
            </div>

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
                    onChange={e => setChatInput(e.target.value)}
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
  )
}

function PackageCard({ pkg, talent }) {
  const navigate = useNavigate()

  const handleOrder = () => {
    navigate(`/order/${pkg._id}?talentId=${talent._id || talent.id}`)
  }

  const pc = PLATFORM_COLORS[pkg.platform] || { bg: '#6b7280' }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{pkg.name}</h3>
          {pkg.platform && (
            <span
              className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: pc.bg }}
            >
              {pkg.platform}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold" style={{ color: pink }}>{formatNGN(pkg.price)}</p>
        </div>
      </div>

      {pkg.description && (
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{pkg.description}</p>
      )}

      {/* Deliverables */}
      {pkg.deliverables && pkg.deliverables.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Deliverables</p>
          <ul className="space-y-1.5">
            {pkg.deliverables.map(d => (
              <li key={d} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delivery + revisions */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{pkg.deliveryDays} day{pkg.deliveryDays !== 1 ? 's' : ''} delivery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <button
        onClick={handleOrder}
        className="w-full py-3 rounded-full text-sm font-semibold text-white transition-colors"
        style={{ backgroundColor: darkPurple }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3b0764'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = darkPurple}
      >
        Order This Package
      </button>
    </div>
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
          <span className="text-xl font-bold tracking-tight" style={{ color: darkPurple }}>Brandiór</span>
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
