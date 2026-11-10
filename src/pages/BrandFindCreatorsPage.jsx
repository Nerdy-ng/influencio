import { useState } from 'react'
import { Search, SlidersHorizontal, X, Users } from 'lucide-react'
import { useCreatorSearch, PAGE_SIZE } from '../hooks/useCreatorSearch'
import { TalentCard, FilterSidebar, SkeletonCard, SortDropdown } from './Marketplace'

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '')

const darkPurple = '#4c1d95'
const purple = '#7c3aed'
const pink = '#F72585'

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
    <div>
      {/* Page header — compact */}
      <div
        className="py-8 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f5f0ff 0%, #ede9fe 55%, #f0ebff 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.18) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: purple, border: '1px solid rgba(124,58,237,0.18)' }}
          >
            Creator Discovery
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mb-2 leading-tight" style={{ color: '#1e0040' }}>
            Find Creators
          </h1>
          <p className="text-sm" style={{ color: 'rgba(76,29,149,0.6)' }}>
            Browse verified African creators ready to amplify your brand
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

export default BrandFindCreatorsContent
