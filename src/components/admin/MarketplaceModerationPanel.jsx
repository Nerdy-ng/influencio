import { useState, useEffect } from "react";
import { saveProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import { Store, RotateCcw, Search, EyeOff, Eye, Flag, Trash2, CheckSquare } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

const TABS = [
  { key: "rate_cards",  label: "Rate Cards" },
  { key: "portfolios",  label: "Portfolios" },
  { key: "bios",        label: "Bios & Profiles" },
  { key: "reported",    label: "Reported Content" },
];

export default function MarketplaceModerationPanel({ showToast, auditLog }) {
  const [tab, setTab]           = useState("rate_cards");
  const [items, setItems]       = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [busy, setBusy]         = useState(null);

  async function loadRateCards() {
    const { data } = await supabase.from("rate_cards").select("*, profiles(id, full_name, handle, status)").order("updated_at", { ascending: false });
    setItems((data || []).map(rc => ({
      id: rc.id,
      userId: rc.creator_id,
      name: rc.profiles?.full_name || rc.profiles?.handle || rc.creator_id?.slice(0, 8) || "Unknown",
      status: rc.profiles?.status,
      hidden: rc.hidden || false,
      reported: rc.reported || false,
      updatedAt: rc.updated_at,
      _type: "rate_card",
      _raw: rc,
    })));
  }

  async function loadPortfolios() {
    const { data } = await supabase.from("profiles").select("id, full_name, handle, status, portfolio, portfolio_hidden").eq("role", "creator").not("portfolio", "is", null).limit(100);
    setItems((data || []).map(p => ({
      id: p.id,
      userId: p.id,
      name: p.full_name || p.handle || p.id?.slice(0, 8),
      status: p.status,
      hidden: p.portfolio_hidden || false,
      reported: false,
      portfolioCount: Array.isArray(p.portfolio) ? p.portfolio.length : 0,
      _type: "portfolio",
      _raw: p,
    })));
  }

  async function loadBios() {
    const { data } = await supabase.from("profiles").select("id, full_name, company_name, handle, role, status, bio, bio_hidden").limit(200);
    setItems((data || []).filter(p => p.bio).map(p => ({
      id: p.id,
      userId: p.id,
      name: p.company_name || p.full_name || p.handle || p.id?.slice(0, 8),
      role: p.role,
      status: p.status,
      hidden: p.bio_hidden || false,
      preview: (p.bio || "").slice(0, 120),
      _type: "bio",
      _raw: p,
    })));
  }

  async function loadReported() {
    const { data } = await supabase.from("reported_content").select("*").order("created_at", { ascending: false }).catch(() => ({ data: [] }));
    setItems((data || []).map(r => ({
      id: r.id,
      name: r.reporter_name || "Anonymous",
      target: r.content_type,
      reason: r.reason,
      resolved: r.resolved,
      reported: true,
      _type: "reported",
      _raw: r,
    })));
  }

  async function load() {
    setLoading(true);
    if (tab === "rate_cards") await loadRateCards();
    else if (tab === "portfolios") await loadPortfolios();
    else if (tab === "bios") await loadBios();
    else await loadReported();
    setLoading(false);
  }

  useEffect(() => { load(); }, [tab]);

  async function toggleHide(item) {
    setBusy(item.id);
    if (item._type === "rate_card") {
      await supabase.from("rate_cards").update({ hidden: !item.hidden }).eq("id", item.id);
    } else if (item._type === "portfolio") {
      saveProfile(item.userId, { portfolio_hidden: !item.hidden });
    } else if (item._type === "bio") {
      saveProfile(item.userId, { bio_hidden: !item.hidden });
    }
    auditLog?.(item.hidden ? "show_content" : "hide_content", item._type, item.id, item.name);
    showToast(item.hidden ? "Content restored" : "Content hidden");
    load();
    setBusy(null);
  }

  async function resolveReport(id) {
    setBusy(id);
    await supabase.from("reported_content").update({ resolved: true }).eq("id", id).catch(() => {});
    setItems(prev => prev.map(i => i.id === id ? { ...i, resolved: true } : i));
    showToast("Marked as resolved");
    setBusy(null);
  }

  const filtered = items.filter(i => {
    const t = search.toLowerCase();
    return !t || (i.name || "").toLowerCase().includes(t) || (i.preview || "").toLowerCase().includes(t) || (i.reason || "").toLowerCase().includes(t);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Marketplace Moderation</h2>
          <p className="text-sm text-gray-500 mt-0.5">Rate cards, portfolios, bios, and reported content</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={tab === t.key ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder={`Search ${tab.replace("_", " ")}…`} value={search}
          onChange={e => setSearch(stripInjection(e.target.value))}
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-gray-200 outline-none focus:border-indigo-400 bg-white shadow-sm" />
      </div>

      {loading ? <p className="text-center text-sm text-gray-400 py-12">Loading…</p>
      : filtered.length === 0 ? <div className="text-center py-16"><Store className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No content</p></div>
      : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-bold text-gray-800">{item.name}</p>
                  {item.role && <span className="text-xs capitalize text-gray-400">{item.role}</span>}
                  {item.status && <span className="text-xs capitalize px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: item.status === "active" ? "#dcfce7" : "#fee2e2", color: item.status === "active" ? "#16a34a" : "#dc2626" }}>{item.status}</span>}
                  {item.hidden && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">Hidden</span>}
                  {item.reported && !item.resolved && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Reported</span>}
                  {item.resolved && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Resolved</span>}
                </div>
                {tab === "rate_cards" && <p className="text-xs text-gray-400">Updated {fmtDate(item.updatedAt)}</p>}
                {tab === "portfolios" && <p className="text-xs text-gray-400">{item.portfolioCount} portfolio items</p>}
                {tab === "bios" && item.preview && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.preview}…</p>}
                {tab === "reported" && <p className="text-xs text-gray-500 mt-0.5"><span className="font-semibold">{item.target}</span> · {item.reason}</p>}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {tab !== "reported" && (
                  <button onClick={() => toggleHide(item)} disabled={busy === item.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 disabled:opacity-50">
                    {item.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {item.hidden ? "Restore" : "Hide"}
                  </button>
                )}
                {tab === "reported" && !item.resolved && (
                  <button onClick={() => resolveReport(item.id)} disabled={busy === item.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 disabled:opacity-50">
                    <CheckSquare className="w-3 h-3" /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
