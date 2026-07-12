import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Bot, Save, RotateCcw } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');

const AI_TOGGLES = [
  { key: "ai_dispute_resolution",    label: "AI Dispute Resolution",        desc: "Use AI to suggest resolution outcomes for disputes" },
  { key: "ai_recommendations",       label: "AI Creator Recommendations",   desc: "AI-powered creator suggestions for brands" },
  { key: "ai_campaign_brief",        label: "AI Campaign Brief Assistant",  desc: "Help brands write better campaign briefs" },
  { key: "ai_spam_detection",        label: "AI Spam Detection",            desc: "Auto-flag suspicious messages and pitches" },
  { key: "ai_content_moderation",    label: "AI Content Moderation",        desc: "Screen bios, portfolios and rate cards automatically" },
  { key: "ai_pitch_quality_score",   label: "AI Pitch Quality Scoring",     desc: "Score creator pitches to help brands decide faster" },
  { key: "ai_fraud_detection",       label: "AI Fraud Detection",           desc: "Flag suspicious wallet and referral activity" },
  { key: "ai_review_moderation",     label: "AI Review Moderation",         desc: "Auto-hide reviews flagged as abusive" },
];

const DEFAULT_SETTINGS = Object.fromEntries(AI_TOGGLES.map(t => [t.key, false]));
DEFAULT_SETTINGS.dispute_prompt_version = "v1";
DEFAULT_SETTINGS.recommendation_prompt_version = "v1";
DEFAULT_SETTINGS.spam_sensitivity = "medium";

export default function AIControlsPanel({ showToast, auditLog }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key, value").in("key", [...AI_TOGGLES.map(t => t.key), "dispute_prompt_version", "recommendation_prompt_version", "spam_sensitivity"]);
    const obj = { ...DEFAULT_SETTINGS };
    (data || []).forEach(r => {
      if (AI_TOGGLES.find(t => t.key === r.key)) obj[r.key] = r.value === true || r.value === "true";
      else obj[r.key] = r.value;
    });
    setSettings(obj);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({ key, value: String(value), updated_at: new Date().toISOString() }));
    await supabase.from("site_settings").upsert(upserts, { onConflict: "key" }).catch(() => {});
    auditLog?.("update_ai_settings", "ai_controls", null, "AI Controls");
    showToast("AI settings saved");
    setSaving(false);
  }

  function toggle(key) {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Controls</h2>
          <p className="text-sm text-gray-500 mt-0.5">Enable or disable AI features platform-wide</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={save} disabled={saving || loading} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: "#4f46e5" }}>
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      {/* Feature toggles */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Bot className="w-4 h-4 text-indigo-500" /> Feature Toggles</p>
        <div className="space-y-0 divide-y divide-gray-50">
          {AI_TOGGLES.map(t => (
            <div key={t.key} className="flex items-center justify-between py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" checked={!!settings[t.key]} onChange={() => toggle(t.key)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-checked:bg-indigo-500 rounded-full transition-colors relative">
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[t.key] ? "translate-x-5" : ""}`} />
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt versioning */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-700 mb-4">Prompt Versioning</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Dispute Resolution Prompt Version</label>
            <select value={settings.dispute_prompt_version || "v1"} onChange={e => setSettings(s => ({ ...s, dispute_prompt_version: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 bg-white">
              <option value="v1">v1 — Basic analysis</option>
              <option value="v2">v2 — With evidence weighting</option>
              <option value="v3">v3 — Full mediation mode</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Recommendation Prompt Version</label>
            <select value={settings.recommendation_prompt_version || "v1"} onChange={e => setSettings(s => ({ ...s, recommendation_prompt_version: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 bg-white">
              <option value="v1">v1 — Niche match only</option>
              <option value="v2">v2 — Niche + engagement rate</option>
              <option value="v3">v3 — Full scoring matrix</option>
            </select>
          </div>
        </div>
      </div>

      {/* Spam sensitivity */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-700 mb-4">Spam Detection Sensitivity</p>
        <div className="flex gap-3">
          {["low", "medium", "high"].map(level => (
            <button key={level} onClick={() => setSettings(s => ({ ...s, spam_sensitivity: level }))}
              className="flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all"
              style={settings.spam_sensitivity === level
                ? { backgroundColor: level === "high" ? "#ef4444" : level === "medium" ? "#d97706" : "#16a34a", color: "#fff" }
                : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
              {level}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {settings.spam_sensitivity === "low" && "Only flags obvious spam. Fewer false positives."}
          {settings.spam_sensitivity === "medium" && "Balanced. Recommended for most cases."}
          {settings.spam_sensitivity === "high" && "Aggressive flagging. May produce more false positives — review queue carefully."}
        </p>
      </div>
    </div>
  );
}
