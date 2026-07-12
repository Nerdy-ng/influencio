import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, RotateCcw, Download } from "lucide-react";

const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtK = (n) => n >= 1000000 ? `₦${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n / 1000).toFixed(1)}K` : `₦${n}`;

function buildMonthlyData(rows, amountKey = "total_amount") {
  const months = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en", { month: "short", year: "2-digit" });
    months[key] = 0;
  }
  rows.forEach(r => {
    const d = new Date(r.created_at);
    const key = d.toLocaleString("en", { month: "short", year: "2-digit" });
    if (months[key] !== undefined) months[key] += Number(r[amountKey] || 0);
  });
  return Object.entries(months).map(([month, value]) => ({ month, value: Math.round(value) }));
}

export default function FinancialReportingPanel({ showToast }) {
  const [loading, setLoading]     = useState(true);
  const [range, setRange]         = useState("6m");
  const [metrics, setMetrics]     = useState(null);
  const [gmvData, setGmvData]     = useState([]);
  const [feeData, setFeeData]     = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [topCreators, setTopCreators] = useState([]);

  async function load() {
    setLoading(true);
    const since = new Date();
    if (range === "7d") since.setDate(since.getDate() - 7);
    else if (range === "30d") since.setDate(since.getDate() - 30);
    else if (range === "3m") since.setMonth(since.getMonth() - 3);
    else since.setMonth(since.getMonth() - 6);

    const [
      { data: completedCollabs },
      { data: allCollabs },
      { data: payouts },
    ] = await Promise.all([
      supabase.from("collabs").select("total_amount, platform_fee, creator_payout, brand_id, creator_id, created_at").eq("status", "completed").gte("created_at", since.toISOString()),
      supabase.from("collabs").select("total_amount, platform_fee, created_at").gte("created_at", since.toISOString()),
      supabase.from("payout_requests").select("amount, created_at").eq("status", "paid").gte("created_at", since.toISOString()),
    ]);

    const completed = completedCollabs || [];
    const all = allCollabs || [];
    const pd = payouts || [];

    const gmv = completed.reduce((s, c) => s + Number(c.total_amount || 0), 0);
    const revenue = all.reduce((s, c) => s + Number(c.platform_fee || 0), 0);
    const payoutTotal = pd.reduce((s, p) => s + Number(p.amount || 0), 0);

    setMetrics({ gmv, revenue, payoutTotal, completedCollabs: completed.length, allCollabs: all.length });
    setGmvData(buildMonthlyData(all, "total_amount"));
    setFeeData(buildMonthlyData(all, "platform_fee"));

    // Top brands by spend
    const brandSpend = {};
    const ids = [...new Set(completed.map(c => c.brand_id).filter(Boolean))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, company_name, full_name, handle").in("id", ids);
      const nm = Object.fromEntries((profs || []).map(p => [p.id, p.company_name || p.full_name || p.handle || "Unknown"]));
      completed.forEach(c => {
        if (!c.brand_id) return;
        brandSpend[c.brand_id] = (brandSpend[c.brand_id] || { name: nm[c.brand_id] || "?", amount: 0 });
        brandSpend[c.brand_id].amount += Number(c.total_amount || 0);
      });
      const creatorEarnings = {};
      const cids = [...new Set(completed.map(c => c.creator_id).filter(Boolean))];
      const { data: cprofs } = await supabase.from("profiles").select("id, full_name, handle").in("id", cids).catch(() => ({ data: [] }));
      const cnm = Object.fromEntries((cprofs || []).map(p => [p.id, p.full_name || p.handle || "?"]));
      completed.forEach(c => {
        if (!c.creator_id) return;
        creatorEarnings[c.creator_id] = (creatorEarnings[c.creator_id] || { name: cnm[c.creator_id] || "?", amount: 0 });
        creatorEarnings[c.creator_id].amount += Number(c.creator_payout || 0);
      });
      setTopBrands(Object.values(brandSpend).sort((a, b) => b.amount - a.amount).slice(0, 5));
      setTopCreators(Object.values(creatorEarnings).sort((a, b) => b.amount - a.amount).slice(0, 5));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [range]);

  function exportCSV() {
    const rows = [
      ["Metric", "Value"],
      ["GMV", metrics?.gmv],
      ["Revenue", metrics?.revenue],
      ["Payouts", metrics?.payoutTotal],
      ["Completed Collabs", metrics?.completedCollabs],
      ["Total Collabs", metrics?.allCollabs],
      [],
      ["Month", "GMV", "Fees"],
      ...gmvData.map((g, i) => [g.month, g.value, feeData[i]?.value || 0]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `brandior_financial_${range}.csv`;
    a.click();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Financial Reporting</h2>
          <p className="text-sm text-gray-500 mt-0.5">Revenue, commissions, GMV and top performers</p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "3m", "6m"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={range === r ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
              {r}
            </button>
          ))}
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "GMV",                value: fmtMoney(metrics?.gmv),           color: "#4f46e5" },
          { label: "Platform Revenue",   value: fmtMoney(metrics?.revenue),        color: "#16a34a" },
          { label: "Creator Payouts",    value: fmtMoney(metrics?.payoutTotal),    color: "#7c3aed" },
          { label: "Completed Collabs",  value: metrics?.completedCollabs ?? "—",  color: "#0ea5e9" },
          { label: "Commission Rate",    value: metrics?.gmv ? `${((metrics.revenue / metrics.gmv) * 100).toFixed(1)}%` : "—", color: "#d97706" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-lg font-black" style={{ color: s.color }}>{loading ? "…" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-700 mb-4">GMV (Monthly)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={gmvData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => fmtMoney(v)} />
              <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} name="GMV" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-700 mb-4">Platform Fees (Monthly)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={feeData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => fmtMoney(v)} />
              <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={false} name="Fees" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top brands / top creators */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { title: "Top Brands by Spend", data: topBrands, color: "#4f46e5" },
          { title: "Top Creators by Earnings", data: topCreators, color: "#7c3aed" },
        ].map(({ title, data, color }) => (
          <div key={title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-700 mb-3">{title}</p>
            {data.length === 0 && !loading ? (
              <p className="text-xs text-gray-300 py-4 text-center">No data for this period</p>
            ) : (
              <div className="space-y-2">
                {data.map((d, i) => {
                  const maxVal = data[0]?.amount || 1;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-semibold text-gray-700 truncate">{i + 1}. {d.name}</p>
                        <p className="text-xs font-black flex-shrink-0 ml-2" style={{ color }}>{fmtMoney(d.amount)}</p>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(d.amount / maxVal) * 100}%`, backgroundColor: color + "88" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
