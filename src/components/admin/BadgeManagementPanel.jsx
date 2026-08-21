import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { BadgeCheck, RotateCcw, Search, Users, Briefcase } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');

const CREATOR_BADGES = [
  { id: "spark",    label: "Spark",    emoji: "⚡", color: "#f97316", bg: "#fff7ed", desc: "New creator showing early promise" },
  { id: "rising",   label: "Rising",   emoji: "🌱", color: "#10b981", bg: "#ecfdf5", desc: "Growing creator with consistent output" },
  { id: "pro",      label: "Pro",      emoji: "🎯", color: "#6366f1", bg: "#eef2ff", desc: "Established creator with proven delivery" },
  { id: "champion", label: "Champion", emoji: "🏆", color: "#7c3aed", bg: "#f3f0ff", desc: "Top-tier creator, elite performer" },
];

const BRAND_BADGES = [
  { id: "pioneer",   label: "Pioneer",   emoji: "🚀", color: "#f97316", bg: "#fff7ed", desc: "First brand to join the ecosystem" },
  { id: "preferred", label: "Preferred", emoji: "⭐", color: "#0ea5e9", bg: "#e0f2fe", desc: "Brand with strong creator relationships" },
  { id: "elite",     label: "Elite",     emoji: "💎", color: "#6366f1", bg: "#eef2ff", desc: "High-spend, high-quality brand partner" },
  { id: "champion",  label: "Champion",  emoji: "🏆", color: "#7c3aed", bg: "#f3f0ff", desc: "Top-ranked brand on the platform" },
];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function BadgeManagementPanel({ showToast }) {
  const [tab, setTab] = useState("creator");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, company_name, handle, role, badge, verified, created_at, avatar_url")
      .eq("role", tab === "creator" ? "talent" : "brand")
      .order("created_at", { ascending: false })
      .limit(200);
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tab]);

  async function assignBadge(userId, badge) {
    setSaving(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ badge })
      .eq("id", userId);
    if (error) {
      showToast?.("Failed to update badge: " + error.message, "error");
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, badge } : u));
      showToast?.(`Badge updated to ${badge || "none"}`);
    }
    setSaving(null);
  }

  const badges = tab === "creator" ? CREATOR_BADGES : BRAND_BADGES;

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = (u.full_name || u.company_name || u.handle || "").toLowerCase();
    return name.includes(q);
  });

  const badgeCounts = badges.map(b => ({
    ...b,
    count: users.filter(u => u.badge === b.id).length,
  }));
  const noBadge = users.filter(u => !u.badge).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Badge Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Assign achievement badges to creators and brands</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ backgroundColor: "#f3f4f6" }}>
        {[{ id: "creator", label: "Creators", Icon: Users }, { id: "brand", label: "Brands", Icon: Briefcase }].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === id ? { backgroundColor: "#0d1117", color: "#fff" } : { backgroundColor: "transparent", color: "#6b7280" }}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Badge summary strip */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {badgeCounts.map(({ id, label, emoji, color, bg, count }) => (
          <div key={id} className="rounded-2xl p-4" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 18 }}>{emoji}</span>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af" }}>{label}</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color }} className="tabular-nums">{count}</p>
          </div>
        ))}
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 18 }}>—</span>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af" }}>No Badge</p>
          </div>
          <p style={{ fontSize: 22, fontWeight: 900, color: "#9ca3af" }} className="tabular-nums">{noBadge}</p>
        </div>
      </div>

      {/* Badge legend */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 10 }}>BADGE MEANINGS</p>
        <div className="flex flex-wrap gap-3">
          {badges.map(({ id, label, emoji, color, bg, desc }) => (
            <div key={id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: bg }}>
              <span style={{ fontSize: 15 }}>{emoji}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color, lineHeight: 1 }}>{label}</p>
                <p style={{ fontSize: 10, color: "#9ca3af" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={`Search ${tab === "creator" ? "creators" : "brands"}…`} value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      {/* User list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["User", "Verified", "Joined", "Current Badge", "Assign Badge"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">No {tab}s found</td></tr>
            ) : filtered.map(u => {
              const name = u.full_name || u.company_name || u.handle || "Unknown";
              const currentBadge = badges.find(b => b.id === u.badge);
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {u.avatar_url
                          ? <img src={u.avatar_url} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} alt="" />
                          : <span style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed" }}>{name.slice(0, 2).toUpperCase()}</span>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{name}</p>
                        <p className="text-xs text-gray-400">@{u.handle || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.verified
                      ? <BadgeCheck className="w-4 h-4 text-green-500" />
                      : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    {currentBadge
                      ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                          style={{ backgroundColor: currentBadge.bg, color: currentBadge.color }}>
                          {currentBadge.emoji} {currentBadge.label}
                        </span>
                      )
                      : <span className="text-xs text-gray-300">None</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {badges.map(b => (
                        <button key={b.id}
                          disabled={saving === u.id}
                          onClick={() => assignBadge(u.id, u.badge === b.id ? null : b.id)}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                          style={u.badge === b.id
                            ? { backgroundColor: b.color, color: "#fff", border: `1.5px solid ${b.color}` }
                            : { backgroundColor: b.bg, color: b.color, border: `1.5px solid ${b.bg}` }}>
                          {saving === u.id ? "…" : b.emoji + " " + b.label}
                        </button>
                      ))}
                      {u.badge && (
                        <button onClick={() => assignBadge(u.id, null)} disabled={saving === u.id}
                          className="px-2 py-1 rounded-full text-xs font-semibold text-gray-400 border border-gray-200 hover:bg-gray-50">
                          Clear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
