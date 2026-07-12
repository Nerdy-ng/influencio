import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Star, RotateCcw, Search, Trash2, EyeOff, Eye, Award } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

const FILTERS = ["all", "hidden", "featured", "reported"];

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className="w-3 h-3" style={{ color: i <= n ? "#f59e0b" : "#e2e8f0", fill: i <= n ? "#f59e0b" : "none" }} />
      ))}
    </div>
  );
}

export default function ReviewsModerationPanel({ showToast, auditLog }) {
  const [reviews, setReviews]   = useState([]);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(null);

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    const list = rows || [];
    const ids = [...new Set(list.flatMap(r => [r.reviewer_id, r.creator_id, r.brand_id]).filter(Boolean))];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, company_name, handle").in("id", ids);
      (profs || []).forEach(p => { nameMap[p.id] = p.company_name || p.full_name || p.handle || "User"; });
    }
    setReviews(list.map(r => ({
      ...r,
      reviewerName: nameMap[r.reviewer_id] || nameMap[r.brand_id] || "Unknown",
      subjectName:  nameMap[r.creator_id]  || nameMap[r.brand_id] || "Unknown",
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function action(type, id) {
    setBusy(id);
    if (type === "delete") {
      await supabase.from("reviews").delete().eq("id", id);
      setReviews(prev => prev.filter(r => r.id !== id));
      auditLog?.("delete_review", "review", id);
      showToast("Review deleted");
    } else if (type === "hide") {
      await supabase.from("reviews").update({ hidden: true }).eq("id", id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, hidden: true } : r));
      auditLog?.("hide_review", "review", id);
      showToast("Review hidden");
    } else if (type === "restore") {
      await supabase.from("reviews").update({ hidden: false }).eq("id", id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, hidden: false } : r));
      showToast("Review restored");
    } else if (type === "feature") {
      const r = reviews.find(r => r.id === id);
      await supabase.from("reviews").update({ featured: !r?.featured }).eq("id", id);
      setReviews(prev => prev.map(rv => rv.id === id ? { ...rv, featured: !rv.featured } : rv));
      showToast(r?.featured ? "Removed from featured" : "Added to featured");
    }
    setBusy(null);
  }

  const filtered = reviews.filter(r => {
    const t = search.toLowerCase();
    const matchSearch = !t || r.reviewerName.toLowerCase().includes(t) || r.subjectName.toLowerCase().includes(t) || (r.comment || "").toLowerCase().includes(t);
    const matchFilter = filter === "all" ? true : filter === "hidden" ? r.hidden : filter === "featured" ? r.featured : filter === "reported" ? r.reported : true;
    return matchSearch && matchFilter;
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reviews & Ratings</h2>
          <p className="text-sm text-gray-500 mt-0.5">{reviews.length} reviews · avg {avgRating}★ · {reviews.filter(r => r.hidden).length} hidden · {reviews.filter(r => r.featured).length} featured</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={filter === f ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Search reviews…" value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-8 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      {loading ? <p className="text-center text-sm text-gray-400 py-12">Loading…</p>
      : filtered.length === 0 ? <div className="text-center py-16"><Star className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No reviews</p></div>
      : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold text-gray-800">{r.reviewerName}</p>
                    <span className="text-xs text-gray-400">→</span>
                    <p className="text-sm font-semibold text-indigo-600">{r.subjectName}</p>
                    <Stars n={r.rating} />
                    {r.hidden && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">Hidden</span>}
                    {r.featured && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">⭐ Featured</span>}
                    {r.reported && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Reported</span>}
                    <span className="text-xs text-gray-400 ml-auto">{fmtDate(r.created_at)}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => action(r.hidden ? "restore" : "hide", r.id)} disabled={busy === r.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 disabled:opacity-50">
                  {r.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {r.hidden ? "Restore" : "Hide"}
                </button>
                <button onClick={() => action("feature", r.id)} disabled={busy === r.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                  style={{ backgroundColor: r.featured ? "#fef3c7" : "#f8fafc", color: r.featured ? "#d97706" : "#64748b" }}>
                  <Award className="w-3 h-3" />
                  {r.featured ? "Unfeature" : "Feature"}
                </button>
                <button onClick={() => action("delete", r.id)} disabled={busy === r.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 disabled:opacity-50">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
