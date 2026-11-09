import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

const purple     = '#7c3aed'
const darkPurple = '#4c1d95'
const pink       = '#F72585'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function CampaignDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [campaign, setCampaign]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [profileReady, setProfileReady]     = useState(false)

  // Pitch state
  const [pitchNote, setPitchNote]     = useState('')
  const [pitching, setPitching]       = useState(false)
  const [pitchOpen, setPitchOpen]     = useState(false)
  const [pitchSuccess, setPitchSuccess] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const [{ data: job }, profileResult, rateResult, appResult] = await Promise.all([
        supabase
          .from('public_jobs')
          .select('id, campaign_name, niche, collab_type, content_types, brief, budget, timeline, applicants_count, created_at, status, brand_id, brand:profiles!brand_id(company_name)')
          .eq('id', id)
          .maybeSingle(),
        user
          ? supabase.from('profiles').select('full_name, creator_avatar_url, niches').eq('id', user.id).single()
          : Promise.resolve({ data: null }),
        user
          ? supabase.from('rate_cards').select('id').eq('creator_id', user.id).maybeSingle()
          : Promise.resolve({ data: null }),
        user
          ? supabase.from('job_applications').select('id').eq('job_id', id).eq('creator_id', user.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ])

      if (!job) { setNotFound(true); setLoading(false); return }

      setCampaign({
        ...job,
        brandName:   job.brand?.company_name || 'Brand',
        appCount:    job.applicants_count || 0,
      })

      if (profileResult.data) {
        const p = profileResult.data
        const steps = [
          !!(p.full_name && p.creator_avatar_url),
          ((p.niches || []).length > 0),
          !!rateResult.data,
        ]
        setProfileReady(steps.every(Boolean))
      }

      setAlreadyApplied(!!appResult.data)
      setLoading(false)
    })()
  }, [id])

  async function handlePitch() {
    if (!pitchNote.trim() || pitchNote.trim().length < 20) return
    setPitching(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      if (campaign.brand_id && user.id === campaign.brand_id) {
        alert("You can't pitch on your own campaign.")
        setPitching(false)
        return
      }

      const { error } = await supabase.from('job_applications').insert({
        job_id:     id,
        creator_id: user.id,
        pitch:      pitchNote.trim(),
        status:     'pending',
      })
      if (error) throw error

      // Notify the brand
      const { data: profileData } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      const creatorName = profileData?.full_name || 'A creator'
      await supabase.from('notifications').insert({
        user_id: campaign.brand_id,
        title:   `New pitch — ${campaign.campaign_name}`,
        body:    `${creatorName} pitched for your campaign`,
        type:    'general',
        data:    { screen: 'CampaignProposals' },
      })

      setAlreadyApplied(true)
      setPitchOpen(false)
      setPitchNote('')
      setPitchSuccess(true)
    } catch (err) {
      alert(err?.message || 'Could not submit pitch. Please try again.')
    } finally {
      setPitching(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f3eeff' }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (notFound || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: '#f3eeff' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: '#f3eeff' }}>
          <span className="text-3xl">🔍</span>
        </div>
        <h1 className="text-xl font-black mb-2" style={{ color: darkPurple }}>Campaign Not Found</h1>
        <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>This campaign may have been closed or removed.</p>
        <button onClick={() => navigate('/creator/find-work')}
          className="px-6 py-3 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: darkPurple }}>
          ← Back to Find Work
        </button>
      </div>
    )
  }

  const isClosed = campaign.status !== 'open'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f3eeff' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#f3eeff', borderBottom: '1px solid #e9d5ff' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70 flex-shrink-0"
          style={{ color: purple }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-sm flex-wrap min-w-0">
          <button onClick={() => navigate('/creator/find-work')}
            className="font-semibold transition-opacity hover:opacity-70 flex-shrink-0" style={{ color: purple }}>
            Find Work
          </button>
          <span style={{ color: 'rgba(124,58,237,0.3)' }} className="flex-shrink-0">/</span>
          <span className="font-bold truncate" style={{ color: darkPurple }}>{campaign.campaign_name}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28">

        {/* Campaign hero card */}
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: 'linear-gradient(135deg, #1a0035 0%, #3d0080 100%)', border: '1px solid rgba(196,181,253,0.15)' }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {campaign.niche && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
                    {campaign.niche}
                  </span>
                )}
                {campaign.collab_type && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                    {campaign.collab_type}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-white leading-tight mb-1">{campaign.campaign_name}</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>by {campaign.brandName}</p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: isClosed ? 'rgba(156,163,175,0.2)' : 'rgba(34,197,94,0.2)', color: isClosed ? '#d1d5db' : '#86efac' }}>
              {isClosed ? 'Closed' : 'Open'}
            </span>
          </div>

          {/* Key metrics */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Budget</p>
              <p className="font-black text-white">₦{Number(campaign.budget).toLocaleString()}</p>
            </div>
            {campaign.timeline && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Timeline</p>
                <p className="font-black text-white">{campaign.timeline}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Pitches</p>
              <p className="font-black text-white">{campaign.appCount} applied</p>
            </div>
          </div>

          <p className="text-[11px] mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Posted {timeAgo(campaign.created_at)}</p>
        </div>

        {/* Content types */}
        {campaign.content_types?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>Content Types</h2>
            <div className="flex flex-wrap gap-2">
              {campaign.content_types.map(ct => (
                <span key={ct} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: purple }}>
                  {ct}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Brief */}
        {campaign.brief && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>Campaign Brief</h2>
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#374151' }}>{campaign.brief}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:static sm:p-0 sm:mt-6 sm:border-0"
          style={{ backgroundColor: '#f3eeff', borderTop: '1px solid #e9d5ff' }}>

          {pitchSuccess ? (
            <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' }}>
              <p className="text-base font-black mb-1" style={{ color: '#166534' }}>🎉 Pitch Sent!</p>
              <p className="text-sm mb-3" style={{ color: '#166534' }}>Your pitch was sent successfully.</p>
              <button onClick={() => navigate('/dashboard?tab=collabs')}
                className="text-sm font-bold" style={{ color: darkPurple }}>
                View in My Collabs →
              </button>
            </div>
          ) : alreadyApplied ? (
            <div className="rounded-2xl py-3 px-5 text-center font-bold text-sm" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
              ✓ You've already pitched for this campaign
            </div>
          ) : isClosed ? (
            <div className="rounded-2xl py-3 px-5 text-center font-bold text-sm" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
              This campaign is closed
            </div>
          ) : !profileReady ? (
            <div>
              <div className="rounded-2xl py-3 px-5 text-center font-bold text-sm mb-2" style={{ backgroundColor: '#f3eeff', color: purple }}>
                🔒 Complete your profile to pitch
              </div>
              <button onClick={() => navigate('/creator/find-work')}
                className="w-full text-center text-xs font-semibold" style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
                Go to Find Work to complete setup →
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPitchOpen(true)}
              className="w-full py-4 rounded-2xl text-base font-black text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: purple, boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
              Pitch for this Campaign
            </button>
          )}
        </div>
      </main>

      {/* Pitch modal */}
      {pitchOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={() => setPitchOpen(false)}>
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 pb-10 sm:pb-6"
            style={{ backgroundColor: '#fff' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: '#e9d5ff' }} />
            <h3 className="text-lg font-black mb-1" style={{ color: '#1e0040' }}>Pitch for this Campaign</h3>
            <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>{campaign.campaign_name}</p>
            <textarea
              value={pitchNote}
              onChange={e => setPitchNote(e.target.value)}
              rows={4}
              placeholder="Briefly introduce yourself and why you're a great fit…"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-1"
              style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#faf9ff', color: '#1e0040' }}
            />
            {pitchNote.length > 0 && pitchNote.trim().length < 20 && (
              <p className="text-xs mb-3" style={{ color: '#ef4444' }}>At least 20 characters required ({pitchNote.trim().length}/20)</p>
            )}
            <button
              onClick={handlePitch}
              disabled={pitching || pitchNote.trim().length < 20}
              className="w-full py-3 rounded-xl font-bold text-white text-sm mb-2 transition-opacity disabled:opacity-40"
              style={{ backgroundColor: purple }}>
              {pitching ? 'Sending…' : 'Send Pitch'}
            </button>
            <button
              onClick={() => setPitchOpen(false)}
              className="w-full py-2 text-sm font-semibold"
              style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
