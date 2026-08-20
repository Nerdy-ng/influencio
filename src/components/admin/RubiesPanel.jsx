import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Wallet, ArrowUpRight, ArrowDownLeft, RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";

const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

const TX_TYPES = {
  escrow_release: { label: "Escrow Release", color: "#16a34a", bg: "#dcfce7", icon: ArrowDownLeft },
  pitch_purchase: { label: "Pitch Purchase",  color: "#4f46e5", bg: "#ede9fe", icon: ArrowUpRight },
  payout:         { label: "Payout",          color: "#d97706", bg: "#fef3c7", icon: ArrowUpRight },
  credit:         { label: "Credit",          color: "#16a34a", bg: "#dcfce7", icon: ArrowDownLeft },
  debit:          { label: "Debit",           color: "#dc2626", bg: "#fee2e2", icon: ArrowUpRight },
};

const STATUS_CHIP = {
  completed: { label: "Completed", bg: "#dcfce7", color: "#166534" },
  pending:   { label: "Pending",   bg: "#fef3c7", color: "#92400e" },
  failed:    { label: "Failed",    bg: "#fee2e2", color: "#991b1b" },
};

export default function RubiesPanel({ showToast, auditLog }) {
  const [loading, setLoading]   = useState(true);
  const [txns, setTxns]         = useState([]);
  const [topups, setTopups]     = useState([]);
  const [wallets, setWallets]   = useState({ withWallet: 0, withoutWallet: 0, total: 0 });
  const [escrowStats, setEscrowStats] = useState({ inEscrow: 0, released: 0, refunded: 0 });
  const [tab, setTab]           = useState("transactions");

  async function load() {
    setLoading(true);
    const [txRes, topupRes, profileRes, collabRes] = await Promise.all([
      supabase.from("rubies_transactions").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("wallet_topups").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("profiles").select("id, rubies_account_number, role").in("role", ["Talent"]),
      supabase.from("collabs").select("payment_status, creator_payout, total_amount").neq("payment_status", "unpaid"),
    ]);

    setTxns(txRes.data || []);
    setTopups(topupRes.data || []);

    const creators = profileRes.data || [];
    const withWallet    = creators.filter(p => p.rubies_account_number).length;
    const withoutWallet = creators.length - withWallet;
    setWallets({ withWallet, withoutWallet, total: creators.length });

    const collabs = collabRes.data || [];
    setEscrowStats({
      inEscrow: collabs.filter(c => c.payment_status === "paid")
        .reduce((s, c) => s + Number(c.creator_payout || 0), 0),
      released: collabs.filter(c => c.payment_status === "released")
        .reduce((s, c) => s + Number(c.creator_payout || 0), 0),
      refunded: collabs.filter(c => c.payment_status === "refunded")
        .reduce((s, c) => s + Number(c.total_amount || 0), 0),
    });

    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const pitchPurchases = topups.filter(t => t.purpose === "pitch_purchase");
  const walletFunds    = topups.filter(t => t.purpose !== "pitch_purchase");
  const totalFunded    = walletFunds.filter(t => t.status === "completed").reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalPitchRev  = pitchPurchases.filter(t => t.status === "completed").reduce((s, t) => s + Number(t.amount || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rubies Payment Panel</h2>
          <p className="text-sm text-gray-500 mt-0.5">Escrow activity, creator wallets, and card payment history</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "In Escrow (DB)",    value: fmtMoney(escrowStats.inEscrow),  color: "#d97706", icon: Clock },
          { label: "Released to Date",  value: fmtMoney(escrowStats.released),  color: "#16a34a", icon: CheckCircle },
          { label: "Refunded to Date",  value: fmtMoney(escrowStats.refunded),  color: "#dc2626", icon: XCircle },
          { label: "Card Funds Received", value: fmtMoney(totalFunded + totalPitchRev), color: "#4f46e5", icon: Wallet },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <p className="text-xs font-semibold text-gray-500">{label}</p>
            </div>
            <p className="text-lg font-black tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Wallet Coverage */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-800 mb-3">Creator Rubies Wallet Coverage</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: wallets.total > 0 ? `${(wallets.withWallet / wallets.total) * 100}%` : "0%",
                backgroundColor: "#16a34a",
              }}
            />
          </div>
          <div className="flex gap-4 text-xs font-semibold flex-shrink-0">
            <span className="text-green-700">{wallets.withWallet} have wallet</span>
            <span className="text-red-600">{wallets.withoutWallet} missing</span>
            <span className="text-gray-400">of {wallets.total} creators</span>
          </div>
        </div>
        {wallets.withoutWallet > 0 && (
          <p className="text-xs text-amber-600 mt-2 font-medium">
            ⚠ {wallets.withoutWallet} creator{wallets.withoutWallet > 1 ? "s" : ""} cannot receive escrow payouts until they complete KYC and get a Rubies wallet.
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
        {[
          { key: "transactions", label: "Rubies Transactions" },
          { key: "topups",       label: "Card Payments" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={tab === t.key
              ? { backgroundColor: "#4f46e5", color: "#fff" }
              : { color: "#94a3b8" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
        </div>
      ) : tab === "transactions" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  {["Type", "Amount", "Reference", "Status", "Date"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {txns.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No Rubies transactions yet</td></tr>
                ) : txns.map(tx => {
                  const meta = TX_TYPES[tx.type] || TX_TYPES.credit;
                  const Icon = meta.icon;
                  const stat = STATUS_CHIP[tx.status] || STATUS_CHIP.pending;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums text-gray-900">{fmtMoney(tx.amount)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[160px] truncate">{tx.reference || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: stat.bg, color: stat.color }}>
                          {stat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(tx.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  {["Purpose", "Amount", "Reference", "Status", "Date"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topups.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No card payments yet</td></tr>
                ) : topups.map(tp => {
                  const isPitch = tp.purpose === "pitch_purchase";
                  const stat = STATUS_CHIP[tp.status] || STATUS_CHIP.pending;
                  return (
                    <tr key={tp.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={isPitch
                            ? { backgroundColor: "#ede9fe", color: "#4f46e5" }
                            : { backgroundColor: "#dbeafe", color: "#1e40af" }}>
                          {isPitch ? "Pitch Purchase" : "Wallet Funding"}
                        </span>
                        {isPitch && tp.pack_size && (
                          <span className="ml-1.5 text-xs text-gray-400">{tp.pack_size} pitches</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums text-gray-900">{fmtMoney(tp.amount)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[160px] truncate">{tp.reference || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: stat.bg, color: stat.color }}>
                          {stat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(tp.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-50 flex gap-6 text-xs text-gray-400">
            <span>Wallet funding: <strong className="text-gray-700">{fmtMoney(totalFunded)}</strong></span>
            <span>Pitch purchases: <strong className="text-gray-700">{fmtMoney(totalPitchRev)}</strong></span>
          </div>
        </div>
      )}

      <div className="rounded-xl px-4 py-3 text-xs text-gray-400 bg-gray-50 border border-gray-100">
        Note: Rubies escrow live balance requires checking the Rubies BaaS dashboard directly. The "In Escrow" figure above is derived from the Supabase DB (collabs with payment_status = paid) and may differ slightly due to timing.
      </div>
    </div>
  );
}
