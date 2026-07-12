import { useState, useEffect } from "react";
import { saveProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import { ArrowUpCircle, RotateCcw, Search, CheckCircle, XCircle, RefreshCw, Building2 } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_COLOR = {
  pending:  { bg: "#fef3c7", color: "#d97706" },
  approved: { bg: "#dcfce7", color: "#16a34a" },
  rejected: { bg: "#fee2e2", color: "#dc2626" },
  failed:   { bg: "#fef2f2", color: "#ef4444" },
  paid:     { bg: "#dbeafe", color: "#1d4ed8" },
};

const FILTERS = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "failed",   label: "Failed" },
  { key: "paid",     label: "Paid" },
];

export default function WithdrawalPanel({ showToast, auditLog }) {
  const [requests, setRequests]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModal, setRejectModal]   = useState(false);

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase.from("payout_requests").select("*").order("created_at", { ascending: false });
    const list = rows || [];
    const ids = [...new Set(list.map(r => r.creator_id).filter(Boolean))];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, handle, phone, bank_account, bank_name, account_number, account_name").in("id", ids);
      (profs || []).forEach(p => { nameMap[p.id] = p; });
    }
    setRequests(list.map(r => ({
      ...r,
      profile: nameMap[r.creator_id] || null,
      displayName: nameMap[r.creator_id]?.full_name || nameMap[r.creator_id]?.handle || r.creator_id?.slice(0, 8) || "Unknown",
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleApprove() {
    if (!selected) return;
    setBusy(true);
    await supabase.from("payout_requests").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", selected.id);
    auditLog?.("approve_withdrawal", "payout_request", selected.id, selected.displayName, { amount: selected.amount });
    showToast(`Withdrawal approved for ${selected.displayName}`);
    await load(); setBusy(false);
  }

  async function handleReject() {
    if (!selected) return;
    setBusy(true);
    await supabase.from("payout_requests").update({ status: "rejected", reject_reason: rejectReason || "Admin rejection", rejected_at: new Date().toISOString() }).eq("id", selected.id);
    // Refund to wallet
    const { data: p } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.creator_id).single();
    saveProfile(selected.creator_id, { wallet_balance: (p?.wallet_balance || 0) + Number(selected.amount) });
    auditLog?.("reject_withdrawal", "payout_request", selected.id, selected.displayName, { reason: rejectReason });
    showToast("Withdrawal rejected — amount refunded to wallet");
    setRejectModal(false); setRejectReason("");
    await load(); setBusy(false);
  }

  async function handleRetry() {
    if (!selected) return;
    setBusy(true);
    await supabase.from("payout_requests").update({ status: "pending", retry_count: (selected.retry_count || 0) + 1, failed_reason: null }).eq("id", selected.id);
    auditLog?.("retry_withdrawal", "payout_request", selected.id, selected.displayName);
    showToast("Withdrawal queued for retry");
    await load(); setBusy(false);
  }

  async function handleManualPayout() {
    if (!selected) return;
    setBusy(true);
    await supabase.from("payout_requests").update({ status: "paid", paid_at: new Date().toISOString(), method: "manual" }).eq("id", selected.id);
    auditLog?.("manual_payout", "payout_request", selected.id, selected.displayName, { amount: selected.amount });
    showToast("Marked as manually paid");
    setManualModal(false);
    await load(); setBusy(false);
  }

  const filtered = requests.filter(r => {
    const t = search.toLowerCase();
    const matchSearch = !t || r.displayName.toLowerCase().includes(t);
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const pendingTotal = requests.filter(r => r.status === "pending").reduce((s, r) => s + Number(r.amount || 0), 0);
  const counts = Object.fromEntries(FILTERS.map(f => [f.key, f.key === "all" ? requests.length : requests.filter(r => r.status === f.key).length]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Withdrawal Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">{counts.pending} pending · {fmtMoney(pendingTotal)} awaiting</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pending",  value: counts.pending,  color: "#d97706" },
          { label: "Approved", value: counts.approved, color: "#16a34a" },
          { label: "Failed",   value: counts.failed,   color: "#ef4444" },
          { label: "Awaiting", value: fmtMoney(pendingTotal), color: "#4f46e5" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{s.label}</p>
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={filter === f.key ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
            {f.label} <span className="ml-1 opacity-70">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by creator name…" value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 420 }}>
        {/* List */}
        <div className="w-80 flex-shrink-0 space-y-1.5 overflow-y-auto" style={{ maxHeight: 580 }}>
          {loading ? <p className="text-center text-sm text-gray-400 py-10">Loading…</p>
          : filtered.length === 0 ? <div className="text-center py-12"><ArrowUpCircle className="w-8 h-8 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No withdrawals</p></div>
          : filtered.map(r => {
            const sc = STATUS_COLOR[r.status] || { bg: "#f1f5f9", color: "#64748b" };
            return (
              <button key={r.id} onClick={() => setSelected(r)}
                className="w-full text-left p-3 rounded-xl transition-all"
                style={{ backgroundColor: selected?.id === r.id ? "#eef2ff" : "#fff", border: `1px solid ${selected?.id === r.id ? "#c7d2fe" : "#e2e8f0"}` }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{r.displayName}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize ml-1" style={sc}>{r.status}</span>
                </div>
                <p className="text-sm font-black text-indigo-600">{fmtMoney(r.amount)}</p>
                <p className="text-xs text-gray-400">{fmtDate(r.created_at)}</p>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white overflow-hidden flex flex-col" style={{ border: "1px solid #e2e8f0" }}>
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{selected.displayName}</h3>
                  <p className="text-xs text-gray-400">{fmtDate(selected.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600">{fmtMoney(selected.amount)}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={STATUS_COLOR[selected.status] || { bg: "#f1f5f9", color: "#64748b" }}>{selected.status}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {selected.status === "pending" && <>
                  <button onClick={handleApprove} disabled={busy} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 disabled:opacity-50">
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => setRejectModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600">
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </>}
                {selected.status === "failed" && (
                  <button onClick={handleRetry} disabled={busy} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 disabled:opacity-50">
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
                {(selected.status === "approved" || selected.status === "failed") && (
                  <button onClick={() => setManualModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700">
                    <Building2 className="w-3 h-3" /> Manual Payout
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {/* Bank details */}
              {selected.profile && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bank Details</p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                    {[
                      ["Bank",           selected.profile.bank_name || selected.bank_name || "—"],
                      ["Account Number", selected.profile.account_number || selected.account_number || "—"],
                      ["Account Name",   selected.profile.account_name || selected.account_name || "—"],
                      ["Phone",          selected.profile.phone || "—"],
                    ].map(([l, v]) => (
                      <div key={l} className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{l}</p>
                        <p className="text-xs font-semibold text-gray-800">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Meta */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Request Details</p>
                <div className="space-y-1.5">
                  {[
                    ["Method",     selected.method || "bank_transfer"],
                    ["Retries",    selected.retry_count || 0],
                    ["Failure",    selected.failed_reason || "—"],
                    ["Approved",   fmtDate(selected.approved_at)],
                    ["Paid",       fmtDate(selected.paid_at)],
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500">{l}</p>
                      <p className="text-xs font-semibold text-gray-800">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: "1px solid #e2e8f0" }}>
            <div className="text-center"><ArrowUpCircle className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">Select a withdrawal request</p></div>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Reject Withdrawal</h3>
            <input value={rejectReason} onChange={e => setRejectReason(stripInjection(e.target.value))}
              placeholder="Reason for rejection…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(false); setRejectReason(""); }} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleReject} disabled={busy} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 disabled:opacity-50">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual payout confirmation */}
      {manualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">Confirm Manual Payout</h3>
            <p className="text-sm text-gray-500 mb-4">Confirm that <strong>{fmtMoney(selected?.amount)}</strong> has been manually sent to <strong>{selected?.displayName}</strong>. This will mark the request as paid.</p>
            <div className="flex gap-3">
              <button onClick={() => setManualModal(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleManualPayout} disabled={busy} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: "#4f46e5" }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
