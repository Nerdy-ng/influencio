import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Sliders, Save, RotateCcw, RotateCw } from "lucide-react";

const FACTORS = [
  { key: "portfolio_quality", label: "Portfolio Quality",     desc: "Weight given to portfolio completeness and diversity" },
  { key: "reviews",           label: "Reviews & Ratings",    desc: "Weight given to average review score and count" },
  { key: "response_rate",     label: "Response Rate",        desc: "How quickly creator responds to inquiries" },
  { key: "completion_rate",   label: "Completion Rate",      desc: "Percentage of completed collaborations" },
  { key: "acceptance_rate",   label: "Acceptance Rate",      desc: "Percentage of pitches accepted by brands" },
  { key: "activity",          label: "Recent Activity",      desc: "How recently the creator was active on the platform" },
  { key: "location_match",    label: "Location Match",       desc: "Boost creators in the same city as the brand" },
  { key: "verified",          label: "Verified Badge",       desc: "Boost verified creators in results" },
  { key: "repeat_hires",      label: "Repeat Hires",         desc: "Creators who brands hire multiple times" },
  { key: "experience",        label: "Experience Level",     desc: "Based on total completed collaborations" },
  { key: "freshness",         label: "Profile Freshness",    desc: "How recently profile was updated" },
  { key: "niche_match",       label: "Niche Match",          desc: "Exact niche match with brand's campaign type" },
];

const DEFAULT_WEIGHTS = Object.fromEntries(FACTORS.map(f => [f.key, 5]));

export default function DiscoveryAlgorithmPanel({ showToast, auditLog }) {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key, value").like("key", "algo_%");
    const obj = { ...DEFAULT_WEIGHTS };
    (data || []).forEach(r => {
      const key = r.key.replace("algo_", "");
      if (obj[key] !== undefined) obj[key] = Number(r.value) || 5;
    });
    setWeights(obj);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const upserts = Object.entries(weights).map(([key, value]) => ({ key: `algo_${key}`, value: String(value), updated_at: new Date().toISOString() }));
    await supabase.from("site_settings").upsert(upserts, { onConflict: "key" }).catch(() => {});
    auditLog?.("update_discovery_algo", "algorithm", null, "Discovery Algorithm");
    showToast("Discovery weights saved");
    setSaving(false);
  }

  function reset() {
    setWeights(DEFAULT_WEIGHTS);
  }

  const totalWeight = Object.values(weights).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Discovery Algorithm</h2>
          <p className="text-sm text-gray-500 mt-0.5">Adjust ranking weights for the creator marketplace. Total: {totalWeight}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
            <RotateCw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={save} disabled={saving || loading} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: "#4f46e5" }}>
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Weights"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-2"><Sliders className="w-4 h-4 text-indigo-500" /> Ranking Weights (0–10)</p>
        <div className="space-y-5">
          {FACTORS.map(f => {
            const w = weights[f.key] ?? 5;
            const pct = totalWeight > 0 ? ((w / totalWeight) * 100).toFixed(1) : 0;
            return (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                    <p className="text-xs text-gray-400">{f.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-xs text-gray-400 w-12 text-right">{pct}%</span>
                    <span className="text-sm font-black text-indigo-600 w-6 text-right">{w}</span>
                  </div>
                </div>
                <input type="range" min="0" max="10" step="1" value={w}
                  onChange={e => setWeights(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                  className="w-full h-2 accent-indigo-600 cursor-pointer" />
                <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual distribution */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-700 mb-4">Weight Distribution</p>
        <div className="space-y-2">
          {FACTORS
            .map(f => ({ ...f, w: weights[f.key] ?? 5, pct: totalWeight > 0 ? (weights[f.key] ?? 5) / totalWeight * 100 : 0 }))
            .sort((a, b) => b.w - a.w)
            .map((f, i) => (
              <div key={f.key} className="flex items-center gap-3">
                <p className="text-xs text-gray-600 w-36 flex-shrink-0 truncate">{f.label}</p>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${f.pct}%`, backgroundColor: `hsl(${250 - i * 15}, 70%, 55%)` }} />
                </div>
                <span className="text-xs font-bold text-gray-500 w-8 text-right">{f.w}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
