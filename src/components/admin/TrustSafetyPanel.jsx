import { useState, useEffect } from "react";
import { saveProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import { Shield, RotateCcw, Search, AlertTriangle, Ban, Eye } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

const TABS = ["reported", "suspicious", "duplicates", "login_history"];

export default function TrustSafetyPanel({ showToast, auditLog }) {
  const [tab, setTab]         = useState("reported");
  const [items, setItems]     = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  async function loadReported() {
    const { data } = await supabase.from("user_reports").select("*").order("created_at", { ascending: false }).catch(() => ({ data: [] }));
    const list = data || [];
    const ids = [...new Set(list.flatMap(r => [r.reporter_id, r.target_id]).filter(Boolean))];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, handle, company_name").in("id", ids);
      (profs || []).forEach(p => { nameMap[p.id] = p.company_name || p.full_name || p.handle || p.id?.slice(0, 8); });
    }
    return list.map(r => ({
      ...r,
      reporterName: nameMap[r.reporter_id] || "Unknown",
      targetName: nameMap[r.target_id] || "Unknown",
      _type: "report",
    }));
  }

  async function loadSuspicious() {
    // Users with multiple reports or unusual activity
    const [{ data: reports }, { data: highReferrals }] = await Promise.all([
      supabase.from("user_reports").select("target_id").catch(() => ({ data: [] })),
      supabase.from("referrals").select("referrer_id").limit(1000).catch(() => ({ data: [] })),
    ]);
    const reportCounts = {};
    (reports || []).forEach(r => { reportCounts[r.target_id] = (reportCounts[r.target_id] || 0) + 1; });
    const referralCounts = {};
    (highReferrals || []).forEach(r => { referralCounts[r.referrer_id] = (referralCounts[r.referrer_id] || 0) + 1; });
    const suspectedIds = [
      ...Object.entries(reportCounts).filter(([, c]) => c >= 2).map(([id]) => id),
      ...Object.entries(referralCounts).filter(([, c]) => c >= 15).map(([id]) => id),
    ];
    const uniqueIds = [...new Set(suspectedIds)];
    if (!uniqueIds.length) return [];
    const { data: profs } = await supabase.from("profiles").select("id, full_name, handle, company_name, role, status, created_at").in("id", uniqueIds);
    return (profs || []).map(p => ({
      id: p.id,
      name: p.company_name || p.full_name || p.handle || p.id?.slice(0, 8),
      role: p.role,
      status: p.status,
      reports: reportCounts[p.id] || 0,
      referrals: referralCounts[p.id] || 0,
      created_at: p.created_at,
      _type: "suspicious",
    }));
  }

  async function loadDuplicates() {
    // Same phone or same device_id
    const { data } = await supabase.from("profiles").select("id, full_name, handle, company_name, phone, role, created_at").not("phone", "is", null).order("phone");
    const list = data || [];
    const phoneMap = {};
    list.forEach(p => {
      if (!p.phone) return;
      if (!phoneMap[p.phone]) phoneMap[p.phone] = [];
      phoneMap[p.phone].push(p);
    });
    const dupes = [];
    Object.entries(phoneMap).forEach(([phone, users]) => {
      if (users.length > 1) dupes.push({ phone, users, _type: "duplicate" });
    });
    return dupes;
  }

  async function loadLoginHistory(userId) {
    const { data } = await supabase.from("login_history").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20).catch(() => ({ data: [] }));
    setLoginHistory(data || []);
  }

  async function load() {
    setLoading(true);
    let data = [];
    if (tab === "reported") data = await loadReported();
    else if (tab === "suspicious") data = await loadSuspicious();
    else if (tab === "duplicates") data = await loadDuplicates();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { load(); setSelected(null); }, [tab]);

  async function banUser(userId, name) {
    setBusy(userId);
    saveProfile(userId, { status: "banned" });
    auditLog?.("ban_user", "profile", userId, name);
    showToast(`${name} banned`);
    load();
    setBusy(null);
  }

  async function resolveReport(id) {
    setBusy(id);
    await supabase.from("user_reports").update({ resolved: true }).eq("id", id).catch(() => {});
    setItems(prev => prev.map(i => i.id === id ? { ...i, resolved: true } : i));
    showToast("Marked as resolved");
    setBusy(null);
  }

  const filtered = items.filter(i => {
    const t = search.toLowerCase();
    if (!t) return true;
    if (i._type === "report") return i.reporterName.toLowerCase().includes(t) || i.targetName.toLowerCase().includes(t) || (i.reason || "").toLowerCase().includes(t);
    if (i._type === "suspicious") return i.name.toLowerCase().includes(t);
    if (i._type === "duplicate") return i.phone?.includes(t) || i.users?.some(u => (u.full_name || "").toLowerCase().includes(t));
    return true;
  });

  const TAB_LABELS = { reported: "Reported Users", suspicious: "Suspicious Activity", duplicates: "Duplicate Accounts", login_history: "Login History" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Trust & Safety</h2>
          <p className="text-sm text-gray-500 mt-0.5">Reported users, suspicious activity, and account security</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={tab === t ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab !== "login_history" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search…" value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-gray-200 outline-none focus:border-indigo-400 bg-white shadow-sm" />
        </div>
      )}

      {loading ? <p className="text-center text-sm text-gray-400 py-12">Loading…</p> : (
        <div className="space-y-2">
          {tab === "reported" && (
            filtered.length === 0 ? <div className="text-center py-12"><Shield className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No reports</p></div>
            : filtered.map(r => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{r.targetName}</p>
                    <span className="text-xs text-gray-400">reported by {r.reporterName}</span>
                    {r.resolved && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Resolved</span>}
                    <span className="text-xs text-gray-400 ml-auto">{fmtDate(r.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-600">{r.reason || "No reason given"}</p>
                </div>
                {!r.resolved && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => banUser(r.target_id, r.targetName)} disabled={busy === r.target_id}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 disabled:opacity-50">
                      <Ban className="w-3 h-3" /> Ban
                    </button>
                    <button onClick={() => resolveReport(r.id)} disabled={busy === r.id}
                      className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 disabled:opacity-50">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {tab === "suspicious" && (
            filtered.length === 0 ? <div className="text-center py-12"><Shield className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No suspicious activity</p></div>
            : filtered.map(u => (
              <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{u.name} <span className="text-xs capitalize text-gray-400 ml-1">{u.role}</span></p>
                  <div className="flex gap-3 mt-1">
                    {u.reports > 0 && <span className="text-xs text-red-600 font-semibold">⚠ {u.reports} reports</span>}
                    {u.referrals >= 15 && <span className="text-xs text-amber-600 font-semibold">🎁 {u.referrals} referrals</span>}
                    <span className="text-xs text-gray-400">Joined {fmtDate(u.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => banUser(u.id, u.name)} disabled={busy === u.id}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 disabled:opacity-50">
                    <Ban className="w-3 h-3" /> Ban
                  </button>
                </div>
              </div>
            ))
          )}

          {tab === "duplicates" && (
            filtered.length === 0 ? <div className="text-center py-12"><Shield className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No duplicates detected</p></div>
            : filtered.map((g, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-gray-400 mb-2">Phone: {g.phone} — {g.users.length} accounts</p>
                <div className="space-y-1">
                  {g.users.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700">{u.company_name || u.full_name || u.handle} <span className="capitalize text-gray-400">({u.role})</span></p>
                      <div className="flex gap-1.5">
                        <button onClick={() => banUser(u.id, u.full_name || u.handle)} disabled={busy === u.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 disabled:opacity-50">
                          <Ban className="w-3 h-3" /> Ban
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {tab === "login_history" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input placeholder="Enter user ID or handle to view login history…" value={search}
                  onChange={e => setSearch(stripInjection(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
                <button onClick={async () => {
                  setBusy("search");
                  const { data: p } = await supabase.from("profiles").select("id").or(`id.eq.${search},handle.eq.${search.replace("@", "")}`).single().catch(() => ({ data: null }));
                  if (p) { setSelected(p); await loadLoginHistory(p.id); }
                  else showToast("User not found", "error");
                  setBusy(null);
                }} disabled={busy === "search" || !search.trim()} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 disabled:opacity-50">
                  Lookup
                </button>
              </div>
              {loginHistory.length > 0 && (
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">IP</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Device</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {loginHistory.map((h, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-xs text-gray-600">{fmtDate(h.created_at)}</td>
                          <td className="px-4 py-2.5 text-xs font-mono text-gray-600">{h.ip || "—"}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-600 truncate max-w-xs">{h.device || h.user_agent?.slice(0, 40) || "—"}</td>
                          <td className="px-4 py-2.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={h.success !== false ? { backgroundColor: "#dcfce7", color: "#16a34a" } : { backgroundColor: "#fee2e2", color: "#dc2626" }}>{h.success !== false ? "Success" : "Failed"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {loginHistory.length === 0 && selected && <p className="text-sm text-gray-400 text-center py-6">No login history found</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
