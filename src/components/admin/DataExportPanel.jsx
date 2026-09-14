import { useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Download, Loader2, Calendar, Filter, FileText,
  Users, Briefcase, Send, BadgeCheck, Mail, Ticket,
  ClipboardList, Wallet, CheckCircle,
} from "lucide-react";

// ── CSV helpers ───────────────────────────────────────────────────────────────

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape  = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    headers.join(","),
    ...rows.map(row => headers.map(h => escape(row[h])).join(",")),
  ].join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function fmtFilename(label, filters) {
  const date  = new Date().toISOString().slice(0, 10);
  const range = filters.from ? `_${filters.from}_to_${filters.to || date}` : "";
  const status = filters.status && filters.status !== "all" ? `_${filters.status}` : "";
  return `brandior_${label.toLowerCase().replace(/\s+/g, "_")}${range}${status}_${date}.csv`;
}

// ── Dataset definitions ───────────────────────────────────────────────────────

const DATASETS = [
  {
    id:      "creators",
    label:   "Creators",
    Icon:    Users,
    color:   "#7c3aed",
    desc:    "All creator accounts with profile, verification and wallet data",
    hasStatus: false,
    hasRole:   false,
    async fetch({ from, to }) {
      let q = supabase
        .from("profiles")
        .select("id, full_name, handle, role, wallet_balance, created_at")
        .eq("role", "creator")
        .order("created_at", { ascending: false });
      if (from) q = q.gte("created_at", from);
      if (to)   q = q.lte("created_at", to + "T23:59:59Z");
      const { data } = await q;

      // Enrich with KYC status
      const ids = (data || []).map(r => r.id);
      const { data: kycs } = ids.length
        ? await supabase.from("kyc_submissions").select("user_id, status").in("user_id", ids).eq("status", "approved")
        : { data: [] };
      const verified = new Set((kycs || []).map(k => k.user_id));

      return (data || []).map(r => ({
        id:             r.id,
        full_name:      r.full_name || "",
        handle:         r.handle    || "",
        kyc_verified:   verified.has(r.id) ? "Yes" : "No",
        wallet_balance: r.wallet_balance || 0,
        joined:         r.created_at?.slice(0, 10) || "",
      }));
    },
  },
  {
    id:      "brands",
    label:   "Brands",
    Icon:    Briefcase,
    color:   "#0891b2",
    desc:    "All brand accounts with company info and wallet data",
    hasStatus: false,
    async fetch({ from, to }) {
      let q = supabase
        .from("profiles")
        .select("id, full_name, company_name, handle, wallet_balance, created_at")
        .eq("role", "brand")
        .order("created_at", { ascending: false });
      if (from) q = q.gte("created_at", from);
      if (to)   q = q.lte("created_at", to + "T23:59:59Z");
      const { data } = await q;
      return (data || []).map(r => ({
        id:             r.id,
        full_name:      r.full_name    || "",
        company_name:   r.company_name || "",
        handle:         r.handle       || "",
        wallet_balance: r.wallet_balance || 0,
        joined:         r.created_at?.slice(0, 10) || "",
      }));
    },
  },
  {
    id:        "collaborations",
    label:     "Collaborations",
    Icon:      Briefcase,
    color:     "#059669",
    desc:      "All brand–creator collaborations with payment and status data",
    hasStatus: true,
    statuses:  ["all", "pending", "active", "in_review", "delivered", "completed", "cancelled", "disputed"],
    async fetch({ from, to, status }) {
      let q = supabase
        .from("collabs")
        .select("id, content_type, total_amount, creator_payout, payment_status, status, created_at, creator:profiles!creator_id(full_name, handle), brand:profiles!brand_id(full_name, company_name)")
        .order("created_at", { ascending: false });
      if (from)                  q = q.gte("created_at", from);
      if (to)                    q = q.lte("created_at", to + "T23:59:59Z");
      if (status && status !== "all") q = q.eq("status", status);
      const { data } = await q;
      return (data || []).map(r => ({
        id:             r.id,
        content_type:   r.content_type    || "",
        total_amount:   r.total_amount    || 0,
        creator_payout: r.creator_payout  || 0,
        payment_status: r.payment_status  || "",
        status:         r.status          || "",
        creator_name:   r.creator?.full_name || "",
        creator_handle: r.creator?.handle    || "",
        brand_name:     r.brand?.company_name || r.brand?.full_name || "",
        created_at:     r.created_at?.slice(0, 10) || "",
      }));
    },
  },
  {
    id:        "payout_requests",
    label:     "Payout Requests",
    Icon:      Wallet,
    color:     "#d97706",
    desc:      "All creator withdrawal requests with bank details and status",
    hasStatus: true,
    statuses:  ["all", "pending", "approved", "rejected"],
    async fetch({ from, to, status }) {
      let q = supabase
        .from("payout_requests")
        .select("id, creator_name, creator_handle, amount, bank_name, account_name, status, created_at")
        .order("created_at", { ascending: false });
      if (from) q = q.gte("created_at", from);
      if (to)   q = q.lte("created_at", to + "T23:59:59Z");
      if (status && status !== "all") q = q.eq("status", status);
      const { data } = await q;
      return (data || []).map(r => ({
        id:             r.id,
        creator_name:   r.creator_name   || "",
        creator_handle: r.creator_handle || "",
        amount:         r.amount         || 0,
        bank_name:      r.bank_name      || "",
        account_name:   r.account_name   || "",
        status:         r.status         || "",
        requested_at:   r.created_at?.slice(0, 10) || "",
      }));
    },
  },
  {
    id:        "kyc",
    label:     "KYC Submissions",
    Icon:      BadgeCheck,
    color:     "#7c3aed",
    desc:      "Identity verification submissions — restrict access by role",
    hasStatus: true,
    statuses:  ["all", "pending", "approved", "rejected", "more_info"],
    async fetch({ from, to, status }) {
      let q = supabase
        .from("kyc_submissions")
        .select("id, user_name, user_handle, doc_type, status, created_at, reviewed_at")
        .order("created_at", { ascending: false });
      if (from) q = q.gte("created_at", from);
      if (to)   q = q.lte("created_at", to + "T23:59:59Z");
      if (status && status !== "all") q = q.eq("status", status);
      const { data } = await q;
      return (data || []).map(r => ({
        id:          r.id,
        user_name:   r.user_name   || "",
        user_handle: r.user_handle || "",
        doc_type:    r.doc_type    || "",
        status:      r.status      || "",
        submitted:   r.created_at?.slice(0, 10)  || "",
        reviewed:    r.reviewed_at?.slice(0, 10) || "",
      }));
    },
  },
  {
    id:        "email_logs",
    label:     "Email Logs",
    Icon:      Mail,
    color:     "#0891b2",
    desc:      "All outbound emails with delivery status and Resend IDs",
    hasStatus: true,
    statuses:  ["all", "sent", "failed"],
    async fetch({ from, to, status }) {
      let q = supabase
        .from("email_logs")
        .select("id, to_email, to_name, subject, type, status, resend_id, triggered_by, created_at")
        .order("created_at", { ascending: false })
        .limit(5000);
      if (from) q = q.gte("created_at", from);
      if (to)   q = q.lte("created_at", to + "T23:59:59Z");
      if (status && status !== "all") q = q.eq("status", status);
      const { data } = await q;
      return (data || []).map(r => ({
        id:           r.id,
        to_email:     r.to_email     || "",
        to_name:      r.to_name      || "",
        subject:      r.subject      || "",
        type:         r.type         || "",
        status:       r.status       || "",
        resend_id:    r.resend_id    || "",
        triggered_by: r.triggered_by || "",
        sent_at:      r.created_at?.slice(0, 19).replace("T", " ") || "",
      }));
    },
  },
  {
    id:        "promo_uses",
    label:     "Promo Code Redemptions",
    Icon:      Ticket,
    color:     "#ec4899",
    desc:      "All promo code redemptions with user and credit data",
    hasStatus: false,
    async fetch({ from, to }) {
      let q = supabase
        .from("promo_code_uses")
        .select("id, user_name, user_role, discount_applied, context, used_at, code:promo_codes!code_id(code, discount_type)")
        .order("used_at", { ascending: false });
      if (from) q = q.gte("used_at", from);
      if (to)   q = q.lte("used_at", to + "T23:59:59Z");
      const { data } = await q;
      return (data || []).map(r => ({
        id:               r.id,
        promo_code:       r.code?.code          || "",
        discount_type:    r.code?.discount_type || "",
        user_name:        r.user_name           || "",
        user_role:        r.user_role           || "",
        discount_applied: r.discount_applied    || 0,
        context:          r.context             || "",
        redeemed_at:      r.used_at?.slice(0, 10) || "",
      }));
    },
  },
  {
    id:        "admin_approvals",
    label:     "Admin Actions Log",
    Icon:      ClipboardList,
    color:     "#6b7280",
    desc:      "All admin approval actions — KYC, fraud flags, disputes",
    hasStatus: true,
    statuses:  ["all", "pending", "approved", "rejected"],
    async fetch({ from, to, status }) {
      let q = supabase
        .from("admin_approvals")
        .select("id, type, description, target, requester_name, requester_role, status, reviewed_by, reviewed_at, created_at")
        .order("created_at", { ascending: false })
        .limit(5000);
      if (from) q = q.gte("created_at", from);
      if (to)   q = q.lte("created_at", to + "T23:59:59Z");
      if (status && status !== "all") q = q.eq("status", status);
      const { data } = await q;
      return (data || []).map(r => ({
        id:             r.id,
        type:           r.type            || "",
        description:    r.description     || "",
        target:         r.target          || "",
        actioned_by:    r.requester_name  || "",
        role:           r.requester_role  || "",
        status:         r.status          || "",
        reviewed_by:    r.reviewed_by     || "",
        reviewed_at:    r.reviewed_at?.slice(0, 10) || "",
        created_at:     r.created_at?.slice(0, 10)  || "",
      }));
    },
  },
];

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function DataExportPanel({ showToast, auditLog }) {
  const [filters, setFilters]     = useState({});  // { [datasetId]: { from, to, status } }
  const [loading, setLoading]     = useState({});
  const [lastExport, setLastExport] = useState({});

  function getFilter(id) {
    return filters[id] || { from: "", to: "", status: "all" };
  }

  function setFilter(id, key, val) {
    setFilters(prev => ({ ...prev, [id]: { ...getFilter(id), [key]: val } }));
  }

  async function doExport(dataset) {
    const f = getFilter(dataset.id);
    setLoading(prev => ({ ...prev, [dataset.id]: true }));
    try {
      const rows = await dataset.fetch({ from: f.from || null, to: f.to || null, status: f.status || "all" });
      if (!rows.length) {
        showToast?.("No data found for the selected filters", "error");
        setLoading(prev => ({ ...prev, [dataset.id]: false }));
        return;
      }
      const csv      = toCSV(rows);
      const filename = fmtFilename(dataset.label, f);
      downloadCSV(csv, filename);
      auditLog?.("data_export", { dataset: dataset.id, rows: rows.length, filename });
      setLastExport(prev => ({ ...prev, [dataset.id]: { rows: rows.length, at: new Date().toLocaleTimeString() } }));
      showToast?.(`Exported ${rows.length.toLocaleString()} rows as ${filename}`);
    } catch (e) {
      showToast?.("Export failed — " + (e.message || "unknown error"), "error");
    }
    setLoading(prev => ({ ...prev, [dataset.id]: false }));
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Data Exports</h2>
        <p className="text-sm text-gray-500 mt-0.5">Export platform data as CSV. All exports are recorded in the audit log.</p>
      </div>

      {/* Dataset cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {DATASETS.map(ds => {
          const f       = getFilter(ds.id);
          const busy    = loading[ds.id];
          const last    = lastExport[ds.id];

          return (
            <div key={ds.id} className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: "#e5e7eb" }}>
              {/* Dataset header */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: ds.color + "18" }}>
                  <ds.Icon className="w-5 h-5" style={{ color: ds.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{ds.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{ds.desc}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                {/* Date range */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 block mb-1">From</label>
                    <input type="date" value={f.from}
                      onChange={e => setFilter(ds.id, "from", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1"
                      style={{ "--tw-ring-color": ds.color }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 block mb-1">To</label>
                    <input type="date" value={f.to}
                      onChange={e => setFilter(ds.id, "to", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1"
                      style={{ "--tw-ring-color": ds.color }} />
                  </div>
                </div>

                {/* Status filter */}
                {ds.hasStatus && (
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Status</label>
                    <select value={f.status || "all"} onChange={e => setFilter(ds.id, "status", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1"
                      style={{ "--tw-ring-color": ds.color }}>
                      {(ds.statuses || ["all"]).map(s => (
                        <option key={s} value={s}>{s === "all" ? "All statuses" : s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Export button + last export info */}
              <div className="flex items-center justify-between gap-2">
                {last ? (
                  <p className="text-xs text-gray-400">
                    <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" />
                    {last.rows.toLocaleString()} rows at {last.at}
                  </p>
                ) : <span />}
                <button onClick={() => doExport(ds)} disabled={busy}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white disabled:opacity-60 transition-opacity hover:opacity-90 flex-shrink-0"
                  style={{ backgroundColor: ds.color }}>
                  {busy
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting…</>
                    : <><Download className="w-3.5 h-3.5" /> Export CSV</>
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 text-center">
        Exports are capped at 5,000 rows per request. Use date filters for larger datasets. All exports appear in the Audit Log.
      </p>
    </div>
  );
}
