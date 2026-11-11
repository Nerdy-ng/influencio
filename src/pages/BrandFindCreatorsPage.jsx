import { useState, useRef } from 'react'
import { Search, SlidersHorizontal, X, Users, ChevronDown } from 'lucide-react'
import { useCreatorSearch, PAGE_SIZE } from '../hooks/useCreatorSearch'
import { TalentCard, FilterSidebar, SkeletonCard, SortDropdown } from './Marketplace'

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '')

const darkPurple = '#4c1d95'
const purple     = '#7c3aed'
const pink       = '#F72585'

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

      {/* ── Page intro ─────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-6 pb-5">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: '#0e0020' }}>
              Find Creators
            </h1>
            <span
              className="text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: purple, border: '1px solid #e9d5ff' }}
            >
              Brand workspace
            </span>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'rgba(15,0,32,0.5)' }}>
            Discover verified African creators for your next campaign.
          </p>
        </div>
      </div>

      {/* ── Sticky search + controls bar ────────────────────────── */}
      <div
        className="sticky z-30 px-4 sm:px-6 py-3"
        style={{ top: '64px', backgroundColor: 'rgba(243,238,255,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e9d5ff' }}
      >
        <div className="max-w-screen-xl mx-auto space-y-2.5">

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
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-8">

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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {loading && visibleCount === PAGE_SIZE
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : talents.slice(0, visibleCount).map(c => (
              <TalentCard key={c._id || c.id} talent={c} from="/brand/find-creators" />
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
