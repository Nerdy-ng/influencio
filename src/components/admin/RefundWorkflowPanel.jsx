import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  RotateCcw, RefreshCw, Loader2, Search, ChevronDown, ChevronUp,
  Check, X, AlertTriangle, Clock, User, DollarSign, FileText,
  ArrowRight, CheckCircle, XCircle, Eye, UserCheck, Inbox,
} from "lucide-react";

const REASONS = [
  "Duplicate charge",
  "Service not delivered",
  "Creator cancelled",
  "Brand cancelled",
  "Quality dispute",
  "Unauthorized transaction",
  "Other",
];

const STATUS_CONFIG = {
  pending:      { label: "Pending",      color: "#d97706", bg: "#fef3c7", Icon: Clock       },
  under_review: { label: "Under Review", color: "#0891b2", bg: "#cffafe", Icon: Eye         },
  approved:     { label: "Approved",     color: "#059669", bg: "#d1fae5", Icon: CheckCircle  },
  rejected:     { label: "Rejected",     color: "#dc2626", bg: "#fee2e2", Icon: XCircle      },
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "—";

const fmtNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function RefundWorkflowPanel({ showToast, auditLog }) {
  const [refunds, setRefunds]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const [showCreate, setShowCreate]   = useState(false);
  const [adminName, setAdminName]     = useState("Admin");

  // Create form
  const [form, setForm] = useState({
    requester_name: "", requester_email: "", amount: "",
    reason: REASONS[0], description: "", transaction_ref: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("brandiór_admin_token");
      if (raw) {
        const p = JSON.parse(atob(raw.split(".")[1] ?? "e30="));
        setAdminName(p?.name || "Admin");
      }
    } catch {}
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("refund_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setRefunds(data || []);
    setLoading(false);
  }

  async function claimReview(r) {
    const { error } = await supabase.from("refund_requests").update({
      status:      "under_review",
      assigned_to: adminName,
      claimed_at:  new Date().toISOString(),
    }).eq("id", r.id);
    if (error) { showToast?.("Failed to claim", "error"); return; }
    auditLog?.("refund_claimed", { id: r.id, admin: adminName });
    showToast?.("Refund claimed — now under review");
    reload(r.id, { status: "under_review", assigned_to: adminName });
    setSelected(s => s?.id === r.id ? { ...s, status: "under_review", assigned_to: adminName } : s);
  }

  async function resolve(r, approved) {
    if (!resolveNote.trim() && !approved) {
      showToast?.("Add a note explaining the rejection", "error");
      return;
    }
    setActionLoading(true);

    const patch = {
      status:        approved ? "approved" : "rejected",
      resolved_by:   adminName,
      resolved_at:   new Date().toISOString(),
      resolution_note: resolveNote.trim() || null,
    };

    const { error } = await supabase.from("refund_requests").update(patch).eq("id", r.id);
    if (error) { showToast?.("Failed to resolve", "error"); setActionLoading(false); return; }

    if (approved && r.user_id && r.amount) {
      // Credit wallet balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", r.user_id)
        .single();
      if (profile) {
        const newBal = (Number(profile.wallet_balance) || 0) + Number(r.amount);
        await supabase.from("profiles").update({ wallet_balance: newBal }).eq("id", r.user_id);
      }
    }

    auditLog?.(approved ? "refund_approved" : "refund_rejected", { id: r.id, amount: r.amount, admin: adminName });
    showToast?.(approved ? `Refund of ${fmtNaira(r.amount)} approved` : "Refund rejected");
    reload(r.id, patch);
    setSelected(s => s?.id === r.id ? { ...s, ...patch } : s);
    setResolveNote("");
    setActionLoading(false);
  }

  async function createRefund() {
    if (!form.requester_name.trim() || !form.amount || !form.reason) {
      showToast?.("Name, amount, and reason are required", "error");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("refund_requests").insert({
      requester_name:  form.requester_name.trim(),
      requester_email: form.requester_email.trim() || null,
      amount:          Number(form.amount),
      reason:          form.reason,
      description:     form.description.trim() || null,
      transaction_ref: form.transaction_ref.trim() || null,
      status:          "pending",
      logged_by:       adminName,
    });
    if (error) { showToast?.("Failed to create", "error"); }
    else {
      auditLog?.("refund_logged", { amount: form.amount, reason: form.reason });
      showToast?.("Refund request logged");
      setForm({ requester_name: "", requester_email: "", amount: "", reason: REASONS[0], description: "", transaction_ref: "" });
      setShowCreate(false);
      load();
    }
    setCreating(false);
  }

  function reload(id, patch) {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  const counts = {
    all:          refunds.length,
    pending:      refunds.filter(r => r.status === "pending").length,
    under_review: refunds.filter(r => r.status === "under_review").length,
    approved:     refunds.filter(r => r.status === "approved").length,
    rejected:     refunds.filter(r => r.status === "rejected").length,
  };

  const totalApproved = refunds
    .filter(r => r.status === "approved")
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  const filtered = refunds.filter(r =>
    (statusFilter === "all" || r.status === statusFilter) &&
    (!search ||
      r.requester_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.requester_email?.toLowerCase().includes(search.toLowerCase()) ||
      r.reason?.toLowerCase().includes(search.toLowerCase()) ||
      r.transaction_ref?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Refund Workflow</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage refund requests with reason tracking and wallet credits</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#7c3aed" }}>
            <FileText className="w-4 h-4" /> Log Refund
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending",      value: counts.pending,      color: "#d97706" },
          { label: "Under Review", value: counts.under_review, color: "#0891b2" },
          { label: "Approved",     value: counts.approved,     color: "#059669" },
          { label: "Total Refunded", value: fmtNaira(totalApproved), color: "#7c3aed", raw: true },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e5e7eb" }}>
            <p className={`font-black text-gray-900 ${s.raw ? "text-lg" : "text-2xl"}`} style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Log refund form */}
      {showCreate && (
        <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: "#7c3aed40" }}>
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900">Log new refund request</p>
            <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">User name *</label>
              <input value={form.requester_name} onChange={e => setForm(f => ({ ...f, requester_name: e.target.value }))}
                placeholder="e.g. Adaeze Okafor"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Email (optional)</label>
              <input value={form.requester_email} onChange={e => setForm(f => ({ ...f, requester_email: e.target.value }))}
                placeholder="user@email.com" type="email"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Amount (₦) *</label>
              <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 50000" type="number" min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Transaction reference</label>
              <input value={form.transaction_ref} onChange={e => setForm(f => ({ ...f, transaction_ref: e.target.value }))}
                placeholder="e.g. collab-id or payout-ref"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Reason *</label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, reason: r }))}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                  style={{
                    backgroundColor: form.reason === r ? "#7c3aed" : "white",
                    color:           form.reason === r ? "white"    : "#6b7280",
                    borderColor:     form.reason === r ? "#7c3aed"  : "#e5e7eb",
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Additional context…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={createRefund} disabled={creating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: "#7c3aed" }}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Log Request
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",          label: "All" },
          { key: "pending",      label: "Pending" },
          { key: "under_review", label: "Under Review" },
          { key: "approved",     label: "Approved" },
          { key: "rejected",     label: "Rejected" },
        ].map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className="px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={{
              backgroundColor: statusFilter === f.key ? "#7c3aed" : "white",
              color:           statusFilter === f.key ? "white"    : "#6b7280",
              border:          `1px solid ${statusFilter === f.key ? "#7c3aed" : "#e5e7eb"}`,
            }}>
            {f.label}{counts[f.key] > 0 ? ` (${counts[f.key]})` : ""}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, reason, or reference…"
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2" />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 rounded-2xl border" style={{ borderColor: "#e5e7eb" }}>
          <Inbox className="w-10 h-10 mb-3 opacity-25" />
          <p className="font-semibold">No refund requests</p>
          <p className="text-xs mt-1 text-gray-300">
            {statusFilter !== "all" ? "Try switching the filter" : "Log one with the button above"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const cfg    = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const isOpen = selected?.id === r.id;

            return (
              <div key={r.id} className="rounded-2xl border bg-white overflow-hidden"
                style={{ borderColor: cfg.color + "30" }}>
                {/* Row */}
                <button onClick={() => setSelected(isOpen ? null : r)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors flex-wrap">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cfg.bg }}>
                    <cfg.Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{r.requester_name || "Unknown user"}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      <span className="text-xs font-bold text-gray-900">{fmtNaira(r.amount)}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-gray-400">
                      <span>{r.reason}</span>
                      {r.transaction_ref && <span>Ref: {r.transaction_ref}</span>}
                      {r.assigned_to && <span>→ {r.assigned_to}</span>}
                      <span>{fmtDate(r.created_at)}</span>
                    </div>
                  </div>

                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {/* Detail / action panel */}
                {isOpen && (
                  <div className="border-t px-5 py-4 space-y-4" style={{ borderColor: "#f3f4f6" }}>
                    {/* Details grid */}
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      {[
                        { label: "Requester",       value: r.requester_name },
                        { label: "Email",            value: r.requester_email || "—" },
                        { label: "Amount",           value: fmtNaira(r.amount) },
                        { label: "Reason",           value: r.reason },
                        { label: "Transaction ref",  value: r.transaction_ref || "—" },
                        { label: "Logged by",        value: r.logged_by || "—" },
                        { label: "Assigned to",      value: r.assigned_to || "Unassigned" },
                        { label: "Resolved by",      value: r.resolved_by || "—" },
                        { label: "Resolved at",      value: fmtDate(r.resolved_at) },
                        { label: "Status",           value: cfg.label },
                      ].map(d => (
                        <div key={d.label} className="rounded-xl p-3" style={{ backgroundColor: "#fafafa" }}>
                          <p className="text-xs font-bold text-gray-400">{d.label}</p>
                          <p className="text-sm text-gray-800 mt-0.5">{d.value}</p>
                        </div>
                      ))}
                    </div>

                    {r.description && (
                      <div className="rounded-xl p-3" style={{ backgroundColor: "#fafafa" }}>
                        <p className="text-xs font-bold text-gray-400 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{r.description}</p>
                      </div>
                    )}

                    {r.resolution_note && (
                      <div className="rounded-xl p-3" style={{ backgroundColor: r.status === "approved" ? "#d1fae5" : "#fee2e2" }}>
                        <p className="text-xs font-bold mb-1" style={{ color: r.status === "approved" ? "#059669" : "#dc2626" }}>Resolution note</p>
                        <p className="text-sm text-gray-700">{r.resolution_note}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {r.status === "pending" && (
                      <div className="flex justify-end">
                        <button onClick={() => claimReview(r)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: "#0891b2" }}>
                          <UserCheck className="w-4 h-4" /> Claim & Review
                        </button>
                      </div>
                    )}

                    {r.status === "under_review" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">Resolution note (required for rejection)</label>
                          <textarea value={resolveNote} onChange={e => setResolveNote(e.target.value)}
                            rows={2} placeholder="Explain the decision…"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => resolve(r, false)} disabled={actionLoading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border disabled:opacity-50"
                            style={{ borderColor: "#dc2626", color: "#dc2626" }}>
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                            Reject
                          </button>
                          <button onClick={() => resolve(r, true)} disabled={actionLoading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ backgroundColor: "#059669" }}>
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Approve & Credit Wallet
                          </button>
                        </div>
                      </div>
                    )}

                    {(r.status === "approved" || r.status === "rejected") && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <cfg.Icon className="w-4 h-4" style={{ color: cfg.color }} />
                        <span style={{ color: cfg.color }}>
                          {r.status === "approved"
                            ? `Refund of ${fmtNaira(r.amount)} credited to wallet`
                            : "Refund rejected — no wallet credit issued"}
                        </span>
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
