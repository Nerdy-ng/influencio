import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import {
  Activity, RefreshCw, Loader2, CheckCircle, XCircle,
  AlertTriangle, Clock, Users, DollarSign, Zap, Database,
  Mail, CreditCard, TrendingUp, BarChart2, ArrowUpRight,
  Shield, FileText, BadgeCheck,
} from "lucide-react";

const fmtNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtMs    = (n) => n != null ? `${n}ms` : "—";

function StatusPill({ status }) {
  const cfg = {
    ok:      { label: "Operational",   color: "#059669", bg: "#d1fae5", Icon: CheckCircle  },
    warn:    { label: "Degraded",      color: "#d97706", bg: "#fef3c7", Icon: AlertTriangle },
    error:   { label: "Down",          color: "#dc2626", bg: "#fee2e2", Icon: XCircle      },
    unknown: { label: "Unknown",       color: "#6b7280", bg: "#f3f4f6", Icon: Clock        },
    checking:{ label: "Checking…",     color: "#7c3aed", bg: "#ede9fe", Icon: Loader2      },
  }[status] || { label: status, color: "#6b7280", bg: "#f3f4f6", Icon: Clock };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <cfg.Icon className={`w-3 h-3 ${status === "checking" ? "animate-spin" : ""}`} />
      {cfg.label}
    </span>
  );
}

function MetricCard({ Icon, label, value, sub, color = "#7c3aed", loading }) {
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e5e7eb" }}>
      <Icon className="w-4 h-4 mb-2" style={{ color }} />
      {loading
        ? <div className="h-8 w-16 rounded-lg animate-pulse" style={{ backgroundColor: "#f3f4f6" }} />
        : <p className="text-2xl font-black text-gray-900">{value}</p>
      }
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs mt-0.5 font-medium" style={{ color }}>{sub}</p>}
    </div>
  );
}

