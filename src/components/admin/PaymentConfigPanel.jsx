import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CreditCard, Save, RotateCcw } from "lucide-react";

const CONFIG_FIELDS = [
  { key: "commission_pct",          label: "Commission %",                   type: "number", min: 0, max: 100, step: 0.1, suffix: "%" },
  { key: "withdrawal_fee",          label: "Withdrawal Fee (₦)",             type: "number", min: 0 },
  { key: "vat_pct",                 label: "VAT %",                          type: "number", min: 0, max: 30, step: 0.1, suffix: "%" },
  { key: "min_withdrawal",          label: "Minimum Withdrawal (₦)",         type: "number", min: 0 },
  { key: "max_withdrawal_daily",    label: "Max Withdrawal per Day (₦)",     type: "number", min: 0 },
  { key: "escrow_auto_release_days",label: "Escrow Auto-Release After (days)",type: "number", min: 0, max: 90 },
  { key: "withdrawal_processing_days", label: "Withdrawal Processing (days)", type: "number", min: 0, max: 14 },
  { key: "min_collab_amount",       label: "Minimum Collab Amount (₦)",      type: "number", min: 0 },
  { key: "gateway_primary",         label: "Primary Payment Gateway",        type: "select", options: ["paystack", "monnify", "flutterwave"] },
  { key: "gateway_fallback",        label: "Fallback Gateway",               type: "select", options: ["paystack", "monnify", "flutterwave", "none"] },
  { key: "gateway_retry_attempts",  label: "Gateway Retry Attempts",         type: "number", min: 0, max: 5 },
  { key: "bank_verification_required", label: "Bank Verification Required",  type: "boolean" },
  { key: "auto_release_enabled",    label: "Auto-Release Escrow Enabled",    type: "boolean" },
];

const DEFAULT_VALUES = {
  commission_pct: 10,
  withdrawal_fee: 50,
  vat_pct: 7.5,
  min_withdrawal: 5000,
  max_withdrawal_daily: 500000,
  escrow_auto_release_days: 14,
  withdrawal_processing_days: 2,
  min_collab_amount: 20000,
  gateway_primary: "paystack",
  gateway_fallback: "monnify",
  gateway_retry_attempts: 3,
  bank_verification_required: true,
  auto_release_enabled: true,
};

export default function PaymentConfigPanel({ showToast, auditLog }) {
  const [config, setConfig]   = useState({ ...DEFAULT_VALUES });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const keys = CONFIG_FIELDS.map(f => `pay_${f.key}`);
    const { data } = await supabase.from("site_settings").select("key, value").in("key", keys);
    const obj = { ...DEFAULT_VALUES };
    (data || []).forEach(r => {
      const key = r.key.replace("pay_", "");
      const field = CONFIG_FIELDS.find(f => f.key === key);
      if (!field) return;
      if (field.type === "number") obj[key] = Number(r.value);
      else if (field.type === "boolean") obj[key] = r.value === "true";
      else obj[key] = r.value;
    });
    setConfig(obj);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const upserts = Object.entries(config).map(([key, value]) => ({ key: `pay_${key}`, value: String(value), updated_at: new Date().toISOString() }));
    await supabase.from("site_settings").upsert(upserts, { onConflict: "key" }).catch(() => {});
    auditLog?.("update_payment_config", "payment_config", null, "Payment Configuration");
    showToast("Payment configuration saved");
    setSaving(false);
  }

  function set(key, value) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payment Configuration</h2>
          <p className="text-sm text-gray-500 mt-0.5">Fees, commissions, gateways and escrow settings</p>
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
        {/* Fees & Commissions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><CreditCard className="w-4 h-4 text-indigo-500" /> Fees & Commissions</p>
          {CONFIG_FIELDS.filter(f => ["commission_pct","vat_pct","withdrawal_fee","min_withdrawal","max_withdrawal_daily","min_collab_amount"].includes(f.key)).map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{f.label}</label>
              <div className="relative">
                <input type="number" value={config[f.key] ?? ""} min={f.min} max={f.max} step={f.step || 1}
                  onChange={e => set(f.key, Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 pr-8" />
                {f.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">{f.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Escrow & Gateways */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <p className="text-sm font-bold text-gray-700">Escrow & Gateways</p>
          {CONFIG_FIELDS.filter(f => ["escrow_auto_release_days","withdrawal_processing_days","gateway_primary","gateway_fallback","gateway_retry_attempts","bank_verification_required","auto_release_enabled"].includes(f.key)).map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{f.label}</label>
              {f.type === "select" ? (
                <select value={config[f.key] || ""} onChange={e => set(f.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 bg-white capitalize">
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === "boolean" ? (
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={!!config[f.key]} onChange={e => set(f.key, e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-indigo-500 rounded-full transition-colors relative">
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config[f.key] ? "translate-x-5" : ""}`} />
                    </div>
                  </label>
                  <span className="text-sm text-gray-600">{config[f.key] ? "Enabled" : "Disabled"}</span>
                </div>
              ) : (
                <input type="number" value={config[f.key] ?? ""} min={f.min} max={f.max}
                  onChange={e => set(f.key, Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
        <p className="text-sm font-bold text-indigo-700 mb-3">Fee Preview — ₦100,000 collaboration</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Brand Pays",        value: `₦${(100000).toLocaleString()}` },
            { label: "Platform Commission",value: `₦${(100000 * (Number(config.commission_pct) / 100)).toLocaleString()}` },
            { label: "VAT",               value: `₦${(100000 * (Number(config.commission_pct) / 100) * (Number(config.vat_pct) / 100)).toLocaleString()}` },
            { label: "Creator Receives",  value: `₦${(100000 - 100000 * (Number(config.commission_pct) / 100) - 100000 * (Number(config.commission_pct) / 100) * (Number(config.vat_pct) / 100)).toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3">
              <p className="text-xs text-indigo-500 font-semibold mb-0.5">{s.label}</p>
              <p className="text-base font-black text-indigo-800">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
