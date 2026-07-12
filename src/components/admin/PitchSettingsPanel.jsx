import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Send, Save, RotateCcw } from "lucide-react";

const FIELDS = [
  { key: "monthly_free_pitches",   label: "Monthly Free Pitches",       desc: "Pitches every creator gets for free each month", type: "number", min: 0, max: 100 },
  { key: "pitch_pack_price",       label: "Pitch Pack Price (₦)",        desc: "Cost of one pack of extra pitches", type: "number", min: 0 },
  { key: "pitch_pack_size",        label: "Pitches Per Pack",            desc: "How many pitches in one purchased pack", type: "number", min: 1, max: 100 },
  { key: "max_banked_pitches",     label: "Max Banked Pitches",          desc: "Maximum pitches a creator can accumulate", type: "number", min: 0, max: 1000 },
  { key: "pitch_expiry_days",      label: "Pitch Expiry (days)",         desc: "Days until unused pitches expire (0 = no expiry)", type: "number", min: 0 },
  { key: "refund_on_rejection",    label: "Refund Pitch on Rejection",   desc: "Return pitch credit if brand rejects the pitch", type: "boolean" },
  { key: "refund_on_expiry",       label: "Refund Pitch on Expiry",      desc: "Return pitch credit if campaign expires unfilled", type: "boolean" },
  { key: "allow_pitch_transfer",   label: "Allow Pitch Transfer",        desc: "Let creators give pitches to other creators", type: "boolean" },
];

const DEFAULTS = {
  monthly_free_pitches: 5,
  pitch_pack_price: 2000,
  pitch_pack_size: 10,
  max_banked_pitches: 100,
  pitch_expiry_days: 0,
  refund_on_rejection: true,
  refund_on_expiry: true,
  allow_pitch_transfer: false,
};

export default function PitchSettingsPanel({ showToast, auditLog }) {
  const [config, setConfig]   = useState({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const keys = FIELDS.map(f => `pitch_${f.key}`);
    const { data } = await supabase.from("site_settings").select("key, value").in("key", keys);
    const obj = { ...DEFAULTS };
    (data || []).forEach(r => {
      const key = r.key.replace("pitch_", "");
      const field = FIELDS.find(f => f.key === key);
      if (!field) return;
      if (field.type === "number") obj[key] = Number(r.value);
      else if (field.type === "boolean") obj[key] = r.value === "true";
    });
    setConfig(obj);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const upserts = Object.entries(config).map(([key, value]) => ({ key: `pitch_${key}`, value: String(value), updated_at: new Date().toISOString() }));
    await supabase.from("site_settings").upsert(upserts, { onConflict: "key" }).catch(() => {});
    auditLog?.("update_pitch_settings", "pitch_settings", null, "Pitch Settings");
    showToast("Pitch settings saved");
    setSaving(false);
  }

  function set(key, value) { setConfig(prev => ({ ...prev, [key]: value })); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pitch Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Control how creators use and earn pitch credits</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={save} disabled={saving || loading} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: "#4f46e5" }}>
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><Send className="w-4 h-4 text-indigo-500" /> Pitch Limits</p>
          {FIELDS.filter(f => f.type === "number").map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 mb-0.5 block">{f.label}</label>
              <p className="text-xs text-gray-400 mb-1">{f.desc}</p>
              <input type="number" value={config[f.key] ?? ""} min={f.min} max={f.max}
                onChange={e => set(f.key, Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <p className="text-sm font-bold text-gray-700">Refund Rules</p>
            {FIELDS.filter(f => f.type === "boolean").map(f => (
              <div key={f.key} className="flex items-start gap-3">
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                  <input type="checkbox" checked={!!config[f.key]} onChange={e => set(f.key, e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-checked:bg-indigo-500 rounded-full transition-colors relative">
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config[f.key] ? "translate-x-5" : ""}`} />
                  </div>
                </label>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                  <p className="text-xs text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
            <p className="text-sm font-bold text-indigo-700 mb-3">Cost Preview</p>
            <div className="space-y-2">
              {[
                ["Free monthly pitches", config.monthly_free_pitches],
                ["Pack size",            config.pitch_pack_size + " pitches"],
                ["Pack price",           `₦${Number(config.pitch_pack_price).toLocaleString()}`],
                ["Cost per pitch",       config.pitch_pack_size > 0 ? `₦${(Number(config.pitch_pack_price) / Number(config.pitch_pack_size)).toFixed(2)}` : "—"],
                ["Max banked",           config.max_banked_pitches + " pitches"],
                ["Expiry",               config.pitch_expiry_days > 0 ? `${config.pitch_expiry_days} days` : "Never"],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <p className="text-xs text-indigo-600">{l}</p>
                  <p className="text-xs font-bold text-indigo-800">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
