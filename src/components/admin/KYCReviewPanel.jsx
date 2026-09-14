import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  CheckCircle, XCircle, Clock, Eye, ChevronDown, ChevronUp,
  User, FileText, AlertCircle, RefreshCw, Loader2,
} from "lucide-react";

const STATUS_COLORS = {
  pending:     { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  approved:    { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  rejected:    { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  more_info:   { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc" },
};

const STATUS_LABELS = {
  pending:   "Pending",
  approved:  "Approved",
  rejected:  "Rejected",
  more_info: "More Info Requested",
};

export default function KYCReviewPanel({ showToast, auditLog }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [expanded, setExpanded] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [moreInfoMsg, setMoreInfoMsg] = useState("");
  const [moreInfoModal, setMoreInfoModal] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("brandiór_admin_token");
    if (raw) {
      try { setAdminName(JSON.parse(atob(raw.split(".")[1] ?? ""))?.name || "Admin"); } catch {}
    }
    loadSubmissions();
  }, [filter]);

  async function loadSubmissions() {
    setLoading(true);
    const q = supabase.from("kyc_submissions").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q.eq("status", filter);
    const { data, error } = await q;
    if (error) showToast?.("Failed to load KYC submissions", "error");
    setSubmissions(data || []);
    setLoading(false);
  }

  async function handleApprove(sub) {
    setProcessing(sub.id);
    const now = new Date().toISOString();
    const { error: kErr } = await supabase.from("kyc_submissions").update({
      status: "approved",
      reviewed_by: adminName,
      reviewed_at: now,
      updated_at: now,
    }).eq("id", sub.id);
    if (!kErr) {
      await supabase.from("profiles").update({ verified: true }).eq("id", sub.user_id);
      await supabase.from("notifications").insert({
        user_id: sub.user_id,
        type: "kyc_approved",
        message: "Your identity verification has been approved! Your wallet is now active.",
        read: false,
        created_at: now,
      });
      auditLog?.("kyc_approve", { submission_id: sub.id, user: sub.user_name });
      showToast?.(`KYC approved for ${sub.user_name}`);
      setSubmissions(prev => prev.map(s => s.id === sub.id
        ? { ...s, status: "approved", reviewed_by: adminName, reviewed_at: now }
        : s));
      setExpanded(null);
    } else {
      showToast?.("Failed to approve KYC", "error");
    }
    setProcessing(null);
  }

  async function handleReject(sub) {
    if (!rejectReason.trim()) { showToast?.("Please enter a rejection reason", "error"); return; }
    setProcessing(sub.id);
    const now = new Date().toISOString();
    const { error: kErr } = await supabase.from("kyc_submissions").update({
      status: "rejected",
      rejection_reason: rejectReason.trim(),
      reviewed_by: adminName,
      reviewed_at: now,
      updated_at: now,
    }).eq("id", sub.id);
    if (!kErr) {
      await supabase.from("notifications").insert({
        user_id: sub.user_id,
        type: "kyc_rejected",
        message: `Your identity verification was not approved. Reason: ${rejectReason.trim()}`,
        read: false,
        created_at: now,
      });
      auditLog?.("kyc_reject", { submission_id: sub.id, user: sub.user_name, reason: rejectReason });
      showToast?.(`KYC rejected for ${sub.user_name}`);
      setSubmissions(prev => prev.map(s => s.id === sub.id
        ? { ...s, status: "rejected", rejection_reason: rejectReason.trim(), reviewed_by: adminName, reviewed_at: now }
        : s));
      setRejectModal(null);
      setRejectReason("");
      setExpanded(null);
    } else {
      showToast?.("Failed to reject KYC", "error");
    }
    setProcessing(null);
  }

  async function handleMoreInfo(sub) {
    if (!moreInfoMsg.trim()) { showToast?.("Please enter a message", "error"); return; }
    setProcessing(sub.id);
    const now = new Date().toISOString();
    const { error: kErr } = await supabase.from("kyc_submissions").update({
      status: "more_info",
      rejection_reason: moreInfoMsg.trim(),
      reviewed_by: adminName,
      reviewed_at: now,
      updated_at: now,
    }).eq("id", sub.id);
    if (!kErr) {
      await supabase.from("notifications").insert({
        user_id: sub.user_id,
        type: "kyc_more_info",
        message: `Additional information needed for your KYC: ${moreInfoMsg.trim()}`,
        read: false,
        created_at: now,
      });
      showToast?.(`More info requested from ${sub.user_name}`);
      setSubmissions(prev => prev.map(s => s.id === sub.id
        ? { ...s, status: "more_info", rejection_reason: moreInfoMsg.trim(), reviewed_by: adminName, reviewed_at: now }
        : s));
      setMoreInfoModal(null);
      setMoreInfoMsg("");
      setExpanded(null);
    } else {
      showToast?.("Failed to send request", "error");
    }
    setProcessing(null);
  }

  const counts = submissions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  const pending_total = filter === "all"
    ? (counts.pending || 0)
    : submissions.filter(s => s.status === "pending").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">KYC Review Queue</h2>
          <p className="text-sm text-gray-500 mt-0.5">Verify creator identities before activating wallets</p>
        </div>
        <button onClick={loadSubmissions} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "more_info", "all"].map(f => {
          const col = STATUS_COLORS[f] || { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-all"
              style={{
                backgroundColor: active ? col.bg : "white",
                color: active ? col.text : "#6b7280",
                borderColor: active ? col.border : "#e5e7eb",
              }}>
              {f === "all" ? "All" : STATUS_LABELS[f]}
              {f === "pending" && pending_total > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending_total}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Submission list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading submissions…
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <CheckCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-semibold">No {filter === "all" ? "" : STATUS_LABELS[filter]?.toLowerCase() + " "}submissions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => {
            const col = STATUS_COLORS[sub.status] || STATUS_COLORS.pending;
            const isOpen = expanded === sub.id;
            const busy = processing === sub.id;
            return (
              <div key={sub.id} className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                {/* Row */}
                <button onClick={() => setExpanded(isOpen ? null : sub.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: "#7c3aed" }}>
                    {(sub.user_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{sub.user_name || "Unknown"}</p>
                    <p className="text-xs text-gray-500 truncate">{sub.user_handle ? `@${sub.user_handle}` : ""} · {sub.doc_type}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: col.bg, color: col.text, border: `1px solid ${col.border}` }}>
                    {STATUS_LABELS[sub.status] || sub.status}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">
                    {new Date(sub.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t px-5 py-5 space-y-5" style={{ borderColor: "#f3f4f6", backgroundColor: "#fafafa" }}>
                    {/* Details grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Detail label="Document Type" value={sub.doc_type} />
                      <Detail label="Document Number" value={sub.doc_number || "—"} />
                      <Detail label="Social Platform" value={sub.social_platform || "—"} />
                      <Detail label="Social Handle" value={sub.social_handle || "—"} />
                      <Detail label="Followers" value={sub.social_followers ? sub.social_followers.toLocaleString() : "—"} />
                      <Detail label="Submitted" value={new Date(sub.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
                      {sub.reviewed_by && <Detail label="Reviewed By" value={sub.reviewed_by} />}
                      {sub.rejection_reason && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            {sub.status === "more_info" ? "Info Requested" : "Rejection Reason"}
                          </p>
                          <p className="text-sm text-gray-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">{sub.rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Document images */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents</p>
                      <div className="flex flex-wrap gap-3">
                        {sub.doc_front_url && (
                          <DocImage label="Front" url={sub.doc_front_url} />
                        )}
                        {sub.doc_back_url && (
                          <DocImage label="Back" url={sub.doc_back_url} />
                        )}
                        {sub.selfie_url && (
                          <DocImage label="Selfie" url={sub.selfie_url} />
                        )}
                        {!sub.doc_front_url && !sub.doc_back_url && !sub.selfie_url && (
                          <p className="text-sm text-gray-400 italic">No documents uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons — only for pending/more_info */}
                    {(sub.status === "pending" || sub.status === "more_info") && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "#e5e7eb" }}>
                        <button onClick={() => handleApprove(sub)} disabled={busy}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-50"
                          style={{ backgroundColor: "#059669" }}>
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button onClick={() => { setRejectModal(sub); setRejectReason(""); }} disabled={busy}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-50"
                          style={{ backgroundColor: "#dc2626" }}>
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button onClick={() => { setMoreInfoModal(sub); setMoreInfoMsg(""); }} disabled={busy}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border disabled:opacity-50"
                          style={{ borderColor: "#7c3aed", color: "#7c3aed" }}>
                          <AlertCircle className="w-3.5 h-3.5" /> Request More Info
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
        <Modal title="Reject KYC Submission" onClose={() => setRejectModal(null)}>
          <p className="text-sm text-gray-600 mb-3">
            Provide a reason for rejecting <strong>{rejectModal.user_name}</strong>'s KYC. This will be sent to them.
          </p>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Document image is blurry. Please resubmit a clearer photo."
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
        </Modal>
      )}

      {/* More info modal */}
      {moreInfoModal && (
        <Modal title="Request More Information" onClose={() => setMoreInfoModal(null)}>
          <p className="text-sm text-gray-600 mb-3">
            Tell <strong>{moreInfoModal.user_name}</strong> what additional information you need.
          </p>
          <textarea
            value={moreInfoMsg}
            onChange={e => setMoreInfoMsg(e.target.value)}
            placeholder="e.g. Please upload a selfie holding your ID document."
            rows={4}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleMoreInfo(moreInfoModal)} disabled={!moreInfoMsg.trim() || processing === moreInfoModal.id}
              className="flex-1 py-2.5 rounded-full text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: "#7c3aed" }}>
              {processing === moreInfoModal.id ? "Sending…" : "Send Request"}
            </button>
            <button onClick={() => setMoreInfoModal(null)}
              className="flex-1 py-2.5 rounded-full text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  );
}

function DocImage({ label, url }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex flex-col items-center gap-1.5">
        <button onClick={() => setOpen(true)}
          className="w-28 h-20 rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 transition-colors group relative">
          <img src={url} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setOpen(false)}>
          <img src={url} alt={label} className="max-w-full max-h-full rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
