import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Bell, Send, RotateCcw, Clock, Users } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');

const AUDIENCE_OPTIONS = [
  { key: "all",     label: "All Users" },
  { key: "creator", label: "Creators Only" },
  { key: "brand",   label: "Brands Only" },
  { key: "individual", label: "Specific User" },
];

export default function NotificationsPanel({ showToast, auditLog }) {
  const [sent, setSent]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState(false);

  // Compose form
  const [title, setTitle]         = useState("");
  const [body, setBody]           = useState("");
  const [audience, setAudience]   = useState("all");
  const [niche, setNiche]         = useState("");
  const [city, setCity]           = useState("");
  const [userId, setUserId]       = useState("");
  const [deepLink, setDeepLink]   = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [imageUrl, setImageUrl]   = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(50).catch(() => ({ data: [] }));
    setSent(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSend() {
    if (!title.trim() || !body.trim()) { showToast("Title and body required", "error"); return; }
    setBusy(true);
    const payload = {
      title: stripInjection(title),
      body:  stripInjection(body),
      audience,
      niche:      niche || null,
      city:       city  || null,
      user_id:    audience === "individual" ? userId || null : null,
      deep_link:  deepLink || null,
      image_url:  imageUrl || null,
      schedule_at: scheduleAt || null,
      status:     scheduleAt ? "scheduled" : "sent",
      created_at: new Date().toISOString(),
    };
    await supabase.from("admin_notifications").insert(payload).catch(() => {});
    // If not scheduled, trigger via edge function or direct insert
    if (!scheduleAt) {
      await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
    auditLog?.("send_notification", "notification", null, title, { audience, niche, city });
    showToast(scheduleAt ? `Notification scheduled for ${scheduleAt}` : "Notification sent!");
    setTitle(""); setBody(""); setNiche(""); setCity(""); setUserId(""); setDeepLink(""); setScheduleAt(""); setImageUrl("");
    load();
    setBusy(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-0.5">Send targeted push notifications to users</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Compose */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><Bell className="w-4 h-4 text-indigo-500" /> Compose Notification</p>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Title *</label>
            <input value={title} onChange={e => setTitle(stripInjection(e.target.value))} placeholder="Notification title"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Message *</label>
            <textarea rows={3} value={body} onChange={e => setBody(stripInjection(e.target.value))} placeholder="Notification body…"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Audience</label>
            <div className="flex gap-1.5 flex-wrap">
              {AUDIENCE_OPTIONS.map(a => (
                <button key={a.key} onClick={() => setAudience(a.key)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={audience === a.key ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {audience === "individual" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">User ID or Handle</label>
              <input value={userId} onChange={e => setUserId(stripInjection(e.target.value))} placeholder="user-uuid or @handle"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {audience !== "individual" && <>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Filter by Niche</label>
                <input value={niche} onChange={e => setNiche(stripInjection(e.target.value))} placeholder="e.g. Fashion"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Filter by City</label>
                <input value={city} onChange={e => setCity(stripInjection(e.target.value))} placeholder="e.g. Lagos"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
            </>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Deep Link (optional)</label>
            <input value={deepLink} onChange={e => setDeepLink(stripInjection(e.target.value))} placeholder="e.g. brandior://wallet"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Image URL (optional)</label>
            <input value={imageUrl} onChange={e => setImageUrl(stripInjection(e.target.value))} placeholder="https://…/image.jpg"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Schedule (optional)</label>
            <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
          </div>

          <button onClick={handleSend} disabled={busy || !title.trim() || !body.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
            style={{ backgroundColor: "#4f46e5" }}>
            {scheduleAt ? <><Clock className="w-4 h-4" /> Schedule</> : <><Send className="w-4 h-4" /> Send Now</>}
          </button>
        </div>

        {/* Sent history */}
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 640 }}>
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Sent History</p>
          {loading ? <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
          : sent.length === 0 ? <p className="text-sm text-gray-300 py-8 text-center">No notifications sent yet</p>
          : sent.map(n => (
            <div key={n.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 capitalize"
                  style={n.status === "sent" ? { backgroundColor: "#dcfce7", color: "#16a34a" } : n.status === "scheduled" ? { backgroundColor: "#fef3c7", color: "#d97706" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
                  {n.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{n.body}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Users className="w-3 h-3" />
                <span className="capitalize">{n.audience}{n.niche ? ` · ${n.niche}` : ""}{n.city ? ` · ${n.city}` : ""}</span>
                <span className="ml-auto">{new Date(n.created_at).toLocaleString("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
