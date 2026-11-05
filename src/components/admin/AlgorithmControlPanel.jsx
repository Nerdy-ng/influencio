import { useState, useEffect } from "react";
import { Save, RotateCcw, AlertCircle, CheckCircle, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { calcScore, parseAlgoConfig, validateWeights, ALGO_DEFAULTS, invalidateAlgoCache } from "../../lib/algoRanking";

const PREVIEW_CREATORS = [
  { id:'p1', name:'Adaeze Okafor',   initials:'AO', tier:'top-rated',   avgRating:4.9, identityVerified:true,  sparkEarned:true,  updatedAt:new Date().toISOString(), createdAt:new Date(Date.now()-30*86400000).toISOString() },
  { id:'p2', name:'Tunde Bakare',    initials:'TB', tier:'top-rated',   avgRating:4.8, identityVerified:true,  sparkEarned:true,  updatedAt:new Date().toISOString(), createdAt:new Date(Date.now()-30*86400000).toISOString() },
  { id:'p3', name:'Ngozi Nnaji',     initials:'NN', tier:'next-rated',  avgRating:4.7, identityVerified:true,  sparkEarned:true,  updatedAt:new Date().toISOString(), createdAt:new Date(Date.now()-30*86400000).toISOString() },
  { id:'p4', name:'Chiamaka Eze',    initials:'CE', tier:'next-rated',  avgRating:4.5, identityVerified:false, sparkEarned:true,  updatedAt:new Date().toISOString(), createdAt:new Date(Date.now()-30*86400000).toISOString() },
  { id:'p5', name:'Emeka Obi',       initials:'EO', tier:'fast-rising', avgRating:4.3, identityVerified:false, sparkEarned:true,  updatedAt:new Date().toISOString(), createdAt:new Date(Date.now()-30*86400000).toISOString() },
  { id:'p6', name:'Sola Adesanya',   initials:'SA', tier:'fast-rising', avgRating:4.1, identityVerified:false, sparkEarned:false, updatedAt:new Date().toISOString(), createdAt:new Date(Date.now()-30*86400000).toISOString() },
  { id:'p7', name:'Amara Nwachukwu', initials:'AN', tier:null,          avgRating:3.8, identityVerified:false, sparkEarned:false, updatedAt:new Date().toISOString(), createdAt:new Date(Date.now()-30*86400000).toISOString() },
  { id:'p8', name:'Biodun Alabi',    initials:'BA', tier:null,          avgRating:0,   identityVerified:false, sparkEarned:false, updatedAt:new Date().toISOString(), createdAt:new Date(Date.now()-15*86400000).toISOString() },
]

const TIER_LABEL = { 'top-rated':'Top Rated', 'next-rated':'Next Rated', 'fast-rising':'Fast Rising' }
const TIER_COLOR = { 'top-rated':'#D4AF37', 'next-rated':'#a78bfa', 'fast-rising':'#22c55e' }

const SIGNAL_META = [
  { key:'rating',   label:'Avg Rating',       desc:'Trigger-maintained from collab completions',   min:0, max:60 },
  { key:'tier',     label:'Tier Level',        desc:'Earned via collab milestones (3/7/15)',         min:0, max:50 },
  { key:'verified', label:'Identity Verified', desc:'KYC completion (server-controlled)',            min:5, max:30 },
  { key:'spark',    label:'Profile Complete',  desc:'5-step completion check (spark_earned)',        min:0, max:20 },
  { key:'activity', label:'Recent Activity',   desc:'Days since last profile update (decay)',        min:0, max:20 },
]

export default function AlgorithmControlPanel({ showToast, auditLog }) {
  const [cfg, setCfg] = useState({ ...ALGO_DEFAULTS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'app_config').maybeSingle()
      if (data?.value) {
        const parsed = JSON.parse(data.value)
        setCfg(parseAlgoConfig(parsed?.algo))
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function setWeight(key, val) {
    setCfg(c => ({ ...c, weights: { ...c.weights, [key]: Math.max(0, Math.min(100, Number(val) || 0)) } }))
  }

  const weightSum = Object.values(cfg.weights).reduce((s, v) => s + v, 0)
  const weightsValid = validateWeights(cfg.weights)

  async function save() {
    if (!weightsValid) return
    setSaving(true)
    try {
      const { data: existing } = await supabase.from('site_settings').select('value').eq('key', 'app_config').maybeSingle()
      const prev = existing?.value ? JSON.parse(existing.value) : {}
      const merged = { ...prev, algo: cfg }
      await supabase.from('site_settings').upsert(
        { key: 'app_config', value: JSON.stringify(merged), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      invalidateAlgoCache()
      auditLog?.('update_algo_weights', 'algorithm', null, 'Algorithm Control')
      showToast('Algorithm weights saved')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { showToast('Save failed — please try again') }
    setSaving(false)
  }

  function reset() { setCfg({ ...ALGO_DEFAULTS }) }

  const preview = [...PREVIEW_CREATORS]
    .map(c => ({ ...c, score: calcScore(c, cfg) }))
    .sort((a, b) => b.score - a.score)

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Algorithm Control</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure how creator profiles are ranked in marketplace discovery.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={save} disabled={saving || !weightsValid}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ backgroundColor: saved ? '#16a34a' : '#4f46e5' }}>
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Weights'}</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-800">Signal Weights</p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${weightsValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                Total: {weightSum}%{!weightsValid && ' ≠ 100'}
              </span>
            </div>
            {!weightsValid && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> Weights must total exactly 100% to save.
              </div>
            )}
            <div className="space-y-5">
              {SIGNAL_META.map(s => (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                      <p className="text-xs text-gray-400">{s.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <input type="number" min={s.min} max={s.max} value={cfg.weights[s.key]}
                        onChange={e => setWeight(s.key, e.target.value)}
                        className="w-14 text-sm font-bold text-center border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      <span className="text-xs text-gray-400 w-4">%</span>
                    </div>
                  </div>
                  <input type="range" min={s.min} max={s.max} step="1" value={cfg.weights[s.key]}
                    onChange={e => setWeight(s.key, e.target.value)}
                    className="w-full h-2 accent-indigo-600 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800 mb-3">Activity Signal</p>
            <label className="block text-xs font-medium text-gray-500 mb-1">Activity Window (days)</label>
            <input type="number" min="30" max="180" value={cfg.activity_window_days}
              onChange={e => setCfg(c => ({ ...c, activity_window_days: Math.max(30, Math.min(180, Number(e.target.value) || 90)) }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            <p className="text-xs text-gray-400 mt-1">Creators not updated in this many days score 0 on the activity signal.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">Newcomer Boost</p>
              <button onClick={() => setCfg(c => ({ ...c, newcomer_boost_enabled: !c.newcomer_boost_enabled }))}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{ backgroundColor: cfg.newcomer_boost_enabled ? '#4f46e5' : '#d1d5db' }}>
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: cfg.newcomer_boost_enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Surface new creators before they accumulate ratings. Default: OFF.</p>
            {cfg.newcomer_boost_enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Window (days)</label>
                  <input type="number" min="14" max="180" value={cfg.newcomer_boost_days}
                    onChange={e => setCfg(c => ({ ...c, newcomer_boost_days: Math.max(14, Math.min(180, Number(e.target.value) || 90)) }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Boost %</label>
                  <input type="number" min="1" max="15" value={cfg.newcomer_boost_pct}
                    onChange={e => setCfg(c => ({ ...c, newcomer_boost_pct: Math.max(1, Math.min(15, Number(e.target.value) || 5)) }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> Live Ranking Preview
              </p>
              <span className="text-xs text-gray-400">Sample creators · updates as you adjust weights</span>
            </div>
            <div className="space-y-2">
              {preview.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: i === 0 ? '#f5f3ff' : '#f9fafb' }}>
                  <span className="text-xs font-black text-gray-400 w-5 text-center flex-shrink-0">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#4f46e5' }}>{c.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: TIER_COLOR[c.tier] ?? '#9ca3af' }}>
                        {TIER_LABEL[c.tier] ?? 'New'}
                      </span>
                      {c.identityVerified && <span className="text-xs text-sky-500 font-semibold">✓ Verified</span>}
                      {c.sparkEarned && <span className="text-xs text-amber-500 font-semibold">⚡ Spark</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-sm font-black text-indigo-700">{(c.score * 100).toFixed(1)}</span>
                    <span className="text-xs text-gray-400">score</span>
                  </div>
                  <div className="w-20 flex-shrink-0">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${c.score * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Sample data only — actual ranking uses live DB signals. Save to apply to marketplace.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
