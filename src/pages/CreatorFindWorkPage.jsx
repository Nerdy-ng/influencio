import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, X, Users, Calendar, CheckCircle, Heart, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useFavorites } from '../hooks/useFavorites'

const purple     = '#7c3aed'
const darkPurple = '#4c1d95'
const pink       = '#F72585'

const BROWSE_NICHES = ['Fashion','Beauty','Tech','Food','Fitness','Lifestyle','Comedy','Travel','Fintech','Business','Voiceover','Gaming']

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
  const { toggle: toggleFav, isFav }    = useFavorites()

  // Setup wizard
  const [setupSteps] = useState([
    { key: 'profile', label: 'Complete your profile',  sub: 'Add your name and photo.',            cta: 'Enter name →' },
    { key: 'niche',   label: 'Set your niche & skills', sub: 'Tell brands what content you create.', cta: 'Pick niche →' },
    { key: 'rate',    label: 'Set your rate card',      sub: 'Show brands your rates.',              cta: 'Set rate →'  },
  ])
  const [stepsDone, setStepsDone]       = useState([false, false, false])
  const [setupLoaded, setSetupLoaded]   = useState(false)
  const [wizardOpen, setWizardOpen]     = useState(false)
  const [cardMode, setCardMode]         = useState('prompt')
  const [sliding, setSliding]           = useState(false)
  const [slideIn, setSlideIn]           = useState(false)
  const savedProfile                    = useRef(null)

  const [formName,   setFormName]   = useState('')
  const [formPhoto,  setFormPhoto]  = useState(null)
  const [formNiches, setFormNiches] = useState([])
  const [formRate,   setFormRate]   = useState('')
  const [formSaving, setFormSaving] = useState(false)
  const [formError,  setFormError]  = useState('')
  const photoRef        = useRef(null)
  const setupWizardRef  = useRef(null)

  const doneCount    = stepsDone.filter(Boolean).length
  const totalSteps   = 3
  const profileReady = doneCount === totalSteps
  const currentIdx   = stepsDone.findIndex(d => !d)
  const currentStep  = currentIdx >= 0 ? setupSteps[currentIdx] : null

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: p }, { data: rate }, { data: jobRows }, { data: apps }] = await Promise.all([
        supabase.from('profiles').select('full_name, creator_avatar_url, niches').eq('id', user.id).single(),
        supabase.from('rate_cards').select('id').eq('creator_id', user.id).maybeSingle(),
        supabase.from('public_jobs').select('*, brand:profiles!brand_id(company_name)').eq('status', 'open').order('created_at', { ascending: false }),
        supabase.from('job_applications').select('job_id').eq('creator_id', user.id),
      ])

      if (p) {
        savedProfile.current = p
        setStepsDone([
          !!(p.full_name && p.creator_avatar_url),
          ((p.niches || []).length > 0),
          !!rate,
        ])
      }
      setSetupLoaded(true)
      setJobs((jobRows || []).map(j => ({
        id: j.id, brand_id: j.brand_id,
        brand:       j.brand?.company_name || 'Brand',
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

  function slideTransition(then) {
    setSliding(true)
    setTimeout(() => { then(); setSliding(false); setSlideIn(true); setTimeout(() => setSlideIn(false), 300) }, 240)
  }

  function openForm() {
    setFormError('')
    const p = savedProfile.current
    if (p) {
      if (currentStep?.key === 'profile') { setFormName(p.full_name || ''); setFormPhoto(p.creator_avatar_url ? { preview: p.creator_avatar_url } : null) }
      if (currentStep?.key === 'niche') setFormNiches(p.niches || [])
    }
    slideTransition(() => setCardMode('form'))
  }

  function goBack() { setFormError(''); slideTransition(() => setCardMode('prompt')) }

  async function saveAndNext() {
    setFormError('')
    const key = currentStep?.key
    if (key === 'profile' && !formName.trim() && !formPhoto) { setFormError('Enter your name or add a photo.'); return }
    if (key === 'niche'   && formNiches.length === 0)         { setFormError('Pick at least one niche.'); return }
    if (key === 'rate'    && !formRate.trim())                 { setFormError('Enter your minimum rate.'); return }
    setFormSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (key === 'profile') {
        const updates = { id: user.id }
        if (formName.trim()) updates.full_name = formName.trim()
        if (formPhoto?.file) {
          const ext = formPhoto.file.name.split('.').pop() || 'jpg'
          const path = `${user.id}/${Date.now()}.${ext}`
          await supabase.storage.from('avatars').upload(path, formPhoto.file, { upsert: true })
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
          updates.creator_avatar_url = publicUrl
        }
        await supabase.from('profiles').upsert(updates, { onConflict: 'id' })
        savedProfile.current = { ...savedProfile.current, ...updates }
      } else if (key === 'niche') {
        await supabase.from('profiles').upsert({ id: user.id, niches: formNiches }, { onConflict: 'id' })
        savedProfile.current = { ...savedProfile.current, niches: formNiches }
      } else if (key === 'rate') {
        await supabase.from('rate_cards').upsert({ creator_id: user.id }, { onConflict: 'creator_id' })
      }
      const newDone = [...stepsDone]
      newDone[currentIdx] = true
      setStepsDone(newDone)
      if (key === 'rate') return
      slideTransition(() => { setCardMode('prompt'); setFormName(''); setFormPhoto(null); setFormNiches([]); setFormRate(''); setFormError('') })
    } catch (err) {
      setFormError(err.message || 'Could not save, try again.')
    } finally {
      setFormSaving(false)
    }
  }

  function handleCardClick(job) {
    if (!profileReady) {
      setupWizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    navigate(`/campaigns/${job.id}`)
  }

  function toggleTypeFilter(type) {
    setTypeFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const typeCounts = jobs.reduce((acc, j) => { acc[j.type] = (acc[j.type] || 0) + 1; return acc }, {})
  const allTypes   = Object.keys(typeCounts).sort()

  const visible = jobs.filter(j => {
    const q = search.toLowerCase()
    const matchesSearch = !q || j.title.toLowerCase().includes(q) || j.brand.toLowerCase().includes(q)
    const matchesNiche  = nicheFilter === 'All' || (j.tags || []).some(t => t.toLowerCase() === nicheFilter.toLowerCase())
    const matchesType   = typeFilters.length === 0 || typeFilters.includes(j.type)
    return matchesSearch && matchesNiche && matchesType
  })

  const hasActiveFilter = nicheFilter !== 'All' || typeFilters.length > 0

  function clearFilters() { setNicheFilter('All'); setTypeFilters([]) }

  const cardStyle = {
    transform: sliding ? 'translateX(-110%)' : slideIn ? 'translateX(0)' : 'translateX(0)',
    transition: sliding ? 'transform 240ms ease-in' : slideIn ? 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)' : 'none',
  }

  // ── Filter panel content (shared between sidebar and drawer) ──────
  function FilterPanelContent({ onApply }) {
    return (
      <div>
        {/* Collab Type section */}
        {allTypes.length > 0 && (
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
                {allTypes.map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={typeFilters.includes(t)}
                      onChange={() => { toggleTypeFilter(t); onApply?.() }}
                      style={{ width: 15, height: 15, accentColor: purple, cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, fontSize: 13, color: 'rgba(15,0,32,0.7)', fontWeight: typeFilters.includes(t) ? 700 : 500 }}>{t}</span>
                    <span style={{ fontSize: 12, color: 'rgba(15,0,32,0.35)', fontWeight: 500 }}>({typeCounts[t]})</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

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
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['All', ...BROWSE_NICHES].map(n => (
                <button
                  key={n}
                  onClick={() => { setNicheFilter(n); onApply?.() }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                    backgroundColor: nicheFilter === n ? 'rgba(124,58,237,0.08)' : 'transparent',
                    color: nicheFilter === n ? purple : 'rgba(15,0,32,0.6)',
                    fontWeight: nicheFilter === n ? 700 : 500,
                    fontSize: 13,
                  }}
                >
                  <span>{n}</span>
                  {nicheFilter === n && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: purple }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f3eeff', minHeight: '100vh' }}>

      {/* ── Page heading area ── */}
      <div style={{ padding: '32px 48px 20px' }} className="sm:px-12 px-4">
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0e0020', marginBottom: 6, lineHeight: 1.1 }}>
          Find Work
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(15,0,32,0.5)', marginBottom: 20, lineHeight: 1.5, maxWidth: 500 }}>
          Discover brand campaigns, collaborations and paid opportunities<br className="hidden sm:block" /> that match your skills and audience.
        </p>

        {/* Search bar with Search button */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 0,
            backgroundColor: '#fff',
            border: '1.5px solid #e9d5ff',
            borderRadius: 999,
            boxShadow: '0 2px 12px rgba(124,58,237,0.07)',
            padding: '4px 4px 4px 20px',
            maxWidth: 700,
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
      <div
        style={{ display: 'flex', gap: 24, padding: '0 48px 48px', alignItems: 'flex-start' }}
        className="px-4 sm:px-12 flex-col lg:flex-row"
      >

        {/* ── Left filter panel (desktop) ── */}
        <aside
          className="hidden lg:block"
          style={{
            width: 280, flexShrink: 0,
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
            {hasActiveFilter && (
              <button onClick={clearFilters} style={{ fontSize: 13, fontWeight: 600, color: purple, background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear all
              </button>
            )}
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

          {/* Setup wizard */}
          {setupLoaded && !profileReady && currentStep && (
            <div ref={setupWizardRef} style={{ marginBottom: 20 }}>
              <button
                onClick={() => setWizardOpen(o => !o)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  background: 'linear-gradient(90deg, #3b0764, #6d28d9)',
                  borderRadius: wizardOpen ? '14px 14px 0 0' : 14,
                  padding: '10px 16px', border: 'none', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 14 }}>🎯</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#fff' }}>Complete your profile to unlock pitching</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', marginRight: 4 }}>{doneCount}/{totalSteps}</span>
                <div style={{ width: 60, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden', marginRight: 6 }}>
                  <div style={{ height: '100%', width: `${Math.round((doneCount / totalSteps) * 100)}%`, backgroundColor: '#fff', borderRadius: 2, transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>{wizardOpen ? '▲' : '▼'}</span>
              </button>
              {wizardOpen && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 60%, #a855f7 100%)', borderRadius: '0 0 14px 14px', padding: 24, ...cardStyle }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step {currentIdx + 1} of {totalSteps}</p>
                      {cardMode === 'form' && (
                        <button onClick={goBack} style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
                      )}
                    </div>
                    {cardMode === 'prompt' ? (
                      <>
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{currentStep.label}</h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 20 }}>{currentStep.sub}</p>
                        <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
                          {setupSteps.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i <= currentIdx ? '#fff' : 'rgba(255,255,255,0.25)' }} />)}
                        </div>
                        <button onClick={openForm} style={{ width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: '12px 0', fontWeight: 900, fontSize: 14, color: '#6d28d9', border: 'none', cursor: 'pointer' }}>
                          {currentStep.cta}
                        </button>
                      </>
                    ) : (
                      <>
                        {currentStep.key === 'profile' && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                              <div onClick={() => photoRef.current?.click()} style={{ cursor: 'pointer', width: 72, height: 72, borderRadius: 36, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {formPhoto?.preview
                                  ? <img src={formPhoto.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <span style={{ fontSize: 22 }}>📷</span>}
                              </div>
                              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={e => { const f = e.target.files?.[0]; if (f) setFormPhoto({ file: f, preview: URL.createObjectURL(f) }) }} />
                            </div>
                            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Your full name"
                              style={{ width: '100%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        )}
                        {currentStep.key === 'niche' && (
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>Pick up to 3 niches</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                              {BROWSE_NICHES.map(n => (
                                <button key={n} onClick={() => setFormNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : prev.length < 3 ? [...prev, n] : prev)}
                                  style={{ padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: formNiches.includes(n) ? 'none' : '1px solid rgba(255,255,255,0.2)', backgroundColor: formNiches.includes(n) ? '#fff' : 'rgba(255,255,255,0.1)', color: formNiches.includes(n) ? '#6d28d9' : 'rgba(255,255,255,0.8)' }}>
                                  {n}
                                </button>
                              ))}
                            </div>
                            {formNiches.length < 3 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 10px', border: '1px solid rgba(255,255,255,0.15)' }}>
                                <input placeholder="Add your own niche…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: '#fff' }}
                                  onKeyDown={e => { if (e.key === 'Enter') { const val = e.target.value.trim(); if (val && !formNiches.includes(val) && formNiches.length < 3) { setFormNiches(prev => [...prev, val]); e.target.value = '' } } }} />
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Enter ↵</span>
                              </div>
                            )}
                          </div>
                        )}
                        {currentStep.key === 'rate' && (
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>What's your minimum rate?</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>₦</span>
                              <input value={formRate} onChange={e => setFormRate(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 50000" type="text" inputMode="numeric"
                                style={{ flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none' }} />
                            </div>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>You can set detailed pricing in your Rate Card later.</p>
                          </div>
                        )}
                        {formError && <p style={{ fontSize: 12, color: '#fca5a5', fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{formError}</p>}
                        <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
                          {setupSteps.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i <= currentIdx ? '#fff' : 'rgba(255,255,255,0.25)' }} />)}
                        </div>
                        <button onClick={saveAndNext} disabled={formSaving}
                          style={{ width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: '12px 0', fontWeight: 900, fontSize: 14, color: '#6d28d9', border: 'none', cursor: 'pointer', opacity: formSaving ? 0.6 : 1 }}>
                          {formSaving ? 'Saving…' : currentIdx === totalSteps - 1 ? 'Finish ✓' : 'Save & continue →'}
                        </button>
                      </>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                      <div style={{ flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((doneCount / totalSteps) * 100)}%`, backgroundColor: '#fff', borderRadius: 3, transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>{doneCount}/{totalSteps}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <p style={{ fontSize: 14, color: 'rgba(15,0,32,0.5)', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: '#0e0020' }}>{visible.length}</span>{' '}
              {visible.length === 1 ? 'opportunity' : 'opportunities'} found
            </p>
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
            {!loading && visible.map(job => {
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
        @media (max-width: 1023px) {
          .lg\\:block { display: none !important; }
          .lg\\:flex-row { flex-direction: column !important; }
          .hidden.lg\\:block { display: none !important; }
        }
      `}</style>
    </div>
  )
}
