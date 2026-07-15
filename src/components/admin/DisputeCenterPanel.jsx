import { useState, useEffect } from "react";
import { saveProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import { Scale, RotateCcw, Search, FileText, Download, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;

const STATUS_COLOR = {
  open:       { bg: "#fee2e2", color: "#dc2626" },
  reviewing:  { bg: "#fef3c7", color: "#d97706" },
  resolved:   { bg: "#dcfce7", color: "#16a34a" },
  closed:     { bg: "#f1f5f9", color: "#64748b" },
  escalated:  { bg: "#ede9fe", color: "#7c3aed" },
};

const FILTERS = [
  { key: "all",      label: "All" },
  { key: "open",     label: "Open" },
  { key: "reviewing",label: "Reviewing" },
  { key: "resolved", label: "Resolved" },
  { key: "closed",   label: "Closed" },
];

const DETAIL_TABS = ["overview", "timeline", "evidence", "messages", "payment"];

export default function DisputeCenterPanel({ showToast, auditLog }) {
  const [disputes, setDisputes]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [tab, setTab]             = useState("overview");
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [resolution, setResolution] = useState({ type: "", note: "" });
  const [splitPct, setSplitPct]   = useState(50);
  const [messages, setMessages]   = useState([]);

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase.from("disputes").select("*").order("created_at", { ascending: false });
    const list = rows || [];
    const ids = [...new Set(list.flatMap(d => [d.brand_id, d.creator_id]).filter(Boolean))];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, company_name, handle").in("id", ids);
      (profs || []).forEach(p => { nameMap[p.id] = p.company_name || p.full_name || p.handle || "User"; });
    }
    setDisputes(list.map(d => ({
      ...d,
      brandName:   nameMap[d.brand_id]   || "Brand",
      creatorName: nameMap[d.creator_id] || "Creator",
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selected || tab !== "messages") return;
    supabase.from("messages").select("*").eq("collab_id", selected.collab_id || "").order("created_at").then(({ data }) => setMessages(data || []));
  }, [selected?.id, tab]);

  const filtered = disputes.filter(d => {
    const t = search.toLowerCase();
    const matchSearch = !t || d.brandName.toLowerCase().includes(t) || d.creatorName.toLowerCase().includes(t) || (d.reason || "").toLowerCase().includes(t);
    const matchFilter = filter === "all" || d.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = Object.fromEntries(FILTERS.map(f => [f.key, f.key === "all" ? disputes.length : disputes.filter(d => d.status === f.key).length]));

  async function updateStatus(status, extra = {}) {
    if (!selected) return;
    setBusy(true);
    await supabase.from("disputes").update({ status, ...extra, resolved_at: status === "resolved" ? new Date().toISOString() : undefined }).eq("id", selected.id);
    auditLog?.(`dispute_${status}`, "dispute", selected.id, `${selected.brandName} vs ${selected.creatorName}`, extra);
    showToast(`Dispute marked ${status}`);
    await load();
    setSelected(prev => ({ ...prev, status, ...extra }));
    setBusy(false);
  }

  async function handleRefund() {
    if (!selected) return;
    await updateStatus("resolved", { resolution_type: "refund", resolution_note: resolution.note });
    if (selected.brand_id && selected.amount) {
      const { data: p } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.brand_id).single();
      saveProfile(selected.brand_id, { wallet_balance: (p?.wallet_balance || 0) + Number(selected.amount) });
      showToast(`₦${Number(selected.amount).toLocaleString()} refunded to brand`);
    }
  }

  async function handleRelease() {
    if (!selected) return;
    await updateStatus("resolved", { resolution_type: "release", resolution_note: resolution.note });
    if (selected.creator_id && selected.amount) {
      const { data: p } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.creator_id).single();
      const payout = selected.creator_payout || selected.amount;
      saveProfile(selected.creator_id, { wallet_balance: (p?.wallet_balance || 0) + Number(payout) });
      showToast(`₦${Number(payout).toLocaleString()} released to creator`);
    }
  }

  async function handleSplit() {
    if (!selected || !selected.amount) return;
    const total = Number(selected.amount);
    const brandShare = Math.round(total * (splitPct / 100));
    const creatorShare = total - brandShare;
    await updateStatus("resolved", { resolution_type: "split", resolution_note: `${splitPct}% / ${100 - splitPct}% split`, split_brand_pct: splitPct });
    if (selected.brand_id) {
      const { data: bp } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.brand_id).single();
      saveProfile(selected.brand_id, { wallet_balance: (bp?.wallet_balance || 0) + brandShare });
    }
    if (selected.creator_id) {
      const { data: cp } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.creator_id).single();
      saveProfile(selected.creator_id, { wallet_balance: (cp?.wallet_balance || 0) + creatorShare });
    }
    showToast(`Split applied: ${fmtMoney(brandShare)} to brand, ${fmtMoney(creatorShare)} to creator`);
  }

  async function getAiSummary() {
    if (!selected) return;
    setAiLoading(true);
    setAiSummary(null);
    try {
      const res = await fetch("/api/analyze-dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disputeId: selected.id }),
      });
      const data = await res.json();
      setAiSummary(data.summary || data.analysis || JSON.stringify(data));
    } catch {
      setAiSummary("Unable to load AI summary — ensure the API server is running.");
    }
    setAiLoading(false);
  }

  function exportDispute() {
    if (!selected) return;
    const csv = [
      ["Field", "Value"],
      ["ID", selected.id],
      ["Status", selected.status],
      ["Brand", selected.brandName],
      ["Creator", selected.creatorName],
      ["Reason", selected.reason],
      ["Amount", fmtMoney(selected.amount)],
      ["Created", fmtDate(selected.created_at)],
      ["Resolved", fmtDate(selected.resolved_at)],
      ["Resolution", selected.resolution_type || "—"],
      ["Note", selected.resolution_note || "—"],
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `dispute_${selected.id}.csv`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dispute Center</h2>
          <p className="text-sm text-gray-500 mt-0.5">{disputes.filter(d => d.status === "open").length} open · {disputes.length} total</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={filter === f.key ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
            {f.label} <span className="ml-1 text-xs opacity-70">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by brand, creator or reason…" value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 520 }}>
        {/* List */}
        <div className="w-80 flex-shrink-0 space-y-2 overflow-y-auto" style={{ maxHeight: 680 }}>
          {loading ? <p className="text-center text-sm text-gray-400 py-10">Loading…</p>
          : filtered.length === 0 ? <div className="text-center py-16"><Scale className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No disputes</p></div>
          : filtered.map(d => {
            const sc = STATUS_COLOR[d.status] || { bg: "#f1f5f9", color: "#64748b" };
            return (
              <button key={d.id} onClick={() => { setSelected(d); setTab("overview"); setAiSummary(null); }}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{ backgroundColor: selected?.id === d.id ? "#eef2ff" : "#fff", border: `1px solid ${selected?.id === d.id ? "#c7d2fe" : "#e2e8f0"}` }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{d.brandName} vs {d.creatorName}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize" style={sc}>{d.status}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">{d.reason || "No reason stated"}</p>
                <p className="text-xs text-gray-400">{fmtMoney(d.amount)} · {fmtDate(d.created_at)}</p>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white overflow-hidden flex flex-col" style={{ border: "1px solid #e2e8f0", maxHeight: 680 }}>
            {/* Header */}
            <div className="px-6 pt-5 pb-0 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selected.brandName} vs {selected.creatorName}</h3>
                  <p className="text-sm text-gray-500">{selected.reason || "No reason stated"}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={STATUS_COLOR[selected.status] || { bg: "#f1f5f9", color: "#64748b" }}>{selected.status}</span>
                  <button onClick={exportDispute} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Export CSV"><Download className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex gap-1 mb-0 pb-3">
                {DETAIL_TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                    style={tab === t ? { backgroundColor: "#eef2ff", color: "#4f46e5" } : { color: "#94a3b8" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {tab === "overview" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Brand",    selected.brandName],
                      ["Creator",  selected.creatorName],
                      ["Amount",   fmtMoney(selected.amount)],
                      ["Opened",   fmtDate(selected.created_at)],
                      ["Resolved", fmtDate(selected.resolved_at)],
                      ["Raised by",selected.raised_by || "User"],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{l}</p>
                        <p className="text-sm font-semibold text-gray-800">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Summary</p>
                      <button onClick={getAiSummary} disabled={aiLoading} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 disabled:opacity-50">
                        <RefreshCw className={`w-3 h-3 ${aiLoading ? "animate-spin" : ""}`} /> {aiLoading ? "Analyzing…" : "Analyze"}
                      </button>
                    </div>
                    {aiSummary ? (
                      <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-900">{aiSummary}</div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-400">Click "Analyze" to generate an AI summary and recommended outcome</div>
                    )}
                  </div>

                  {/* Resolution actions */}
                  {selected.status !== "resolved" && selected.status !== "closed" && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Resolve Dispute</p>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <textarea rows={2} value={resolution.note} onChange={e => setResolution(r => ({ ...r, note: stripInjection(e.target.value) }))}
                          placeholder="Resolution note (optional)…"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 resize-none bg-white" />
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={handleRefund} disabled={busy} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 disabled:opacity-50">
                            <CheckCircle className="w-3 h-3 inline mr-1" />Refund Brand
                          </button>
                          <button onClick={handleRelease} disabled={busy} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 disabled:opacity-50">
                            <CheckCircle className="w-3 h-3 inline mr-1" />Release to Creator
                          </button>
                          <div className="flex items-center gap-2">
                            <button onClick={handleSplit} disabled={busy} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 disabled:opacity-50">
                              Split
                            </button>
                            <div className="flex items-center gap-1.5">
                              <input type="range" min="0" max="100" value={splitPct} onChange={e => setSplitPct(Number(e.target.value))} className="w-24 h-1.5 accent-purple-600" />
                              <span className="text-xs font-semibold text-purple-600 w-20">{splitPct}% / {100 - splitPct}%</span>
                            </div>
                          </div>
                          <button onClick={() => updateStatus("closed", { resolution_note: resolution.note })} disabled={busy}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 disabled:opacity-50">
                            <XCircle className="w-3 h-3 inline mr-1" />Close No Action
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {(selected.resolution_type || selected.resolution_note) && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-green-700 mb-1 uppercase tracking-wide">Resolution</p>
                      <p className="text-sm text-green-800 capitalize">{selected.resolution_type} {selected.split_brand_pct ? `(${selected.split_brand_pct}% / ${100 - selected.split_brand_pct}%)` : ""}</p>
                      {selected.resolution_note && <p className="text-xs text-green-700 mt-1">{selected.resolution_note}</p>}
                    </div>
                  )}
                </>
              )}

              {tab === "timeline" && (
                <div className="space-y-3">
                  {[
                    { label: "Dispute opened", date: selected.created_at, icon: "⚠️" },
                    { label: "Under review", date: selected.reviewing_at, icon: "🔍" },
                    { label: "Resolved", date: selected.resolved_at, icon: "✅" },
                  ].filter(e => e.date).map((e, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <span className="text-lg">{e.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{e.label}</p>
                        <p className="text-xs text-gray-400">{fmtDate(e.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "evidence" && (
                <div className="space-y-2">
                  {Array.isArray(selected.evidence) && selected.evidence.length > 0
                    ? selected.evidence.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-sm">
                          <span className="text-gray-700 truncate">{f.name || f.url}</span>
                          <span className="text-gray-400 text-xs ml-2">{f.uploaded_by}</span>
                        </a>
                      ))
                    : <p className="text-sm text-gray-300 text-center py-12">No evidence files</p>}
                </div>
              )}

              {tab === "messages" && (
                <div className="space-y-2">
                  {messages.length === 0
                    ? <p className="text-sm text-gray-300 text-center py-12">No conversation messages</p>
                    : messages.map(m => (
                        <div key={m.id} className="p-3 rounded-xl border border-gray-100">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-600">{m.sender_name || m.sender_id?.slice(0, 8)}</span>
                            <span className="text-xs text-gray-400">{fmtDate(m.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{m.content || m.text || "—"}</p>
                        </div>
                      ))}
                </div>
              )}

              {tab === "payment" && (
                <div className="space-y-3">
                  {[
                    ["Disputed Amount", fmtMoney(selected.amount)],
                    ["Platform Fee", fmtMoney(selected.platform_fee)],
                    ["Creator Payout", fmtMoney(selected.creator_payout)],
                    ["Payment Status", selected.payment_status || "—"],
                    ["Resolution Type", selected.resolution_type || "Pending"],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                      <p className="text-sm text-gray-500">{l}</p>
                      <p className="text-sm font-semibold text-gray-800">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: "1px solid #e2e8f0" }}>
            <div className="text-center"><Scale className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">Select a dispute</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
