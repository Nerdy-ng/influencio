import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { ChevronLeft, Megaphone, Users, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

const darkPurple = '#4c1d95'
const purple = '#7c3aed'

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

// ── Campaign List ─────────────────────────────────────────────────────────────
function CampaignList() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('public_jobs')
        .select('*, applications:job_applications(count)')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false })
      setCampaigns(data || [])
      setLoading(false)
    })()
  }, [])

  async function toggleStatus(e, campaign) {
    e.stopPropagation()
    setToggling(campaign.id)
    const newStatus = campaign.status === 'open' ? 'closed' : 'open'
    await supabase.from('public_jobs').update({ status: newStatus }).eq('id', campaign.id)
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c))
    setToggling(null)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: purple }}>Campaigns</p>
          <h1 className="text-2xl font-black" style={{ color: '#1e0040' }}>My Campaigns</h1>
        </div>
        <button onClick={() => navigate('/brand-dashboard?tab=post-campaign')}
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white"
          style={{ backgroundColor: darkPurple }}>
          + Post Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-sm mb-4">No campaigns posted yet.</p>
          <p className="text-sm mb-6">Post a campaign and creators will apply directly to it.</p>
          <button onClick={() => navigate('/brand-dashboard?tab=post-campaign')}
            className="text-sm font-bold px-5 py-2.5 rounded-xl text-white"
            style={{ backgroundColor: darkPurple }}>
            Post Your First Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(c => {
            const appCount = c.applications?.[0]?.count ?? 0
            return (
              <div key={c.id}
                onClick={() => navigate(`/brand/my-campaigns/${c.id}`)}
                className="rounded-2xl p-5 bg-white cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ border: '1px solid #e9d5ff', boxShadow: '0 2px 8px rgba(192,132,252,0.06)' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-1" style={{ color: purple }}>{c.niche} · {c.collab_type}</p>
                    <h3 className="font-black text-base" style={{ color: '#1e0040' }}>{c.campaign_name}</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: c.status === 'open' ? '#dcfce7' : '#f3f4f6', color: c.status === 'open' ? '#16a34a' : '#6b7280' }}>
                    {c.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-semibold mb-4" style={{ color: '#374151' }}>
                  <span style={{ color: purple }}>₦{Number(c.budget).toLocaleString()}</span>
                  <span>📅 {c.timeline}</span>
                  <span>👥 {appCount} pitch{appCount !== 1 ? 'es' : ''}</span>
                  <span style={{ color: '#9ca3af' }}>{timeAgo(c.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/brand/my-campaigns/${c.id}/pitches`) }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: darkPurple }}>
                    View Pitches ({appCount})
                  </button>
                  <button onClick={e => toggleStatus(e, c)} disabled={toggling === c.id}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold border disabled:opacity-40"
                    style={{ borderColor: '#e9d5ff', color: purple, background: '#fff' }}>
                    {toggling === c.id ? '…' : c.status === 'open' ? 'Close' : 'Reopen'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Campaign Detail ───────────────────────────────────────────────────────────
function CampaignDetail({ id }) {
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [appCount, setAppCount] = useState(0)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('public_jobs')
        .select('*, applications:job_applications(count)')
        .eq('id', id)
        .maybeSingle()
      if (data) {
        setCampaign(data)
        setAppCount(data.applications?.[0]?.count ?? 0)
      }
      setLoading(false)
    })()
  }, [id])

  async function toggleStatus() {
    if (!campaign) return
    setToggling(true)
    const newStatus = campaign.status === 'open' ? 'closed' : 'open'
    await supabase.from('public_jobs').update({ status: newStatus }).eq('id', campaign.id)
    setCampaign(prev => ({ ...prev, status: newStatus }))
    setToggling(false)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>

  if (!campaign) return (
    <div className="text-center py-20 text-gray-400">
      <p className="font-semibold">Campaign not found.</p>
      <button onClick={() => navigate('/brand/my-campaigns')} className="mt-4 text-sm font-bold" style={{ color: purple }}>← Back to My Campaigns</button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Campaign card */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, #1a0035, #3d0080)', border: '1px solid rgba(196,181,253,0.2)' }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>{campaign.niche} · {campaign.collab_type}</p>
            <h2 className="text-2xl font-black text-white">{campaign.campaign_name}</h2>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: campaign.status === 'open' ? 'rgba(34,197,94,0.2)' : 'rgba(156,163,175,0.2)', color: campaign.status === 'open' ? '#86efac' : '#d1d5db' }}>
            {campaign.status === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
          <span className="font-bold text-white">₦{Number(campaign.budget).toLocaleString()}</span>
          <span>📅 {campaign.timeline}</span>
          <span>👥 {appCount} pitch{appCount !== 1 ? 'es' : ''}</span>
          {campaign.content_types?.length > 0 && <span>{campaign.content_types.join(', ')}</span>}
        </div>

        {campaign.brief && (
          <div className="rounded-xl p-4 mt-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#c084fc' }}>Brief</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{campaign.brief}</p>
          </div>
        )}

        <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Posted {timeAgo(campaign.created_at)}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/brand/my-campaigns/${id}/pitches`)}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: darkPurple }}>
          View Pitches ({appCount})
        </button>
        <button onClick={toggleStatus} disabled={toggling}
          className="px-5 py-3 rounded-xl text-sm font-bold border disabled:opacity-40"
          style={{ borderColor: '#e9d5ff', color: purple, background: '#fff' }}>
          {toggling ? '…' : campaign.status === 'open' ? 'Close Campaign' : 'Reopen Campaign'}
        </button>
      </div>
    </div>
  )
}

