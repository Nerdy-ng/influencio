import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { saveProfile } from "../../lib/profile";
import {
  MessageSquare, Search, RotateCcw, Flag, ShieldOff, ShieldCheck,
  Trash2, Lock, AlertTriangle, Send, Shield,
} from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');

const TABS = ["conversations", "reported", "blocked"];

function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function MessagingModerationPanel({ showToast, auditLog }) {
  const [tab, setTab]               = useState("conversations");
  const [threads, setThreads]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [messages, setMessages]     = useState([]);
  const [profileMap, setProfileMap] = useState({});
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [busy, setBusy]             = useState(null);
  const [blocked, setBlocked]       = useState([]);
  const [reported, setReported]     = useState([]);
  const [adminId, setAdminId]       = useState(null);
  const [compose, setCompose]       = useState("");
  const [sending, setSending]       = useState(false);
  const scrollRef                   = useRef(null);
  const realtimeCh                  = useRef(null);

  // Grab current admin user id once
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setAdminId(data.user.id);
    });
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Real-time subscription when a thread is selected
  useEffect(() => {
    if (realtimeCh.current) { supabase.removeChannel(realtimeCh.current); realtimeCh.current = null; }
    if (!selected) return;
    const ch = supabase
      .channel(`admin-messages:${selected.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `collab_id=eq.${selected.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    realtimeCh.current = ch;
    return () => { supabase.removeChannel(ch); realtimeCh.current = null; };
  }, [selected?.id]);

  async function load() {
    setLoading(true);

    // Load collabs that have at least one message (active threads)
    const [{ data: collabs }, { data: msgReported }] = await Promise.all([
      supabase
        .from("collabs")
        .select("id, brand_id, creator_id, content_type, status, payment_status, created_at, updated_at, locked")
        .neq("status", "cancelled")
        .order("updated_at", { ascending: false })
        .limit(300),
      supabase
        .from("messages")
        .select("*")
        .eq("reported", true)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const collabList = collabs || [];

    // Resolve all profile names in one query
    const ids = [...new Set(collabList.flatMap(c => [c.brand_id, c.creator_id]).filter(Boolean))];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, handle")
        .in("id", ids);
      (profs || []).forEach(p => {
        nameMap[p.id] = { label: p.company_name || p.full_name || p.handle || p.id?.slice(0, 8), ...p };
      });
    }
    setProfileMap(nameMap);

    setThreads(collabList.map(c => ({
      ...c,
      brandName:   nameMap[c.brand_id]?.label  || "Brand",
      creatorName: nameMap[c.creator_id]?.label || "Creator",
    })));

    // Reported messages with sender names
    const reportedIds = [...new Set((msgReported || []).map(m => m.sender_id).filter(Boolean))];
    let reportedNames = { ...nameMap };
    if (reportedIds.some(id => !reportedNames[id])) {
      const newIds = reportedIds.filter(id => !reportedNames[id]);
      const { data: rp } = await supabase.from("profiles").select("id, full_name, company_name, handle").in("id", newIds);
      (rp || []).forEach(p => { reportedNames[p.id] = { label: p.company_name || p.full_name || p.handle || p.id?.slice(0, 8) }; });
    }
    setReported((msgReported || []).map(m => ({
      ...m,
      senderName: reportedNames[m.sender_id]?.label || m.sender_id?.slice(0, 8) || "Unknown",
    })));

    // Blocked users
    const { data: pr } = await supabase
      .from("profiles")
      .select("id, full_name, company_name, handle, restrictions")
      .not("restrictions", "is", null);
    setBlocked((pr || []).filter(p => p.restrictions?.messaging === true).map(p => ({
      ...p,
      displayName: p.company_name || p.full_name || p.handle || p.id?.slice(0, 8),
    })));

    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function openThread(thread) {
    setSelected(thread);
    setCompose("");
    setMsgLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("collab_id", thread.id)
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages(data || []);
    setMsgLoading(false);
  }

  async function sendAdminMessage() {
    if (!compose.trim() || !selected || !adminId) return;
    setSending(true);
    const text = stripInjection(compose.trim());
    const { error } = await supabase.from("messages").insert({
      collab_id:   selected.id,
      sender_id:   adminId,
      sender_role: "admin",
      sender_type: "admin",
      sender_name: "Brandior Team",
      body:        text,
      text:        text,
    });
    if (error) { showToast("Failed to send: " + error.message, "error"); }
    else {
      setCompose("");
      auditLog?.("admin_message_sent", "collab", selected.id,
        `${selected.brandName} × ${selected.creatorName}`, { preview: text.slice(0, 80) });
    }
    setSending(false);
  }

  async function deleteMessage(msgId) {
    setBusy(msgId);
    await supabase.from("messages").delete().eq("id", msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    auditLog?.("delete_message", "message", msgId);
    showToast("Message deleted");
    setBusy(null);
  }

  async function lockThread(collabId) {
    setBusy(collabId);
    await supabase.from("collabs").update({ locked: true }).eq("id", collabId);
    setThreads(prev => prev.map(t => t.id === collabId ? { ...t, locked: true } : t));
    setSelected(prev => prev?.id === collabId ? { ...prev, locked: true } : prev);
    auditLog?.("lock_conversation", "collab", collabId);
    showToast("Conversation locked");
    setBusy(null);
  }

  async function unlockThread(collabId) {
    setBusy(collabId);
    await supabase.from("collabs").update({ locked: false }).eq("id", collabId);
    setThreads(prev => prev.map(t => t.id === collabId ? { ...t, locked: false } : t));
    setSelected(prev => prev?.id === collabId ? { ...prev, locked: false } : prev);
    auditLog?.("unlock_conversation", "collab", collabId);
    showToast("Conversation unlocked");
    setBusy(null);
  }

  async function unreportMessage(msgId) {
    setBusy(msgId);
    await supabase.from("messages").update({ reported: false }).eq("id", msgId);
    setReported(prev => prev.filter(m => m.id !== msgId));
    showToast("Report cleared");
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

  function senderLabel(msg) {
    if (msg.sender_role === "admin" || msg.sender_type === "admin") return "Brandior Team";
    return profileMap[msg.sender_id]?.label || msg.sender_name || msg.sender_id?.slice(0, 8) || "User";
  }

  function senderColor(msg) {
    if (msg.sender_role === "admin" || msg.sender_type === "admin") return "#7c3aed";
    if (msg.sender_role === "brand" || msg.sender_type === "brand") return "#4f46e5";
    return "#0891b2";
  }

  function senderBadge(msg) {
    if (msg.sender_role === "admin" || msg.sender_type === "admin") return (
      <span className="inline-flex items-center gap-0.5 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">
        <Shield className="w-2.5 h-2.5" /> Admin
      </span>
    );
    if (msg.sender_role === "brand") return (
      <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-semibold">Brand</span>
    );
    return (
      <span className="text-[10px] bg-cyan-100 text-cyan-600 px-1.5 py-0.5 rounded-full font-semibold">Creator</span>
    );
  }

  const filteredThreads = threads.filter(t => {
    const q = search.toLowerCase();
    return !q || t.brandName.toLowerCase().includes(q) || t.creatorName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Messaging</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {threads.length} threads · {reported.length} reported · {blocked.length} blocked
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
            style={tab === t
              ? { backgroundColor: "#fff", color: "#4f46e5", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
              : { color: "#64748b" }}>
            {t === "reported" ? `Reported (${reported.length})`
            : t === "blocked" ? `Blocked (${blocked.length})`
            : "Conversations"}
          </button>
        ))}
      </div>

      {/* ── Conversations tab ── */}
      {tab === "conversations" && (
        <div className="flex gap-4" style={{ minHeight: 560 }}>
          {/* Thread list */}
          <div className="w-72 flex-shrink-0 flex flex-col gap-2">
            <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input value={search} onChange={e => setSearch(stripInjection(e.target.value))}
                  placeholder="Search participants…"
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 outline-none focus:border-indigo-400" />
              </div>
            </div>
            <div className="flex-1 space-y-1.5 overflow-y-auto" style={{ maxHeight: 600 }}>
              {loading
                ? <p className="text-center text-xs text-gray-400 py-8">Loading…</p>
                : filteredThreads.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-6">No threads found</p>
                  : filteredThreads.map(t => (
                    <button key={t.id} onClick={() => openThread(t)}
                      className="w-full text-left p-3 rounded-xl transition-all"
                      style={{
                        backgroundColor: selected?.id === t.id ? "#eef2ff" : "#fff",
                        border: `1px solid ${selected?.id === t.id ? "#c7d2fe" : "#e2e8f0"}`,
                      }}>
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <p className="text-xs font-semibold text-gray-700 truncate leading-tight">
                          {t.brandName} × {t.creatorName}
                        </p>
                        {t.locked && (
                          <Lock className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {t.content_type?.replace(/_/g, " ") || "Collab"} · {timeAgo(t.updated_at || t.created_at)}
                      </p>
                    </button>
                  ))}
            </div>
          </div>

          {/* Message view + compose */}
          {selected ? (
            <div className="flex-1 rounded-2xl bg-white flex flex-col overflow-hidden" style={{ border: "1px solid #e2e8f0", maxHeight: 680 }}>
              {/* Header */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{selected.brandName} × {selected.creatorName}</p>
                  <p className="text-xs text-gray-400">
                    {selected.content_type?.replace(/_/g, " ") || "Collaboration"}
                    {selected.locked ? " · 🔒 Locked" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selected.locked ? (
                    <button onClick={() => unlockThread(selected.id)} disabled={busy === selected.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 disabled:opacity-50">
                      <Lock className="w-3 h-3" /> Unlock
                    </button>
                  ) : (
                    <button onClick={() => lockThread(selected.id)} disabled={busy === selected.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 disabled:opacity-50">
                      <Lock className="w-3 h-3" /> Lock
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading
                  ? <p className="text-sm text-gray-400 text-center py-10">Loading messages…</p>
                  : messages.length === 0
                    ? <p className="text-sm text-gray-300 text-center py-14">No messages yet in this thread.</p>
                    : messages.map(m => {
                      const isAdmin = m.sender_role === "admin" || m.sender_type === "admin";
                      return (
                        <div key={m.id}
                          className={`group flex items-start gap-2 ${m.reported ? "bg-red-50 rounded-xl p-2" : ""} ${isAdmin ? "flex-row-reverse" : ""}`}>
                          {/* Avatar */}
                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: senderColor(m) }}>
                            {isAdmin ? <Shield className="w-3.5 h-3.5" /> : senderLabel(m).slice(0, 2).toUpperCase()}
                          </div>
                          <div className={`flex-1 min-w-0 ${isAdmin ? "items-end flex flex-col" : ""}`}>
                            <div className={`flex items-center gap-1.5 mb-0.5 ${isAdmin ? "flex-row-reverse" : ""}`}>
                              <span className="text-xs font-semibold" style={{ color: senderColor(m) }}>
                                {senderLabel(m)}
                              </span>
                              {senderBadge(m)}
                              <span className="text-[10px] text-gray-300">{timeAgo(m.created_at)}</span>
                              {m.reported && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded-full font-semibold">Reported</span>
                              )}
                            </div>
                            <div className={`inline-block max-w-xs lg:max-w-sm rounded-2xl px-3 py-2 text-sm ${
                              isAdmin
                                ? "bg-purple-600 text-white rounded-tr-sm"
                                : "bg-gray-100 text-gray-800 rounded-tl-sm"
                            }`}>
                              {m.text || m.body || (m.file_url ? (
                                <a href={m.file_url} target="_blank" rel="noopener noreferrer"
                                  className="underline text-xs">{m.file_name || "Attachment"}</a>
                              ) : "—")}
                            </div>
                          </div>
                          <button onClick={() => deleteMessage(m.id)} disabled={busy === m.id}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition-all disabled:opacity-30 self-start mt-1 flex-shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
              </div>

              {/* Admin compose */}
              <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2 border border-purple-100">
                  <Shield className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                  <input
                    value={compose}
                    onChange={e => setCompose(stripInjection(e.target.value))}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAdminMessage(); } }}
                    placeholder="Write as Brandior Team…"
                    disabled={selected.locked || sending}
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-purple-300 outline-none disabled:opacity-40"
                  />
                  <button onClick={sendAdminMessage} disabled={!compose.trim() || selected.locked || sending}
                    className="p-1.5 rounded-lg bg-purple-600 text-white disabled:opacity-30 hover:bg-purple-700 transition-colors flex-shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {selected.locked && (
                  <p className="text-[10px] text-red-400 mt-1 text-center">Conversation is locked — unlock to send messages</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: "1px solid #e2e8f0" }}>
              <div className="text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">Select a conversation to view</p>
                <p className="text-xs text-gray-300 mt-1">You can read history and send as Brandior Team</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Reported tab ── */}
      {tab === "reported" && (
        <div className="space-y-2">
          {reported.length === 0 && !loading && (
            <div className="text-center py-16">
              <Flag className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No reported messages</p>
            </div>
          )}
          {reported.map(m => (
            <div key={m.id} className="bg-white rounded-xl p-4 border border-red-100 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-700">{m.senderName}</span>
                  <span className="text-xs text-gray-400">{timeAgo(m.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{m.text || m.body || m.content || "—"}</p>
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

      {/* ── Blocked tab ── */}
      {tab === "blocked" && (
        <div className="space-y-2">
          {blocked.length === 0 && !loading && (
            <div className="text-center py-16">
              <ShieldOff className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No messaging blocks active</p>
            </div>
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
