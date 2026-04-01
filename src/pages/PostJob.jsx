import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  Briefcase, ChevronRight, CheckCircle, Send, X, Plus,
  Instagram, Youtube, MapPin, DollarSign, Calendar, Users,
  Star, BadgeCheck, ArrowLeft, ChevronDown,
} from 'lucide-react'
import Navbar from '../components/Navbar'

const purple = '#7c3aed'
const pink = '#FF6B9D'
const darkPurple = '#4c1d95'

const NICHES = [
  'Beauty & Skincare', 'Fashion & Style', 'Tech & Gadgets', 'Food & Cooking',
  'Fitness & Wellness', 'Comedy & Entertainment', 'Finance & Business',
  'Travel & Lifestyle', 'Music', 'Education', 'Gaming', 'Parenting & Family',
]

const PLATFORMS = [
  { id: 'Instagram', icon: '📸' },
  { id: 'TikTok', icon: '🎵' },
  { id: 'YouTube', icon: '▶️' },
  { id: 'Twitter/X', icon: '𝕏' },
  { id: 'Facebook', icon: '👤' },
  { id: 'Snapchat', icon: '👻' },
  { id: 'Podcast', icon: '🎙️' },
]

const CONTENT_TYPES = [
  'UGC Videos', 'Video Editing', 'Creative Strategy',
  'Social Content', 'Design', 'Copywriting',
]

// Recommended creators mapped by niche
const RECOMMENDED = {
  'Beauty & Skincare': [
    { id: 'adaeze_glam', name: 'Adaeze Okafor', handle: '@adaeze_glam', followers: '125K', niche: 'Beauty & Skincare', rating: 4.8, tier: 'top-rated', location: 'Lagos' },
    { id: 'bisi_beauty', name: 'Bisi Alabi', handle: '@bisi_beauty', followers: '89K', niche: 'Beauty & Skincare', rating: 4.6, tier: 'rising', location: 'Accra' },
  ],
  'Fashion & Style': [
    { id: 'fatimah_style', name: 'Fatimah Abdullahi', handle: '@fatimah_style', followers: '280K', niche: 'Fashion & Style', rating: 4.9, tier: 'top-rated', location: 'Nairobi' },
    { id: 'amaka_luxe', name: 'Amaka Igwe', handle: '@amaka_luxe', followers: '95K', niche: 'Fashion & Style', rating: 5.0, tier: 'top-rated', location: 'Lagos' },
  ],
  'Tech & Gadgets': [
    { id: 'chidi_tech', name: 'Chidi Nwosu', handle: '@chidi_tech', followers: '45K', niche: 'Tech & Gadgets', rating: 4.5, tier: 'rising', location: 'Accra' },
  ],
  'Food & Cooking': [
    { id: 'emeka_eats', name: 'Emeka Eze', handle: '@emeka_eats', followers: '62K', niche: 'Food & Cooking', rating: 4.3, tier: 'rising', location: 'Abuja' },
  ],
  'Fitness & Wellness': [
    { id: 'ngozi_fit', name: 'Ngozi Obi', handle: '@ngozi_fit', followers: '189K', niche: 'Fitness & Wellness', rating: 4.7, tier: 'top-rated', location: 'Nairobi' },
  ],
  'Comedy & Entertainment': [
    { id: 'tunde_comedy', name: 'Tunde Bakare', handle: '@tunde_comedy', followers: '310K', niche: 'Comedy', rating: 4.6, tier: 'top-rated', location: 'Kumasi' },
  ],
}

const DEFAULT_RECOMMENDED = [
  { id: 'adaeze_glam', name: 'Adaeze Okafor', handle: '@adaeze_glam', followers: '125K', niche: 'Beauty & Skincare', rating: 4.8, tier: 'top-rated', location: 'Lagos' },
  { id: 'fatimah_style', name: 'Fatimah Abdullahi', handle: '@fatimah_style', followers: '280K', niche: 'Fashion & Style', rating: 4.9, tier: 'top-rated', location: 'Nairobi' },
  { id: 'tunde_comedy', name: 'Tunde Bakare', handle: '@tunde_comedy', followers: '310K', niche: 'Comedy', rating: 4.6, tier: 'top-rated', location: 'Kumasi' },
  { id: 'ngozi_fit', name: 'Ngozi Obi', handle: '@ngozi_fit', followers: '189K', niche: 'Fitness & Wellness', rating: 4.7, tier: 'top-rated', location: 'Nairobi' },
]

