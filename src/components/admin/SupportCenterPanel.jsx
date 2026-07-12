import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { LifeBuoy, RotateCcw, Search, MessageSquare, CheckCircle, Clock, StickyNote } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";
function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const QUICK_REPLIES = [
  { label: "Greeting", text: "Hi! Thanks for reaching out to Brandior support. I'm looking into this for you right now." },
  { label: "Investigating", text: "I've escalated this to our technical team. We'll update you within 24 hours." },
  { label: "Resolved", text: "This issue has been resolved. Please let me know if you experience any further problems." },
  { label: "Wallet delay", text: "Wallet credits can take up to 30 minutes to reflect. If it's been longer, please try logging out and back in." },
  { label: "Withdrawal time", text: "Withdrawals typically process within 1–3 business days. You'll receive an email when payment is sent." },
];

const STATUS_FILTERS = ["all", "open", "in_progress", "resolved", "closed"];

export default function SupportCenterPanel({ showToast, auditLog }) {
  const [tickets, setTickets]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [reply, setReply]         = useState("");
  const [note, setNote]           = useState("");
  const [busy, setBusy]           = useState(false);
  const [msgHistory, setMsgHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("conversation");

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    const list = rows || [];
    const ids = [...new Set(list.map(t => t.user_id).filter(Boolean))];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, company_name, handle, role, wallet_balance").in("id", ids);
      (profs || []).forEach(p => { nameMap[p.id] = p; });
    }
    setTickets(list.map(t => ({
      ...t,
      userName: nameMap[t.user_id]?.company_name || nameMap[t.user_id]?.full_name || nameMap[t.user_id]?.handle || "User",
      _profile: nameMap[t.user_id] || null,
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function loadMessages(ticketId) {
    const { data } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticketId).order("created_at");
    setMsgHistory(data || []);
  }

  useEffect(() => {
    if (selected) loadMessages(selected.id);
  }, [selected?.id]);

  async function sendReply() {
    if (!reply.trim() || !selected) return;
    setBusy(true);
    await supabase.from("ticket_messages").insert({ ticket_id: selected.id, sender: "admin", content: reply.trim(), created_at: new Date().toISOString() }).catch(() => {});
    await supabase.from("support_tickets").update({ status: "in_progress", last_reply_at: new Date().toISOString() }).eq("id", selected.id);
    auditLog?.("ticket_reply", "support_ticket", selected.id, selected.userName);
    showToast("Reply sent");
    setReply("");
    loadMessages(selected.id);
    setBusy(false);
  }

  async function addInternalNote() {
    if (!note.trim() || !selected) return;
    setBusy(true);
    await supabase.from("ticket_messages").insert({ ticket_id: selected.id, sender: "admin_note", content: note.trim(), created_at: new Date().toISOString() }).catch(() => {});
    showToast("Note added");
    setNote("");
    loadMessages(selected.id);
    setBusy(false);
  }

  async function updateStatus(status) {
    if (!selected) return;
    await supabase.from("support_tickets").update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : undefined }).eq("id", selected.id);
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status } : t));
    setSelected(prev => ({ ...prev, status }));
    auditLog?.(`ticket_${status}`, "support_ticket", selected.id, selected.userName);
    showToast(`Ticket ${status}`);
  }

  const filtered = tickets.filter(t => {
    const term = search.toLowerCase();
    const matchSearch = !term || t.userName.toLowerCase().includes(term) || (t.subject || "").toLowerCase().includes(term);
    const matchStatus = filter === "all" || t.status === filter;
    return matchSearch && matchStatus;
  });

  const counts = Object.fromEntries(STATUS_FILTERS.map(f => [f, f === "all" ? tickets.length : tickets.filter(t => t.status === f).length]));

  const STATUS_STYLE = {
    open:        { bg: "#fee2e2", color: "#dc2626" },
    in_progress: { bg: "#fef3c7", color: "#d97706" },
    resolved:    { bg: "#dcfce7", color: "#16a34a" },
    closed:      { bg: "#f1f5f9", color: "#64748b" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Support Center</h2>
          <p className="text-sm text-gray-500 mt-0.5">{counts.open} open · {counts.in_progress} in progress · {tickets.length} total</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={filter === f ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
              {f.replace("_", " ")} <span className="ml-1 opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(stripInjection(e.target.value))} placeholder="Search tickets…"
            className="w-full pl-8 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 540 }}>
        {/* Ticket list */}
        <div className="w-72 flex-shrink-0 space-y-1.5 overflow-y-auto" style={{ maxHeight: 640 }}>
          {filtered.map(t => (
            <button key={t.id} onClick={() => { setSelected(t); setActiveTab("conversation"); }}
              className="w-full text-left p-3 rounded-xl transition-all"
              style={{ backgroundColor: selected?.id === t.id ? "#eef2ff" : "#fff", border: `1px solid ${selected?.id === t.id ? "#c7d2fe" : "#e2e8f0"}` }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-bold text-gray-800 truncate">{t.subject || "Support request"}</p>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 capitalize" style={STATUS_STYLE[t.status] || { bg: "#f1f5f9", color: "#64748b" }}>{t.status?.replace("_", " ")}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{t.userName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{timeAgo(t.created_at)}</p>
            </button>
          ))}
          {!loading && filtered.length === 0 && <div className="text-center py-12"><LifeBuoy className="w-8 h-8 mx-auto mb-2 text-gray-200" /><p className="text-xs text-gray-400">No tickets</p></div>}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white overflow-hidden flex flex-col" style={{ border: "1px solid #e2e8f0", maxHeight: 680 }}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{selected.subject || "Support request"}</p>
                  <p className="text-xs text-gray-400">{selected.userName} · {fmtDate(selected.created_at)}</p>
                </div>
                <div className="flex gap-1.5">
                  {["open", "in_progress", "resolved", "closed"].filter(s => s !== selected.status).map(s => (
                    <button key={s} onClick={() => updateStatus(s)}
                      className="px-2 py-1.5 rounded-lg text-xs font-semibold capitalize"
                      style={STATUS_STYLE[s] || { backgroundColor: "#f1f5f9", color: "#64748b" }}>
                      → {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tabs */}
              <div className="flex gap-1">
                {["conversation", "user_info", "notes"].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                    style={activeTab === t ? { backgroundColor: "#eef2ff", color: "#4f46e5" } : { color: "#94a3b8" }}>
                    {t.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "conversation" && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {/* Original message */}
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1">{selected.userName} (original)</p>
                      <p className="text-sm text-gray-700">{selected.message || selected.body || "No message body"}</p>
                    </div>
                    {msgHistory.filter(m => m.sender !== "admin_note").map(m => (
                      <div key={m.id} className={`p-3 rounded-xl ${m.sender === "admin" ? "bg-indigo-50 border border-indigo-100 ml-8" : "bg-gray-50 border border-gray-100"}`}>
                        <p className="text-xs font-semibold text-gray-500 mb-1">{m.sender === "admin" ? "Support Team" : selected.userName}</p>
                        <p className="text-sm text-gray-700">{m.content}</p>
                      </div>
                    ))}
                  </div>
                  {/* Quick replies */}
                  <div className="px-4 pb-1 flex gap-1.5 flex-wrap">
                    {QUICK_REPLIES.map(qr => (
                      <button key={qr.label} onClick={() => setReply(qr.text)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200">
                        {qr.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
                    <textarea rows={2} value={reply} onChange={e => setReply(stripInjection(e.target.value))} placeholder="Type reply…"
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 resize-none" />
                    <button onClick={sendReply} disabled={busy || !reply.trim()}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 self-end" style={{ backgroundColor: "#4f46e5" }}>
                      Send
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "user_info" && selected._profile && (
                <div className="p-5 space-y-2">
                  {[
                    ["Name", selected.userName],
                    ["Role", selected._profile.role],
                    ["Wallet Balance", `₦${Number(selected._profile.wallet_balance || 0).toLocaleString()}`],
                    ["Handle", selected._profile.handle || "—"],
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <p className="text-xs text-gray-500">{l}</p>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{v}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "notes" && (
                <div className="p-4 flex flex-col h-full">
                  <div className="flex-1 space-y-2 mb-3 overflow-y-auto">
                    {msgHistory.filter(m => m.sender === "admin_note").map(m => (
                      <div key={m.id} className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                        <p className="text-xs text-yellow-600 font-semibold mb-1">Internal note · {timeAgo(m.created_at)}</p>
                        <p className="text-sm text-yellow-800">{m.content}</p>
                      </div>
                    ))}
                    {msgHistory.filter(m => m.sender === "admin_note").length === 0 && (
                      <p className="text-xs text-gray-300 text-center py-8">No internal notes yet</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <textarea rows={2} value={note} onChange={e => setNote(stripInjection(e.target.value))} placeholder="Add internal note (not visible to user)…"
                      className="flex-1 px-3 py-2 rounded-xl border border-yellow-200 text-sm outline-none focus:border-yellow-400 resize-none bg-yellow-50" />
                    <button onClick={addInternalNote} disabled={busy || !note.trim()}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-yellow-200 text-yellow-800 disabled:opacity-50 self-end">
                      <StickyNote className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: "1px solid #e2e8f0" }}>
            <div className="text-center"><LifeBuoy className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">Select a ticket</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
