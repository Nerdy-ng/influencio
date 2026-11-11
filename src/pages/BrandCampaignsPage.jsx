import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { ChevronLeft, Megaphone, Users, ArrowUpRight, Plus, Calendar, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'

const darkPurple = '#4c1d95'
const purple = '#7c3aed'
const pink = '#F72585'

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

function Spinner() {
  return <div className="w-6 h-6 rounded-full animate-spin flex-shrink-0" style={{ border: '2px solid #e9d5ff', borderTopColor: purple }} />
}

function CampaignRowSkeleton() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 rounded-full w-28" style={{ backgroundColor: '#f3eeff' }} />
          <div className="h-4 rounded-full w-56" style={{ backgroundColor: '#ede9fe' }} />
        </div>
        <div className="h-5 w-14 rounded-full" style={{ backgroundColor: '#f3eeff' }} />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-2.5 rounded-full w-20" style={{ backgroundColor: '#f3eeff' }} />
        <div className="h-2.5 rounded-full w-24" style={{ backgroundColor: '#f3eeff' }} />
        <div className="h-2.5 rounded-full w-16" style={{ backgroundColor: '#f3eeff' }} />
      </div>
      <div className="h-9 rounded-xl" style={{ backgroundColor: '#ede9fe' }} />
    </div>
  )
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: '#0e0020' }}>My Campaigns</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(15,0,32,0.5)' }}>
            {loading ? '' : `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/brand/post-campaign')}
          className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white flex-shrink-0 transition-opacity hover:opacity-90"
          style={{ backgroundColor: purple }}>
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <CampaignRowSkeleton key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && campaigns.length === 0 && (
        <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: 'rgba(124,58,237,0.07)', border: '1px solid #e9d5ff' }}>
            <Megaphone className="w-6 h-6" style={{ color: purple }} />
          </div>
          <p className="font-black text-base mb-2" style={{ color: '#0e0020' }}>No campaigns yet</p>
          <p className="text-sm mb-7" style={{ color: 'rgba(15,0,32,0.5)', lineHeight: '1.65' }}>
            Post a campaign and creators on Brandior<br />will discover it and pitch directly.
          </p>
          <button
            onClick={() => navigate('/brand/post-campaign')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: purple }}>
            <Plus className="w-4 h-4" /> Post a Campaign
          </button>
        </div>
      )}

      {/* List */}
      {!loading && campaigns.length > 0 && (
        <div className="space-y-4">
          {campaigns.map(c => {
            const appCount = c.applications?.[0]?.count ?? 0
            const isOpen = c.status === 'open'
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/brand/my-campaigns/${c.id}`)}
                className="rounded-2xl p-5 cursor-pointer transition-all"
                style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 12px rgba(124,58,237,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.10)'; e.currentTarget.style.borderColor = '#c4b5fd' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.05)'; e.currentTarget.style.borderColor = '#e9d5ff' }}
              >
                {/* Title + status */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-1" style={{ color: purple }}>
                      {[c.niche, c.collab_type].filter(Boolean).join(' · ')}
                    </p>
                    <h3 className="font-black text-base leading-snug" style={{ color: '#0e0020' }}>{c.campaign_name}</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: isOpen ? '#dcfce7' : 'rgba(15,0,32,0.06)', color: isOpen ? '#16a34a' : 'rgba(15,0,32,0.45)' }}>
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs" style={{ color: 'rgba(15,0,32,0.45)' }}>
                  <span className="font-semibold" style={{ color: purple }}>₦{Number(c.budget).toLocaleString()}</span>
                  <span>{c.timeline}</span>
                  <span>{timeAgo(c.created_at)}</span>
                </div>

                {/* Pitch count */}
                <div className="flex items-center gap-2 mb-4 py-2.5 px-3 rounded-xl"
                  style={{ backgroundColor: appCount > 0 ? 'rgba(124,58,237,0.06)' : 'rgba(15,0,32,0.03)', border: `1px solid ${appCount > 0 ? '#e9d5ff' : 'rgba(15,0,32,0.06)'}` }}>
                  <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: appCount > 0 ? purple : 'rgba(15,0,32,0.3)' }} />
                  <span className="text-sm font-black" style={{ color: appCount > 0 ? darkPurple : 'rgba(15,0,32,0.35)' }}>
                    {appCount} {appCount === 1 ? 'pitch' : 'pitches'}
                  </span>
                  {appCount > 0 && <span className="text-xs" style={{ color: 'rgba(15,0,32,0.4)' }}>— ready to review</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/brand/my-campaigns/${c.id}/pitches`) }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: purple }}>
                    View Pitches
                  </button>
                  <button
                    onClick={e => toggleStatus(e, c)} disabled={toggling === c.id}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40"
                    style={{ borderColor: '#e9d5ff', color: purple, backgroundColor: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}>
                    {toggling === c.id ? '…' : isOpen ? 'Close' : 'Reopen'}
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

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  if (!campaign) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="font-semibold mb-4" style={{ color: 'rgba(15,0,32,0.5)' }}>Campaign not found.</p>
      <button onClick={() => navigate('/brand/my-campaigns')}
        className="text-sm font-bold" style={{ color: purple, background: 'none', border: 'none', cursor: 'pointer' }}>
        ← Back to My Campaigns
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Campaign header card */}
      <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'linear-gradient(135deg, #1a0035, #3d0080)', border: '1px solid rgba(196,181,253,0.2)' }}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c084fc' }}>
            {[campaign.niche, campaign.collab_type].filter(Boolean).join(' · ')}
          </p>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: campaign.status === 'open' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', color: campaign.status === 'open' ? '#86efac' : 'rgba(255,255,255,0.5)' }}>
            {campaign.status === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1 mb-3">{campaign.campaign_name}</h2>
        <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <span className="font-bold" style={{ color: '#c084fc' }}>₦{Number(campaign.budget).toLocaleString()}</span>
          <span>{campaign.timeline}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>Posted {timeAgo(campaign.created_at)}</span>
        </div>
        <div className="flex items-center gap-2 mt-3 py-2 px-3 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
          <span className="text-sm font-black text-white">{appCount} {appCount === 1 ? 'pitch' : 'pitches'}</span>
        </div>
      </div>

      {/* Brief card */}
      {campaign.brief && (
        <div className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 12px rgba(124,58,237,0.05)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(124,58,237,0.5)' }}>Campaign Brief</p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(15,0,32,0.7)', whiteSpace: 'pre-wrap' }}>{campaign.brief}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/brand/my-campaigns/${id}/pitches`)}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: purple }}>
          View Pitches ({appCount})
        </button>
        <button onClick={toggleStatus} disabled={toggling}
          className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40"
          style={{ borderColor: '#e9d5ff', color: purple, backgroundColor: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.04)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}>
          {toggling ? '…' : campaign.status === 'open' ? 'Close Campaign' : 'Reopen Campaign'}
        </button>
      </div>
    </div>
  )
}

