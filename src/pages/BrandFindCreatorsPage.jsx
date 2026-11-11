import { useState, useRef } from 'react'
import { Search, SlidersHorizontal, X, Users, Heart, BadgeCheck, Play } from 'lucide-react'
import { useCreatorSearch, PAGE_SIZE } from '../hooks/useCreatorSearch'
import { FilterSidebar, SkeletonCard, SortDropdown, StarRating } from './Marketplace'
import { useNavigate } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import { NICHES, formatNGN, formatFollowers } from '../lib/creatorFilters'

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '')

const darkPurple = '#4c1d95'
const purple     = '#7c3aed'
const pink       = '#F72585'

const TIERS = [
  { value: 'fast-rising', label: 'Fast Rising', color: '#22c55e' },
  { value: 'next-rated',  label: 'Next Rated',  color: '#a78bfa', diamond: true },
  { value: 'top-rated',   label: 'Top Rated',   color: '#D4AF37', diamond: true },
]

function BrandCreatorCard({ talent, from = '/brand/find-creators' }) {
  const navigate = useNavigate()
  const { toggle, isFav } = useFavorites()
  const faved = isFav(talent._id || talent.id)
  const videoRef = useRef(null)
  const [videoPlaying, setVideoPlaying] = useState(false)

  const avatarSrc = talent.avatar_url || talent.avatar
    || null // fall through to initials

  const tierInfo = TIERS.find(x => x.value === talent.tier) || TIERS[0]

  function handleClick() {
    navigate(`/creators/${talent.handle || talent._id || talent.id}`, { state: { from } })
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
      style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.13)'; e.currentTarget.style.borderColor = '#c4b5fd' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.06)'; e.currentTarget.style.borderColor = '#e9d5ff' }}
    >
      {/* Portrait image */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ aspectRatio: '5/4' }}
        onMouseEnter={() => { if (videoRef.current && talent.featuredVideo) { videoRef.current.play().catch(() => {}); setVideoPlaying(true) } }}
        onMouseLeave={() => { if (videoRef.current && talent.featuredVideo) { videoRef.current.pause(); videoRef.current.currentTime = 0; setVideoPlaying(false) } }}
      >
        {talent.featuredVideo ? (
          <>
            <video ref={videoRef} src={talent.featuredVideo}
              className="absolute inset-0 w-full h-full object-cover"
              muted loop playsInline preload="metadata"
              poster={avatarSrc || undefined} />
            {!videoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(14,0,32,0.5)', backdropFilter: 'blur(4px)' }}>
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>
            )}
          </>
        ) : avatarSrc ? (
          <img src={avatarSrc} alt={talent.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none' }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-black text-4xl" style={{ background: 'linear-gradient(135deg, #f3eeff, #e9d5ff)', color: '#7c3aed' }}>
            {(talent.name || 'C')[0].toUpperCase()}
          </div>
        )}

        {/* Tier badge */}
        <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: tierInfo.color + '22', color: tierInfo.color, border: `1px solid ${tierInfo.color}55`, backdropFilter: 'blur(8px)' }}>
          {tierInfo.diamond
            ? <><svg width="7" height="7" viewBox="0 0 24 24" fill={tierInfo.color}><path d="M12 2L2 9l10 13L22 9z"/></svg>{tierInfo.label}</>
            : tierInfo.label}
        </div>

        {/* Heart */}
        <button
          onClick={ev => { ev.stopPropagation(); toggle(talent) }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: faved ? 'rgba(247,37,133,0.25)' : 'rgba(14,0,32,0.35)', backdropFilter: 'blur(6px)' }}
        >
          <Heart className="w-3.5 h-3.5" style={{ color: faved ? pink : '#fff' }} fill={faved ? pink : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <p className="font-black text-base truncate leading-snug" style={{ color: '#0F0020' }}>{talent.name}</p>
              {talent.completedCampaigns >= 10 && (
                <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: purple }}>
                  <BadgeCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'rgba(76,29,149,0.5)' }}>@{talent.handle}</p>
          </div>
          <StarRating rating={talent.avgRating} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(talent.niches || []).slice(0, 2).map(n => {
            const nicheObj = NICHES.find(x => x.label === n)
            return (
              <span key={n} className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: purple }}>
                {nicheObj ? nicheObj.emoji + ' ' : ''}{n}
              </span>
            )
          })}
          {talent.availableForHire && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(22,163,74,0.07)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              Available
            </span>
          )}
        </div>

        <p className="text-xs" style={{ color: 'rgba(76,29,149,0.5)' }}>
          {formatFollowers(talent.totalFollowers)} followers
          {' · '}{Number(talent.avgEngagement || 0).toFixed(1)}% eng
          {' · '}{talent.completedCampaigns || 0} jobs
        </p>

        <div className="flex items-center justify-between gap-2 pt-2.5 mt-auto"
          style={{ borderTop: '1px solid rgba(124,58,237,0.08)' }}>
          <span className="text-sm font-black" style={{ color: purple }}>
            From {formatNGN(talent.minPrice)}
          </span>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/creators/${talent.handle || talent._id || talent.id}`, { state: { from } }) }}
            className="text-sm font-bold px-4 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: purple }}
          >
            View Profile →
          </button>
        </div>
      </div>
    </div>
  )
}

export function BrandFindCreatorsContent() {
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
    <div style={{ backgroundColor: '#f3eeff', minHeight: '100%' }}>

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f3eeff 0%, #ede9fe 60%, #ddd6fe 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-2">
              <span style={{ color: '#0e0020' }}>Find </span>
              <span style={{ color: '#7c3aed' }}>Creators</span>
            </h1>
            <p className="text-sm sm:text-base mb-5" style={{ color: 'rgba(15,0,32,0.55)' }}>
              Discover verified African creators for your next campaign.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: '🛡️', label: 'Vetted Creators' },
                { icon: '🌍', label: 'Across Africa' },
                { icon: '⚡', label: 'Ready to Collaborate' },
              ].map(({ icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: darkPurple, border: '1px solid rgba(124,58,237,0.15)' }}>
                  {icon} {label}
                </span>
              ))}
            </div>
          </div>
          {/* Decorative circle motif */}
          <div className="hidden sm:block flex-shrink-0 relative w-32 h-32 sm:w-40 sm:h-40">
            <div className="absolute inset-0 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            <div className="absolute inset-4 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #F72585 0%, transparent 70%)' }} />
          </div>
        </div>
      </div>

      {/* ── Sticky search + controls bar ────────────────────────── */}
      <div
        className="sticky z-30 px-4 sm:px-6 lg:px-8 py-3"
        style={{ top: '64px', backgroundColor: 'rgba(243,238,255,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e9d5ff' }}
      >
        <div className="max-w-7xl mx-auto space-y-2.5">

          {/* Search row */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 pointer-events-none"
              style={{ color: 'rgba(124,58,237,0.5)', width: '1.1rem', height: '1.1rem' }}
            />
            <input
              type="text"
              placeholder="Search by name, handle or niche…"
              value={search}
              onChange={e => { setSearch(stripInjection(e.target.value)); setVisibleCount(PAGE_SIZE) }}
              className="w-full rounded-2xl text-sm focus:outline-none transition-shadow"
              style={{
                paddingLeft: '2.75rem',
                paddingRight: search ? '2.75rem' : '1.25rem',
                paddingTop: '0.8125rem',
                paddingBottom: '0.8125rem',
                backgroundColor: '#fff',
                border: '1.5px solid #e9d5ff',
                color: '#0e0020',
                boxShadow: '0 2px 12px rgba(124,58,237,0.07)',
              }}
              onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12), 0 2px 12px rgba(124,58,237,0.07)'; e.target.style.borderColor = '#c4b5fd' }}
              onBlur={e => { e.target.style.boxShadow = '0 2px 12px rgba(124,58,237,0.07)'; e.target.style.borderColor = '#e9d5ff' }}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setVisibleCount(PAGE_SIZE) }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: purple }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.18)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.1)'}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filters + sort row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="relative inline-flex items-center gap-1.5 text-sm font-semibold transition-all flex-shrink-0"
              style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1.5px solid #e9d5ff', color: darkPurple, backgroundColor: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.backgroundColor = '#fff' }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: purple }} />
              Filters
              {activeFilterCount > 0 && (
                <>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-black"
                    style={{ backgroundColor: pink }}>{activeFilterCount}</span>
                  <span className="sr-only">{activeFilterCount} active</span>
                </>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold transition-colors flex-shrink-0"
                style={{ color: 'rgba(76,29,149,0.5)', padding: '0.5rem 0.75rem' }}
                onMouseEnter={e => e.currentTarget.style.color = darkPurple}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(76,29,149,0.5)'}
              >
                Clear all
              </button>
            )}

            <div className="flex-1" />
            <SortDropdown value={sort} onChange={v => { setSort(v); setVisibleCount(PAGE_SIZE) }} />
          </div>
        </div>
      </div>

      {/* ── Filter drawer ────────────────────────────────────────── */}
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
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(192,132,252,0.1)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(192,132,252,0.2)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(192,132,252,0.1)'}
              >
                <X className="w-4 h-4" style={{ color: '#a78bfa' }} />
              </button>
            </div>
            <FilterSidebar {...hook} />
          </div>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 md:pb-8">

        {/* Count row */}
        {!loading && (
          <p className="text-xs mb-5" style={{ color: 'rgba(76,29,149,0.45)' }}>
            <span className="font-black" style={{ color: darkPurple }}>{total.toLocaleString()}</span>
            {' '}creator{total !== 1 ? 's' : ''} found
            {search && <span> matching <em style={{ fontStyle: 'normal', color: purple }}>"{search}"</em></span>}
          </p>
        )}

        {/* Error */}
        {error && !loading && talents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(124,58,237,0.08)', border: '1px solid #e9d5ff' }}>
              <Users className="w-6 h-6" style={{ color: purple }} />
            </div>
            <p className="text-sm font-semibold mb-4" style={{ color: 'rgba(76,29,149,0.6)' }}>
              Could not load creators
            </p>
            <button
              onClick={fetchTalents}
              className="px-6 py-2.5 rounded-full text-white text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: darkPurple }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {loading && visibleCount === PAGE_SIZE
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : talents.slice(0, visibleCount).map(c => (
              <BrandCreatorCard key={c._id || c.id} talent={c} from="/brand/find-creators" />
            ))
          }
        </div>

        {/* Empty */}
        {!loading && talents.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(124,58,237,0.08)', border: '1px solid #e9d5ff' }}>
              <Users className="w-7 h-7" style={{ color: purple }} />
            </div>
            <p className="font-black text-base mb-1.5" style={{ color: darkPurple }}>
              {search ? `No creators match "${search}"` : 'No creators found'}
            </p>
            <p className="text-sm mb-6" style={{ color: 'rgba(76,29,149,0.5)' }}>
              Try a different search or adjust your filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-full text-white text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: darkPurple }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="flex justify-center py-8">
          {visibleCount < talents.length && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#a78bfa' }}>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Loading more…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrandFindCreatorsContent
