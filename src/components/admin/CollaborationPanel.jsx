import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Search, RotateCcw, Briefcase, Clock, CheckCircle, AlertTriangle, Scale, RefreshCw } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');

const STATUS_COLOR = {
  pending:            { bg: "#fef3c7", color: "#d97706" },
  in_progress:        { bg: "#dbeafe", color: "#1d4ed8" },
  delivered:          { bg: "#ede9fe", color: "#7c3aed" },
  revision_requested: { bg: "#fee2e2", color: "#dc2626" },
  completed:          { bg: "#dcfce7", color: "#16a34a" },
  cancelled:          { bg: "#f1f5f9", color: "#64748b" },
  paused:             { bg: "#fff7ed", color: "#f97316" },
  expired:            { bg: "#fef2f2", color: "#ef4444" },
};

const FILTERS = [
  { key: "all",       label: "All",       color: "#4f46e5" },
  { key: "pending",   label: "Pending",   color: "#d97706" },
  { key: "active",    label: "Active",    color: "#1d4ed8" },
  { key: "delivered", label: "Delivered", color: "#7c3aed" },
  { key: "completed", label: "Completed", color: "#16a34a" },
  { key: "cancelled", label: "Cancelled", color: "#64748b" },
];

function isActive(s) { return ["in_progress","delivered","revision_requested"].includes(s); }

function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—"; }
function fmtMoney(n) { return `₦${Number(n || 0).toLocaleString()}`; }
function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function CollaborationPanel({ showToast, auditLog }) {
  const [collabs,  setCollabs]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [tab,      setTab]      = useState("overview");
  const [messages, setMessages] = useState([]);
  const [msgLoad,  setMsgLoad]  = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase.from("collabs").select("*").order("created_at", { ascending: false });
    const list = rows || [];
    const ids = [...new Set(list.flatMap(c => [c.brand_id, c.creator_id]))];
    let nameMap = {};
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, company_name, handle").in("id", ids);
      (profiles || []).forEach(p => { nameMap[p.id] = { name: p.company_name || p.full_name || p.handle || "Unknown", raw: p }; });
    }
    setCollabs(list.map(c => ({
      ...c,
      brandName:   nameMap[c.brand_id]?.name   || "Unknown Brand",
      creatorName: nameMap[c.creator_id]?.name || "Unknown Creator",
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selected || tab !== "messages") return;
    setMsgLoad(true);
    supabase.from("messages").select("*").or(`collab_id.eq.${selected.id}`).order("created_at").then(({ data }) => {
      setMessages(data || []);
      setMsgLoad(false);
    });
  }, [selected?.id, tab]);

  const filtered = collabs.filter(c => {
    const term = search.toLowerCase();
    const matchSearch = !term || c.brandName.toLowerCase().includes(term) || c.creatorName.toLowerCase().includes(term) || (c.content_type || "").toLowerCase().includes(term);
    const matchFilter = filter === "all" ? true : filter === "active" ? isActive(c.status) : c.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = Object.fromEntries(FILTERS.map(f => [f.key,
    f.key === "all" ? collabs.length : f.key === "active" ? collabs.filter(c => isActive(c.status)).length : collabs.filter(c => c.status === f.key).length
  ]));

  async function updateStatus(status) {
    if (!selected) return;
    setBusy(true);
    await supabase.from("collabs").update({ status }).eq("id", selected.id);
    auditLog?.(`collab_${status}`, "collab", selected.id, `${selected.brandName} × ${selected.creatorName}`);
    showToast(`Collaboration ${status.replace("_", " ")}`);
    await load();
    setBusy(false);
  }

  async function handleTransferDispute() {
    if (!disputeReason.trim()) { showToast("Enter a reason", "error"); return; }
    setBusy(true);
    await supabase.from("disputes").insert({
      collab_id:   selected.id,
      brand_id:    selected.brand_id,
      creator_id:  selected.creator_id,
      reason:      disputeReason.trim(),
      status:      "open",
      raised_by:   "admin",
      amount:      selected.total_amount,
    });
    await supabase.from("collabs").update({ status: "disputed" }).eq("id", selected.id);
    auditLog?.("transfer_to_dispute", "collab", selected.id);
    showToast("Transferred to dispute");
    setDisputeModal(false); setDisputeReason("");
    await load();
    setBusy(false);
  }

  const DETAIL_TABS = ["overview", "timeline", "files", "payments", "messages"];

  function Field({ label, value }) {
    return (
      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Collaboration Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">{collabs.length} total collaborations</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={filter === f.key ? { backgroundColor: f.color, color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
            {f.label} <span className="text-xs px-1.5 rounded-full" style={filter === f.key ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" } : { backgroundColor: "#e2e8f0", color: "#64748b" }}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by brand, creator or content type…" value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 520 }}>
        {/* List */}
        <div className="w-80 flex-shrink-0 space-y-2 overflow-y-auto" style={{ maxHeight: 720 }}>
          {loading ? <p className="text-center text-sm text-gray-400 py-10">Loading…</p>
          : filtered.length === 0 ? <div className="text-center py-16"><Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No collaborations</p></div>
          : filtered.map(c => {
            const sc = STATUS_COLOR[c.status] || { bg: "#f1f5f9", color: "#64748b" };
            return (
              <button key={c.id} onClick={() => { setSelected(c); setTab("overview"); }}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{ backgroundColor: selected?.id === c.id ? "#eef2ff" : "#fff", border: `1px solid ${selected?.id === c.id ? "#c7d2fe" : "#e2e8f0"}` }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.content_type || "Collaboration"}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize" style={sc}>{c.status?.replace(/_/g, " ")}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.brandName} × {c.creatorName}</p>
                <p className="text-xs text-gray-400 mt-1">{fmtMoney(c.total_amount)} · {fmtDate(c.created_at)}</p>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white overflow-hidden flex flex-col" style={{ border: "1px solid #e2e8f0", maxHeight: 720 }}>
            {/* Header + actions */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selected.content_type || "Collaboration"}</h3>
                  <p className="text-sm text-gray-500">{selected.brandName} × {selected.creatorName}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                  style={STATUS_COLOR[selected.status] || { bg: "#f1f5f9", color: "#64748b" }}>
                  {selected.status?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => updateStatus("cancelled")} disabled={busy}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 disabled:opacity-50">Cancel</button>
                <button onClick={() => updateStatus("completed")} disabled={busy}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 disabled:opacity-50">Force Complete</button>
                <button onClick={() => updateStatus("revision_requested")} disabled={busy}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-700 disabled:opacity-50">Force Revision</button>
                <button onClick={() => updateStatus("in_progress")} disabled={busy}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 disabled:opacity-50">Reopen</button>
                <button onClick={() => setDisputeModal(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700">Transfer to Dispute</button>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 mt-3">
                {DETAIL_TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                    style={tab === t ? { backgroundColor: "#eef2ff", color: "#4f46e5" } : { color: "#94a3b8" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Duration"       value={selected.duration_label || "—"} />
                    <Field label="Total Amount"   value={fmtMoney(selected.total_amount)} />
                    <Field label="Platform Fee"   value={fmtMoney(selected.platform_fee)} />
                    <Field label="Creator Payout" value={fmtMoney(selected.creator_payout)} />
                    <Field label="Payment Status" value={selected.payment_status || "—"} />
                    <Field label="Created"        value={fmtDate(selected.created_at)} />
                  </div>
                  {selected.brief && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Brief</p>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm text-gray-700">
                        {selected.brief.productName  && <p><span className="font-semibold">Product:</span> {selected.brief.productName}</p>}
                        {selected.brief.goal         && <p><span className="font-semibold">Goal:</span> {selected.brief.goal}</p>}
                        {selected.brief.instructions && <p><span className="font-semibold">Instructions:</span> {selected.brief.instructions}</p>}
                        {selected.brief.deadline     && <p><span className="font-semibold">Deadline:</span> {selected.brief.deadline}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "timeline" && (
                <div className="space-y-3">
                  {[
                    { label: "Created",  date: selected.created_at,  icon: "🕐", color: "#4f46e5" },
                    { label: "Started",  date: selected.started_at,  icon: "▶️",  color: "#0ea5e9" },
                    { label: "Delivered",date: selected.delivered_at,icon: "📦", color: "#7c3aed" },
                    { label: "Completed",date: selected.completed_at,icon: "✅", color: "#16a34a" },
                    { label: "Updated",  date: selected.updated_at,  icon: "🔄", color: "#d97706" },
                  ].filter(e => e.date).map((e, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <span className="text-lg">{e.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{e.label}</p>
                        <p className="text-xs text-gray-400">{fmtDate(e.date)} · {timeAgo(e.date)}</p>
                      </div>
                    </div>
                  ))}
                  {!selected.created_at && <p className="text-sm text-gray-400 text-center py-8">No timeline data</p>}
                </div>
              )}

              {tab === "files" && (
                <div className="space-y-2">
                  {Array.isArray(selected.delivered_files) && selected.delivered_files.length > 0
                    ? selected.delivered_files.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-sm">
                          <span className="text-gray-700 truncate">{f.name}</span>
                          <span className="text-gray-400 text-xs ml-2">{fmtDate(f.uploaded_at)}</span>
                        </a>
                      ))
                    : <div className="text-center py-12 text-sm text-gray-300">No files delivered yet</div>}
                </div>
              )}

              {tab === "payments" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Total Amount"   value={fmtMoney(selected.total_amount)} />
                    <Field label="Platform Fee"   value={fmtMoney(selected.platform_fee)} />
                    <Field label="Creator Payout" value={fmtMoney(selected.creator_payout)} />
                    <Field label="Payment Status" value={selected.payment_status || "unpaid"} />
                  </div>
                  {selected.payment_status === "paid" && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-0.5">In Escrow</p>
                      <p className="text-lg font-black text-amber-700">{fmtMoney(selected.total_amount)}</p>
                    </div>
                  )}
                  {selected.payment_status === "released" && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-0.5">Released to Creator</p>
                      <p className="text-lg font-black text-green-700">{fmtMoney(selected.creator_payout)}</p>
                    </div>
                  )}
                </div>
              )}

              {tab === "messages" && (
                <div className="space-y-2">
                  {msgLoad ? <p className="text-sm text-gray-400 text-center py-8">Loading messages…</p>
                  : messages.length === 0 ? <div className="text-center py-12 text-sm text-gray-300">No messages found</div>
                  : messages.map(m => (
                    <div key={m.id} className="p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-500">{m.sender_name || m.sender_id?.slice(0,8)}</p>
                        <p className="text-xs text-gray-400">{timeAgo(m.created_at)}</p>
                      </div>
                      <p className="text-sm text-gray-700">{m.content || m.text || "—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: "1px solid #e2e8f0" }}>
            <div className="text-center"><Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">Select a collaboration to view details</p></div>
          </div>
        )}
      </div>

      {/* Transfer to dispute modal */}
      {disputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-1">Transfer to Dispute</h3>
            <p className="text-sm text-gray-500 mb-4">This will open a formal dispute for this collaboration.</p>
            <textarea rows={3} value={disputeReason} onChange={e => setDisputeReason(stripInjection(e.target.value))}
              placeholder="Reason for escalation…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setDisputeModal(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleTransferDispute} disabled={busy} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: "#7c3aed" }}>Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