const PIPELINE_FILTERS = [
  { key: 'All',         label: 'All' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview',   label: 'In Discussion' },
  { key: 'accepted',    label: 'Hired' },
  { key: 'rejected',    label: 'Declined' },
]
const APP_STATUS_COLOR = {
  pending:       '#6366f1',
  shortlisted:   '#FA8112',
  interview:     '#38bdf8',
  accepted:      '#22c55e',
  rejected:      '#ef4444',
}
const APP_STATUS_LABEL = {
  pending:       'New',
  shortlisted:   'Shortlisted',
  interview:     'In Discussion',
  accepted:      'Hired',
  rejected:      'Declined',
}

// ── Pitches ───────────────────────────────────────────────────────────────────
function CampaignPitches({ id }) {
  const navigate = useNavigate()
  const [campaign, setCampaign]           = useState(null)
  const [applicants, setApplicants]       = useState([])
  const [loading, setLoading]             = useState(true)
  const [activeFilter, setActiveFilter]   = useState('All')
  const [hireTarget, setHireTarget]       = useState(null)
  const [hireAmount, setHireAmount]       = useState('')
  const [hireDeadline, setHireDeadline]   = useState('')
  const [hireNote, setHireNote]           = useState('')
  const [hiring, setHiring]               = useState(false)
  const [hireError, setHireError]         = useState('')

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

  async function updateAppStatus(app, dbStatus) {
    setApplicants(prev => prev.map(a => a.id === app.id ? { ...a, status: dbStatus } : a))
    await supabase.from('job_applications').update({ status: dbStatus }).eq('id', app.id)
  }

  async function handleHire() {
    if (!hireTarget || !hireAmount || hiring) return
    setHiring(true)
    setHireError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')
      const amount = parseInt(hireAmount.replace(/[^0-9]/g, ''), 10)
      if (!amount) throw new Error('Enter a valid offer amount')

      const { data, error } = await supabase.functions.invoke('collab-hire', {
        body: {
          job_id:         id,
          application_id: hireTarget.app.id,
          content_type:   campaign?.collab_type || 'Content',
          total_amount:   amount,
          brief: {
            collabTitle:  campaign?.campaign_name || 'Collab',
            deadline:     hireDeadline || undefined,
            instructions: hireNote.trim() || undefined,
            brandName:    user?.user_metadata?.company_name || user?.user_metadata?.full_name || 'Brand',
            budget:       `₦${amount.toLocaleString()}`,
          },
        },
      })
      if (error || !data?.ok) throw new Error(data?.error ?? error?.message ?? 'Could not create offer')

      await updateAppStatus(hireTarget.app, 'accepted')
      setHireTarget(null)
      navigate(`/brand-dashboard?newOrder=${data.collab_id}`)
    } catch (err) {
      setHireError(err.message || 'Could not hire creator. Please try again.')
    } finally {
      setHiring(false)
    }
  }

  const pipelineCounts = PIPELINE_FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === 'All'
      ? applicants.length
      : applicants.filter(a => a.status === f.key).length
    return acc
  }, {})

  const filtered = activeFilter === 'All'
    ? applicants
    : applicants.filter(a => a.status === activeFilter)

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="max-w-2xl mx-auto">

      {/* Mini campaign context */}
      {campaign && (
        <div className="rounded-2xl p-4 mb-5 flex items-center justify-between gap-3"
          style={{ background: 'linear-gradient(135deg, #1a0035, #3d0080)', border: '1px solid rgba(196,181,253,0.2)' }}>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#c084fc' }}>
              {[campaign.niche, campaign.collab_type].filter(Boolean).join(' · ')}
            </p>
            <h2 className="text-base font-black text-white leading-snug">{campaign.campaign_name}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>₦{Number(campaign.budget).toLocaleString()}</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: campaign.status === 'open' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', color: campaign.status === 'open' ? '#86efac' : 'rgba(255,255,255,0.5)' }}>
            {campaign.status === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>
      )}

      {/* Pipeline filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: 'none' }}>
        {PIPELINE_FILTERS.map(f => {
          const active = activeFilter === f.key
          const count  = pipelineCounts[f.key] ?? 0
          const col    = APP_STATUS_COLOR[f.key] ?? purple
          return (
            <button key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              style={active
                ? { backgroundColor: col + '18', color: col, border: `1.5px solid ${col}` }
                : { backgroundColor: '#fff', color: 'rgba(15,0,32,0.5)', border: '1.5px solid #e9d5ff' }}>
              {f.label}
              {count > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: active ? col + '30' : '#f3eeff', color: active ? col : purple }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="font-black text-sm mb-4" style={{ color: 'rgba(15,0,32,0.4)' }}>
        {filtered.length} pitch{filtered.length !== 1 ? 'es' : ''}{activeFilter !== 'All' ? ` · ${PIPELINE_FILTERS.find(f => f.key === activeFilter)?.label}` : ''}
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(124,58,237,0.07)', border: '1px solid #e9d5ff' }}>
            <Users className="w-6 h-6" style={{ color: purple }} />
          </div>
          <p className="font-black mb-1" style={{ color: '#0e0020' }}>
            {activeFilter === 'All' ? 'No pitches yet' : `No ${PIPELINE_FILTERS.find(f => f.key === activeFilter)?.label.toLowerCase()} pitches`}
          </p>
          <p className="text-sm" style={{ color: 'rgba(15,0,32,0.5)' }}>
            {activeFilter === 'All' ? 'Your campaign is live and visible to creators.' : 'Adjust the filter to see other pitches.'}
          </p>
        </div>
      )}

      {/* Pitch cards */}
      {filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map(app => {
            const c = app.creator || {}
            const tierColors = {
              'fast-rising': { bg: '#f0fdf4', color: '#16a34a' },
              'next-rated':  { bg: '#f5f3ff', color: purple },
              'top-rated':   { bg: '#fefce8', color: '#d97706' },
            }
            const tc = tierColors[c.tier] || tierColors['fast-rising']
            const sc = APP_STATUS_COLOR[app.status] ?? '#6366f1'
            const sl = APP_STATUS_LABEL[app.status] ?? 'New'
            const isShortlisted = app.status === 'shortlisted'
            const isHired = app.status === 'accepted'
            return (
              <div key={app.id} className="rounded-2xl p-5" style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 12px rgba(124,58,237,0.05)' }}>
                {/* Creator identity */}
                <div className="flex items-start gap-3 mb-3">
                  {c.avatar_url
                    ? <img src={c.avatar_url} alt={c.full_name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ backgroundColor: darkPurple }}>
                        {(c.full_name || '?')[0]}
                      </div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm" style={{ color: '#0e0020' }}>{c.full_name || 'Creator'}</span>
                      {c.username && <span className="text-xs" style={{ color: 'rgba(15,0,32,0.4)' }}>@{c.username}</span>}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: tc.bg, color: tc.color }}>
                        {(c.tier || 'fast-rising').replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(15,0,32,0.45)' }}>
                      {c.niches?.length > 0 && <span>{c.niches[0]}</span>}
                      {c.avg_rating > 0 && <span>★ {c.avg_rating}</span>}
                      {app.rate > 0 && <span style={{ color: '#16a34a', fontWeight: 700 }}>₦{Number(app.rate).toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: sc + '18', color: sc }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: sc }} />
                      {sl}
                    </span>
                    <span className="text-[10px]" style={{ color: 'rgba(15,0,32,0.35)' }}>{timeAgo(app.created_at)}</span>
                  </div>
                </div>

                {/* Pitch text */}
                <p className="text-sm leading-relaxed mb-4"
                  style={{ color: 'rgba(15,0,32,0.65)', backgroundColor: 'rgba(124,58,237,0.04)', borderRadius: '0.625rem', padding: '0.625rem 0.875rem' }}>
                  "{app.pitch}"
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {!isHired && (
                    <button
                      onClick={() => updateAppStatus(app, isShortlisted ? 'pending' : 'shortlisted')}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                      style={isShortlisted
                        ? { backgroundColor: '#FA811210', color: '#FA8112', border: '1.5px solid #FA811240' }
                        : { backgroundColor: '#fff', color: 'rgba(15,0,32,0.5)', border: '1.5px solid #e9d5ff' }}>
                      {isShortlisted ? '★ Shortlisted' : '☆ Shortlist'}
                    </button>
                  )}

                  <Link to={`/creators/${c.username || c.id}`}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-opacity hover:opacity-80"
                    style={{ backgroundColor: '#f3eeff', color: darkPurple }}>
                    Profile <ArrowUpRight className="w-3 h-3" />
                  </Link>

                  {!isHired && (
                    <button
                      onClick={() => { setHireTarget({ app, creatorName: c.full_name || 'Creator' }); setHireAmount(campaign?.budget ? String(campaign.budget) : ''); setHireError('') }}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white ml-auto transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#22c55e' }}>
                      Hire →
                    </button>
                  )}

                  {isHired && (
                    <span className="ml-auto text-xs font-bold px-3 py-2 rounded-xl"
                      style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                      ✓ Hired
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Hire modal */}
      {hireTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => !hiring && setHireTarget(null)}>
          <div
            className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 pb-10 sm:pb-6"
            style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: '#e9d5ff' }} />
            <h3 className="text-lg font-black mb-1" style={{ color: '#0e0020' }}>Hire {hireTarget.creatorName}</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(15,0,32,0.45)' }}>{campaign?.campaign_name}</p>

            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(15,0,32,0.4)' }}>
              Offer amount <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 transition-all"
              style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#faf9ff' }}>
              <span className="font-black text-base" style={{ color: '#0e0020' }}>₦</span>
              <input
                type="text" inputMode="numeric"
                value={hireAmount ? Number(hireAmount).toLocaleString() : ''}
                onChange={e => setHireAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 150,000"
                className="flex-1 text-sm bg-transparent outline-none font-semibold"
                style={{ color: '#0e0020' }}
              />
            </div>

            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(15,0,32,0.4)' }}>Deadline</label>
            <input
              type="text" value={hireDeadline} onChange={e => setHireDeadline(e.target.value)}
              placeholder="e.g. 30 Jul 2026"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-4 transition-all"
              style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#faf9ff', color: '#0e0020' }}
            />

            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(15,0,32,0.4)' }}>
              Note to creator <span style={{ color: 'rgba(15,0,32,0.3)', fontWeight: 500 }}>(optional)</span>
            </label>
            <textarea
              value={hireNote} onChange={e => setHireNote(e.target.value)} rows={3}
              placeholder="Extra instructions or context for the creator…"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-4 transition-all"
              style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#faf9ff', color: '#0e0020' }}
            />

            <div className="flex items-start gap-2.5 rounded-xl p-3 mb-4"
              style={{ backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <p className="text-xs" style={{ color: '#10b981' }}>Payment is held in escrow. Funds are released only when you approve the creator's delivery.</p>
            </div>

            {hireError && (
              <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold"
                style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
                {hireError}
              </div>
            )}

            <button
              onClick={handleHire} disabled={hiring || !hireAmount}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm mb-2 transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: purple }}>
              {hiring ? 'Creating offer…' : hireAmount ? `Proceed to Payment · ₦${Number(hireAmount).toLocaleString()}` : 'Enter an amount to continue'}
            </button>
            <button
              onClick={() => setHireTarget(null)} disabled={hiring}
              className="w-full py-2 text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-70"
              style={{ color: 'rgba(15,0,32,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
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

  function Breadcrumbs() {
    return (
      <div className="flex items-center gap-1.5 text-sm flex-wrap min-w-0">
        <button onClick={() => navigate('/brand-dashboard')}
          className="font-semibold transition-opacity hover:opacity-70 flex-shrink-0" style={{ color: purple }}>
          Dashboard
        </button>
        <span style={{ color: 'rgba(124,58,237,0.3)' }}>/</span>
        <button onClick={() => navigate('/brand/my-campaigns')}
          className="font-semibold transition-opacity hover:opacity-70 flex-shrink-0"
          style={{ color: id ? purple : darkPurple }}>
          My Campaigns
        </button>
        {id && (
          <>
            <span style={{ color: 'rgba(124,58,237,0.3)' }}>/</span>
            <button onClick={() => navigate(`/brand/my-campaigns/${id}`)}
              className="font-semibold transition-opacity hover:opacity-70 flex-shrink-0"
              style={{ color: isPitches ? purple : darkPurple }}>
              Campaign
            </button>
          </>
        )}
        {isPitches && (
          <>
            <span style={{ color: 'rgba(124,58,237,0.3)' }}>/</span>
            <span className="font-semibold flex-shrink-0" style={{ color: darkPurple }}>Pitches</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--b-brandDashBg, #f3eeff)' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'rgba(243,238,255,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e9d5ff' }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 p-1 rounded-lg transition-colors flex-shrink-0"
          style={{ color: purple }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.08)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <ChevronLeft className="w-5 h-5" />
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
