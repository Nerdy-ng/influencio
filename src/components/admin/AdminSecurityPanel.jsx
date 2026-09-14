import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Shield, RefreshCw, Loader2, LogIn, LogOut, Clock,
  Monitor, AlertTriangle, CheckCircle, XCircle, Trash2,
  ChevronDown, Search, ShieldOff,
} from "lucide-react";

const fmtDate = (d) => d
  ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "—";

const fmtAge = (d) => {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)      return `${s}s ago`;
  if (s < 3600)    return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)   return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const EVENT_CONFIG = {
  login:            { label: "Login",           Icon: LogIn,       color: "#059669" },
  logout:           { label: "Logout",          Icon: LogOut,      color: "#6b7280" },
  session_expired:  { label: "Session Expired", Icon: Clock,       color: "#d97706" },
  session_revoked:  { label: "Session Revoked", Icon: ShieldOff,   color: "#dc2626" },
  failed_login:     { label: "Failed Login",    Icon: AlertTriangle, color: "#dc2626" },
};

export default function AdminSecurityPanel({ showToast, auditLog }) {
  const [tab, setTab]             = useState("sessions");
  const [sessions, setSessions]   = useState([]);
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [revoking, setRevoking]   = useState(null);
  const [search, setSearch]       = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [adminName, setAdminName] = useState("Admin");

  // Stats
  const [stats, setStats] = useState({ activeSessions: 0, loginsToday: 0, failedToday: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("brandiór_admin_token");
      if (raw) {
        const p = JSON.parse(atob(raw.split(".")[1] ?? "e30="));
        setAdminName(p?.name || "Admin");
      }
    } catch {}
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [sessRes, evtRes] = await Promise.all([
      supabase.from("admin_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("admin_security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const sessData = sessRes.data || [];
    const evtData  = evtRes.data  || [];

    setSessions(sessData);
    setEvents(evtData);

    // Compute stats
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    setStats({
      activeSessions: sessData.filter(s => s.is_active && new Date(s.expires_at) > new Date()).length,
      loginsToday:    evtData.filter(e => e.event_type === "login" && new Date(e.created_at) >= todayStart).length,
      failedToday:    evtData.filter(e => e.event_type === "failed_login" && new Date(e.created_at) >= todayStart).length,
    });

    setLoading(false);
  }

  async function revokeSession(session) {
    setRevoking(session.id);
    const { error } = await supabase.from("admin_sessions").update({
      is_active:  false,
      revoked_at: new Date().toISOString(),
      revoked_by: adminName,
    }).eq("id", session.id);

    if (error) { showToast?.("Failed to revoke session", "error"); }
    else {
      // Log the revocation
      await supabase.from("admin_security_events").insert({
        event_type:  "session_revoked",
        admin_email: session.admin_email,
        admin_name:  session.admin_name,
        admin_role:  session.admin_role,
        session_id:  session.id,
        metadata:    { revoked_by: adminName },
      });
      auditLog?.("session_revoked", { email: session.admin_email });
      showToast?.(`Session revoked for ${session.admin_name || session.admin_email}`);
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, is_active: false, revoked_at: new Date().toISOString(), revoked_by: adminName } : s));
      setStats(prev => ({ ...prev, activeSessions: Math.max(0, prev.activeSessions - 1) }));
    }
    setRevoking(null);
  }

  const filteredSessions = sessions.filter(s =>
    !search || s.admin_email?.includes(search) || s.admin_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEvents = events.filter(e =>
    (eventFilter === "all" || e.event_type === eventFilter) &&
    (!search || e.admin_email?.includes(search) || e.admin_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const currentSessionId = localStorage.getItem("brandiór_admin_session_id");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Security</h2>
          <p className="text-sm text-gray-500 mt-0.5">Active sessions, security events, and session revocation</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Sessions",  value: stats.activeSessions, Icon: Monitor,       color: "#7c3aed" },
          { label: "Logins Today",     value: stats.loginsToday,    Icon: LogIn,         color: "#059669" },
          { label: "Failed Today",     value: stats.failedToday,    Icon: AlertTriangle, color: "#dc2626" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e5e7eb" }}>
            <s.Icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* SLA definition box */}
      <div className="rounded-2xl border p-4 flex items-start gap-3" style={{ borderColor: "#fde68a", backgroundColor: "#fefce8" }}>
        <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-700">8-hour session limit</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Sessions expire automatically after 8 hours. The expiry is now enforced server-side — even if the token is still valid,
            a revoked or expired session in the database will be rejected on the next validation check.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "sessions", label: "Active Sessions" },
          { key: "events",   label: "Security Events" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-5 py-2 rounded-full text-sm font-bold transition-all"
            style={{
              backgroundColor: tab === t.key ? "#7c3aed" : "white",
              color:           tab === t.key ? "white" : "#6b7280",
              border:          `1px solid ${tab === t.key ? "#7c3aed" : "#e5e7eb"}`,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by email or name…"
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "#7c3aed" }} />
        </div>
        {tab === "events" && (
          <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "#7c3aed" }}>
            <option value="all">All events</option>
            {Object.keys(EVENT_CONFIG).map(k => (
              <option key={k} value={k}>{EVENT_CONFIG[k].label}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : tab === "sessions" ? (
        // ── Sessions tab ──────────────────────────────────────────────────────
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Monitor className="w-10 h-10 mb-3 opacity-25" />
              <p className="font-semibold">No sessions recorded yet</p>
              <p className="text-xs mt-1 text-gray-300">Sessions are registered on next login</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
              {filteredSessions.map(s => {
                const isExpired = new Date(s.expires_at) < new Date();
                const isCurrent = s.id === currentSessionId;
                const isActive  = s.is_active && !isExpired;
                const statusLabel = !s.is_active ? "Revoked" : isExpired ? "Expired" : "Active";
                const statusColor = !s.is_active ? "#dc2626" : isExpired ? "#d97706" : "#059669";
                const statusBg    = !s.is_active ? "#fee2e2" : isExpired ? "#fef3c7" : "#d1fae5";

                return (
                  <div key={s.id} className="px-5 py-4 flex items-start gap-4 flex-wrap">
                    <Monitor className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: isActive ? "#7c3aed" : "#9ca3af" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{s.admin_name || s.admin_email}</p>
                        {isCurrent && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#7c3aed20", color: "#7c3aed" }}>
                            This session
                          </span>
                        )}
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: statusBg, color: statusColor }}>
                          {statusLabel}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{s.admin_role}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">{s.user_agent}</p>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                        <span>Started {fmtDate(s.created_at)}</span>
                        <span>Last seen {fmtAge(s.last_seen_at)}</span>
                        <span>Expires {fmtDate(s.expires_at)}</span>
                        {s.revoked_by && <span className="text-red-400">Revoked by {s.revoked_by}</span>}
                      </div>
                    </div>
                    {isActive && !isCurrent && (
                      <button onClick={() => revokeSession(s)} disabled={revoking === s.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors disabled:opacity-50"
                        style={{ borderColor: "#dc2626", color: "#dc2626" }}>
                        {revoking === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldOff className="w-3 h-3" />}
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // ── Events tab ────────────────────────────────────────────────────────
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Shield className="w-10 h-10 mb-3 opacity-25" />
              <p className="font-semibold">No security events yet</p>
              <p className="text-xs mt-1 text-gray-300">Events are recorded on login, logout, and session changes</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
              {filteredEvents.map(e => {
                const cfg = EVENT_CONFIG[e.event_type] || { label: e.event_type, Icon: Shield, color: "#6b7280" };
                return (
                  <div key={e.id} className="flex items-start gap-4 px-5 py-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: cfg.color + "15" }}>
                      <cfg.Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{cfg.label}</p>
                        <p className="text-xs text-gray-500">{e.admin_name || e.admin_email || "—"}</p>
                        <span className="text-xs font-medium text-gray-400 ml-auto">{fmtDate(e.created_at)}</span>
                      </div>
                      {e.admin_role && <p className="text-xs text-gray-400 mt-0.5">{e.admin_role}</p>}
                      {e.metadata && Object.keys(e.metadata).length > 0 && (
                        <p className="text-xs text-gray-300 mt-0.5 font-mono">
                          {Object.entries(e.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
