import { useState, useEffect, useCallback } from "react";
import { Send, Users, CheckCircle, AlertTriangle, Bell, Clock, RotateCcw } from "lucide-react";
import { supabase } from "../../lib/supabase";

const TARGETS = [
  { id: "all",      label: "Everyone",      desc: "All users with push enabled" },
  { id: "brand",    label: "Brands only",   desc: "All brand accounts" },
  { id: "creator",  label: "Creators only", desc: "All creator / talent accounts" },
  { id: "user",     label: "Specific user", desc: "Send to one person by email" },
];

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function PushNotificationPanel({ showToast, auditLog }) {
  const [target,    setTarget]    = useState("all");
  const [email,     setEmail]     = useState("");
  const [title,     setTitle]     = useState("");
  const [body,      setBody]      = useState("");
  const [sending,   setSending]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [history,   setHistory]   = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("compose");

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, created_at, user_id")
      .eq("type", "admin")
      .order("created_at", { ascending: false })
      .limit(100);
    setHistory(data ?? []);
    setHistLoading(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  async function fetchTokens() {
    let query = supabase
      .from("profiles")
      .select("id, full_name, push_token, role")
      .not("push_token", "is", null);

    if (target === "brand") {
      query = query.in("role", ["brand", "Brand"]);
    } else if (target === "creator") {
      query = query.in("role", ["creator", "Talent", "talent"]);
    } else if (target === "user") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, push_token, role")
        .ilike("email", email.trim())
        .not("push_token", "is", null)
        .single();
      return profile ? [profile] : [];
    }

    const { data } = await query;
    return data ?? [];
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      showToast?.("Title and message are required.");
      return;
    }
    if (target === "user" && !email.trim()) {
      showToast?.("Enter a user email.");
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const profiles = await fetchTokens();
      if (profiles.length === 0) {
        setResult({ sent: 0, skipped: 0, errors: 0, note: "No users found with push tokens." });
        return;
      }

      let sent = 0, skipped = 0, errors = 0;
      const errorMessages = [];

      await Promise.all(
        profiles.map(async (p) => {
          try {
            const { data: fnData, error } = await supabase.functions.invoke("send-push", {
              body: { token: p.push_token, title: title.trim(), body: body.trim(), data: {} },
            });
            if (error) {
              errorMessages.push(`${p.full_name ?? p.id}: ${error.message}`);
              errors++;
              return;
            }
            // Expo returns { data: { status: "error", details: [...] } } on token failures
            const expoStatus = fnData?.data?.[0]?.status ?? fnData?.status;
            if (expoStatus === "error") {
              const detail = fnData?.data?.[0]?.details ?? fnData?.message ?? "Expo rejected token";
              errorMessages.push(`${p.full_name ?? p.id}: ${detail}`);
              errors++;
              return;
            }

            await supabase.from("notifications").insert({
              user_id: p.id,
              title:   title.trim(),
              body:    body.trim(),
              type:    "admin",
              data:    {},
            });

            sent++;
          } catch (e) {
            errorMessages.push(`${p.full_name ?? p.id}: ${e?.message ?? "Unknown"}`);
            errors++;
          }
        })
      );

      skipped = profiles.length - sent - errors;
      setResult({ sent, skipped, errors, errorMessages });
      if (sent > 0) {
        auditLog?.("send_push", "notification", null, `"${title.trim()}" → ${sent} users`, { target, sent });
        setTitle("");
        setBody("");
        showToast?.(`Sent to ${sent} user${sent !== 1 ? "s" : ""}.`);
        loadHistory();
      }
    } catch (err) {
      showToast?.("Failed to send: " + (err.message ?? "Unknown error"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
        {[{ id: "compose", label: "Compose" }, { id: "history", label: `History (${history.length})` }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === t.id ? { backgroundColor: "#ede9fe", color: "#7c3aed" } : { color: "#94a3b8" }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "history" ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={loadHistory} disabled={histLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50">
              <RotateCcw className={`w-3.5 h-3.5 ${histLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          {histLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No notifications sent yet.</div>
          ) : (
            <div className="space-y-2">
              {/* Group by title+body (dedupe broadcast) */}
              {Object.values(
                history.reduce((acc, n) => {
                  const key = `${n.title}||${n.body}||${n.created_at?.slice(0, 16)}`;
                  if (!acc[key]) acc[key] = { ...n, count: 0 };
                  acc[key].count++;
                  return acc;
                }, {})
              ).map(n => (
                <div key={n.id} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#7c3aed18" }}>
                    <Bell className="w-4 h-4" style={{ color: "#7c3aed" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(n.created_at)} · {n.count} recipient{n.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
      <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#7c3aed18" }}>
          <Bell className="w-5 h-5" style={{ color: "#7c3aed" }} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">Push Notifications</h2>
          <p className="text-sm text-gray-500">Send a real-time push to your users</p>
        </div>
      </div>

      {/* Target */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Send to</label>
        <div className="grid grid-cols-2 gap-3">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTarget(t.id); setResult(null); }}
              className="flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all"
              style={{
                borderColor: target === t.id ? "#7c3aed" : "#e5e7eb",
                backgroundColor: target === t.id ? "#7c3aed08" : "#fff",
              }}>
              <span className="text-sm font-bold" style={{ color: target === t.id ? "#7c3aed" : "#111827" }}>{t.label}</span>
              <span className="text-xs text-gray-400 mt-0.5">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Specific user email */}
      {target === "user" && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">User email</label>
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "#e5e7eb", focusRingColor: "#7c3aed" }}
          />
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Title</label>
        <input
          type="text"
          placeholder="e.g. New feature alert 🎉"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={65}
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none"
          style={{ borderColor: "#e5e7eb" }}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/65</p>
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Message</label>
        <textarea
          placeholder="What do you want to tell your users?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={240}
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
          style={{ borderColor: "#e5e7eb" }}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/240</p>
      </div>

      {/* Result */}
      {result && (
        <div className="flex items-start gap-3 p-4 rounded-xl border"
          style={{ backgroundColor: result.errors > 0 && result.sent === 0 ? "#fef2f2" : "#f0fdf4", borderColor: result.errors > 0 && result.sent === 0 ? "#fecaca" : "#bbf7d0" }}>
          {result.sent > 0
            ? <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 shrink-0" />
            : <AlertTriangle className="w-5 h-5 mt-0.5 text-red-400 shrink-0" />}
          <div className="text-sm">
            {result.note
              ? <p className="font-semibold text-gray-600">{result.note}</p>
              : <>
                  <p className="font-bold text-gray-800">
                    {result.sent} sent · {result.skipped} skipped · {result.errors} failed
                  </p>
                  {result.errorMessages?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.errorMessages.map((m, i) => (
                        <li key={i} className="text-xs text-red-600 font-mono break-all">{m}</li>
                      ))}
                    </ul>
                  )}
                </>}
          </div>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !body.trim()}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
        style={{ backgroundColor: "#7c3aed" }}>
        {sending
          ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Sending…</>
          : <><Send className="w-4 h-4" /> Send Notification</>}
      </button>

      </div>
      )}

    </div>
  );
}
