import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, X, Star, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { searchLocations, locationMatches } from '../lib/locationData'

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '')
const darkPurple = '#4c1d95'
const purple = '#7c3aed'

const TIER_INFO = {
  'fast-rising': { label: 'Fast Rising', color: '#22c55e' },
  'next-rated':  { label: 'Next',        color: '#a78bfa', diamond: true },
  'top-rated':   { label: 'Top',         color: '#D4AF37', diamond: true },
}

function initials(name) {
  return (name || '??').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const NICHES = ['All', 'Beauty & Skincare', 'Fashion & Style', 'Food & Cooking', 'Tech & Gadgets', 'Fitness & Wellness', 'Comedy', 'Finance & Business']

export default function BrandFindCreatorsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [nicheFilter, setNicheFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  const [locationFocused, setLocationFocused] = useState(false)
  const [talents, setTalents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, handle, location, niches, tier, avg_rating, min_price, avatar_url')
        .eq('role', 'creator')
        .order('avg_rating', { ascending: false })
        .limit(48)
      setTalents(data || [])
      setLoading(false)
    })()
  }, [])

  const locationSuggestions = searchLocations(locationSearch, 8).filter(l => l !== locationFilter)

  const filtered = talents.filter(t => {
    if (search && !t.full_name?.toLowerCase().includes(search.toLowerCase()) && !t.handle?.toLowerCase().includes(search.toLowerCase())) return false
    if (nicheFilter !== 'All' && !(t.niches || []).includes(nicheFilter)) return false
    if (locationFilter && !locationMatches(t.location, locationFilter)) return false
    return true
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--b-brandDashBg, #f9f5ff)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'var(--b-brandDashBg, #f9f5ff)', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <button onClick={() => navigate('/brand-dashboard')}
          className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: purple }}>
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </button>
        <span style={{ color: 'rgba(124,58,237,0.3)' }}>/</span>
        <span className="text-sm font-bold" style={{ color: darkPurple }}>Find Creators</span>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-5">
        {/* Hero */}
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1a0035 0%, #3d0080 100%)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>Talent Marketplace</p>
          <h1 className="text-xl font-black text-white mb-1">Find Your Next Creator</h1>
          <p className="text-white/50 text-sm">Browse verified African creators ready to bring your brand campaigns to life.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
          <input
            value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            placeholder="Search by name or handle…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
            style={{ border: '1px solid #e9d5ff', backgroundColor: '#faf5ff' }}
          />
        </div>

        {/* Niche chips */}
        <div className="flex gap-2 flex-wrap">
          {NICHES.map(n => (
            <button key={n} onClick={() => setNicheFilter(n)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              style={nicheFilter === n
                ? { backgroundColor: darkPurple, color: 'white' }
                : { backgroundColor: '#f3eeff', color: purple, border: '1px solid #e9d5ff' }}>
              {n}
            </button>
          ))}
        </div>

        {/* Location filter */}
        <div className="relative">
          {locationFilter ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold w-fit"
              style={{ backgroundColor: '#f3eeff', color: purple, border: '1px solid #e9d5ff' }}>
              <MapPin className="w-3 h-3" />
              {locationFilter}
              <button onClick={() => { setLocationFilter(''); setLocationSearch('') }} className="ml-0.5 hover:opacity-70 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
                <input
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                  onFocus={() => setLocationFocused(true)}
                  onBlur={() => setTimeout(() => setLocationFocused(false), 150)}
                  placeholder="Filter by location…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  style={{ border: '1px solid #e9d5ff', backgroundColor: '#faf5ff' }}
                />
                {locationSearch && (
                  <button onClick={() => setLocationSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70">
                    <X className="w-3.5 h-3.5 text-brand-dark/30" />
                  </button>
                )}
              </div>
              {locationFocused && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                  style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 4px 16px rgba(124,58,237,0.08)' }}>
                  {!locationSearch.trim() && (
                    <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>
                      Popular locations
                    </p>
                  )}
                  {locationSuggestions.map(l => (
                    <button key={l}
                      onMouseDown={() => { setLocationFilter(l); setLocationSearch(''); setLocationFocused(false) }}
                      className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors hover:bg-purple-50"
                      style={{ color: '#1e0040' }}>
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
                      {l}
                    </button>
                  ))}
                </div>
              )}
              {locationFocused && locationSearch.trim() && locationSuggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl py-3 z-50"
                  style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff' }}>
                  <p className="text-sm text-center" style={{ color: '#9ca3af' }}>No matching locations</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Creator grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.length === 0 ? (
                <p className="col-span-3 text-center text-sm text-gray-400 py-8">No creators found</p>
              ) : filtered.map(t => {
                const tier = TIER_INFO[t.tier] || TIER_INFO['fast-rising']
                const handle = t.handle ? `@${t.handle}` : ''
                const niche = (t.niches || [])[0] || ''
                return (
                  <Link key={t.id} to={`/creators/${t.handle || t.id}`}
                    className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 8px rgba(192,132,252,0.07)' }}>
                    {t.avatar_url
                      ? <img src={t.avatar_url} alt={t.full_name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                      : <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                          style={{ backgroundColor: purple }}>
                          {initials(t.full_name)}
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="font-bold text-brand-dark text-sm truncate">{t.full_name}</p>
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: tier.color, backgroundColor: `${tier.color}18`, border: `1px solid ${tier.color}40` }}>
                          {tier.label}
                          {tier.diamond && <svg width="7" height="7" viewBox="0 0 24 24" fill={tier.color}><path d="M12 2L2 9l10 13L22 9z"/></svg>}
                        </span>
                      </div>
                      <p className="text-brand-dark/40 text-xs mb-1">{handle}{t.location ? ` · ${t.location}` : ''}</p>
                      {niche && <p className="text-xs text-brand-dark/50 mb-2">{niche}</p>}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-0.5" style={{ color: purple }}><Star className="w-3 h-3 fill-current" />{(t.avg_rating || 5).toFixed(1)}</span>
                        {t.min_price > 0 && <span className="font-semibold ml-auto" style={{ color: darkPurple }}>from ₦{t.min_price.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="text-center pt-2">
              <Link to="/marketplace" className="text-sm font-semibold hover:underline" style={{ color: purple }}>
                Browse all creators in Marketplace →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
