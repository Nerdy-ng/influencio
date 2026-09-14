import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Timer, RefreshCw, Loader2, AlertTriangle, CheckCircle,
  XCircle, ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react";

// ── SLA definitions ───────────────────────────────────────────────────────────
const SLAS = [
  {
    id:        "kyc",
    label:     "KYC Review",
    target:    48,   // hours
    atRisk:    36,   // hours — start showing amber
    desc:      "Identity submissions must be reviewed within 48 hours",
    navTab:    "kyc",
    color:     "#7c3aed",
  },
  {
    id:        "payout",
    label:     "Payout Approval",
    target:    24,
    atRisk:    18,
    desc:      "Payout requests must be actioned within 24 hours",
    navTab:    "payout-approvals",
    color:     "#0891b2",
  },
  {
    id:        "dispute",
    label:     "Dispute Resolution",
    target:    120,  // 5 days
    atRisk:    96,   // 4 days
    desc:      "Open disputes must be resolved within 5 business days",
    navTab:    "disputes2",
    color:     "#d97706",
  },
  {
    id:        "fraud",
    label:     "Fraud Flag Review",
    target:    72,
    atRisk:    48,
    desc:      "Flagged accounts must be reviewed within 72 hours",
    navTab:    "fraud",
    color:     "#dc2626",
  },
];

function hoursAgo(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) / 3600000;
}

