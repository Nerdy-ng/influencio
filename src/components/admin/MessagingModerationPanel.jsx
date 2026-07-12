import { useState, useEffect } from "react";
import { saveProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import { MessageSquare, Search, RotateCcw, Flag, ShieldOff, ShieldCheck, Trash2, Lock, AlertTriangle } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');

const TABS = ["conversations", "reported", "blocked"];

function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function MessagingModerationPanel({ showToast, auditLog }) {
  const [tab, setTab]              = useState("conversations");
  const [convos, setConvos]        = useState([]);
  const [selected, setSelected]    = useState(null);
  const [messages, setMessages]    = useState([]);
  const [search, setSearch]        = useState("");
  const [loading, setLoading]      = useState(true);
  const [msgLoading, setMsgLoading]= useState(false);
  const [busy, setBusy]            = useState(null);
  const [blocked, setBlocked]      = useState([]);
  const [reported, setReported]    = useState([]);

  async function load() {
    setLoading(true);
    const [{ data: cs }, { data: msgs }] = await Promise.all([
      supabase.from("conversations").select("*").order("updated_at", { ascending: false }).limit(200),
      supabase.from("messages").select("*").eq("reported", true).order("created_at", { ascending: false }).limit(200),
    ]);
    // Load participant names
    const convList = cs || [];
    const msgList = msgs || [];
    const ids = [...new Set([
      ...convList.flatMap(c => [c.brand_id, c.creator_id, c.participant_a, c.participant_b].filter(Boolean)),
      ...msgList.map(m => m.sender_id).filter(Boolean),
    ])];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, company_name, handle").in("id", ids);
      (profs || []).forEach(p => { nameMap[p.id] = p.company_name || p.full_name || p.handle || p.id?.slice(0, 8); });
    }
    setConvos(convList.map(c => ({
      ...c,
      nameA: nameMap[c.brand_id || c.participant_a] || "User A",
      nameB: nameMap[c.creator_id || c.participant_b] || "User B",
    })));
    setReported(msgList.map(m => ({
      ...m,
      senderName: nameMap[m.sender_id] || m.sender_id?.slice(0, 8) || "Unknown",
    })));
    // Blocked users from restrictions
    const { data: pr } = await supabase.from("profiles").select("id, full_name, company_name, handle, restrictions").not("restrictions", "is", null);
    setBlocked((pr || []).filter(p => p.restrictions?.messaging === true).map(p => ({
      ...p,
      displayName: p.company_name || p.full_name || p.handle || p.id?.slice(0, 8),
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function loadMessages(convoId) {
    setMsgLoading(true);
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", convoId).order("created_at").limit(100);
    setMessages(data || []);
    setMsgLoading(false);
  }

  async function deleteMessage(msgId) {
    setBusy(msgId);
    await supabase.from("messages").delete().eq("id", msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    auditLog?.("delete_message", "message", msgId);
    showToast("Message deleted");
    setBusy(null);
  }

  async function lockConversation(convoId) {
    setBusy(convoId);
    await supabase.from("conversations").update({ locked: true }).eq("id", convoId);
    auditLog?.("lock_conversation", "conversation", convoId);
    showToast("Conversation locked");
    setBusy(null);
    load();
  }

  async function unreportMessage(msgId) {
    setBusy(msgId);
    await supabase.from("messages").update({ reported: false }).eq("id", msgId);
    setReported(prev => prev.filter(m => m.id !== msgId));
    showToast("Cleared report");
    setBusy(null);
  }

  async function toggleMessagingBlock(userId, displayName, isCurrentlyBlocked) {
    setBusy(userId);
    const { data: p } = await supabase.from("profiles").select("restrictions").eq("id", userId).single();
    const r = p?.restrictions || {};
    r.messaging = !isCurrentlyBlocked;
    saveProfile(userId, { restrictions: r });
    auditLog?.(isCurrentlyBlocked ? "unblock_messaging" : "block_messaging", "profile", userId, displayName);
    showToast(isCurrentlyBlocked ? "Messaging restored" : "Messaging blocked");
    load();
    setBusy(null);
  }

  const filteredConvos = convos.filter(c => {
    const t = search.toLowerCase();
    return !t || c.nameA.toLowerCase().includes(t) || c.nameB.toLowerCase().includes(t);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Messaging Moderation</h2>
          <p className="text-sm text-gray-500 mt-0.5">{convos.length} conversations · {reported.length} reported messages · {blocked.length} blocked users</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
            style={tab === t ? { backgroundColor: "#fff", color: "#4f46e5", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: "#64748b" }}>
            {t === "reported" ? `Reported (${reported.length})` : t === "blocked" ? `Blocked (${blocked.length})` : "Conversations"}
          </button>
        ))}
      </div>

      {tab === "conversations" && (
        <div className="flex gap-4" style={{ minHeight: 520 }}>
          {/* Conversation list */}
          <div className="w-72 flex-shrink-0 space-y-2">
            <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input value={search} onChange={e => setSearch(stripInjection(e.target.value))}
                  placeholder="Search participants…" className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 outline-none focus:border-indigo-400" />
              </div>
            </div>
            <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 600 }}>
              {filteredConvos.map(c => (
                <button key={c.id} onClick={() => { setSelected(c); loadMessages(c.id); }}
                  className="w-full text-left p-3 rounded-xl transition-all"
                  style={{ backgroundColor: selected?.id === c.id ? "#eef2ff" : "#fff", border: `1px solid ${selected?.id === c.id ? "#c7d2fe" : "#e2e8f0"}` }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <p className="text-xs font-semibold text-gray-700 truncate">{c.nameA} × {c.nameB}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{timeAgo(c.updated_at)}</p>
                    {c.locked && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Locked</span>}
                  </div>
                </button>
              ))}
              {!loading && filteredConvos.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No conversations</p>}
            </div>
          </div>

          {/* Message view */}
          {selected ? (
            <div className="flex-1 rounded-2xl bg-white overflow-hidden flex flex-col" style={{ border: "1px solid #e2e8f0", maxHeight: 680 }}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{selected.nameA} × {selected.nameB}</p>
                  <p className="text-xs text-gray-400">{selected.locked ? "🔒 Locked" : "Active"} · {timeAgo(selected.updated_at)}</p>
                </div>
                <div className="flex gap-2">
                  {!selected.locked && (
                    <button onClick={() => lockConversation(selected.id)} disabled={busy === selected.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 disabled:opacity-50">
                      <Lock className="w-3 h-3" /> Lock
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {msgLoading ? <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
                : messages.length === 0 ? <p className="text-sm text-gray-300 text-center py-12">No messages</p>
                : messages.map(m => (
                  <div key={m.id} className={`group flex items-start gap-2 ${m.reported ? "bg-red-50 rounded-xl p-2" : ""}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-600">{m.sender_name || m.sender_id?.slice(0, 8) || "User"}</span>
                        <span className="text-xs text-gray-300">{timeAgo(m.created_at)}</span>
                        {m.reported && <span className="text-xs bg-red-100 text-red-600 px-1.5 rounded-full font-semibold">Reported</span>}
                      </div>
                      <p className="text-sm text-gray-700">{m.content || m.text || "—"}</p>
                    </div>
                    <button onClick={() => deleteMessage(m.id)} disabled={busy === m.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-all disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: "1px solid #e2e8f0" }}>
              <div className="text-center"><MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">Select a conversation</p></div>
            </div>
          )}
        </div>
      )}

      {tab === "reported" && (
        <div className="space-y-2">
          {reported.length === 0 && !loading && (
            <div className="text-center py-16"><Flag className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No reported messages</p></div>
          )}
          {reported.map(m => (
            <div key={m.id} className="bg-white rounded-xl p-4 border border-red-100 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-700">{m.senderName}</span>
                  <span className="text-xs text-gray-400">{timeAgo(m.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{m.content || m.text || "—"}</p>
                {m.report_reason && <p className="text-xs text-red-500 mb-2">Reason: {m.report_reason}</p>}
                <div className="flex gap-2">
                  <button onClick={() => deleteMessage(m.id)} disabled={busy === m.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 disabled:opacity-50">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  <button onClick={() => unreportMessage(m.id)} disabled={busy === m.id}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 disabled:opacity-50">
                    Clear Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "blocked" && (
        <div className="space-y-2">
          {blocked.length === 0 && !loading && (
            <div className="text-center py-16"><ShieldOff className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No messaging blocks active</p></div>
          )}
          {blocked.map(u => (
            <div key={u.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{u.displayName}</p>
                <p className="text-xs text-gray-400">Messaging restricted</p>
              </div>
              <button onClick={() => toggleMessagingBlock(u.id, u.displayName, true)} disabled={busy === u.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 disabled:opacity-50">
                <ShieldCheck className="w-3.5 h-3.5" /> Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