// ── Pitches ───────────────────────────────────────────────────────────────────
function CampaignPitches({ id }) {
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [{ data: job }, { data: apps }] = await Promise.all([
        supabase.from('public_jobs').select('id, campaign_name, niche, collab_type, budget, status').eq('id', id).maybeSingle(),
        supabase.from('job_applications')
          .select('*, creator:profiles!creator_id(id, full_name, avatar_url, username, niches, tier, avg_rating, min_price)')
          .eq('job_id', id)
          .order('created_at', { ascending: false }),
      ])
      setCampaign(job)
      setApplicants(apps || [])
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /></div>

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mini campaign header */}
      {campaign && (
        <div className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-3"
          style={{ background: 'linear-gradient(135deg, #1a0035, #3d0080)' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#c084fc' }}>{campaign.niche} · {campaign.collab_type}</p>
            <h2 className="text-base font-black text-white">{campaign.campaign_name}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>₦{Number(campaign.budget).toLocaleString()}</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: campaign.status === 'open' ? 'rgba(34,197,94,0.2)' : 'rgba(156,163,175,0.2)', color: campaign.status === 'open' ? '#86efac' : '#d1d5db' }}>
            {campaign.status === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>
      )}

      <h3 className="font-black text-lg mb-4" style={{ color: '#1e0040' }}>
        {applicants.length} Pitch{applicants.length !== 1 ? 'es' : ''}
      </h3>

      {applicants.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-semibold">No pitches yet — your campaign is live and visible to creators.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map(app => {
            const c = app.creator || {}
            const tierColors = {
              'fast-rising': { bg: '#f0fdf4', color: '#16a34a' },
              'next-rated':  { bg: '#f5f3ff', color: purple },
              'top-rated':   { bg: '#fefce8', color: '#d97706' },
            }
            const tc = tierColors[c.tier] || tierColors['fast-rising']
            return (
              <div key={app.id} className="rounded-2xl p-5 bg-white" style={{ border: '1px solid #e9d5ff' }}>
                <div className="flex items-start gap-3 mb-3">
                  {c.avatar_url
                    ? <img src={c.avatar_url} alt={c.full_name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: darkPurple }}>
                        {(c.full_name || '?')[0]}
                      </div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: '#1e0040' }}>{c.full_name || 'Creator'}</span>
                      {c.username && <span className="text-xs text-gray-400">@{c.username}</span>}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: tc.bg, color: tc.color }}>
                        {(c.tier || 'fast-rising').replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {c.niches?.length > 0 && <span>{c.niches[0]}</span>}
                      {c.avg_rating > 0 && <span>⭐ {c.avg_rating}</span>}
                      {c.min_price > 0 && <span style={{ color: purple }}>From ₦{Number(c.min_price).toLocaleString()}</span>}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#f3eeff', color: purple }}>
                    {timeAgo(app.created_at)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#374151', background: '#faf5ff', borderRadius: 10, padding: '10px 14px' }}>"{app.pitch}"</p>
                <Link to={`/creators/${c.username || c.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{ backgroundColor: darkPurple }}>
                  View Profile <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Page shell ────────────────────────────────────────────────────────────────
export default function BrandCampaignsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isPitches = id && location.pathname.endsWith('/pitches')

  // Breadcrumb nav
  function Breadcrumbs() {
    return (
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <button onClick={() => navigate('/brand-dashboard')}
          className="font-semibold transition-opacity hover:opacity-70" style={{ color: purple }}>
          Dashboard
        </button>
        <span style={{ color: 'rgba(124,58,237,0.3)' }}>/</span>
        <button onClick={() => navigate('/brand/my-campaigns')}
          className={`font-semibold transition-opacity hover:opacity-70 ${!id ? 'opacity-100' : ''}`}
          style={{ color: id ? purple : darkPurple }}>
          My Campaigns
        </button>
        {id && (
          <>
            <span style={{ color: 'rgba(124,58,237,0.3)' }}>/</span>
            <button onClick={() => navigate(`/brand/my-campaigns/${id}`)}
              className="font-semibold transition-opacity hover:opacity-70"
              style={{ color: isPitches ? purple : darkPurple }}>
              Campaign
            </button>
          </>
        )}
        {isPitches && (
          <>
            <span style={{ color: 'rgba(124,58,237,0.3)' }}>/</span>
            <span className="font-semibold" style={{ color: darkPurple }}>Pitches</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--b-brandDashBg, #f9f5ff)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'var(--b-brandDashBg, #f9f5ff)', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70 flex-shrink-0"
          style={{ color: purple }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <Breadcrumbs />
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {!id && <CampaignList />}
        {id && !isPitches && <CampaignDetail id={id} />}
        {id && isPitches && <CampaignPitches id={id} />}
      </main>
    </div>
  )
}
