import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  CheckCircle, XCircle, Clock, RefreshCw, Loader2,
  ChevronDown, ChevronUp, AlertCircle, DollarSign,
} from "lucide-react";

const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS = {
  pending:    { bg: "#fef3c7", text: "#92400e", border: "#fde68a",  label: "Pending Approval" },
  approved:   { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7",  label: "Approved" },
  rejected:   { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5",  label: "Rejected" },
  processing: { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc",  label: "Processing" },
};

export default function PayoutApprovalPanel({ showToast, auditLog }) {
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("pending");
  const [expanded, setExpanded]         = useState(null);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing]     = useState(null);
  const [adminName, setAdminName]       = useState("Admin");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("brandiór_admin_token");
      if (raw) {
        const payload = JSON.parse(atob(raw.split(".")[1] ?? "e30="));
        setAdminName(payload?.name || "Admin");
      }
    } catch {}
    load();
  }, [filter]);

  async function load() {
    setLoading(true);
    const q = supabase
      .from("payout_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (filter !== "all") q.eq("status", filter);
    const { data, error } = await q;
    if (error) showToast?.("Failed to load payout requests", "error");
    setRequests(data || []);
    setLoading(false);
  }

  async function handleApprove(req) {
    setProcessing(req.id);
    const now = new Date().toISOString();
    const { error } = await supabase.from("payout_requests").update({
      status: "approved",
      reviewed_by: adminName,
      reviewed_at: now,
      updated_at: now,
    }).eq("id", req.id);

    if (error) {
      showToast?.("Failed to approve request", "error");
      setProcessing(null);
      return;
    }

    // Deduct from wallet
    await supabase.functions.invoke("admin-adjust-wallet", {
      body: {
        action: "debit",
        user_id: req.user_id,
        amount: Number(req.amount),
        note: `Payout approved — ${req.bank_name} ${req.account_number}`,
      },
    });

    // Notify creator
    await supabase.from("notifications").insert({
      user_id: req.user_id,
      type: "payout_approved",
      message: `Your withdrawal of ${fmtMoney(req.amount)} has been approved and is being processed to ${req.bank_name} (${req.account_number}). Allow 1–3 business days.`,
      read: false,
      created_at: now,
    });

    auditLog?.("payout_approve", { request_id: req.id, creator: req.creator_name, amount: req.amount });
    showToast?.(`Payout of ${fmtMoney(req.amount)} approved for ${req.creator_name}`);
    setRequests(prev => prev.map(r => r.id === req.id
      ? { ...r, status: "approved", reviewed_by: adminName, reviewed_at: now }
      : r));
    setExpanded(null);
    setProcessing(null);
  }

  async function handleReject(req) {
    if (!rejectReason.trim()) { showToast?.("Please enter a rejection reason", "error"); return; }
    setProcessing(req.id);
    const now = new Date().toISOString();
    const { error } = await supabase.from("payout_requests").update({
      status: "rejected",
      rejection_reason: rejectReason.trim(),
      reviewed_by: adminName,
      reviewed_at: now,
      updated_at: now,
    }).eq("id", req.id);

    if (error) {
      showToast?.("Failed to reject request", "error");
      setProcessing(null);
      return;
    }

    // Notify creator
    await supabase.from("notifications").insert({
      user_id: req.user_id,
      type: "payout_rejected",
      message: `Your withdrawal request of ${fmtMoney(req.amount)} was not approved. Reason: ${rejectReason.trim()}. No funds were deducted.`,
      read: false,
      created_at: now,
    });

    auditLog?.("payout_reject", { request_id: req.id, creator: req.creator_name, amount: req.amount, reason: rejectReason });
    showToast?.(`Payout rejected for ${req.creator_name}`);
    setRequests(prev => prev.map(r => r.id === req.id
      ? { ...r, status: "rejected", rejection_reason: rejectReason.trim(), reviewed_by: adminName, reviewed_at: now }
      : r));
    setRejectModal(null);
    setRejectReason("");
    setExpanded(null);
    setProcessing(null);
  }

  const pendingCount  = requests.filter(r => r.status === "pending").length;
  const pendingAmount = requests.filter(r => r.status === "pending").reduce((s, r) => s + Number(r.amount || 0), 0);
  const approvedTotal = requests.filter(r => r.status === "approved").reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Payout Approval Queue</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review and approve creator withdrawal requests before funds are released</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending Requests",  value: pendingCount,        sub: fmtMoney(pendingAmount) + " on hold",   color: "#d97706" },
          { label: "Approved (all)",    value: requests.filter(r => r.status === "approved").length, sub: fmtMoney(approvedTotal) + " paid out", color: "#059669" },
          { label: "Rejected (all)",    value: requests.filter(r => r.status === "rejected").length, sub: "returned to creators", color: "#dc2626" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{loading ? "…" : s.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "all"].map(f => {
          const meta = STATUS[f] || { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-all"
              style={{
                backgroundColor: active ? meta.bg : "white",
                color:           active ? meta.text : "#6b7280",
                borderColor:     active ? meta.border : "#e5e7eb",
              }}>
              {f === "all" ? "All" : meta.label}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <DollarSign className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-semibold">No {filter === "all" ? "" : (STATUS[filter]?.label?.toLowerCase() + " ")}requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const meta = STATUS[req.status] || STATUS.pending;
            const isOpen = expanded === req.id;
            const busy   = processing === req.id;
            return (
              <div key={req.id} className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                {/* Row header */}
                <button onClick={() => setExpanded(isOpen ? null : req.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {(req.creator_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{req.creator_name || "Creator"}</p>
                    <p className="text-xs text-gray-500">{req.bank_name} · ****{(req.account_number || "").slice(-4)}</p>
                  </div>
                  <p className="font-black text-violet-700 flex-shrink-0">{fmtMoney(req.amount)}</p>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.bg, color: meta.text, border: `1px solid ${meta.border}` }}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">{fmtDate(req.created_at)}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t px-5 py-5 space-y-5" style={{ borderColor: "#f3f4f6", backgroundColor: "#fafafa" }}>

                    {/* Bank details — the key info for manual transfer */}
                    <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Bank Transfer Details</p>
                      {[
                        ["Account Name",   req.account_name],
                        ["Account Number", req.account_number],
                        ["Bank",           req.bank_name],
                        ["Amount",         fmtMoney(req.amount)],
                      ].map(([l, v]) => (
                        <div key={l} className="flex items-center justify-between">
                          <p className="text-xs text-amber-600">{l}</p>
                          <p className="text-sm font-bold text-amber-900 font-mono select-all">{v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Creator + request info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InfoRow label="Creator"    value={req.creator_name || "—"} />
                      <InfoRow label="Handle"     value={req.creator_handle ? `@${req.creator_handle}` : "—"} />
                      <InfoRow label="Requested"  value={fmtDate(req.created_at)} />
                      {req.reviewed_by && <InfoRow label="Reviewed By" value={req.reviewed_by} />}
                      {req.reviewed_at && <InfoRow label="Reviewed At" value={fmtDate(req.reviewed_at)} />}
                      {req.rejection_reason && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rejection Reason</p>
                          <p className="text-sm text-gray-800 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{req.rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions — only for pending */}
                    {req.status === "pending" && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "#e5e7eb" }}>
                        <button onClick={() => handleApprove(req)} disabled={busy}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-white disabled:opacity-50"
                          style={{ backgroundColor: "#059669" }}>
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve &amp; Release Funds
                        </button>
                        <button onClick={() => { setRejectModal(req); setRejectReason(""); }} disabled={busy}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-white disabled:opacity-50"
                          style={{ backgroundColor: "#dc2626" }}>
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Reject Payout Request</h3>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl p-3 mb-4 bg-red-50 border border-red-100">
              <p className="text-sm font-semibold text-red-800">{rejectModal.creator_name} — {fmtMoney(rejectModal.amount)}</p>
              <p className="text-xs text-red-600 mt-0.5">{rejectModal.bank_name} · {rejectModal.account_number}</p>
            </div>
            <p className="text-sm text-gray-600 mb-3">Provide a reason. The creator will be notified and no funds will be deducted.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Account details do not match KYC records. Please resubmit with the correct account."
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleReject(rejectModal)} disabled={!rejectReason.trim() || processing === rejectModal.id}
                className="flex-1 py-2.5 rounded-full text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: "#dc2626" }}>
                {processing === rejectModal.id ? "Rejecting…" : "Confirm Rejection"}
              </button>
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-full text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  );
}
