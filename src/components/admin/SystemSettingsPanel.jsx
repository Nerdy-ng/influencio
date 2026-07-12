import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Settings, Save, RotateCcw, AlertTriangle, Server } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');

const BOOL_SETTINGS = [
  { key: "maintenance_mode",     label: "Maintenance Mode",          desc: "Show maintenance page to all users", danger: true },
  { key: "registration_enabled", label: "User Registration",         desc: "Allow new users to sign up" },
  { key: "creator_reg_enabled",  label: "Creator Registration",      desc: "Allow new creators to register" },
  { key: "brand_reg_enabled",    label: "Brand Registration",        desc: "Allow new brands to register" },
  { key: "pitching_enabled",     label: "Pitching System",           desc: "Allow creators to submit pitches" },
  { key: "collabs_enabled",      label: "Collaboration System",      desc: "Allow new collaborations to be created" },
  { key: "withdrawals_enabled",  label: "Withdrawals",               desc: "Allow creator withdrawal requests" },
  { key: "wallet_topup_enabled", label: "Wallet Top-up",             desc: "Allow brands to top up wallets" },
];

const TEXT_SETTINGS = [
  { key: "min_app_version_ios",     label: "Min iOS App Version",     placeholder: "1.0.0" },
  { key: "min_app_version_android", label: "Min Android App Version", placeholder: "1.0.0" },
  { key: "maintenance_message",     label: "Maintenance Message",     placeholder: "We're doing maintenance. Back shortly!" },
  { key: "storage_bucket",          label: "Storage Bucket Name",     placeholder: "brandior-uploads" },
  { key: "support_email",           label: "Support Email",           placeholder: "support@brandior.africa" },
];

export default function SystemSettingsPanel({ showToast, auditLog }) {
  const [settings, setSettings] = useState({});
  const [cronStatus, setCronStatus] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState("general");

  async function load() {
    setLoading(true);
    const allKeys = [...BOOL_SETTINGS.map(s => `sys_${s.key}`), ...TEXT_SETTINGS.map(s => `sys_${s.key}`)];
    const [{ data: sData }, { data: logs }] = await Promise.all([
      supabase.from("site_settings").select("key, value").in("key", allKeys),
      supabase.from("webhook_logs").select("*").order("created_at", { ascending: false }).limit(20).catch(() => ({ data: [] })),
    ]);
    const obj = {};
    BOOL_SETTINGS.forEach(s => { obj[s.key] = false; });
    TEXT_SETTINGS.forEach(s => { obj[s.key] = ""; });
    (sData || []).forEach(r => {
      const key = r.key.replace("sys_", "");
      const boolSetting = BOOL_SETTINGS.find(s => s.key === key);
      obj[key] = boolSetting ? r.value === "true" : r.value;
    });
    setSettings(obj);
    setWebhookLogs(logs || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const upserts = [
      ...BOOL_SETTINGS.map(s => ({ key: `sys_${s.key}`, value: String(!!settings[s.key]), updated_at: new Date().toISOString() })),
      ...TEXT_SETTINGS.map(s => ({ key: `sys_${s.key}`, value: stripInjection(settings[s.key] || ""), updated_at: new Date().toISOString() })),
    ];
    await supabase.from("site_settings").upsert(upserts, { onConflict: "key" }).catch(() => {});
    auditLog?.("update_system_settings", "system", null, "System Settings");
    showToast("System settings saved");
    setSaving(false);
  }

  function set(key, value) { setSettings(prev => ({ ...prev, [key]: value })); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Platform controls, feature flags, and configuration</p>
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

      {/* Maintenance warning */}
      {settings.maintenance_mode && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-700">Maintenance mode is ON — users cannot access the platform</p>
        </div>
      )}

      <div className="flex gap-1.5 mb-0">
        {["general", "feature_flags", "webhooks"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
            style={tab === t ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><Server className="w-4 h-4 text-indigo-500" /> General Configuration</p>
          {TEXT_SETTINGS.map(s => (
            <div key={s.key}>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{s.label}</label>
              <input value={settings[s.key] || ""} onChange={e => set(s.key, e.target.value)}
                placeholder={s.placeholder}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
            </div>
          ))}
        </div>
      )}

      {tab === "feature_flags" && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-indigo-500" /> Feature Flags</p>
          <div className="divide-y divide-gray-50">
            {BOOL_SETTINGS.map(s => (
              <div key={s.key} className="flex items-center justify-between py-4 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800" style={s.danger && settings[s.key] ? { color: "#dc2626" } : {}}>{s.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={!!settings[s.key]} onChange={e => set(s.key, e.target.checked)} className="sr-only peer" />
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${!!settings[s.key] ? (s.danger ? "bg-red-500" : "bg-indigo-500") : "bg-gray-200"}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[s.key] ? "translate-x-5" : ""}`} />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "webhooks" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-700">Recent Webhook Events</p>
            </div>
            {webhookLogs.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-300">No webhook logs</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Time</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {webhookLogs.map((log, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-700">{log.event || log.event_type || "—"}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 capitalize">{log.source || log.gateway || "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={log.status === "success" || log.processed ? { backgroundColor: "#dcfce7", color: "#16a34a" } : { backgroundColor: "#fee2e2", color: "#dc2626" }}>
                          {log.status || (log.processed ? "processed" : "failed")}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
