import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CreditCard, Save, RotateCcw, Info } from "lucide-react";

const DEFAULT_CONFIG = {
  commission_pct:          10,
  escrow_auto_release_days: 14,
  min_creator_rate:        20000,
  min_withdrawal:          5000,
  min_collab_amount:       20000,
  auto_release_enabled:    true,
  bank_verification_required: true,
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

export default function PaymentConfigPanel({ showToast, auditLog }) {
  const [config, setConfig]   = useState({ ...DEFAULT_CONFIG });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("value").eq("key", "app_config").single();
    const cfg = data?.value ? JSON.parse(data.value) : {};
    setConfig({
      commission_pct:           Number(cfg.platform_commission_pct   ?? DEFAULT_CONFIG.commission_pct),
      escrow_auto_release_days: Number(cfg.auto_release_days         ?? DEFAULT_CONFIG.escrow_auto_release_days),
      min_creator_rate:         Number(cfg.min_creator_rate          ?? DEFAULT_CONFIG.min_creator_rate),
      min_withdrawal:           Number(cfg.min_withdrawal            ?? DEFAULT_CONFIG.min_withdrawal),
      min_collab_amount:        Number(cfg.min_collab_amount         ?? DEFAULT_CONFIG.min_collab_amount),
      auto_release_enabled:     cfg.auto_release_enabled !== false,
      bank_verification_required: cfg.bank_verification_required !== false,
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    // Load full blob so we never destroy other fields (pitch config etc.)
    const { data: existing } = await supabase.from("site_settings").select("value").eq("key", "app_config").single();
    const current = existing?.value ? JSON.parse(existing.value) : {};
    const merged = {
      ...current,
      platform_commission_pct:    Number(config.commission_pct),
      escrow_release_delay_hours: Number(config.escrow_auto_release_days) * 24,
      auto_release_days:          Number(config.escrow_auto_release_days),
      min_creator_rate:           Number(config.min_creator_rate),
      min_withdrawal:             Number(config.min_withdrawal),
      min_collab_amount:          Number(config.min_collab_amount),
      auto_release_enabled:       config.auto_release_enabled,
      bank_verification_required: config.bank_verification_required,
    };
    await supabase.from("site_settings").upsert(
      { key: "app_config", value: JSON.stringify(merged), updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    auditLog?.("update_payment_config", "payment_config", null, "Payment Configuration");
    showToast("Payment configuration saved");
    setSaving(false);
  }

  function set(key, value) { setConfig(prev => ({ ...prev, [key]: value })); }

  const exampleAmount = 100000;
  const commission    = exampleAmount * (config.commission_pct / 100);
  const creatorGets   = exampleAmount - commission;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payment Configuration</h2>
          <p className="text-sm text-gray-500 mt-0.5">Commission, escrow timing, and platform minimums</p>
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

      {/* Payment stack info */}
      <div className="rounded-2xl p-4 border border-blue-100 bg-blue-50 flex gap-3">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 space-y-0.5">
          <p className="font-bold text-blue-800">Payment Stack: Rubies BaaS + Interswitch</p>
          <p>Wallet funding and escrow use Rubies internal transfers. Card payments use Interswitch PaymentEngine.</p>
          <p>API keys are stored as Supabase Edge Function Secrets — not editable here. Update them in the Supabase dashboard under Edge Functions → Secrets.</p>
          <p className="font-semibold mt-1">Secrets required: RUBIES_SK, RUBIES_ESCROW_ACCOUNT, RUBIES_WEBHOOK_SECRET, BRANDIOR_ADMIN_API_KEY</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Fees & Commissions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" /> Fees & Commissions
          </p>

          {[
            { key: "commission_pct",    label: "Platform Commission (%)",    suffix: "%",  min: 0, max: 50, step: 0.5 },
            { key: "min_creator_rate",  label: "Minimum Creator Rate (₦)",   prefix: "₦", min: 0 },
            { key: "min_withdrawal",    label: "Minimum Withdrawal (₦)",     prefix: "₦", min: 0 },
            { key: "min_collab_amount", label: "Minimum Collab Amount (₦)",  prefix: "₦", min: 0 },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{f.label}</label>
              <div className="relative">
                {f.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">{f.prefix}</span>}
                <input
                  type="number" value={config[f.key] ?? ""} min={f.min} max={f.max} step={f.step || 1}
                  onChange={e => set(f.key, Number(e.target.value))}
                  className={`w-full py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 ${f.prefix ? "pl-6 pr-3" : "px-3"} ${f.suffix ? "pr-8" : ""}`}
                />
                {f.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">{f.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Escrow Settings */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <p className="text-sm font-bold text-gray-700">Escrow Settings</p>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Auto-Release After (days)</label>
            <input
              type="number" value={config.escrow_auto_release_days ?? ""} min={0} max={90}
              onChange={e => set("escrow_auto_release_days", Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              = {Number(config.escrow_auto_release_days) * 24} hours · Collab-release edge function uses this
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { key: "auto_release_enabled",       label: "Auto-Release Escrow",           desc: "Automatically release escrow to creator after the delay" },
              { key: "bank_verification_required",  label: "Bank Verification Required",    desc: "Verify creator bank account before allowing withdrawal" },
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
        </div>
      </div>

      {/* Fee Preview */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
        <p className="text-sm font-bold text-indigo-700 mb-3">Fee Preview — ₦100,000 collaboration</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Brand Pays",          value: `₦${exampleAmount.toLocaleString()}` },
            { label: `Commission (${config.commission_pct}%)`, value: `₦${commission.toLocaleString()}` },
            { label: "Creator Receives",    value: `₦${creatorGets.toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3">
              <p className="text-xs text-indigo-500 font-semibold mb-0.5">{s.label}</p>
              <p className="text-base font-black text-indigo-800">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-indigo-500 mt-3">
          Note: ₦{commission.toLocaleString()} goes to Brandior platform fee. Creator payout is transferred from Rubies escrow to their Rubies wallet.
        </p>
      </div>
    </div>
  );
}
