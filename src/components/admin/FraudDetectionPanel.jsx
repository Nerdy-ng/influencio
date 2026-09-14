import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  ShieldAlert, RefreshCw, Loader2, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Eye, UserX, Landmark,
  FileText, Zap, TrendingUp,
} from "lucide-react";

const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const SIGNALS = [
  { id: "shared_bank",     label: "Shared Bank Account",       Icon: Landmark,    color: "#dc2626", desc: "Multiple users using the same account number for payouts" },
  { id: "shared_kyc",      label: "Duplicate KYC Document",    Icon: FileText,    color: "#d97706", desc: "Same document number submitted by more than one user" },
  { id: "unverified_earn", label: "High Earnings, No KYC",     Icon: TrendingUp,  color: "#7c3aed", desc: "Creators with ₦50,000+ in earnings but no approved KYC" },
  { id: "payout_velocity", label: "Payout Velocity Spike",     Icon: Zap,         color: "#0891b2", desc: "Creators with 3+ payout requests in the last 14 days" },
];

export default function FraudDetectionPanel({ showToast, auditLog }) {
  const [activeSignal, setActiveSignal] = useState("shared_bank");
  const [results, setResults]           = useState({});
  const [loading, setLoading]           = useState({});
  const [expanded, setExpanded]         = useState(null);
  const [dismissed, setDismissed]       = useState({});
  const [flagging, setFlagging]         = useState(null);
  const [adminName, setAdminName]       = useState("Admin");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("brandiór_admin_token");
      if (raw) {
        const p = JSON.parse(atob(raw.split(".")[1] ?? "e30="));
        setAdminName(p?.name || "Admin");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!results[activeSignal]) runDetection(activeSignal);
  }, [activeSignal]);

  async function runDetection(signalId) {
    setLoading(prev => ({ ...prev, [signalId]: true }));
    let data = [];
    try {
      if (signalId === "shared_bank") {
        data = await detectSharedBank();
      } else if (signalId === "shared_kyc") {
        data = await detectSharedKYC();
      } else if (signalId === "unverified_earn") {
        data = await detectUnverifiedEarners();
      } else if (signalId === "payout_velocity") {
        data = await detectPayoutVelocity();
      }
    } catch (e) {
      showToast?.("Detection query failed", "error");
    }
    setResults(prev => ({ ...prev, [signalId]: data }));
    setLoading(prev => ({ ...prev, [signalId]: false }));
  }

  // ── Detection queries ─────────────────────────────────────────────────────

  async function detectSharedBank() {
    const { data } = await supabase
      .from("payout_requests")
      .select("account_number, account_name, bank_name, user_id, creator_name, creator_handle, amount, created_at")
      .order("created_at", { ascending: false });
    if (!data) return [];
    const grouped = {};
    for (const row of data) {
      const key = row.account_number;
      if (!key) continue;
      if (!grouped[key]) grouped[key] = { account_number: key, account_name: row.account_name, bank_name: row.bank_name, users: new Map() };
      grouped[key].users.set(row.user_id, { user_id: row.user_id, name: row.creator_name, handle: row.creator_handle, amount: row.amount, date: row.created_at });
    }
    return Object.values(grouped)
      .filter(g => g.users.size > 1)
      .map(g => ({ ...g, users: Array.from(g.users.values()), id: g.account_number }));
  }

  async function detectSharedKYC() {
    const { data } = await supabase
      .from("kyc_submissions")
      .select("doc_number, doc_type, user_id, user_name, user_handle, status, created_at")
      .not("doc_number", "is", null)
      .order("created_at", { ascending: false });
    if (!data) return [];
    const grouped = {};
    for (const row of data) {
      const key = row.doc_number?.trim();
      if (!key) continue;
      if (!grouped[key]) grouped[key] = { doc_number: key, doc_type: row.doc_type, users: new Map() };
      grouped[key].users.set(row.user_id, { user_id: row.user_id, name: row.user_name, handle: row.user_handle, status: row.status, date: row.created_at });
    }
    return Object.values(grouped)
      .filter(g => g.users.size > 1)
      .map(g => ({ ...g, users: Array.from(g.users.values()), id: g.doc_number }));
  }

  async function detectUnverifiedEarners() {
    // Get all creators and their total collabs earnings
    const { data: collabData } = await supabase
      .from("collabs")
      .select("creator_id, creator_payout, payment_status")
      .in("payment_status", ["paid", "released"]);
    if (!collabData) return [];

    // Aggregate by creator
    const earningsMap = {};
    for (const c of collabData) {
      if (!c.creator_id) continue;
      earningsMap[c.creator_id] = (earningsMap[c.creator_id] || 0) + Number(c.creator_payout || 0);
    }
    const highEarners = Object.entries(earningsMap)
      .filter(([, total]) => total >= 50000)
      .map(([id, total]) => ({ creator_id: id, total }));

    if (!highEarners.length) return [];

    // Get their KYC status
    const ids = highEarners.map(e => e.creator_id);
    const { data: kycs } = await supabase
      .from("kyc_submissions")
      .select("user_id, status")
      .in("user_id", ids)
      .eq("status", "approved");

    const verifiedSet = new Set((kycs || []).map(k => k.user_id));
    const unverified = highEarners.filter(e => !verifiedSet.has(e.creator_id));

    if (!unverified.length) return [];

    // Get profile info
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, handle, role")
      .in("id", unverified.map(e => e.creator_id))
      .eq("role", "creator");

    const profMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
    return unverified
      .map(e => ({ id: e.creator_id, user_id: e.creator_id, total: e.total, ...profMap[e.creator_id] }))
      .filter(r => r.full_name || r.handle)
      .sort((a, b) => b.total - a.total);
  }

  async function detectPayoutVelocity() {
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("payout_requests")
      .select("user_id, creator_name, creator_handle, amount, created_at, status")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false });
    if (!data) return [];
    const grouped = {};
    for (const row of data) {
      if (!grouped[row.user_id]) grouped[row.user_id] = { user_id: row.user_id, name: row.creator_name, handle: row.creator_handle, requests: [] };
      grouped[row.user_id].requests.push({ amount: row.amount, date: row.created_at, status: row.status });
    }
    return Object.values(grouped)
      .filter(g => g.requests.length >= 3)
      .map(g => ({ ...g, id: g.user_id, total: g.requests.reduce((s, r) => s + Number(r.amount), 0) }))
      .sort((a, b) => b.requests.length - a.requests.length);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async function handleFlag(item, signal) {
    setFlagging(item.id);
    const target = item.handle ? `@${item.handle}` : item.name || item.account_number || item.doc_number;
    const desc   = SIGNALS.find(s => s.id === signal)?.label || signal;
    const { error } = await supabase.from("admin_approvals").insert({
      type:           "Fraud Flag",
      description:    `${desc} — ${target}`,
      target:         target,
      target_id:      item.user_id || item.id,
      requester_name: adminName,
      requester_role: "Admin",
      status:         "pending",
    });
    if (error) { showToast?.("Failed to flag", "error"); }
    else {
      auditLog?.("fraud_flag", { signal, target });
      showToast?.(`Flagged ${target} for review`);
    }
    setFlagging(null);
  }

  function handleDismiss(itemId) {
    setDismissed(prev => ({ ...prev, [itemId]: true }));
    showToast?.("Dismissed — marked as reviewed");
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const signal     = SIGNALS.find(s => s.id === activeSignal);
  const items      = (results[activeSignal] || []).filter(i => !dismissed[i.id]);
  const isLoading  = loading[activeSignal];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Fraud & Duplicate Account Detection</h2>
          <p className="text-sm text-gray-500 mt-0.5">Automated signals across the platform — review and act</p>
        </div>
        <button onClick={() => runDetection(activeSignal)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <RefreshCw className="w-4 h-4" /> Rerun
        </button>
      </div>

      {/* Signal tabs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SIGNALS.map(s => {
          const count  = (results[s.id] || []).filter(i => !dismissed[i.id]).length;
          const active = activeSignal === s.id;
          return (
            <button key={s.id} onClick={() => setActiveSignal(s.id)}
              className="text-left p-4 rounded-2xl border transition-all"
              style={{
                backgroundColor: active ? `${s.color}08` : "white",
                borderColor:     active ? s.color : "#e5e7eb",
                boxShadow:       active ? `0 0 0 2px ${s.color}30` : "none",
              }}>
              <s.Icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
              <p className="text-xs font-bold text-gray-800">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{s.desc}</p>
              {results[s.id] !== undefined && (
                <p className="text-sm font-black mt-2" style={{ color: count > 0 ? s.color : "#9ca3af" }}>
                  {count} {count === 1 ? "match" : "matches"}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "#f3f4f6" }}>
          <signal.Icon className="w-4 h-4" style={{ color: signal.color }} />
          <p className="font-semibold text-gray-800 text-sm">{signal.label}</p>
          <p className="text-xs text-gray-400 ml-1">— {signal.desc}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Running detection…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CheckCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold">No matches found</p>
            <p className="text-xs mt-1 text-gray-300">
              {results[activeSignal] === undefined ? "Click Rerun to scan" : "All clear for this signal"}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
            {items.map(item => {
              const isOpen = expanded === item.id;
              const busy   = flagging === item.id;
              return (
                <div key={item.id}>
                  <button onClick={() => setExpanded(isOpen ? null : item.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: signal.color }} />
                    <div className="flex-1 min-w-0">
                      <ResultTitle item={item} signalId={activeSignal} />
                      <ResultSub   item={item} signalId={activeSignal} />
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4" style={{ backgroundColor: "#fafafa" }}>
                      <ResultDetail item={item} signalId={activeSignal} />
                      <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "#e5e7eb" }}>
                        <button onClick={() => handleFlag(item, activeSignal)} disabled={busy}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white disabled:opacity-50"
                          style={{ backgroundColor: "#dc2626" }}>
                          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                          Flag for Review
                        </button>
                        <button onClick={() => handleDismiss(item.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100">
                          <CheckCircle className="w-3.5 h-3.5" /> Dismiss (False Positive)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Per-signal display helpers ────────────────────────────────────────────

function ResultTitle({ item, signalId }) {
  if (signalId === "shared_bank") return <p className="text-sm font-semibold text-gray-900">{item.account_number} · {item.bank_name}</p>;
  if (signalId === "shared_kyc")  return <p className="text-sm font-semibold text-gray-900">{item.doc_type} — {item.doc_number}</p>;
  if (signalId === "unverified_earn") return <p className="text-sm font-semibold text-gray-900">{item.full_name || item.handle || item.creator_id}</p>;
  if (signalId === "payout_velocity") return <p className="text-sm font-semibold text-gray-900">{item.name || item.handle || item.user_id}</p>;
  return null;
}

function ResultSub({ item, signalId }) {
  if (signalId === "shared_bank")     return <p className="text-xs text-gray-400">{item.users.length} accounts using this bank account</p>;
  if (signalId === "shared_kyc")      return <p className="text-xs text-gray-400">{item.users.length} accounts sharing this document</p>;
  if (signalId === "unverified_earn") return <p className="text-xs text-gray-400">{item.handle ? `@${item.handle}` : ""} · {fmtMoney(item.total)} earned · no verified KYC</p>;
  if (signalId === "payout_velocity") return <p className="text-xs text-gray-400">{item.handle ? `@${item.handle}` : ""} · {item.requests.length} requests in 14 days · {fmtMoney(item.total)} total</p>;
  return null;
}

function ResultDetail({ item, signalId }) {
  if (signalId === "shared_bank" || signalId === "shared_kyc") {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Accounts involved</p>
        <div className="space-y-2">
          {item.users.map((u, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">{u.name || "Unknown"}</p>
                <p className="text-xs text-gray-400">{u.handle ? `@${u.handle}` : u.user_id?.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                {u.status && <span className="text-xs font-semibold text-gray-500">{u.status}</span>}
                <p className="text-xs text-gray-400">{fmtDate(u.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (signalId === "unverified_earn") {
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        <Detail label="Name"         value={item.full_name || "—"} />
        <Detail label="Handle"       value={item.handle ? `@${item.handle}` : "—"} />
        <Detail label="Total Earned" value={fmtMoney(item.total)} />
        <Detail label="KYC Status"   value="Not approved" />
      </div>
    );
  }
  if (signalId === "payout_velocity") {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payout requests (last 14 days)</p>
        <div className="space-y-2">
          {item.requests.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-2 border border-gray-100">
              <p className="text-sm font-semibold text-gray-800">{fmtMoney(r.amount)}</p>
              <span className="text-xs text-gray-400">{r.status}</span>
              <span className="text-xs text-gray-400">{fmtDate(r.date)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs font-bold text-gray-800 mt-3">Total: {fmtMoney(item.total)} across {item.requests.length} requests</p>
      </div>
    );
  }
  return null;
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  );
}
