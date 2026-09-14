import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import {
  DollarSign, Search, Loader2, ChevronDown, ChevronUp,
  RefreshCw, TrendingUp, Clock, CheckCircle, Wallet,
  BarChart2, User,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const RANGES = [
  { key: "30d",  label: "Last 30 days", days: 30  },
  { key: "90d",  label: "Last 90 days", days: 90  },
  { key: "1y",   label: "Last year",    days: 365 },
  { key: "all",  label: "All time",     days: null },
];

const STATUS_COLORS = {
  released: "#059669",
  paid:     "#0891b2",
  pending:  "#d97706",
  refunded: "#6b7280",
};

const CONTENT_COLORS = ["#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626", "#ec4899", "#8b5cf6"];

export default function CreatorEarningsPanel({ showToast }) {
  const [range, setRange]         = useState("all");
  const [loading, setLoading]     = useState(true);
  const [creators, setCreators]   = useState([]);
  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState(null);
  const [detail, setDetail]       = useState({});
  const [loadingDetail, setLoadingDetail] = useState(null);
  const [showRange, setShowRange] = useState(false);

  // Platform totals
  const [totals, setTotals]       = useState({ earned: 0, released: 0, inEscrow: 0, pending: 0 });

  useEffect(() => { load(range); }, [range]);

  async function load(rng) {
    setLoading(true);
    setExpanded(null);
    const cutoff = RANGES.find(r => r.key === rng)?.days
      ? new Date(Date.now() - RANGES.find(r => r.key === rng).days * 86400000).toISOString()
      : null;

    let q = supabase
      .from("collabs")
      .select("creator_id, creator_payout, payment_status, content_type, created_at, creator:profiles!creator_id(full_name, handle, avatar_url)")
      .neq("payment_status", "unpaid");
    if (cutoff) q = q.gte("created_at", cutoff);
    const { data: collabs } = await q;

    if (!collabs) { setLoading(false); return; }

    // Aggregate by creator
    const map = {};
    let totalEarned = 0, totalReleased = 0, totalEscrow = 0;

    for (const c of collabs) {
      const id = c.creator_id;
      if (!id) continue;
      if (!map[id]) {
        map[id] = {
          id,
          name:     c.creator?.full_name || "Unknown",
          handle:   c.creator?.handle    || "",
          avatar:   c.creator?.avatar_url,
          total:    0,
          released: 0,
          inEscrow: 0,
          count:    0,
        };
      }
      const amt = Number(c.creator_payout || 0);
      map[id].total   += amt;
      map[id].count   += 1;
      if (c.payment_status === "released") { map[id].released += amt; totalReleased += amt; }
      else if (c.payment_status === "paid") { map[id].inEscrow += amt; totalEscrow += amt; }
      totalEarned += amt;
    }

    // Get pending payouts
    const { data: payouts } = await supabase
      .from("payout_requests")
      .select("user_id, amount, status")
      .eq("status", "pending");
    const payoutMap = {};
    let totalPending = 0;
    for (const p of payouts || []) {
      payoutMap[p.user_id] = (payoutMap[p.user_id] || 0) + Number(p.amount || 0);
      totalPending += Number(p.amount || 0);
    }
    for (const id of Object.keys(map)) {
      map[id].pendingPayout = payoutMap[id] || 0;
    }

    setTotals({ earned: totalEarned, released: totalReleased, inEscrow: totalEscrow, pending: totalPending });
    setCreators(Object.values(map).sort((a, b) => b.total - a.total));
    setLoading(false);
  }

  async function loadDetail(creatorId) {
    if (detail[creatorId]) return;
    setLoadingDetail(creatorId);

    const { data: collabs } = await supabase
      .from("collabs")
      .select("creator_payout, payment_status, content_type, created_at, brand:profiles!brand_id(full_name, company_name)")
      .eq("creator_id", creatorId)
      .neq("payment_status", "unpaid")
      .order("created_at", { ascending: true });

    if (!collabs) { setLoadingDetail(null); return; }

    // By content type
    const byType = {};
    for (const c of collabs) {
      const t = c.content_type || "Other";
      byType[t] = (byType[t] || 0) + Number(c.creator_payout || 0);
    }
    const contentBreakdown = Object.entries(byType)
      .map(([type, amount]) => ({ type, amount }))
      .sort((a, b) => b.amount - a.amount);

    // By brand (top 5)
    const byBrand = {};
    for (const c of collabs) {
      const name = c.brand?.company_name || c.brand?.full_name || "Unknown Brand";
      byBrand[name] = (byBrand[name] || 0) + Number(c.creator_payout || 0);
    }
    const brandBreakdown = Object.entries(byBrand)
      .map(([brand, amount]) => ({ brand, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly trend (last 6 months)
    const monthMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-GB", { month: "short", year: "2-digit" });
      monthMap[key] = 0;
    }
    for (const c of collabs) {
      const d = new Date(c.created_at);
      const key = d.toLocaleString("en-GB", { month: "short", year: "2-digit" });
      if (key in monthMap) monthMap[key] += Number(c.creator_payout || 0);
    }
    const monthlyTrend = Object.entries(monthMap).map(([month, amount]) => ({ month, amount }));

    setDetail(prev => ({ ...prev, [creatorId]: { contentBreakdown, brandBreakdown, monthlyTrend, collabs } }));
    setLoadingDetail(null);
  }

  function toggleExpand(id) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    loadDetail(id);
  }

  const filtered = useMemo(() =>
    creators.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle?.toLowerCase().includes(search.toLowerCase())
    ),
  [creators, search]);

  const activeRange = RANGES.find(r => r.key === range);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Creator Earnings Breakdown</h2>
          <p className="text-sm text-gray-500 mt-0.5">Per-creator earnings with content type, brand, and monthly trend</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowRange(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm text-gray-600 hover:bg-gray-50"
              style={{ borderColor: "#e5e7eb" }}>
              {activeRange?.label} <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showRange && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border shadow-lg overflow-hidden" style={{ borderColor: "#e5e7eb", minWidth: 140 }}>
                {RANGES.map(r => (
                  <button key={r.key} onClick={() => { setRange(r.key); setShowRange(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50"
                    style={{ color: range === r.key ? "#7c3aed" : "#374151", fontWeight: range === r.key ? 700 : 400 }}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => load(range)} className="p-2 rounded-xl hover:bg-gray-100">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Platform totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Earned",    value: totals.earned,   Icon: DollarSign,  color: "#7c3aed" },
          { label: "Paid Out",        value: totals.released, Icon: CheckCircle, color: "#059669" },
          { label: "In Escrow",       value: totals.inEscrow, Icon: Clock,       color: "#0891b2" },
          { label: "Pending Payout",  value: totals.pending,  Icon: Wallet,      color: "#d97706" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e5e7eb" }}>
            <s.Icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
            <p className="text-xl font-black text-gray-900">{fmtMoney(s.value)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or handle…"
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#7c3aed" }} />
      </div>

      {/* Creator table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading earnings…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-2xl text-gray-400" style={{ borderColor: "#e5e7eb" }}>
          <BarChart2 className="w-10 h-10 mb-3 opacity-25" />
          <p className="font-semibold">No earnings data</p>
          <p className="text-xs mt-1 text-gray-300">No completed collabs in this period</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b text-xs font-bold text-gray-400 uppercase tracking-wider" style={{ borderColor: "#f3f4f6" }}>
            <div className="col-span-1">#</div>
            <div className="col-span-4">Creator</div>
            <div className="col-span-2 text-right">Total Earned</div>
            <div className="col-span-2 text-right">Paid Out</div>
            <div className="col-span-2 text-right">In Escrow</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
            {filtered.map((c, i) => {
              const isOpen = expanded === c.id;
              const d      = detail[c.id];
              const busy   = loadingDetail === c.id;

              return (
                <div key={c.id}>
                  {/* Row */}
                  <button onClick={() => toggleExpand(c.id)}
                    className="w-full grid grid-cols-12 gap-2 items-center px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                    <div className="col-span-1 text-xs font-black text-gray-300">#{i + 1}</div>
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                        style={{ backgroundColor: "#7c3aed" }}>
                        {c.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.handle ? `@${c.handle}` : `${c.count} collab${c.count !== 1 ? "s" : ""}`}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-black text-gray-900">{fmtMoney(c.total)}</p>
                      <p className="text-xs text-gray-400">{c.count} collab{c.count !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-bold" style={{ color: "#059669" }}>{fmtMoney(c.released)}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-bold" style={{ color: "#0891b2" }}>{fmtMoney(c.inEscrow)}</p>
                      {c.pendingPayout > 0 && (
                        <p className="text-xs font-semibold" style={{ color: "#d97706" }}>₦{Number(c.pendingPayout).toLocaleString()} pending withdrawal</p>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Detail panel */}
                  {isOpen && (
                    <div className="px-5 pb-6 border-t space-y-5" style={{ borderColor: "#f3f4f6", backgroundColor: "#fafafa" }}>
                      {busy ? (
                        <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading breakdown…
                        </div>
                      ) : d ? (
                        <>
                          {/* Monthly trend */}
                          <div className="pt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Monthly Earnings (last 6 months)</p>
                            <div style={{ height: 140 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={d.monthlyTrend} barSize={28}>
                                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                  <YAxis hide />
                                  <Tooltip
                                    formatter={(v) => [fmtMoney(v), "Earnings"]}
                                    contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                                  />
                                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#7c3aed" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Content type + Brand breakdown side by side */}
                          <div className="grid sm:grid-cols-2 gap-5">
                            {/* By content type */}
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">By Content Type</p>
                              {d.contentBreakdown.length === 0 ? (
                                <p className="text-sm text-gray-400">No data</p>
                              ) : (
                                <div className="space-y-2">
                                  {d.contentBreakdown.map((item, idx) => {
                                    const pct = d.collabs.reduce((s, x) => s + Number(x.creator_payout || 0), 0);
                                    const barPct = pct === 0 ? 0 : Math.round((item.amount / pct) * 100);
                                    return (
                                      <div key={item.type}>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="font-semibold text-gray-700 capitalize">{item.type?.replace(/_/g, " ") || "Other"}</span>
                                          <span className="text-gray-500">{fmtMoney(item.amount)} · {barPct}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#f3f4f6" }}>
                                          <div className="h-full rounded-full" style={{ width: `${barPct}%`, backgroundColor: CONTENT_COLORS[idx % CONTENT_COLORS.length] }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* By brand */}
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Top Brands (by payment)</p>
                              {d.brandBreakdown.length === 0 ? (
                                <p className="text-sm text-gray-400">No data</p>
                              ) : (
                                <div className="space-y-2">
                                  {d.brandBreakdown.map((item, idx) => {
                                    const topAmt = d.brandBreakdown[0]?.amount || 1;
                                    const barPct = Math.round((item.amount / topAmt) * 100);
                                    return (
                                      <div key={item.brand}>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="font-semibold text-gray-700 truncate max-w-[140px]">{item.brand}</span>
                                          <span className="text-gray-500 flex-shrink-0">{fmtMoney(item.amount)}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#f3f4f6" }}>
                                          <div className="h-full rounded-full" style={{ width: `${barPct}%`, backgroundColor: "#0891b2" }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
