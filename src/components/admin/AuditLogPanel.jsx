import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Search, Shield, User, DollarSign, Bell, Star, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";

const ACTION_META = {
  ban_user:        { label: "Banned user",           icon: AlertTriangle, color: "#dc2626" },
  suspend_user:    { label: "Suspended user",         icon: AlertTriangle, color: "#d97706" },
  unsuspend_user:  { label: "Unsuspended user",       icon: User,          color: "#16a34a" },
  verify_user:     { label: "Verified user",          icon: Shield,        color: "#0ea5e9" },
  release_escrow:  { label: "Released escrow",        icon: DollarSign,    color: "#16a34a" },
  refund_escrow:   { label: "Refunded payment",       icon: DollarSign,    color: "#ef4444" },
  wallet_credit:   { label: "Credited wallet",        icon: DollarSign,    color: "#7c3aed" },
  wallet_debit:    { label: "Debited wallet",         icon: DollarSign,    color: "#ef4444" },
  send_push:       { label: "Sent push notification", icon: Bell,          color: "#6366f1" },
  approve_request: { label: "Approved request",       icon: Shield,        color: "#16a34a" },
  reject_request:  { label: "Rejected request",       icon: Shield,        color: "#dc2626" },
  update_user:     { label: "Updated user profile",   icon: User,          color: "#64748b" },
  approve_rate_card: { label: "Approved rate card",   icon: Star,          color: "#16a34a" },
  reject_rate_card:  { label: "Rejected rate card",   icon: Star,          color: "#dc2626" },
};

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AuditLogPanel() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const actionTypes = ["all", ...Object.keys(ACTION_META)];

  const visible = rows.filter(r => {
    const matchFilter = filter === "all" || r.action === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.target_label?.toLowerCase().includes(q) || r.admin_name?.toLowerCase().includes(q) || r.action?.includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, action…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none"
          />
        </div>
        <select
          value={filter} onChange={e => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white">
          {actionTypes.map(a => (
            <option key={a} value={a}>{a === "all" ? "All actions" : (ACTION_META[a]?.label ?? a)}</option>
          ))}
        </select>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No audit entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Action", "Target", "Admin", "Role", "When", "Detail"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(row => {
                  const meta = ACTION_META[row.action] ?? { label: row.action, icon: Shield, color: "#64748b" };
                  const Icon = meta.icon;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: meta.color + "18" }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                          </div>
                          <span className="font-semibold text-gray-800 whitespace-nowrap">{meta.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{row.target_label || row.target_id || "—"}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.admin_name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                          style={{ backgroundColor: row.admin_role === "admin" ? "#ede9fe" : "#dbeafe", color: row.admin_role === "admin" ? "#7c3aed" : "#1d4ed8" }}>
                          {row.admin_role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{timeAgo(row.created_at)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-48 truncate">
                        {row.detail && Object.keys(row.detail).length > 0 ? JSON.stringify(row.detail) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
