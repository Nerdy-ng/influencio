import { useState, useEffect } from "react";
import { saveProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import { Wallet, Search, RotateCcw, Plus, Minus, Snowflake, ArrowRightLeft } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function WalletManagementPanel({ showToast, auditLog }) {
  const [wallets, setWallets]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState(false);
  const [modal, setModal]         = useState(null); // { type: "credit"|"debit"|"transfer"|"adjust_escrow", data: {} }
  const [amount, setAmount]       = useState("");
  const [note, setNote]           = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [txHistory, setTxHistory] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("id, full_name, company_name, handle, role, wallet_balance, restrictions").order("wallet_balance", { ascending: false });
    setWallets((data || []).map(p => ({
      ...p,
      displayName: p.company_name || p.full_name || p.handle || p.id?.slice(0, 8),
      frozen: p.restrictions?.wallet === true,
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function loadTxHistory(userId) {
    setTxLoading(true);
    const { data } = await supabase.from("wallet_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
    setTxHistory(data || []);
    setTxLoading(false);
  }

  async function handleCredit() {
    if (!selected || !amount) return;
    setBusy(true);
    const n = Number(amount);
    const { data: p } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.id).single();
    saveProfile(selected.id, { wallet_balance: (p?.wallet_balance || 0) + n });
    await supabase.from("wallet_transactions").insert({ user_id: selected.id, type: "admin_credit", amount: n, note: note || "Admin credit", created_at: new Date().toISOString() }).catch(() => {});
    auditLog?.("wallet_credit", "profile", selected.id, selected.displayName, { amount: n, note });
    showToast(`${fmtMoney(n)} credited to ${selected.displayName}`);
    setModal(null); setAmount(""); setNote("");
    load(); loadTxHistory(selected.id);
    setBusy(false);
  }

  async function handleDebit() {
    if (!selected || !amount) return;
    setBusy(true);
    const n = Number(amount);
    const { data: p } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.id).single();
    const current = p?.wallet_balance || 0;
    if (n > current) { showToast("Insufficient balance", "error"); setBusy(false); return; }
    saveProfile(selected.id, { wallet_balance: current - n });
    await supabase.from("wallet_transactions").insert({ user_id: selected.id, type: "admin_debit", amount: -n, note: note || "Admin debit", created_at: new Date().toISOString() }).catch(() => {});
    auditLog?.("wallet_debit", "profile", selected.id, selected.displayName, { amount: n, note });
    showToast(`${fmtMoney(n)} debited from ${selected.displayName}`);
    setModal(null); setAmount(""); setNote("");
    load(); loadTxHistory(selected.id);
    setBusy(false);
  }

  async function handleFreeze() {
    if (!selected) return;
    setBusy(true);
    const { data: p } = await supabase.from("profiles").select("restrictions").eq("id", selected.id).single();
    const r = p?.restrictions || {};
    r.wallet = !selected.frozen;
    saveProfile(selected.id, { restrictions: r });
    auditLog?.(selected.frozen ? "wallet_unfreeze" : "wallet_freeze", "profile", selected.id, selected.displayName);
    showToast(selected.frozen ? "Wallet unfrozen" : "Wallet frozen");
    await load();
    setBusy(false);
  }

  async function handleTransfer() {
    if (!selected || !amount || !transferTo.trim()) return;
    setBusy(true);
    const n = Number(amount);
    // Debit from
    const { data: fp } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.id).single();
    if (n > (fp?.wallet_balance || 0)) { showToast("Insufficient balance", "error"); setBusy(false); return; }
    saveProfile(selected.id, { wallet_balance: (fp?.wallet_balance || 0) - n });
    // Credit to — find by handle or id
    const { data: tp } = await supabase.from("profiles").select("id, wallet_balance, full_name, company_name, handle").or(`id.eq.${transferTo},handle.eq.${transferTo}`).single().catch(() => ({ data: null }));
    if (!tp) { showToast("Target user not found", "error"); setBusy(false); return; }
    saveProfile(tp.id, { wallet_balance: (tp.wallet_balance || 0) + n });
    auditLog?.("wallet_transfer", "profile", selected.id, selected.displayName, { amount: n, to: tp.id });
    showToast(`${fmtMoney(n)} transferred to ${tp.company_name || tp.full_name || tp.handle}`);
    setModal(null); setAmount(""); setTransferTo(""); setNote("");
    load();
    setBusy(false);
  }

  const filteredWallets = wallets.filter(w => {
    const t = search.toLowerCase();
    return !t || w.displayName.toLowerCase().includes(t) || (w.handle || "").toLowerCase().includes(t);
  });

  const totalBalance = wallets.reduce((s, w) => s + (w.wallet_balance || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Wallet Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Total balance: {fmtMoney(totalBalance)} across {wallets.length} users</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Float",   value: fmtMoney(totalBalance),                  color: "#4f46e5" },
          { label: "Frozen Wallets",value: wallets.filter(w => w.frozen).length,     color: "#ef4444" },
          { label: "Zero Balance",  value: wallets.filter(w => !w.wallet_balance).length, color: "#d97706" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or handle…" value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 480 }}>
        {/* List */}
        <div className="w-80 flex-shrink-0 space-y-1.5 overflow-y-auto" style={{ maxHeight: 600 }}>
          {filteredWallets.map(w => (
            <button key={w.id} onClick={() => { setSelected(w); loadTxHistory(w.id); }}
              className="w-full text-left p-3 rounded-xl transition-all"
              style={{ backgroundColor: selected?.id === w.id ? "#eef2ff" : "#fff", border: `1px solid ${selected?.id === w.id ? "#c7d2fe" : "#e2e8f0"}` }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{w.displayName}</p>
                  <p className="text-xs text-gray-400 capitalize">{w.role || "user"} {w.frozen ? "· 🔒 Frozen" : ""}</p>
                </div>
                <p className="text-sm font-black flex-shrink-0 ml-2" style={{ color: w.wallet_balance > 0 ? "#16a34a" : "#94a3b8" }}>{fmtMoney(w.wallet_balance)}</p>
              </div>
            </button>
          ))}
          {!loading && filteredWallets.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No wallets found</p>}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white overflow-hidden flex flex-col" style={{ border: "1px solid #e2e8f0", maxHeight: 640 }}>
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{selected.displayName}</h3>
                  <p className="text-xs text-gray-400 capitalize">{selected.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black" style={{ color: "#16a34a" }}>{fmtMoney(selected.wallet_balance)}</p>
                  {selected.frozen && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">🔒 Frozen</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setModal({ type: "credit" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700">
                  <Plus className="w-3 h-3" /> Credit
                </button>
                <button onClick={() => setModal({ type: "debit" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600">
                  <Minus className="w-3 h-3" /> Debit
                </button>
                <button onClick={handleFreeze} disabled={busy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 disabled:opacity-50">
                  <Snowflake className="w-3 h-3" /> {selected.frozen ? "Unfreeze" : "Freeze"}
                </button>
                <button onClick={() => setModal({ type: "transfer" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700">
                  <ArrowRightLeft className="w-3 h-3" /> Transfer
                </button>
              </div>
            </div>
            {/* Transaction history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Transaction History</p>
              {txLoading ? <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
              : txHistory.length === 0 ? <p className="text-sm text-gray-300 text-center py-8">No transactions</p>
              : txHistory.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 capitalize">{(tx.type || "transaction").replace(/_/g, " ")}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()} {tx.note ? `· ${tx.note}` : ""}</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: tx.amount >= 0 ? "#16a34a" : "#ef4444" }}>
                    {tx.amount >= 0 ? "+" : ""}{fmtMoney(Math.abs(tx.amount))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: "1px solid #e2e8f0" }}>
            <div className="text-center"><Wallet className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">Select a wallet</p></div>
          </div>
        )}
      </div>

      {/* Action modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 capitalize">{modal.type} Wallet — {selected?.displayName}</h3>
            {modal.type === "transfer" && (
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Transfer to (handle or user ID)</label>
                <input value={transferTo} onChange={e => setTransferTo(stripInjection(e.target.value))}
                  placeholder="@handle or uuid" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 mb-3" />
              </div>
            )}
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Amount (₦)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 mb-3" />
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Note (optional)</label>
            <input value={note} onChange={e => setNote(stripInjection(e.target.value))} placeholder="Reason…"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setAmount(""); setNote(""); setTransferTo(""); }}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button disabled={busy || !amount}
                onClick={modal.type === "credit" ? handleCredit : modal.type === "debit" ? handleDebit : handleTransfer}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: modal.type === "credit" ? "#16a34a" : modal.type === "debit" ? "#ef4444" : "#7c3aed" }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
