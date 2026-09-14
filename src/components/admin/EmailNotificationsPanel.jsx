import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Mail, Save, RefreshCw } from "lucide-react";

const EMAIL_TYPES = [
  {
    group: "Creators",
    items: [
      { key: "creator_onboarding", label: "Welcome email",         desc: "Sent when a creator creates an account" },
      { key: "collab_hired",       label: "Hired notification",    desc: "Creator gets hired for a collab" },
      { key: "payment_released",   label: "Payment released",      desc: "Escrow funds released to creator's wallet" },
      { key: "collab_completed",   label: "Collab completed",      desc: "Sent to creator when a collab is marked done" },
      { key: "payout_sent",        label: "Payout sent",           desc: "Creator withdraws earnings to bank account" },
      { key: "kyc_approved",       label: "KYC approved",          desc: "Identity verification successful" },
      { key: "kyc_rejected",       label: "KYC rejected",          desc: "Identity verification failed" },
      { key: "deadline_reminder",  label: "Deadline reminder",     desc: "Reminder sent 3 days before collab deadline" },
      { key: "new_brief",          label: "New brief received",    desc: "Brand sends a custom offer directly to creator" },
    ],
  },
  {
    group: "Brands",
    items: [
      { key: "brand_onboarding",   label: "Welcome email",         desc: "Sent when a brand creates an account" },
      { key: "new_proposal",       label: "New proposal",          desc: "Creator applies to a brand's collab posting" },
      { key: "collab_refunded",    label: "Refund processed",      desc: "Escrow payment refunded to brand wallet" },
    ],
  },
  {
    group: "Platform",
    items: [
      { key: "announcement",       label: "Announcements",         desc: "Admin-sent platform-wide announcements" },
      { key: "newsletter",         label: "Newsletter",            desc: "Marketing newsletters sent from admin panel" },
      { key: "waitlist_welcome",   label: "Waitlist welcome",      desc: "Sent when someone joins the waitlist" },
    ],
  },
];

const ALL_KEYS = EMAIL_TYPES.flatMap(g => g.items.map(i => `email_${i.key}`));

export default function EmailNotificationsPanel({ showToast, auditLog }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [dirty, setDirty]       = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key, value").in("key", ALL_KEYS);
    const obj = {};
    ALL_KEYS.forEach(k => { obj[k] = true; }); // default all to enabled
    (data || []).forEach(r => { obj[r.key] = r.value !== "false" && r.value !== false; });
    setSettings(obj);
    setDirty(false);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function toggle(key) {
    setSettings(prev => ({ ...prev, [`email_${key}`]: !prev[`email_${key}`] }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));
    await supabase.from("site_settings").upsert(upserts, { onConflict: "key" });
    auditLog?.("update_email_notifications", "email_settings", null, "Email Notifications");
    showToast?.("Email notification settings saved");
    setDirty(false);
    setSaving(false);
  }

  const enabledCount  = Object.values(settings).filter(Boolean).length;
  const totalCount    = ALL_KEYS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Email Notifications</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Control which transactional emails are sent to users. Disabled emails are silently skipped — no queuing.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-purple-700 transition">
            <Save size={14} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <Mail size={16} className="text-purple-600 shrink-0" />
        <span className="text-sm text-gray-600">
          <span className="font-bold text-gray-900">{enabledCount}</span> of{" "}
          <span className="font-bold text-gray-900">{totalCount}</span> email types are currently enabled
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => {
              const all = {};
              ALL_KEYS.forEach(k => { all[k] = true; });
              setSettings(all);
              setDirty(true);
            }}
            className="text-xs text-purple-600 font-semibold hover:underline">
            Enable all
          </button>
          <span className="text-gray-300">·</span>
          <button
            onClick={() => {
              const all = {};
              ALL_KEYS.forEach(k => { all[k] = false; });
              setSettings(all);
              setDirty(true);
            }}
            className="text-xs text-red-500 font-semibold hover:underline">
            Disable all
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading settings…</div>
      ) : (
        <div className="space-y-6">
          {EMAIL_TYPES.map(group => (
            <div key={group.group}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {group.group}
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {group.items.map(item => {
                  const enabled = settings[`email_${item.key}`] !== false;
                  return (
                    <div key={item.key} className="flex items-center gap-4 px-5 py-4">
                      {/* Toggle */}
                      <button
                        onClick={() => toggle(item.key)}
                        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
                          enabled ? "bg-purple-600" : "bg-gray-200"
                        }`}>
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            enabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                          <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {item.key}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>

                      {/* Status chip */}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                        enabled
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}>
                        {enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Changes take effect immediately — no redeploy needed. Emails that are already in flight are not affected.
      </p>
    </div>
  );
}
