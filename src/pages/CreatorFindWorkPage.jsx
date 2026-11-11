import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Users, Calendar, CheckCircle, Heart, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useFavorites } from '../hooks/useFavorites'
import Navbar from '../components/Navbar'

const purple     = '#7c3aed'
const darkPurple = '#4c1d95'
const pink       = '#F72585'

const BROWSE_NICHES = ['Fashion','Beauty','Tech','Food','Fitness','Lifestyle','Comedy','Travel','Fintech','Business','Voiceover','Gaming']
const PREDEFINED_TYPES = ['UGC Content','Paid Campaign','Product Collaboration','Event / Experience']

function brandInitials(name) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const BRAND_COLORS = ['#7c3aed','#4c1d95','#db2777','#0891b2','#059669','#d97706','#dc2626','#7c3aed']
function brandColor(name) {
  let hash = 0
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return BRAND_COLORS[hash % BRAND_COLORS.length]
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(15,0,32,0.35)', flexShrink: 0 }}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  )
}

export default function CreatorFindWorkPage() {
  const navigate = useNavigate()

  const [jobs, setJobs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [applied, setApplied]     = useState([])
  const [search, setSearch]       = useState('')
  const [nicheFilter, setNicheFilter]   = useState('All')
  const [typeFilters, setTypeFilters]   = useState([])
  const [filtersOpen, setFiltersOpen]   = useState(false)
  const [nicheOpen, setNicheOpen]       = useState(true)
  const [typeOpen, setTypeOpen]         = useState(true)
  const [budgetOpen, setBudgetOpen]     = useState(true)
  const [budgetMin, setBudgetMin]       = useState(0)
  const [budgetMax, setBudgetMax]       = useState(500000)
  const [sortBy, setSortBy]             = useState('recent')
  const [sortOpen, setSortOpen]         = useState(false)
  const { toggle: toggleFav, isFav }    = useFavorites()

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Simple select without FK join — avoids silent join failures
      const { data: jobRows, error: jobsErr } = await supabase
        .from('public_jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (jobsErr) console.error('[FindWork] public_jobs query error:', jobsErr)

      // Fetch brand names separately
      let brandMap = {}
      if (jobRows && jobRows.length > 0) {
        const ids = [...new Set(jobRows.map(j => j.brand_id).filter(Boolean))]
        if (ids.length > 0) {
          const { data: brands } = await supabase
            .from('profiles')
            .select('id, company_name, full_name')
            .in('id', ids)
          brandMap = Object.fromEntries(
            (brands || []).map(b => [b.id, b.company_name || b.full_name || 'Brand'])
          )
        }
      }

      const { data: apps } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('creator_id', user.id)

      setJobs((jobRows || []).map(j => ({
        id:          j.id,
        brand_id:    j.brand_id,
        brand:       brandMap[j.brand_id] || 'Brand',
        title:       j.campaign_name,
        type:        j.collab_type || (j.content_types?.[0]) || 'UGC',
        budget:      `₦${Number(j.budget).toLocaleString()}`,
        budgetRaw:   Number(j.budget),
        deadline:    j.timeline,
        description: j.brief,
        tags:        [j.niche].filter(Boolean),
        applicants:  j.applicants_count || 0,
        isNew:       (Date.now() - new Date(j.created_at).getTime()) < 3 * 86400000,
      })))
      setApplied((apps || []).map(a => a.job_id))
      setLoading(false)
    })()
  }, [])

  function handleCardClick(job) {
    navigate(`/campaigns/${job.id}`)
  }

  function toggleTypeFilter(type) {
    setTypeFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const typeCounts    = jobs.reduce((acc, j) => { acc[j.type] = (acc[j.type] || 0) + 1; return acc }, {})
  const allTypes      = Object.keys(typeCounts).sort()
  const displayTypes  = allTypes.length > 0 ? allTypes : PREDEFINED_TYPES

  const visible = jobs.filter(j => {
    const q = search.toLowerCase()
    const matchesSearch  = !q || j.title.toLowerCase().includes(q) || j.brand.toLowerCase().includes(q)
    const matchesNiche   = nicheFilter === 'All' || (j.tags || []).some(t => t.toLowerCase() === nicheFilter.toLowerCase())
    const matchesType    = typeFilters.length === 0 || typeFilters.includes(j.type)
    const matchesBudget  = j.budgetRaw >= budgetMin && (budgetMax >= 500000 || j.budgetRaw <= budgetMax)
    return matchesSearch && matchesNiche && matchesType && matchesBudget
  })

  const sortedVisible = sortBy === 'budget_high' ? [...visible].sort((a, b) => b.budgetRaw - a.budgetRaw)
    : sortBy === 'budget_low' ? [...visible].sort((a, b) => a.budgetRaw - b.budgetRaw)
    : visible

  const SORT_OPTIONS = [
    { value: 'recent',      label: 'Most Recent' },
    { value: 'budget_high', label: 'Highest Budget' },
    { value: 'budget_low',  label: 'Lowest Budget' },
  ]
  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Most Recent'

  const hasActiveFilter = nicheFilter !== 'All' || typeFilters.length > 0 || budgetMin > 0 || budgetMax < 500000

  function clearFilters() { setNicheFilter('All'); setTypeFilters([]); setBudgetMin(0); setBudgetMax(500000) }

  // ── Filter panel content (shared between sidebar and drawer) ──────
  function FilterPanelContent({ onApply }) {
    return (
      <div>
        {/* Collab Type section — always visible */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9d5ff' }}>
          <button
            onClick={() => setTypeOpen(o => !o)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0e0020' }}>Collab Type</span>
            <ChevronDown style={{ width: 14, height: 14, color: 'rgba(15,0,32,0.4)', transform: typeOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
          {typeOpen && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayTypes.map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={typeFilters.includes(t)}
                    onChange={() => { toggleTypeFilter(t); onApply?.() }}
                    style={{ width: 15, height: 15, accentColor: purple, cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, fontSize: 13, color: 'rgba(15,0,32,0.7)', fontWeight: typeFilters.includes(t) ? 700 : 500 }}>{t}</span>
                  <span style={{ fontSize: 12, color: 'rgba(15,0,32,0.35)', fontWeight: 500 }}>({typeCounts[t] || 0})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Budget Range section */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9d5ff' }}>
          <button
            onClick={() => setBudgetOpen(o => !o)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0e0020' }}>Budget Range</span>
            <ChevronDown style={{ width: 14, height: 14, color: 'rgba(15,0,32,0.4)', transform: budgetOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
          {budgetOpen && (
            <div style={{ marginTop: 14 }}>
              {/* Filled track */}
              <div style={{ position: 'relative', height: 4, backgroundColor: '#e9d5ff', borderRadius: 2, margin: '0 0 4px' }}>
                <div style={{
                  position: 'absolute', height: '100%', borderRadius: 2, backgroundColor: purple,
                  left: `${(budgetMin / 500000) * 100}%`,
                  right: `${100 - (budgetMax / 500000) * 100}%`,
                }} />
              </div>
              {/* Dual handles */}
              <div className="dual-range">
                <input type="range" min={0} max={500000} step={5000} value={budgetMin}
                  onChange={e => setBudgetMin(Math.min(Number(e.target.value), budgetMax - 5000))}
                />
                <input type="range" min={0} max={500000} step={5000} value={budgetMax}
                  onChange={e => setBudgetMax(Math.max(Number(e.target.value), budgetMin + 5000))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(15,0,32,0.5)', marginTop: 6 }}>
                <span>₦{budgetMin.toLocaleString()}</span>
                <span>{budgetMax >= 500000 ? '₦500,000+' : '₦' + budgetMax.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Niche section */}
        <div style={{ padding: '16px 20px' }}>
          <button
            onClick={() => setNicheOpen(o => !o)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0e0020' }}>Niche</span>
            <ChevronDown style={{ width: 14, height: 14, color: 'rgba(15,0,32,0.4)', transform: nicheOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
          {nicheOpen && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['All', ...BROWSE_NICHES].map(n => (
                <label key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="niche-filter"
                    checked={nicheFilter === n}
                    onChange={() => { setNicheFilter(n); onApply?.() }}
                    style={{ width: 15, height: 15, accentColor: purple, cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, fontSize: 13, color: 'rgba(15,0,32,0.7)', fontWeight: nicheFilter === n ? 700 : 500 }}>{n}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f3eeff', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Page heading area ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 pt-24 pb-5">
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0e0020', marginBottom: 6, lineHeight: 1.1 }}>
          Find Work
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(15,0,32,0.5)', marginBottom: 20, lineHeight: 1.5, maxWidth: 520 }}>
          Discover brand campaigns, collaborations and paid opportunities that match your skills and audience.
        </p>

        {/* Search bar with Search button */}
        <div
          style={{
            display: 'flex', alignItems: 'center',
            backgroundColor: '#fff',
            border: '1.5px solid #e9d5ff',
            borderRadius: 999,
            boxShadow: '0 2px 12px rgba(124,58,237,0.07)',
            padding: '4px 4px 4px 20px',
          }}
        >
          <Search style={{ width: 18, height: 18, color: 'rgba(124,58,237,0.4)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search campaigns by brand or keyword…"
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 14,
              color: '#0e0020', backgroundColor: 'transparent',
              padding: '10px 12px',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', color: 'rgba(124,58,237,0.4)' }}
            >
              <X style={{ width: 15, height: 15 }} />
            </button>
          )}
          <button
            style={{
              backgroundColor: purple, color: '#fff', border: 'none', borderRadius: 999,
              padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 pb-16 flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left filter panel (desktop) ── */}
        <aside
          className="hidden lg:block flex-shrink-0"
          style={{
            width: 272,
            backgroundColor: '#fff',
            borderRadius: 16,
            border: '1px solid #e9d5ff',
            boxShadow: '0 2px 12px rgba(124,58,237,0.05)',
            position: 'sticky',
            top: 72,
            overflow: 'hidden',
          }}
        >
          {/* Panel header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e9d5ff' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0e0020' }}>Filters</span>
            <button onClick={clearFilters} style={{ fontSize: 13, fontWeight: 600, color: hasActiveFilter ? purple : 'rgba(15,0,32,0.25)', background: 'none', border: 'none', cursor: hasActiveFilter ? 'pointer' : 'default' }}>
              Clear all
            </button>
          </div>
          <FilterPanelContent />
        </aside>

        {/* ── Right content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Mobile filter row */}
          <div className="flex items-center gap-3 mb-4 lg:hidden">
            <button
              onClick={() => setFiltersOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, color: darkPurple,
                backgroundColor: '#fff', border: '1.5px solid #e9d5ff',
                borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filters
              {hasActiveFilter && (
                <span style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: pink, color: '#fff', fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {typeFilters.length + (nicheFilter !== 'All' ? 1 : 0)}
                </span>
              )}
            </button>
            {hasActiveFilter && (
              <button onClick={clearFilters} style={{ fontSize: 12, fontWeight: 600, color: 'rgba(76,29,149,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear all
              </button>
            )}
          </div>

          {/* Results count + sort */}
          {!loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: 'rgba(15,0,32,0.5)' }}>
                <span style={{ fontWeight: 700, color: '#0e0020' }}>{visible.length}</span>{' '}
                {visible.length === 1 ? 'opportunity' : 'opportunities'} found
              </p>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setSortOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'rgba(15,0,32,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                >
                  Sort by: <strong style={{ color: '#0e0020', marginLeft: 2 }}>{sortLabel}</strong>
                  <ChevronDown style={{ width: 13, height: 13, marginLeft: 2, color: 'rgba(15,0,32,0.4)' }} />
                </button>
                {sortOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 20, backgroundColor: '#fff', border: '1px solid #e9d5ff', borderRadius: 10, overflow: 'hidden', minWidth: 160, boxShadow: '0 4px 16px rgba(124,58,237,0.1)' }}>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                        style={{ display: 'block', width: '100%', padding: '9px 14px', fontSize: 13, textAlign: 'left', border: 'none', backgroundColor: sortBy === opt.value ? 'rgba(124,58,237,0.08)' : '#fff', color: sortBy === opt.value ? purple : 'rgba(15,0,32,0.7)', cursor: 'pointer', fontWeight: sortBy === opt.value ? 700 : 500 }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && visible.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: 'rgba(124,58,237,0.08)', border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={purple} strokeWidth="1.5" opacity="0.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3l-4 4-4-4"/></svg>
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, color: darkPurple, marginBottom: 4 }}>No campaigns found</p>
              <p style={{ fontSize: 13, color: 'rgba(76,29,149,0.5)' }}>Try adjusting your search or filters</p>
            </div>
          )}

          {/* ── Opportunity cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!loading && sortedVisible.map(job => {
              const bgColor  = brandColor(job.brand)
              const isPitched = applied.includes(job.id)
              const isFaved   = isFav(job.id)

              return (
                <div
                  key={job.id}
                  onClick={() => handleCardClick(job)}
                  style={{
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    border: '1px solid #e9d5ff',
                    boxShadow: '0 1px 8px rgba(124,58,237,0.05)',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = '#c4b5fd' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(124,58,237,0.05)'; e.currentTarget.style.borderColor = '#e9d5ff' }}
                >
                  {/* Heart — absolutely top-right */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleFav(job) }}
                    style={{
                      position: 'absolute', top: 16, right: 16,
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 4, lineHeight: 0,
                    }}
                    aria-label={isFaved ? 'Remove from favourites' : 'Save to favourites'}
                  >
                    <Heart
                      style={{
                        width: 18, height: 18,
                        color: isFaved ? pink : 'rgba(15,0,32,0.25)',
                        fill: isFaved ? pink : 'none',
                        transition: 'color 0.15s, fill 0.15s',
                      }}
                    />
                  </button>

                  {/* Card body */}
                  <div style={{ display: 'flex', gap: 16, padding: '20px 52px 20px 20px' }}>

                    {/* Brand icon */}
                    <div
                      style={{
                        width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                        backgroundColor: bgColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: 16, color: '#fff',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {brandInitials(job.brand)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                      {/* Title + type badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0e0020', lineHeight: 1.2, margin: 0 }}>
                          {job.title}
                        </h3>
                        {job.type && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: darkPurple,
                            backgroundColor: 'rgba(124,58,237,0.08)',
                            padding: '3px 10px', borderRadius: 999,
                            flexShrink: 0, whiteSpace: 'nowrap',
                          }}>
                            {job.type}
                          </span>
                        )}
                        {isPitched && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: '#16a34a',
                            backgroundColor: 'rgba(22,163,74,0.08)',
                            border: '1px solid rgba(22,163,74,0.2)',
                            padding: '3px 10px', borderRadius: 999,
                            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <CheckCircle style={{ width: 10, height: 10 }} strokeWidth={3} />
                            Pitched
                          </span>
                        )}
                      </div>

                      {/* Brand name + verified */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: darkPurple }}>{job.brand}</span>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: purple, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CheckCircle style={{ width: 10, height: 10, color: '#fff' }} strokeWidth={3} />
                        </span>
                      </div>

                      {/* Description */}
                      {job.description && (
                        <p style={{
                          fontSize: 13, color: 'rgba(15,0,32,0.5)', lineHeight: 1.5,
                          marginBottom: 12,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {job.description}
                        </p>
                      )}

                      {/* Budget */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <BagIcon />
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0e0020' }}>{job.budget}</span>
                        {job.deadline && (
                          <>
                            <span style={{ color: '#e9d5ff', fontSize: 12 }}>·</span>
                            <Calendar style={{ width: 13, height: 13, color: 'rgba(124,58,237,0.4)' }} />
                            <span style={{ fontSize: 12, color: 'rgba(15,0,32,0.4)' }}>{job.deadline}</span>
                          </>
                        )}
                        {job.applicants > 0 && (
                          <>
                            <span style={{ color: '#e9d5ff', fontSize: 12 }}>·</span>
                            <Users style={{ width: 13, height: 13, color: 'rgba(124,58,237,0.4)' }} />
                            <span style={{ fontSize: 12, color: 'rgba(15,0,32,0.4)' }}>{job.applicants} applied</span>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>{/* end right column */}
      </div>{/* end two-column */}

      {/* ── Mobile filter drawer ── */}
      {filtersOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setFiltersOpen(false)}
        >
          <div
            style={{ height: '100%', width: 300, backgroundColor: '#fff', overflowY: 'auto', animation: 'slideInLeft 0.25s ease-out', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e9d5ff' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0e0020' }}>Filters</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {hasActiveFilter && (
                  <button onClick={() => { clearFilters(); setFiltersOpen(false) }} style={{ fontSize: 13, fontWeight: 600, color: purple, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Clear all
                  </button>
                )}
                <button onClick={() => setFiltersOpen(false)} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(124,58,237,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X style={{ width: 14, height: 14, color: purple }} />
                </button>
              </div>
            </div>
            <FilterPanelContent onApply={() => setFiltersOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .dual-range { position: relative; height: 24px; margin: 4px 0; }
        .dual-range input[type=range] {
          -webkit-appearance: none; appearance: none;
          position: absolute; width: 100%; height: 24px;
          background: none; pointer-events: none; margin: 0; padding: 0;
        }
        .dual-range input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; pointer-events: all;
          width: 16px; height: 16px; border-radius: 50%;
          background: #7c3aed; cursor: pointer;
          border: 2px solid #fff; box-shadow: 0 1px 4px rgba(124,58,237,0.4);
        }
        .dual-range input[type=range]::-moz-range-thumb {
          pointer-events: all; width: 16px; height: 16px; border-radius: 50%;
          background: #7c3aed; cursor: pointer;
          border: 2px solid #fff; box-shadow: 0 1px 4px rgba(124,58,237,0.4);
        }
      `}</style>
    </div>
  )
}
