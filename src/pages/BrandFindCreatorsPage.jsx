import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Users } from 'lucide-react'
import { useCreatorSearch, PAGE_SIZE } from '../hooks/useCreatorSearch'
import { TalentCard, FilterSidebar, SkeletonCard } from './Marketplace'
import { SORT_OPTIONS } from '../lib/creatorFilters'

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '')

const darkPurple = '#4c1d95'
const pink = '#F72585'

export default function BrandFindCreatorsPage() {
  const navigate = useNavigate()
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
      {/* Brand breadcrumb header */}
      <div
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#0d0020', borderBottom: '1px solid rgba(192,132,252,0.15)' }}
      >
        <button
          onClick={() => navigate('/brand/dashboard')}
          className="text-xs font-medium transition-colors"
          style={{ color: '#a78bfa' }}
          onMouseEnter={e => e.currentTarget.style.color = '#c084fc'}
          onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
        >
          ← Dashboard
        </button>
        <span style={{ color: 'rgba(192,132,252,0.4)' }}>/</span>
        <span className="text-xs font-semibold text-white">Find Creators</span>
      </div>

      {/* Page header */}
      <div
        className="pt-10 pb-10 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #150030 50%, #3d0080 100%)' }}
      >
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
            Creator Discovery
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-3 leading-tight text-white">
            Find Creators
          </h1>
          <p className="mb-6 text-sm" style={{ color: '#c4b5fd' }}>
            Browse verified African creators ready to amplify your brand
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#a78bfa' }} />
            <input
              type="text"
              placeholder="Search by name, handle, or niche..."
              value={search}
              onChange={e => { setSearch(stripInjection(e.target.value)); setVisibleCount(PAGE_SIZE) }}
              className="w-full py-4 text-base bg-white focus:outline-none transition-shadow"
              style={{
                borderRadius: '9999px',
                paddingLeft: '3rem',
                paddingRight: '4rem',
                boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
                color: '#1a0040',
              }}
            />
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition-colors"
              style={{ backgroundColor: darkPurple }}
              title="Open filters"
            >
              <SlidersHorizontal className="w-4 h-4 text-white" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: pink }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
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
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(192,132,252,0.1)' }}
              >
                <X className="w-4 h-4" style={{ color: '#a78bfa' }} />
              </button>
            </div>
            <FilterSidebar {...hook} hideReset />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-sm" style={{ color: '#6b21a8' }}>
                {loading ? 'Loading...' : `Showing ${total} creator${total !== 1 ? 's' : ''}`}
              </p>
              <select
                value={sort}
                onChange={e => { setSort(stripInjection(e.target.value)); setVisibleCount(PAGE_SIZE) }}
                className="text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-300"
                style={{ backgroundColor: '#fff', border: '1px solid rgba(124,58,237,0.2)', color: '#4c1d95' }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Error state */}
            {error && !loading && talents.length === 0 && (
              <div className="text-center py-16">
                <p className="mb-4" style={{ color: '#a78bfa' }}>Failed to load creators</p>
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
                  <TalentCard key={c._id || c.id} talent={c} from="/brand/find-creators" />
                ))
              }
            </div>

            {/* Empty state */}
            {!loading && talents.length === 0 && !error && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(124,58,237,0.15)' }}>
                  <Users className="w-9 h-9" style={{ color: '#7c3aed' }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#3b0764' }}>No creators found</h3>
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
    </div>
  )
}
