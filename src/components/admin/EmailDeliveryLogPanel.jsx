import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Mail, RefreshCw, Search, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, Loader2, Send,
} from "lucide-react";

const fmtDate = (d) => d ? new Date(d).toLocaleString("en-GB", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
}) : "—";

const TYPE_LABELS = {
  waitlist:        "Waitlist Welcome",
  kyc_approved:    "KYC Approved",
  kyc_rejected:    "KYC Rejected",
  kyc_more_info:   "KYC — More Info",
  payout_approved: "Payout Approved",
  payout_rejected: "Payout Rejected",
  collab_update:   "Collab Update",
  password_reset:  "Password Reset",
  other:           "Other",
};

const STATUS_META = {
  sent:    { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7", label: "Sent",    Icon: CheckCircle },
  failed:  { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", label: "Failed",  Icon: XCircle     },
  pending: { bg: "#fef3c7", text: "#92400e", border: "#fde68a", label: "Pending", Icon: Clock       },
};

const EMAIL_TYPES = ["all", ...Object.keys(TYPE_LABELS)];

export default function EmailDeliveryLogPanel({ showToast }) {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded]   = useState(null);
  const [page, setPage]           = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => { load(); }, [typeFilter, statusFilter, page]);

  async function load() {
    setLoading(true);
    let q = supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (typeFilter   !== "all") q = q.eq("type",   typeFilter);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data, error } = await q;
    if (error) showToast?.("Failed to load email logs", "error");
    setLogs(data || []);
    setLoading(false);
  }

  const filtered = search.trim()
    ? logs.filter(l =>
        l.to_email?.toLowerCase().includes(search.toLowerCase()) ||
        l.to_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.subject?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const sentCount   = logs.filter(l => l.status === "sent").length;
  const failedCount = logs.filter(l => l.status === "failed").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Email Delivery Log</h2>
          <p className="text-sm text-gray-500 mt-0.5">All transactional emails sent by the platform</p>
        </div>
        <button onClick={() => { setPage(0); load(); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Logged",  value: logs.length,  color: "#4f46e5" },
          { label: "Delivered",     value: sentCount,     color: "#059669" },
          { label: "Failed",        value: failedCount,   color: "#dc2626" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{loading ? "…" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Status tabs */}
        {["all", "sent", "failed", "pending"].map(s => {
          const meta = STATUS_META[s] || { bg: "#f3f4f6", text: "#374151", border: "#d1d5db", label: "All" };
          const active = statusFilter === s;
          return (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
              style={{
                backgroundColor: active ? meta.bg : "white",
                color:           active ? meta.text : "#6b7280",
                borderColor:     active ? meta.border : "#e5e7eb",
              }}>
              {s === "all" ? "All Status" : meta.label}
            </button>
          );
        })}

        {/* Type select */}
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
          className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600 focus:outline-none focus:border-purple-300">
          {EMAIL_TYPES.map(t => (
            <option key={t} value={t}>{t === "all" ? "All Types" : TYPE_LABELS[t] || t}</option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by email, name or subject…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100"
        />
      </div>

      {/* Log list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading logs…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Mail className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-semibold">No email logs found</p>
          <p className="text-xs mt-1 text-gray-300">Emails logged here when sent via the platform</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => {
            const meta = STATUS_META[log.status] || STATUS_META.sent;
            const StatusIcon = meta.Icon;
            const isOpen = expanded === log.id;
            return (
              <div key={log.id} className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                <button onClick={() => setExpanded(isOpen ? null : log.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                  <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: meta.text }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{log.to_email}</p>
                    <p className="text-xs text-gray-400 truncate">{log.subject}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.bg, color: meta.text, border: `1px solid ${meta.border}` }}>
                    {meta.label}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                    {TYPE_LABELS[log.type] || log.type}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">{fmtDate(log.sent_at)}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: "#f3f4f6", backgroundColor: "#fafafa" }}>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Detail label="To"          value={log.to_email} />
                      <Detail label="Name"         value={log.to_name || "—"} />
                      <Detail label="Subject"      value={log.subject} />
                      <Detail label="Type"         value={TYPE_LABELS[log.type] || log.type} />
                      <Detail label="Status"       value={meta.label} />
                      <Detail label="Sent At"      value={fmtDate(log.sent_at)} />
                      <Detail label="Triggered By" value={log.triggered_by || "system"} />
                      {log.resend_id && <Detail label="Resend ID" value={log.resend_id} mono />}
                    </div>
                    {log.error_message && (
                      <div className="rounded-xl px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-100">
                        <span className="font-bold">Error: </span>{log.error_message}
                      </div>
                    )}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Metadata</p>
                        <pre className="text-xs text-gray-600 bg-gray-100 rounded-lg px-3 py-2 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && (logs.length === PAGE_SIZE || page > 0) && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            ← Prev
          </button>
          <span className="text-xs text-gray-500">Page {page + 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={logs.length < PAGE_SIZE}
            className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 font-medium break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}
