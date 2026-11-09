import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Briefcase, ChevronLeft, X, Users, Calendar, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

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

export default function CreatorFindWorkPage() {
  const navigate = useNavigate()

  const [jobs, setJobs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [applied, setApplied]     = useState([])
  const [search, setSearch]       = useState('')
  const [nicheFilter, setNicheFilter] = useState('All')

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

  const visible = jobs.filter(j => {
    const q = search.toLowerCase()
    const matchesSearch = !q || j.title.toLowerCase().includes(q) || j.brand.toLowerCase().includes(q)
    const matchesNiche = nicheFilter === 'All' || (j.tags || []).some(t => t.toLowerCase() === nicheFilter.toLowerCase())
    return matchesSearch && matchesNiche
  })

  const cardStyle = {
    transform: sliding ? 'translateX(-110%)' : slideIn ? 'translateX(0)' : 'translateX(0)',
    transition: sliding ? 'transform 240ms ease-in' : slideIn ? 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)' : 'none',
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f3eeff' }}>

      {/* ── Sticky top bar ── */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'rgba(243,238,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e9d5ff' }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: purple }}
        >
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </button>
        <span style={{ color: 'rgba(124,58,237,0.3)' }}>/</span>
        <span className="text-sm font-bold" style={{ color: darkPurple }}>Find Work</span>
      </header>

      {/* ── Hero ── */}
      <div
        className="px-4 sm:px-6 pt-10 pb-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f5f0ff 0%, #ede9fe 50%, #f0ebff 100%)',
          borderBottom: '1px solid rgba(124,58,237,0.08)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative max-w-2xl mx-auto">
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: purple, border: '1px solid #e9d5ff' }}
          >
            Find Work
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 leading-tight" style={{ color: darkPurple }}>
            Find opportunities that fit you
          </h1>
          <p className="text-sm sm:text-base mb-7" style={{ color: 'rgba(76,29,149,0.6)' }}>
            Discover brand campaigns and collaborations tailored to your niche and audience.
          </p>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'rgba(124,58,237,0.45)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by brand, campaign or niche…"
              className="w-full rounded-2xl pl-11 pr-10 py-3.5 text-sm focus:outline-none transition-shadow"
              style={{
                backgroundColor: '#fff',
                border: '1.5px solid #e9d5ff',
                color: '#1e0040',
                boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
              }}
              onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12), 0 2px 12px rgba(124,58,237,0.08)'}
              onBlur={e => e.target.style.boxShadow = '0 2px 12px rgba(124,58,237,0.08)'}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: purple }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main area ── */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-5">

        {/* Setup wizard */}
        {setupLoaded && !profileReady && currentStep && (
          <div ref={setupWizardRef}>
            <button
              onClick={() => setWizardOpen(o => !o)}
              className="w-full flex items-center gap-3 text-left"
              style={{
                background: 'linear-gradient(90deg, #3b0764, #6d28d9)',
                borderRadius: wizardOpen ? '14px 14px 0 0' : 14,
                padding: '10px 16px',
                border: 'none',
                cursor: 'pointer',
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
                    <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Step {currentIdx + 1} of {totalSteps}
                    </p>
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

        {/* ── Niche filter chips ── */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {['All', ...BROWSE_NICHES].map(n => (
            <button
              key={n}
              onClick={() => setNicheFilter(n)}
              className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all"
              style={
                nicheFilter === n
                  ? { backgroundColor: purple, color: '#fff', border: '1.5px solid transparent', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }
                  : { backgroundColor: '#fff', color: purple, border: '1.5px solid #e9d5ff' }
              }
            >
              {n}
            </button>
          ))}
        </div>

        {/* ── Results header ── */}
        {!loading && (
          <p className="text-sm font-semibold" style={{ color: 'rgba(76,29,149,0.5)' }}>
            {visible.length} {visible.length === 1 ? 'opportunity' : 'opportunities'} found
          </p>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && visible.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(124,58,237,0.08)' }}>
              <Briefcase className="w-7 h-7" style={{ color: purple, opacity: 0.5 }} />
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: darkPurple }}>No campaigns found</p>
            <p className="text-xs" style={{ color: 'rgba(76,29,149,0.5)' }}>Try adjusting your search or niche filter</p>
          </div>
        )}

        {/* ── Opportunity cards ── */}
        {!loading && visible.map(job => {
          const bgColor = brandColor(job.brand)
          const isPitched = applied.includes(job.id)

          return (
            <div
              key={job.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e9d5ff',
                boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = '#c4b5fd' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.06)'; e.currentTarget.style.borderColor = '#e9d5ff' }}
            >
              <div className="p-5">
                {/* ── Brand row ── */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Brand monogram */}
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm text-white"
                    style={{ backgroundColor: bgColor }}
                  >
                    {brandInitials(job.brand)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate" style={{ color: darkPurple }}>{job.brand}</p>
                      {/* Verified dot — all public_jobs brands are vetted */}
                      <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: purple }}>
                        <CheckCircle className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(76,29,149,0.45)' }}>{job.type}</p>
                  </div>

                  {job.isNew && (
                    <span
                      className="flex-shrink-0 text-[10px] font-black px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${pink}15`, color: pink, border: `1px solid ${pink}30` }}
                    >
                      New
                    </span>
                  )}
                </div>

                {/* ── Campaign title ── */}
                <h3 className="font-black text-base mb-1.5 leading-snug" style={{ color: '#1e0040' }}>
                  {job.title}
                </h3>

                {/* ── Description ── */}
                {job.description && (
                  <p className="text-sm mb-3 leading-relaxed line-clamp-2" style={{ color: 'rgba(30,0,64,0.6)' }}>
                    {job.description}
                  </p>
                )}

                {/* ── Tags ── */}
                {job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.tags.map(t => (
                      <span
                        key={t}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: purple }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── Metrics row ── */}
                <div
                  className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-4 py-3 px-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.08)' }}
                >
                  {/* Budget — most important, so first */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black" style={{ color: purple }}>
                      {job.budget}
                    </span>
                  </div>

                  {job.deadline && (
                    <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'rgba(30,0,64,0.5)' }}>
                      <Calendar className="w-3.5 h-3.5" style={{ color: 'rgba(124,58,237,0.5)' }} />
                      {job.deadline}
                    </div>
                  )}

                  {job.applicants > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'rgba(30,0,64,0.5)' }}>
                      <Users className="w-3.5 h-3.5" style={{ color: 'rgba(124,58,237,0.5)' }} />
                      {job.applicants} applied
                    </div>
                  )}
                </div>

                {/* ── CTA ── */}
                {isPitched ? (
                  <div
                    className="w-full py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Pitched
                  </div>
                ) : !profileReady ? (
                  <button
                    onClick={() => setupWizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#94a3b8' }}
                  >
                    🔒 Complete profile to pitch
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/campaigns/${job.id}`)}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: purple }}
                  >
                    View Campaign →
                  </button>
                )}
              </div>
            </div>
          )
        })}

      </main>
    </div>
  )
}
