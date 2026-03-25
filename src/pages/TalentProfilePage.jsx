import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ChevronLeft, MapPin, Star, CheckCircle, Users, Heart,
  Package, Clock, RefreshCw, Shield, ExternalLink, Zap,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

const API = 'http://localhost:3001/api'

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
  const { toggle, isFav } = useFavorites()

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

        {/* Profile header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex flex-wrap gap-6 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=7c3aed&color=fff&size=96`}
                alt={c.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-50"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=7c3aed&color=fff&size=96` }}
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 ring-2 ring-white shadow" title="Online" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-gray-900">{c.name}</h1>
                <TierBadge tier={c.tier} size="md" />
                {c.availableForHire ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Available for Hire
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    Currently Unavailable
                  </span>
                )}
                <button
                  onClick={() => toggle(c)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
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
              </div>

              <p className="text-sm text-gray-400 mb-2">@{c.handle}</p>

              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{c.location}</span>
              </div>

              <StarRating rating={c.avgRating} size="lg" />

              {c.bio && (
                <p className="text-sm text-gray-600 leading-relaxed mt-3 max-w-2xl">{c.bio}</p>
              )}

              {/* Niches */}
              {c.niches && c.niches.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {c.niches.map(n => (
                    <span key={n} className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#f3e8ff', color: purple }}>
                      {n}
                    </span>
                  ))}
                </div>
              )}

              {/* Content styles */}
              {c.contentStyles && c.contentStyles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.contentStyles.map(s => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Social platforms */}
          {c.platforms && c.platforms.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">Social Platforms</p>
              <div className="flex flex-wrap gap-3">
                {c.platforms.map(p => {
                  const pc = PLATFORM_COLORS[p.name] || { bg: '#6b7280', label: p.name }
                  return (
                    <div key={p.name} className="flex items-center gap-2.5 bg-gray-50 rounded-2xl px-4 py-2.5">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: pc.bg }}
                      >
                        {p.name[0]}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{pc.label}</p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">{formatFollowers(p.followers)}</span> followers &middot;{' '}
                          <span style={{ color: pink }}>{Number(p.engagement || 0).toFixed(1)}%</span> engagement
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Completed campaigns count */}
          <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span><strong className="text-gray-800">{c.completedCampaigns || 0}</strong> campaigns completed on Brandiór</span>
          </div>
        </div>

        {/* 2-col lower section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Packages */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Packages &amp; Pricing</h2>
            <div className="flex flex-col gap-4">
              {(c.packages || []).map(pkg => (
                <PackageCard key={pkg._id} pkg={pkg} talent={c} />
              ))}
              {(!c.packages || c.packages.length === 0) && (
                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No packages listed yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Quick stats */}
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
                    Completed Jobs
                  </div>
                  <span className="font-bold text-gray-800">{c.completedCampaigns || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="w-4 h-4" />
                    Avg. Rating
                  </div>
                  <span className="font-bold text-gray-800">{Number(c.avgRating || 0).toFixed(1)} / 5</span>
                </div>
              </div>
            </div>

            {/* Why work with */}
            <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg, #f9f5ff, #fdf4ff)' }}>
              <h3 className="font-bold text-gray-900 mb-3">Why work with {c.name.split(' ')[0]}?</h3>
              <ul className="space-y-2.5">
                {[
                  { icon: Shield, text: 'Secure escrow payment — your money is safe until you approve' },
                  { icon: CheckCircle, text: `${c.completedCampaigns || 0}+ brands have worked with this talent` },
                  { icon: RefreshCw, text: 'Revisions included in every package' },
                  { icon: ExternalLink, text: 'Verified African talent with authentic audience' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-xs text-gray-600">
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: purple }} />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Escrow note */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-2.5">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Escrow Protected</p>
                <p className="text-xs text-green-600 mt-0.5">Payment is held securely until you approve the deliverables.</p>
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
