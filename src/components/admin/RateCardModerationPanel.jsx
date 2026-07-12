import { useState, useEffect, useCallback } from "react";
import { RotateCcw, ChevronDown, ChevronUp, CheckCircle, XCircle, Star } from "lucide-react";
import { supabase } from "../../lib/supabase";

function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function RateCardModerationPanel({ showToast, auditLog }) {
  const [cards,    setCards]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter,   setFilter]   = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("rate_cards")
      .select(`
        *,
        creator:profiles!creator_id(id, full_name, role, verified)
      `)
      .order("updated_at", { ascending: false })
      .limit(100);
    setCards(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function approve(card) {
    await supabase.from("rate_cards").update({ is_public: true }).eq("id", card.id);
    auditLog?.("approve_rate_card", "rate_card", card.id, card.creator?.full_name ?? "Creator");
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, is_public: true } : c));
    showToast?.("Rate card approved — now visible on marketplace.");
  }

  async function reject(card) {
    await supabase.from("rate_cards").update({ is_public: false }).eq("id", card.id);
    auditLog?.("reject_rate_card", "rate_card", card.id, card.creator?.full_name ?? "Creator");
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, is_public: false } : c));
    showToast?.("Rate card hidden from marketplace.", "info");
  }

  const visible = filter === "all" ? cards
    : filter === "public" ? cards.filter(c => c.is_public)
    : cards.filter(c => !c.is_public);

  return (
    <div className="space-y-4">

      {/* Filter + Refresh */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { id: "all",     label: "All" },
          { id: "public",  label: "Live" },
          { id: "hidden",  label: "Hidden" },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={filter === f.id ? { backgroundColor: "#ede9fe", color: "#7c3aed" } : { color: "#94a3b8" }}>
            {f.label}
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

      {/* Cards */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">No rate cards found.</div>
      ) : (
        <div className="space-y-3">
          {visible.map(card => {
            const isOpen = expanded === card.id;
            const contentTypes = Array.isArray(card.content_types) ? card.content_types : [];
            const platforms = Array.isArray(card.platforms) ? card.platforms : [];
            const addons = Array.isArray(card.addons) ? card.addons : [];

            return (
              <div key={card.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-4 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                    style={{ backgroundColor: "#7c3aed" }}>
                    {(card.creator?.full_name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{card.creator?.full_name ?? "Unknown Creator"}</p>
                    <p className="text-xs text-gray-400">{contentTypes.length} content type{contentTypes.length !== 1 ? "s" : ""} · {platforms.length} platform{platforms.length !== 1 ? "s" : ""} · Updated {timeAgo(card.updated_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: card.is_public ? "#dcfce7" : "#fee2e2", color: card.is_public ? "#16a34a" : "#dc2626" }}>
                      {card.is_public ? "Live" : "Hidden"}
                    </span>
                    {card.is_public
                      ? <button onClick={() => reject(card)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50">
                          <XCircle className="w-3 h-3" /> Hide
                        </button>
                      : <button onClick={() => approve(card)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: "#16a34a" }}>
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>}
                    <button onClick={() => setExpanded(isOpen ? null : card.id)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 py-4 space-y-3 text-sm">
                    {contentTypes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Content Types</p>
                        <div className="flex flex-wrap gap-2">
                          {contentTypes.map((ct, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700">
                              {typeof ct === "string" ? ct : ct.label ?? ct.name ?? JSON.stringify(ct)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {platforms.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Platforms</p>
                        <div className="flex flex-wrap gap-2">
                          {platforms.map((p, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700">
                              {typeof p === "string" ? p : p.label ?? p.id ?? JSON.stringify(p)}
                              {p.fee ? ` · ₦${Number(p.fee).toLocaleString()}` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {addons.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Add-ons</p>
                        <div className="flex flex-wrap gap-2">
                          {addons.map((a, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700">
                              {typeof a === "string" ? a : a.label ?? a.name ?? JSON.stringify(a)}
                              {a.price ? ` · ₦${Number(a.price).toLocaleString()}` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
