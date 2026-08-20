import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Send, Save, RotateCcw } from "lucide-react";

const DEFAULTS = {
  max_pitches_per_month: 10,
  pitch_pack_price:      500,
  pitch_pack_size:       10,
  pitch_expiry_days:     0,
  refund_on_rejection:   true,
  refund_on_expiry:      true,
};

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: checked ? "#4f46e5" : "#cbd5e1" }}>
      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }} />
    </button>
  );
}

export default function PitchSettingsPanel({ showToast, auditLog }) {
  const [config, setConfig]   = useState({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("value").eq("key", "app_config").single();
    const cfg = data?.value ? JSON.parse(data.value) : {};
    setConfig({
      max_pitches_per_month: Number(cfg.max_pitches_per_month ?? DEFAULTS.max_pitches_per_month),
      pitch_pack_price:      Number(cfg.pitch_pack_price      ?? DEFAULTS.pitch_pack_price),
      pitch_pack_size:       Number(cfg.pitch_pack_size       ?? DEFAULTS.pitch_pack_size),
      pitch_expiry_days:     Number(cfg.pitch_expiry_days     ?? DEFAULTS.pitch_expiry_days),
      refund_on_rejection:   cfg.refund_on_rejection !== false,
      refund_on_expiry:      cfg.refund_on_expiry    !== false,
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    // Merge into the full app_config blob — never overwrite other fields
    const { data: existing } = await supabase.from("site_settings").select("value").eq("key", "app_config").single();
    const current = existing?.value ? JSON.parse(existing.value) : {};
    const merged = {
      ...current,
      max_pitches_per_month: config.max_pitches_per_month,
      pitch_pack_price:      config.pitch_pack_price,
      pitch_pack_size:       config.pitch_pack_size,
      pitch_expiry_days:     config.pitch_expiry_days,
      refund_on_rejection:   config.refund_on_rejection,
      refund_on_expiry:      config.refund_on_expiry,
    };
    await supabase.from("site_settings").upsert(
      { key: "app_config", value: JSON.stringify(merged), updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    auditLog?.("update_pitch_settings", "pitch_settings", null, "Pitch Settings");
    showToast("Pitch settings saved");
    setSaving(false);
  }

  function set(key, value) { setConfig(prev => ({ ...prev, [key]: value })); }

  const costPerPitch = config.pitch_pack_size > 0
    ? (config.pitch_pack_price / config.pitch_pack_size).toFixed(2)
    : "—";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pitch Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Control how creators use and purchase pitch credits</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={save} disabled={saving || loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: "#4f46e5" }}>
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Pitch Limits */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-500" /> Pitch Limits & Pricing
          </p>

          {[
            { key: "max_pitches_per_month", label: "Free Monthly Pitches",    desc: "Pitches every creator gets for free each month", min: 0, max: 100 },
            { key: "pitch_pack_size",       label: "Pitches Per Pack",         desc: "How many extra pitches in one purchased pack",  min: 1, max: 100 },
            { key: "pitch_pack_price",      label: "Pitch Pack Price (₦)",    desc: "Cost of one pack of extra pitches",             min: 0, prefix: "₦" },
            { key: "pitch_expiry_days",     label: "Pitch Expiry (days)",      desc: "Days until unused pitches expire (0 = never)",  min: 0 },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 mb-0.5 block">{f.label}</label>
              <p className="text-xs text-gray-400 mb-1">{f.desc}</p>
              <div className="relative">
                {f.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">{f.prefix}</span>}
                <input
                  type="number" value={config[f.key] ?? ""} min={f.min} max={f.max}
                  onChange={e => set(f.key, Number(e.target.value))}
                  className={`w-full py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 ${f.prefix ? "pl-6 pr-3" : "px-3"}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {/* Refund Rules */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <p className="text-sm font-bold text-gray-700">Refund Rules</p>
            {[
              { key: "refund_on_rejection", label: "Refund on Rejection",  desc: "Return pitch credit if brand rejects the pitch" },
              { key: "refund_on_expiry",    label: "Refund on Expiry",     desc: "Return pitch credit if campaign expires unfilled" },
            ].map(f => (
              <div key={f.key} className="flex items-start gap-3">
                <Toggle checked={!!config[f.key]} onChange={v => set(f.key, v)} />
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
                ["Free monthly pitches", config.max_pitches_per_month],
                ["Pack size",            `${config.pitch_pack_size} pitches`],
                ["Pack price",           `₦${Number(config.pitch_pack_price).toLocaleString()}`],
                ["Cost per pitch",       `₦${costPerPitch}`],
                ["Pitch expiry",         config.pitch_expiry_days > 0 ? `${config.pitch_expiry_days} days` : "Never"],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <p className="text-xs text-indigo-600">{l}</p>
                  <p className="text-xs font-bold text-indigo-800">{v}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-indigo-400 mt-3">
              These settings sync to mobile via the app_config blob in site_settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
