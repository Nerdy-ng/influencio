import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, RotateCcw } from "lucide-react";

const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const COLORS = ["#4f46e5", "#7c3aed", "#0ea5e9", "#16a34a", "#d97706", "#ef4444", "#f97316", "#84cc16"];

function buildMonthlyCount(rows, dateKey = "created_at") {
  const months = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en", { month: "short", year: "2-digit" });
    months[key] = 0;
  }
  (rows || []).forEach(r => {
    const d = new Date(r[dateKey]);
    const key = d.toLocaleString("en", { month: "short", year: "2-digit" });
    if (months[key] !== undefined) months[key]++;
  });
  return Object.entries(months).map(([month, count]) => ({ month, count }));
}

export default function AnalyticsPanel() {
  const [loading, setLoading]       = useState(true);
  const [range, setRange]           = useState("6m");
  const [metrics, setMetrics]       = useState(null);
  const [creatorGrowth, setCreatorGrowth] = useState([]);
  const [brandGrowth, setBrandGrowth]     = useState([]);
  const [campaignSuccess, setCampaignSuccess] = useState([]);
  const [nicheData, setNicheData]   = useState([]);
  const [referralData, setReferralData] = useState([]);

  async function load() {
    setLoading(true);
    const since = new Date();
    if (range === "30d") since.setDate(since.getDate() - 30);
    else if (range === "3m") since.setMonth(since.getMonth() - 3);
    else since.setMonth(since.getMonth() - 6);

    const [
      { data: creators },
      { data: brands },
      { data: collabs },
      { data: referrals },
    ] = await Promise.all([
      supabase.from("profiles").select("id, created_at").eq("role", "creator").gte("created_at", since.toISOString()),
      supabase.from("profiles").select("id, created_at").eq("role", "brand").gte("created_at", since.toISOString()),
      supabase.from("collabs").select("id, status, created_at, total_amount").gte("created_at", since.toISOString()),
      supabase.from("referrals").select("id, created_at").gte("created_at", since.toISOString()).catch(() => ({ data: [] })),
    ]);

    const c = creators || [];
    const b = brands   || [];
    const cl= collabs  || [];
    const r = referrals || [];

    const completed = cl.filter(c => c.status === "completed");
    const completionRate = cl.length ? ((completed.length / cl.length) * 100).toFixed(1) : 0;

    setMetrics({
      newCreators: c.length,
      newBrands:   b.length,
      newCollabs:  cl.length,
      completionRate,
      referrals:   r.length,
    });

    setCreatorGrowth(buildMonthlyCount(c));
    setBrandGrowth(buildMonthlyCount(b));
    setCampaignSuccess([
      { name: "Completed", value: completed.length, color: "#16a34a" },
      { name: "In Progress", value: cl.filter(x => x.status === "in_progress").length, color: "#0ea5e9" },
      { name: "Cancelled", value: cl.filter(x => x.status === "cancelled").length, color: "#ef4444" },
      { name: "Other", value: cl.filter(x => !["completed","in_progress","cancelled"].includes(x.status)).length, color: "#d97706" },
    ].filter(x => x.value > 0));

    setReferralData(buildMonthlyCount(r));

    // Niche distribution
    const { data: nicheProfiles } = await supabase.from("profiles").select("niches").eq("role", "creator").not("niches", "is", null);
    const nicheCount = {};
    (nicheProfiles || []).forEach(p => {
      const niches = Array.isArray(p.niches) ? p.niches : Object.keys(p.niches || {});
      niches.forEach(n => { nicheCount[n] = (nicheCount[n] || 0) + 1; });
    });
    setNicheData(Object.entries(nicheCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })));

    setLoading(false);
  }

  useEffect(() => { load(); }, [range]);

  const KPIS = [
    { label: "New Creators",    value: metrics?.newCreators,      color: "#7c3aed" },
    { label: "New Brands",      value: metrics?.newBrands,        color: "#0ea5e9" },
    { label: "New Collabs",     value: metrics?.newCollabs,       color: "#4f46e5" },
    { label: "Completion Rate", value: metrics?.completionRate ? `${metrics.completionRate}%` : "—", color: "#16a34a" },
    { label: "Referrals",       value: metrics?.referrals,        color: "#d97706" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Growth, performance, and platform health</p>
        </div>
        <div className="flex gap-2">
          {["30d", "3m", "6m"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={range === r ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
              {r}
            </button>
          ))}
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {KPIS.map(k => (
          <div key={k.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
            <p className="text-xl font-black" style={{ color: k.color }}>{loading ? "…" : k.value ?? "—"}</p>
          </div>
        ))}
      </div>

      {/* Creator & Brand growth */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-700 mb-4">Creator Growth</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={creatorGrowth} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[3, 3, 0, 0]} name="Creators" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-700 mb-4">Brand Growth</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={brandGrowth} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[3, 3, 0, 0]} name="Brands" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Campaign outcomes */}
        {campaignSuccess.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-700 mb-4">Collaboration Outcomes</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={campaignSuccess} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                  {campaignSuccess.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* Niche distribution */}
        {nicheData.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-700 mb-4">Top Creator Niches</p>
            <div className="space-y-2">
              {nicheData.map((n, i) => {
                const max = nicheData[0]?.value || 1;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold text-gray-700 truncate">{n.name}</p>
                      <p className="text-xs font-black ml-2" style={{ color: COLORS[i % COLORS.length] }}>{n.value}</p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${(n.value / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] + "88" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Referral trend */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-700 mb-4">Referral Performance</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={referralData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#d97706" strokeWidth={2} dot={false} name="Referrals" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
