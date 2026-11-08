import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Briefcase, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

const purple   = '#7c3aed'
const darkPurple = '#4c1d95'
const pink     = '#F72585'

const BROWSE_NICHES = ['Fashion','Beauty','Tech','Food','Fitness','Lifestyle','Comedy','Travel','Fintech','Business','Voiceover','Gaming']

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
      if (key === 'rate') return // last step — stay on this page
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
    <div className="min-h-screen" style={{ backgroundColor: '#f9f5ff' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#f9f5ff', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: purple }}>
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </button>
        <span style={{ color: 'rgba(124,58,237,0.3)' }}>/</span>
        <span className="text-sm font-bold" style={{ color: darkPurple }}>Find Work</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-4">

        {/* Setup wizard */}
        {setupLoaded && !profileReady && currentStep && (
          <div ref={setupWizardRef} style={{ overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 60%, #a855f7 100%)', borderRadius: 20, padding: 24, ...cardStyle }}>
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

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opportunities…"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#fff', color: '#1e0040' }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>}
        </div>

        {/* Niche chips */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {['All', ...BROWSE_NICHES].map(n => (
            <button key={n} onClick={() => setNicheFilter(n)}
              style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: nicheFilter === n ? 'none' : '1px solid #e9d5ff', backgroundColor: nicheFilter === n ? purple : '#fff', color: nicheFilter === n ? '#fff' : '#6d28d9', transition: 'all 0.15s' }}>
              {n}
            </button>
          ))}
        </div>

        {/* Campaign cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: purple }} />
            <p className="font-semibold text-sm" style={{ color: darkPurple }}>No campaigns found</p>
          </div>
        ) : visible.map(job => (
          <div key={job.id} className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff' }}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="font-black text-base" style={{ color: '#1e0040' }}>{job.title}</h3>
              {job.isNew && <span className="flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F7258518', color: pink }}>New</span>}
            </div>
            <p className="text-xs font-semibold mb-3" style={{ color: '#4b5563' }}>{job.brand} · {job.type}</p>
            <p className="text-sm mb-3 leading-relaxed line-clamp-3" style={{ color: '#1e0040' }}>{job.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {job.tags.map(t => <span key={t} className="text-xs font-semibold px-2 py-1 rounded-md" style={{ backgroundColor: '#f5f3ff', color: purple }}>{t}</span>)}
            </div>
            <div className="flex flex-wrap gap-4 mb-4 text-xs font-semibold" style={{ color: '#374151' }}>
              <span style={{ color: purple }}>₦ {job.budget.replace('₦','')}</span>
              <span>📅 {job.deadline}</span>
              <span>👥 {job.applicants} applied</span>
            </div>
            {applied.includes(job.id) ? (
              <div className="w-full py-3 rounded-xl text-sm font-bold text-center" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                ✓ Pitched
              </div>
            ) : !profileReady ? (
              <button
                onClick={() => setupWizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: '#94a3b8' }}>
                🔒 Complete profile to pitch
              </button>
            ) : (
              <button
                onClick={() => navigate(`/campaigns/${job.id}`)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: purple }}>
                View Campaign →
              </button>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