const TIER_BADGE = {
  'top-rated': { label: 'Top Rated', color: '#D4AF37', bg: '#D4AF3715' },
  'rising':    { label: 'Rising',    color: '#7c3aed', bg: '#7c3aed15' },
}

// ── Multi-select dropdown ─────────────────────────────────────────────────────
function MultiSelect({ options, value, onChange, placeholder, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(id) {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id])
  }

  const display = value.length === 0
    ? placeholder
    : value.length === 1
    ? (options.find(o => (o.id || o) === value[0])?.id || value[0])
    : `${value.length} selected`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-left transition-all"
        style={{
          border: `1.5px solid ${error ? pink : open ? purple : '#e9d5ff'}`,
          backgroundColor: '#faf5ff',
          color: value.length ? '#1e0040' : '#9ca3af',
        }}>
        <span className="truncate">{display}</span>
        <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2 text-gray-400 transition-transform" style={{ transform: open ? 'rotate(180deg)' : '' }} />
      </button>

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map(v => {
            const opt = options.find(o => (o.id || o) === v)
            const label = opt?.id || opt || v
            const icon = opt?.icon
            return (
              <span key={v} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: darkPurple }}>
                {icon && <span>{icon}</span>}
                {label}
                <button type="button" onClick={() => toggle(v)} className="ml-0.5 hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-2xl shadow-lg overflow-hidden overflow-y-auto"
          style={{ border: '1.5px solid #e9d5ff', backgroundColor: 'white', maxHeight: 240 }}>
          {options.map(opt => {
            const id = opt.id || opt
            const label = opt.id || opt
            const icon = opt.icon
            const selected = value.includes(id)
            return (
              <button key={id} type="button" onClick={() => toggle(id)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-purple-50"
                style={{ color: selected ? darkPurple : '#374151', fontWeight: selected ? 600 : 400 }}>
                <span className="flex items-center gap-2">
                  {icon && <span>{icon}</span>}
                  {label}
                </span>
                {selected && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: purple }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CreatorCard({ creator, invited, onInvite }) {
  const badge = TIER_BADGE[creator.tier] || TIER_BADGE['rising']
  const initials = creator.name.split(' ').map(w => w[0]).join('').slice(0, 2)
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-all"
      style={{ border: '1.5px solid #e9d5ff', backgroundColor: invited ? '#faf5ff' : '#fff' }}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #c084fc, #7c3aed)' }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-sm font-bold text-gray-900 truncate">{creator.name}</p>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ color: badge.color, backgroundColor: badge.bg }}>{badge.label}</span>
        </div>
        <p className="text-xs text-gray-400">{creator.handle} · {creator.followers} · {creator.location}</p>
      </div>
      <button
        onClick={() => onInvite(creator.id)}
        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
        style={invited
          ? { backgroundColor: '#dcfce7', color: '#16a34a' }
          : { backgroundColor: darkPurple, color: '#fff' }}>
        {invited ? '✓ Invited' : 'Invite'}
      </button>
    </div>
  )
}

export default function PostJob() {
  const navigate = useNavigate()
  const [step, setStep] = useState('form') // 'form' | 'success'
  const [section2Open, setSection2Open] = useState(false)
  const section2Ref = useRef(null)
  const [loading, setLoading] = useState(false)
  const [invited, setInvited] = useState(new Set())
  const [req, setReq] = useState('')
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    title: '',
    niche: '',
    platforms: [],
    contentType: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    location: '',
    followersRequired: '',
    description: '',
    requirements: [],
  })

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function togglePlatform(id) {
    set('platforms', form.platforms.includes(id)
      ? form.platforms.filter(p => p !== id)
      : [...form.platforms, id])
  }

  function addReq() {
    if (!req.trim()) return
    set('requirements', [...form.requirements, req.trim()])
    setReq('')
  }

  function removeReq(i) {
    set('requirements', form.requirements.filter((_, idx) => idx !== i))
  }

  function validateSection1() {
    const e = {}
    if (!form.title.trim()) e.title = 'Job title is required'
    if (!form.niche) e.niche = 'Select a niche'
    if (!form.platforms.length) e.platforms = 'Select at least one platform'
    if (!form.budgetMin) e.budgetMin = 'Enter minimum budget'
    return e
  }

  function handleNext() {
    const errs = validateSection1()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSection2Open(true)
    setTimeout(() => {
      section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.description.trim()) e2.description = 'Add a job description'
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('success') }, 1200)
  }

  function handleInvite(id) {
    setInvited(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const recommended = RECOMMENDED[form.niche] || DEFAULT_RECOMMENDED

  if (step === 'success') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f3eeff' }}>
        <Helmet><title>Job Posted | Brandior</title></Helmet>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-28">

          {/* Success header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
              <CheckCircle className="w-8 h-8" style={{ color: '#16a34a' }} />
            </div>
            <h1 className="text-2xl font-black mb-2" style={{ color: darkPurple }}>Job posted!</h1>
            <p className="text-gray-500 text-sm">"{form.title}" is now live on the job board.</p>
          </div>

          {/* Recommended creators */}
          <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1.5px solid #e9d5ff' }}>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4" style={{ color: '#D4AF37' }} />
              <h2 className="font-black text-base" style={{ color: darkPurple }}>
                Recommended creators for this job
              </h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">Based on your niche. Invite them directly to apply.</p>
            <div className="space-y-2">
              {recommended.map(c => (
                <CreatorCard key={c.id} creator={c} invited={invited.has(c.id)} onInvite={handleInvite} />
              ))}
            </div>
            <Link to="/marketplace"
              className="flex items-center gap-1.5 text-xs font-semibold mt-4 transition-opacity hover:opacity-70"
              style={{ color: purple }}>
              Browse all creators <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setStep('form'); setSection2Open(false); setErrors({}); setForm({ title: '', niche: '', platforms: [], contentType: '', budgetMin: '', budgetMax: '', deadline: '', location: '', followersRequired: '', description: '', requirements: [] }); setInvited(new Set()) }}
              className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all"
              style={{ borderColor: '#e9d5ff', color: darkPurple }}>
              Post another job
            </button>
            <button onClick={() => navigate('/brand-dashboard?tab=orders')}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ backgroundColor: darkPurple }}>
              View my campaigns
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f3eeff' }}>
      <Helmet>
        <title>Post a Job | Brandior</title>
        <meta name="description" content="Post a creator or influencer job on Brandior and reach thousands of African creators." />
      </Helmet>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pt-28">

        {/* Header */}
        <div className="mb-8">
          <Link to="/brand-dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 transition-opacity hover:opacity-70"
            style={{ color: purple }}>
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-black" style={{ color: darkPurple }}>Post a Job</h1>
          <p className="text-gray-500 text-sm mt-1">Reach thousands of verified creators across Africa.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Section 1: Job Basics ── */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid #e9d5ff' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ backgroundColor: darkPurple }}>1</div>
              <h2 className="font-bold text-sm" style={{ color: darkPurple }}>Job basics</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Job title *</label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Instagram Reel for Skincare Product Launch"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ border: `1.5px solid ${errors.title ? pink : '#e9d5ff'}`, backgroundColor: '#faf5ff', color: '#1e0040' }}
                />
                {errors.title && <p className="text-xs mt-1" style={{ color: pink }}>{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Niche / Industry *</label>
                <select
                  value={form.niche}
                  onChange={e => set('niche', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ border: `1.5px solid ${errors.niche ? pink : '#e9d5ff'}`, backgroundColor: '#faf5ff', color: form.niche ? '#1e0040' : '#9ca3af' }}>
                  <option value="">Select a niche</option>
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.niche && <p className="text-xs mt-1" style={{ color: pink }}>{errors.niche}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Platform(s) *</label>
                <MultiSelect
                  options={PLATFORMS}
                  value={form.platforms}
                  onChange={v => { set('platforms', v); if (errors.platforms) setErrors(e => ({ ...e, platforms: '' })) }}
                  placeholder="Select platforms…"
                  error={errors.platforms}
                />
                {errors.platforms && <p className="text-xs mt-1" style={{ color: pink }}>{errors.platforms}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Content type</label>
                <select
                  value={form.contentType}
                  onChange={e => set('contentType', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#faf5ff', color: form.contentType ? '#1e0040' : '#9ca3af' }}>
                  <option value="">Select content type</option>
                  {CONTENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid #e9d5ff' }}>
            <h2 className="font-bold text-sm mb-4" style={{ color: darkPurple }}>Budget</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Min budget (₦) *</label>
                <input
                  type="number"
                  value={form.budgetMin}
                  onChange={e => set('budgetMin', e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ border: `1.5px solid ${errors.budgetMin ? pink : '#e9d5ff'}`, backgroundColor: '#faf5ff', color: '#1e0040' }}
                />
                {errors.budgetMin && <p className="text-xs mt-1" style={{ color: pink }}>{errors.budgetMin}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Max budget (₦)</label>
                <input
                  type="number"
                  value={form.budgetMax}
                  onChange={e => set('budgetMax', e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#faf5ff', color: '#1e0040' }}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Location</label>
                <input
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="e.g. Lagos (remote okay)"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#faf5ff', color: '#1e0040' }}
                />
              </div>
            </div>
          </div>

          {/* ── Next button (only shows before section 2 is open) ── */}
          {!section2Open && (
            <button type="button" onClick={handleNext}
              className="w-full py-4 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: `linear-gradient(135deg, ${darkPurple}, ${purple})`, boxShadow: '0 8px 24px rgba(76,29,149,0.35)' }}>
              Next <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* ── Section 2: Campaign Details (revealed on Next) ── */}
          {section2Open && (
            <>
              <div ref={section2Ref} className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid #e9d5ff' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ backgroundColor: darkPurple }}>2</div>
                  <h2 className="font-bold text-sm" style={{ color: darkPurple }}>Campaign details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Describe the campaign *</label>
                    <textarea
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      rows={5}
                      placeholder="Tell creators what the campaign is about, what you expect, and what makes this exciting..."
                      className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none"
                      style={{ border: `1.5px solid ${errors.description ? pink : '#e9d5ff'}`, backgroundColor: '#faf5ff', color: '#1e0040' }}
                    />
                    {errors.description && <p className="text-xs mt-1" style={{ color: pink }}>{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Min followers required</label>
                    <input
                      value={form.followersRequired}
                      onChange={e => set('followersRequired', e.target.value)}
                      placeholder="e.g. 5K+"
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                      style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#faf5ff', color: '#1e0040' }}
                    />
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid #e9d5ff' }}>
                <h2 className="font-bold text-sm mb-4" style={{ color: darkPurple }}>
                  Requirements <span className="text-gray-400 font-normal">(optional)</span>
                </h2>
                <div className="flex gap-2 mb-2">
                  <input
                    value={req}
                    onChange={e => setReq(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addReq() } }}
                    placeholder="Add a requirement and press Enter"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ border: '1.5px solid #e9d5ff', backgroundColor: '#faf5ff', color: '#1e0040' }}
                  />
                  <button type="button" onClick={addReq}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: darkPurple, color: '#fff' }}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.requirements.length === 0 && (
                  <p className="text-xs text-gray-400">e.g. Must have worked with food brands before</p>
                )}
                {form.requirements.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg mb-1.5"
                    style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                    <span className="text-xs text-gray-700">{r}</span>
                    <button type="button" onClick={() => removeReq(i)}>
                      <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                style={{ background: `linear-gradient(135deg, ${darkPurple}, ${purple})`, boxShadow: '0 8px 24px rgba(76,29,149,0.35)' }}>
                {loading
                  ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><Send className="w-4 h-4" /> Post Job & Find Creators</>
                }
              </button>
            </>
          )}

        </form>
      </div>
    </div>
  )
}