const fmtAge = (d) => {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function SystemHealthPanel({ showToast }) {
  const [loading, setLoading]   = useState(true);
  const [dbStatus, setDbStatus] = useState("checking");
  const [dbLatency, setDbLatency] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const [queues, setQueues] = useState({
    kyc: 0, payouts: 0, disputes: 0, fraud: 0, refunds: 0,
  });

  const [metrics, setMetrics] = useState({
    totalUsers: 0, creators: 0, brands: 0,
    activeCollabs: 0, totalCollabs: 0,
    totalPaidOut: 0, newSignups7d: 0,
    activeSessions: 0,
  });

  const [recentEvents, setRecentEvents] = useState([]);

  const check = useCallback(async () => {
    setLoading(true);
    setDbStatus("checking");
    setDbLatency(null);

    const t0 = Date.now();

    try {
      // ── DB latency ping ───────────────────────────────────────────────────
      const pingRes = await supabase.from("profiles").select("id").limit(1);
      const latency = Date.now() - t0;
      setDbLatency(latency);
      setDbStatus(pingRes.error ? "error" : latency > 2000 ? "warn" : "ok");

      // ── Queue depths ──────────────────────────────────────────────────────
      const [kycRes, payoutRes, disputeRes, fraudRes, refundRes] = await Promise.all([
        supabase.from("kyc_submissions") .select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("payout_requests") .select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("admin_approvals") .select("id", { count: "exact", head: true }).ilike("type", "%dispute%").eq("status", "pending"),
        supabase.from("admin_approvals") .select("id", { count: "exact", head: true }).eq("type", "Fraud Flag").eq("status", "pending"),
        supabase.from("refund_requests") .select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setQueues({
        kyc:     kycRes.count     ?? 0,
        payouts: payoutRes.count  ?? 0,
        disputes:disputeRes.count ?? 0,
        fraud:   fraudRes.count   ?? 0,
        refunds: refundRes.count  ?? 0,
      });

      // ── Platform metrics ──────────────────────────────────────────────────
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

      const [
        creatorsRes, brandsRes,
        activeCollabsRes, totalCollabsRes,
        payoutVolumeRes, signupsRes,
        sessionsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "creator"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "brand"),
        supabase.from("collaborations").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("collaborations").select("id", { count: "exact", head: true }),
        supabase.from("payout_requests").select("amount").eq("status", "completed"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("admin_sessions").select("id", { count: "exact", head: true }).eq("is_active", true).gt("expires_at", new Date().toISOString()),
      ]);

      const totalPaidOut = (payoutVolumeRes.data || []).reduce((s, r) => s + Number(r.amount || 0), 0);

      setMetrics({
        creators:       creatorsRes.count    ?? 0,
        brands:         brandsRes.count      ?? 0,
        totalUsers:     (creatorsRes.count   ?? 0) + (brandsRes.count ?? 0),
        activeCollabs:  activeCollabsRes.count ?? 0,
        totalCollabs:   totalCollabsRes.count  ?? 0,
        totalPaidOut,
        newSignups7d:   signupsRes.count      ?? 0,
        activeSessions: sessionsRes.count     ?? 0,
      });

      // ── Recent security events ────────────────────────────────────────────
      const { data: evts } = await supabase
        .from("admin_security_events")
        .select("event_type, admin_name, admin_role, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      setRecentEvents(evts || []);

    } catch {
      setDbStatus("error");
      showToast?.("Health check failed", "error");
    }

    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { check(); }, [check]);

  const totalQueueDepth = Object.values(queues).reduce((a, b) => a + b, 0);
  const overallHealth =
    dbStatus === "error"   ? "error"
    : totalQueueDepth > 20 ? "warn"
    : dbStatus === "warn"  ? "warn"
    : "ok";

  const HEALTH_BANNER = {
    ok:    { msg: "All systems operational",           color: "#059669", bg: "#d1fae5", border: "#a7f3d0", Icon: CheckCircle  },
    warn:  { msg: "Systems operational — queues building up", color: "#d97706", bg: "#fef3c7", border: "#fde68a", Icon: AlertTriangle },
    error: { msg: "Database connectivity issue detected", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", Icon: XCircle      },
  }[overallHealth];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">System Health</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Platform metrics, queue depths, and service status
            {lastRefresh && <span className="ml-2">· Last checked {fmtAge(lastRefresh)}</span>}
          </p>
        </div>
        <button onClick={check} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Overall health banner */}
      {!loading && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{ backgroundColor: HEALTH_BANNER.bg, border: `1px solid ${HEALTH_BANNER.border}` }}>
          <HEALTH_BANNER.Icon className="w-5 h-5 flex-shrink-0" style={{ color: HEALTH_BANNER.color }} />
          <p className="text-sm font-bold" style={{ color: HEALTH_BANNER.color }}>{HEALTH_BANNER.msg}</p>
        </div>
      )}

      {/* Services */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Services</p>
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          {[
            {
              Icon: Database,
              label: "Supabase Database",
              desc:  "Primary data store — query latency measured live",
              status: dbStatus,
              detail: dbLatency != null ? `${fmtMs(dbLatency)} response` : null,
            },
            {
              Icon: Mail,
              label: "Resend (Email)",
              desc:  "Transactional email provider for OTPs and notifications",
              status: "unknown",
              link:  "https://status.resend.com",
              linkLabel: "Check status →",
            },
            {
              Icon: CreditCard,
              label: "Payment Gateway",
              desc:  "Paystack / Flutterwave for card payments",
              status: "unknown",
              link:  "https://status.paystack.com",
              linkLabel: "Check status →",
            },
          ].map((s, i) => (
            <div key={s.label} className={`flex items-center gap-4 px-5 py-4 flex-wrap ${i > 0 ? "border-t" : ""}`}
              style={{ borderColor: "#f3f4f6" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#f3f4f6" }}>
                <s.Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                {s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold mt-0.5 inline-flex items-center gap-0.5"
                    style={{ color: "#7c3aed" }}>
                    {s.linkLabel} <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {s.detail && <span className="text-xs text-gray-400 font-mono">{s.detail}</span>}
                <StatusPill status={loading && s.status === "checking" ? "checking" : s.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform metrics */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Platform metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard Icon={Users}      label="Total users"       value={metrics.totalUsers.toLocaleString()}   sub={`${metrics.creators} creators · ${metrics.brands} brands`} loading={loading} />
          <MetricCard Icon={Zap}        label="Active collabs"    value={metrics.activeCollabs.toLocaleString()} sub={`${metrics.totalCollabs} total`} color="#0891b2" loading={loading} />
          <MetricCard Icon={DollarSign} label="Total paid out"    value={fmtNaira(metrics.totalPaidOut)}        color="#059669" loading={loading} />
          <MetricCard Icon={TrendingUp} label="New signups (7d)"  value={metrics.newSignups7d.toLocaleString()} color="#d97706" loading={loading} />
        </div>
      </div>

      {/* Queue depths */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Action queues</p>
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          {[
            { key: "kyc",     label: "KYC Review",        Icon: BadgeCheck,  target: 48, color: "#7c3aed" },
            { key: "payouts", label: "Payout Approvals",  Icon: DollarSign,  target: 24, color: "#0891b2" },
            { key: "disputes",label: "Open Disputes",     Icon: AlertTriangle,target: 120,color: "#d97706" },
            { key: "fraud",   label: "Fraud Flag Review", Icon: Shield,      target: 72, color: "#dc2626" },
            { key: "refunds", label: "Pending Refunds",   Icon: RotateCcwIcon, target: null, color: "#059669" },
          ].map((q, i) => {
            const n = queues[q.key];
            const urgent = n > 5;
            const warning = n > 2;
            const dotColor = n === 0 ? "#059669" : urgent ? "#dc2626" : warning ? "#d97706" : q.color;

            return (
              <div key={q.key} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? "border-t" : ""}`}
                style={{ borderColor: "#f3f4f6" }}>
                <q.Icon className="w-4 h-4 flex-shrink-0" style={{ color: q.color }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{q.label}</p>
                  {q.target && <p className="text-xs text-gray-400">SLA: {q.target < 24 ? `${q.target}h` : `${q.target / 24}d`}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {loading
                    ? <div className="h-6 w-12 rounded-lg animate-pulse" style={{ backgroundColor: "#f3f4f6" }} />
                    : (
                      <span className="text-sm font-black px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: n === 0 ? "#d1fae5" : urgent ? "#fee2e2" : warning ? "#fef3c7" : "#f3f4f6",
                          color: dotColor,
                        }}>
                        {n === 0 ? "Clear" : n}
                      </span>
                    )
                  }
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="border-t px-5 py-3 flex items-center justify-between" style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}>
            <p className="text-xs font-bold text-gray-500">Total items awaiting action</p>
            {loading
              ? <div className="h-6 w-10 rounded-lg animate-pulse" style={{ backgroundColor: "#e5e7eb" }} />
              : <span className="text-sm font-black" style={{ color: totalQueueDepth > 10 ? "#dc2626" : "#059669" }}>
                  {totalQueueDepth}
                </span>
            }
          </div>
        </div>
      </div>

      {/* Active admin sessions */}
      <div className="rounded-2xl border bg-white p-4 flex items-center gap-4" style={{ borderColor: "#e5e7eb" }}>
        <Shield className="w-5 h-5 text-purple-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Active admin sessions</p>
          <p className="text-xs text-gray-400">Admins currently logged in with valid, non-expired sessions</p>
        </div>
        {loading
          ? <div className="h-8 w-12 rounded-lg animate-pulse" style={{ backgroundColor: "#f3f4f6" }} />
          : <p className="text-2xl font-black" style={{ color: "#7c3aed" }}>{metrics.activeSessions}</p>
        }
      </div>

      {/* Recent admin activity */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent admin activity</p>
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Activity className="w-8 h-8 mb-2 opacity-25" />
              <p className="text-sm">No recent activity recorded</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
              {recentEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: e.event_type === "login" ? "#059669" : e.event_type === "logout" ? "#6b7280" : "#dc2626" }} />
                  <p className="text-sm text-gray-700 flex-1">
                    <span className="font-semibold">{e.admin_name || "Admin"}</span>
                    {" · "}
                    <span className="text-gray-500">{e.event_type.replace(/_/g, " ")}</span>
                  </p>
                  <p className="text-xs text-gray-400 flex-shrink-0">{fmtAge(e.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Local alias to avoid name collision with lucide's RotateCcw
function RotateCcwIcon({ className, style }) {
  return <RefreshCw className={className} style={style} />;
}
