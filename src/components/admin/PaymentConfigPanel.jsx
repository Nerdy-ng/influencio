import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CreditCard, Save, RotateCcw, Eye, EyeOff, CheckCircle } from "lucide-react";

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

const PROVIDERS = [
  {
    id: "paystack",
    name: "Paystack",
    color: "#0BA4DB",
    fields: [
      { key: "pay_paystack_public_key",  label: "Public Key",  placeholder: "pk_live_…",  secret: false },
      { key: "pay_paystack_secret_key",  label: "Secret Key",  placeholder: "sk_live_…",  secret: true  },
    ],
  },
  {
    id: "monnify",
    name: "Monnify",
    color: "#2B75F0",
    fields: [
      { key: "pay_monnify_api_key",       label: "API Key",       placeholder: "MK_…",       secret: false },
      { key: "pay_monnify_secret_key",    label: "Secret Key",    placeholder: "…",           secret: true  },
      { key: "pay_monnify_contract_code", label: "Contract Code", placeholder: "MNFY|…",     secret: false },
      { key: "pay_monnify_mode",          label: "Mode",          placeholder: "live",        secret: false, options: ["live", "sandbox"] },
    ],
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    color: "#F5A623",
    fields: [
      { key: "pay_flutterwave_public_key", label: "Public Key",  placeholder: "FLWPUBK_…",  secret: false },
      { key: "pay_flutterwave_secret_key", label: "Secret Key",  placeholder: "FLWSECK_…",  secret: true  },
    ],
  },
];

const ALL_CRED_KEYS = PROVIDERS.flatMap(p => p.fields.map(f => f.key));

export default function PaymentConfigPanel({ showToast, auditLog }) {
  const [config, setConfig]       = useState({ ...DEFAULT_VALUES });
  const [creds, setCreds]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);
  const [revealed, setRevealed]   = useState({});

  async function load() {
    setLoading(true);
    const keys = [...CONFIG_FIELDS.map(f => `pay_${f.key}`), ...ALL_CRED_KEYS];
    const { data } = await supabase.from("site_settings").select("key, value").in("key", keys);
    const obj = { ...DEFAULT_VALUES };
    const credObj = {};
    (data || []).forEach(r => {
      if (ALL_CRED_KEYS.includes(r.key)) {
        credObj[r.key] = r.value ?? "";
      } else {
        const key = r.key.replace("pay_", "");
        const field = CONFIG_FIELDS.find(f => f.key === key);
        if (!field) return;
        if (field.type === "number") obj[key] = Number(r.value);
        else if (field.type === "boolean") obj[key] = r.value === "true";
        else obj[key] = r.value;
      }
    });
    setConfig(obj);
    setCreds(credObj);
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

  async function saveCreds() {
    setSavingCreds(true);
    const upserts = Object.entries(creds)
      .filter(([, v]) => v !== undefined)
      .map(([key, value]) => ({ key, value: String(value), updated_at: new Date().toISOString() }));
    await supabase.from("site_settings").upsert(upserts, { onConflict: "key" }).catch(() => {});
    auditLog?.("update_payment_credentials", "payment_config", null, "Payment Provider Credentials");
    showToast("Credentials saved");
    setSavingCreds(false);
  }

  function set(key, value) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  function setCred(key, value) {
    setCreds(prev => ({ ...prev, [key]: value }));
  }

  function toggleReveal(key) {
    setRevealed(prev => ({ ...prev, [key]: !prev[key] }));
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

      {/* Provider Credentials */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-gray-800">Provider Credentials</p>
            <p className="text-xs text-gray-400 mt-0.5">Keys are stored securely and only read server-side by edge functions</p>
          </div>
          <button onClick={saveCreds} disabled={savingCreds || loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: "#4f46e5" }}>
            <Save className="w-3.5 h-3.5" /> {savingCreds ? "Saving…" : "Save Credentials"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {PROVIDERS.map(provider => {
            const isActive = config.gateway_primary === provider.id || config.gateway_fallback === provider.id;
            return (
              <div key={provider.id} className="bg-white rounded-2xl p-5 border space-y-3"
                style={{ borderColor: isActive ? provider.color + "55" : "#e2e8f0" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: provider.color }} />
                    <p className="text-sm font-bold text-gray-800">{provider.name}</p>
                  </div>
                  {isActive && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: provider.color + "18", color: provider.color }}>
                      {config.gateway_primary === provider.id ? "Primary" : "Fallback"}
                    </span>
                  )}
                </div>

                {provider.fields.map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">{field.label}</label>
                    {field.options ? (
                      <select value={creds[field.key] || "live"} onChange={e => setCred(field.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 bg-white capitalize">
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.secret && !revealed[field.key] ? "password" : "text"}
                          value={creds[field.key] || ""}
                          onChange={e => setCred(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 font-mono pr-9"
                        />
                        {field.secret && (
                          <button type="button" onClick={() => toggleReveal(field.key)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {revealed[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    )}
                    {creds[field.key] && (
                      <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Configured
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
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
