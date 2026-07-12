import { useState, useEffect, useCallback } from "react";
import { RotateCcw, TrendingUp, Users, DollarSign } from "lucide-react";
import { supabase } from "../../lib/supabase";

function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ReferralTrackingPanel() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("referrals")
      .select(`
        id, status, amount, created_at,
        referee_name,
        referrer:profiles!referrer_id(id, full_name, role)
      `)
      .order("created_at", { ascending: false })
      .limit(200);
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const total       = rows.length;
  const earned      = rows.filter(r => r.status === "earned");
  const pending     = rows.filter(r => r.status === "pending");
  const totalPaid   = earned.reduce((s, r) => s + (r.amount || 0), 0);

  const visible = filter === "all" ? rows : rows.filter(r => r.status === filter);

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: total,                              color: "#7c3aed", icon: Users },
          { label: "Earned",          value: earned.length,                      color: "#16a34a", icon: TrendingUp },
          { label: "Pending",         value: pending.length,                     color: "#d97706", icon: TrendingUp },
          { label: "Total Paid Out",  value: `₦${totalPaid.toLocaleString()}`,  color: "#16a34a", icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + Refresh */}
      <div className="flex items-center gap-3 flex-wrap">
        {["all", "pending", "earned"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize"
            style={filter === f ? { backgroundColor: "#ede9fe", color: "#7c3aed" } : { color: "#94a3b8" }}>
            {f === "all" ? "All" : f}
          </button>
        ))}
        <div className="ml-auto">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No referrals found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Referrer", "Referee", "Referrer Role", "Amount", "Status", "When"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.referrer?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{row.referee_name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ backgroundColor: row.referrer?.role === "brand" ? "#dbeafe" : "#f3e8ff", color: row.referrer?.role === "brand" ? "#1d4ed8" : "#7c3aed" }}>
                        {row.referrer?.role ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: "#16a34a" }}>₦{(row.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ backgroundColor: row.status === "earned" ? "#dcfce7" : "#fef3c7", color: row.status === "earned" ? "#16a34a" : "#d97706" }}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{timeAgo(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
