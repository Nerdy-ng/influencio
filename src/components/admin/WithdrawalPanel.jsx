import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowUpCircle, RotateCcw, Search, CheckCircle, XCircle, Clock, Info } from "lucide-react";

const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";
const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');

const STATUS_META = {
  pending:   { bg: "#fef3c7", color: "#d97706", label: "Pending",   Icon: Clock },
  completed: { bg: "#dcfce7", color: "#16a34a", label: "Completed", Icon: CheckCircle },
  failed:    { bg: "#fee2e2", color: "#dc2626", label: "Failed",    Icon: XCircle },
};

const FILTERS = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "failed",    label: "Failed" },
];

export default function WithdrawalPanel({ showToast, auditLog }) {
  const [payouts, setPayouts]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase
      .from("rubies_transactions")
      .select("*")
      .eq("type", "payout")
      .order("created_at", { ascending: false })
      .limit(100);

    const list = rows || [];
    const ids  = [...new Set(list.map(r => r.user_id).filter(Boolean))];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, handle, payout_accounts")
        .in("id", ids);
      (profs || []).forEach(p => { nameMap[p.id] = p; });
    }

    setPayouts(list.map(r => ({
      ...r,
      creatorName: nameMap[r.user_id]?.full_name || nameMap[r.user_id]?.handle || "Creator",
      profile: nameMap[r.user_id] || null,
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = payouts.filter(r => {
    const t = search.toLowerCase();
    const matchSearch = !t || r.creatorName.toLowerCase().includes(t) || (r.destination || "").toLowerCase().includes(t);
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPaid    = payouts.filter(r => r.status === "completed").reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalPending = payouts.filter(r => r.status === "pending").reduce((s, r) => s + Number(r.amount || 0), 0);
  const counts = Object.fromEntries(FILTERS.map(f => [f.key, f.key === "all" ? payouts.length : payouts.filter(r => r.status === f.key).length]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Creator Payout History</h2>
          <p className="text-sm text-gray-500 mt-0.5">Creator-initiated withdrawals via Rubies · auto-processed</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
        <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Payouts are creator-initiated and processed automatically via Rubies external transfer to their linked bank account. No manual approval needed. Failed payouts should be investigated in the Rubies BaaS dashboard.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Paid Out",   value: fmtMoney(totalPaid),         color: "#16a34a" },
          { label: "Pending",          value: fmtMoney(totalPending),       color: "#d97706" },
          { label: "Failed",           value: counts.failed,                color: "#dc2626" },
          { label: "Total Payouts",    value: counts.all,                   color: "#4f46e5" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{s.label}</p>
            <p className="text-lg font-black" style={{ color: s.color }}>{loading ? "…" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={filter === f.key ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
            {f.label} <span className="ml-1 opacity-70">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by creator or bank account…" value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      {/* List + Detail */}
      <div className="flex gap-4" style={{ minHeight: 420 }}>
        <div className="w-80 flex-shrink-0 space-y-1.5 overflow-y-auto" style={{ maxHeight: 580 }}>
          {loading ? <p className="text-center text-sm text-gray-400 py-10">Loading…</p>
          : filtered.length === 0
            ? <div className="text-center py-12"><ArrowUpCircle className="w-8 h-8 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No payouts found</p></div>
            : filtered.map(r => {
              const sm = STATUS_META[r.status] || STATUS_META.pending;
              return (
                <button key={r.id} onClick={() => setSelected(r)}
                  className="w-full text-left p-3 rounded-xl transition-all"
                  style={{ backgroundColor: selected?.id === r.id ? "#eef2ff" : "#fff", border: `1px solid ${selected?.id === r.id ? "#c7d2fe" : "#e2e8f0"}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.creatorName}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-1" style={{ backgroundColor: sm.bg, color: sm.color }}>{sm.label}</span>
                  </div>
                  <p className="text-sm font-black text-indigo-600">{fmtMoney(r.amount)}</p>
                  <p className="text-xs text-gray-400 truncate">{r.destination || "—"}</p>
                  <p className="text-xs text-gray-400">{fmtDate(r.created_at)}</p>
                </button>
              );
            })}
        </div>

        {/* Detail pane */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white overflow-hidden flex flex-col" style={{ border: "1px solid #e2e8f0" }}>
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{selected.creatorName}</h3>
                  <p className="text-xs text-gray-400">{fmtDate(selected.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600">{fmtMoney(selected.amount)}</p>
                  {(() => {
                    const sm = STATUS_META[selected.status] || STATUS_META.pending;
                    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: sm.bg, color: sm.color }}>{sm.label}</span>;
                  })()}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payout Details</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {[
                    ["Destination",    selected.destination || "—"],
                    ["Reference",      selected.reference   || "—"],
                    ["Amount",         fmtMoney(selected.amount)],
                    ["Status",         selected.status],
                    ["Date",           fmtDate(selected.created_at)],
                    ["Note",           selected.note || "—"],
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-start justify-between">
                      <p className="text-xs text-gray-500 flex-shrink-0 w-28">{l}</p>
                      <p className="text-xs font-semibold text-gray-800 text-right break-all">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selected.status === "failed" && (
                <div className="rounded-xl p-4 border" style={{ backgroundColor: "#fff7ed", borderColor: "#fed7aa" }}>
                  <p className="text-xs font-bold text-orange-700 mb-1">Failed Payout</p>
                  <p className="text-xs text-orange-600">Check the Rubies BaaS dashboard for the reference <strong>{selected.reference}</strong> to investigate. The creator's wallet balance was not debited if the transfer failed.</p>
                </div>
              )}

              {selected.status === "pending" && (
                <div className="rounded-xl p-4 border" style={{ backgroundColor: "#fefce8", borderColor: "#fef08a" }}>
                  <p className="text-xs font-bold text-yellow-700 mb-1">Pending Confirmation</p>
                  <p className="text-xs text-yellow-600">Rubies has accepted the transfer. Funds typically arrive within 1–3 business days. Status will update once confirmed.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: "1px solid #e2e8f0" }}>
            <div className="text-center">
              <ArrowUpCircle className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Select a payout to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