function fmtAge(hours) {
  if (hours < 1)   return `${Math.round(hours * 60)}m ago`;
  if (hours < 24)  return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function fmtRemaining(hours, target) {
  const rem = target - hours;
  if (rem <= 0) return null;
  if (rem < 1)  return `${Math.round(rem * 60)}m left`;
  if (rem < 24) return `${Math.round(rem)}h left`;
  return `${Math.round(rem / 24)}d left`;
}

function statusOf(hours, sla) {
  if (hours >= sla.target) return "breached";
  if (hours >= sla.atRisk) return "at_risk";
  return "ok";
}

const STATUS_CONFIG = {
  ok:       { label: "On Track",   color: "#059669", bg: "#d1fae5", Icon: CheckCircle  },
  at_risk:  { label: "At Risk",    color: "#d97706", bg: "#fef3c7", Icon: AlertTriangle },
  breached: { label: "Breached",   color: "#dc2626", bg: "#fee2e2", Icon: XCircle      },
};

export default function SLATrackerPanel({ showToast, setActiveTab }) {
  const [loading, setLoading]   = useState(true);
  const [data, setData]         = useState({});
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [kycRes, payoutRes, disputeRes, fraudRes] = await Promise.all([
        // KYC: pending submissions
        supabase.from("kyc_submissions")
          .select("id, user_name, user_handle, created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: true }),

        // Payout: pending requests
        supabase.from("payout_requests")
          .select("id, creator_name, creator_handle, amount, created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: true }),

        // Disputes: pending admin_approvals of type Dispute
        supabase.from("admin_approvals")
          .select("id, target, description, created_at")
          .ilike("type", "%dispute%")
          .eq("status", "pending")
          .order("created_at", { ascending: true }),

        // Fraud flags: pending admin_approvals of type Fraud Flag
        supabase.from("admin_approvals")
          .select("id, target, description, created_at")
          .eq("type", "Fraud Flag")
          .eq("status", "pending")
          .order("created_at", { ascending: true }),
      ]);

      const process = (rows, labelFn) =>
        (rows || []).map(r => ({
          ...r,
          label: labelFn(r),
          age:   hoursAgo(r.created_at),
        }));

      setData({
        kyc:     process(kycRes.data,     r => r.user_name    || r.user_handle || r.id.slice(0, 8)),
        payout:  process(payoutRes.data,  r => r.creator_name || r.creator_handle || r.id.slice(0, 8)),
        dispute: process(disputeRes.data, r => r.target       || r.description?.slice(0, 40) || r.id.slice(0, 8)),
        fraud:   process(fraudRes.data,   r => r.target       || r.description?.slice(0, 40) || r.id.slice(0, 8)),
      });
    } catch {
      showToast?.("Failed to load SLA data", "error");
    }
    setLoading(false);
  }

  // Overall health
  const allItems = SLAS.flatMap(sla => (data[sla.id] || []).map(item => statusOf(item.age, sla)));
  const breached  = allItems.filter(s => s === "breached").length;
  const atRisk    = allItems.filter(s => s === "at_risk").length;
  const overallOk = breached === 0 && atRisk === 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">SLA Tracker</h2>
          <p className="text-sm text-gray-500 mt-0.5">Response time commitments across all admin queues</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Checking SLAs…
        </div>
      ) : (
        <>
          {/* Overall health banner */}
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{
              backgroundColor: overallOk ? "#d1fae5" : breached > 0 ? "#fee2e2" : "#fef3c7",
              border: `1px solid ${overallOk ? "#a7f3d0" : breached > 0 ? "#fecaca" : "#fde68a"}`,
            }}>
            {overallOk
              ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              : breached > 0
                ? <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                : <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            }
            <p className="text-sm font-bold"
              style={{ color: overallOk ? "#059669" : breached > 0 ? "#dc2626" : "#d97706" }}>
              {overallOk
                ? "All queues within SLA — no action needed"
                : `${breached > 0 ? `${breached} breached` : ""}${breached > 0 && atRisk > 0 ? " · " : ""}${atRisk > 0 ? `${atRisk} at risk` : ""}`
              }
            </p>
          </div>

          {/* SLA cards */}
          <div className="space-y-3">
            {SLAS.map(sla => {
              const items    = data[sla.id] || [];
              const statuses = items.map(item => statusOf(item.age, sla));
              const nBreached = statuses.filter(s => s === "breached").length;
              const nAtRisk   = statuses.filter(s => s === "at_risk").length;
              const nOk       = statuses.filter(s => s === "ok").length;
              const worstStatus = nBreached > 0 ? "breached" : nAtRisk > 0 ? "at_risk" : "ok";
              const cfg = STATUS_CONFIG[worstStatus];
              const isOpen = expanded === sla.id;

              return (
                <div key={sla.id} className="rounded-2xl border bg-white overflow-hidden"
                  style={{ borderColor: items.length === 0 ? "#e5e7eb" : cfg.color + "40" }}>
                  {/* Card header */}
                  <button onClick={() => setExpanded(isOpen ? null : sla.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                    {/* SLA colour dot */}
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sla.color }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900">{sla.label}</p>
                        <span className="text-xs text-gray-400">Target: {sla.target < 24 ? `${sla.target}h` : `${sla.target / 24}d`}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{sla.desc}</p>
                    </div>

                    {/* Status counts */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {items.length === 0 ? (
                        <span className="text-xs font-bold text-gray-400">Queue empty</span>
                      ) : (
                        <>
                          {nBreached > 0 && <Pill n={nBreached} status="breached" />}
                          {nAtRisk   > 0 && <Pill n={nAtRisk}   status="at_risk"  />}
                          {nOk       > 0 && <Pill n={nOk}       status="ok"       />}
                        </>
                      )}
                      {items.length > 0 && (
                        isOpen
                          ? <ChevronUp   className="w-4 h-4 text-gray-400 ml-1" />
                          : <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                      )}
                    </div>
                  </button>

                  {/* Item list */}
                  {isOpen && items.length > 0 && (
                    <div className="border-t" style={{ borderColor: "#f3f4f6" }}>
                      {/* Column headers */}
                      <div className="grid grid-cols-12 px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b" style={{ borderColor: "#f9f9f9" }}>
                        <div className="col-span-5">Item</div>
                        <div className="col-span-3">Submitted</div>
                        <div className="col-span-2">Age</div>
                        <div className="col-span-2">Status</div>
                      </div>
                      <div className="divide-y" style={{ borderColor: "#f9f9f9" }}>
                        {items.map(item => {
                          const st  = statusOf(item.age, sla);
                          const cfg = STATUS_CONFIG[st];
                          const rem = fmtRemaining(item.age, sla.target);
                          return (
                            <div key={item.id} className="grid grid-cols-12 items-center px-5 py-3 gap-2">
                              <div className="col-span-5 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{item.label}</p>
                                {item.amount && (
                                  <p className="text-xs text-gray-400">₦{Number(item.amount).toLocaleString()}</p>
                                )}
                              </div>
                              <div className="col-span-3">
                                <p className="text-xs text-gray-500">
                                  {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(item.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs font-semibold" style={{ color: cfg.color }}>{fmtAge(item.age)}</p>
                                {rem && <p className="text-xs text-gray-400">{rem}</p>}
                                {!rem && <p className="text-xs font-bold text-red-500">{Math.round(item.age - sla.target)}h over</p>}
                              </div>
                              <div className="col-span-2">
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                                  <cfg.Icon className="w-3 h-3" />
                                  {cfg.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Go to queue button */}
                      {setActiveTab && (
                        <div className="px-5 py-3 border-t flex justify-end" style={{ borderColor: "#f3f4f6" }}>
                          <button onClick={() => setActiveTab(sla.navTab)}
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: sla.color }}>
                            Go to {sla.label} queue <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SLA definitions legend */}
          <div className="rounded-2xl border p-5" style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">SLA Targets</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {SLAS.map(sla => (
                <div key={sla.id} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: sla.color }} />
                  <div>
                    <p className="text-xs font-bold text-gray-700">{sla.label}</p>
                    <p className="text-xs text-gray-400">
                      At risk after {sla.atRisk < 24 ? `${sla.atRisk}h` : `${sla.atRisk / 24}d`} ·
                      Breached after {sla.target < 24 ? `${sla.target}h` : `${sla.target / 24}d`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Pill({ n, status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {n} {cfg.label}
    </span>
  );
}
