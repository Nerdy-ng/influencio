import { useState, useEffect } from "react";
import { saveProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import { Lock, RotateCcw, Search, Unlock, ArrowDownLeft, Split } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

function ageInDays(iso) {
  return iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : 0;
}

export default function EscrowPanel({ showToast, auditLog }) {
  const [escrows, setEscrows]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState(false);
  const [splitPct, setSplitPct]   = useState(50);
  const [splitModal, setSplitModal] = useState(false);
  const [releaseNote, setReleaseNote] = useState("");
  const [releaseModal, setReleaseModal] = useState(null); // "release" | "refund"

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase.from("collabs").select("*").eq("payment_status", "paid").order("created_at", { ascending: false });
    const list = rows || [];
    const ids = [...new Set(list.flatMap(c => [c.brand_id, c.creator_id]).filter(Boolean))];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, company_name, handle, wallet_balance").in("id", ids);
      (profs || []).forEach(p => { nameMap[p.id] = p; });
    }
    setEscrows(list.map(c => ({
      ...c,
      brandName:   nameMap[c.brand_id]?.company_name || nameMap[c.brand_id]?.full_name || "Brand",
      creatorName: nameMap[c.creator_id]?.full_name  || nameMap[c.creator_id]?.handle  || "Creator",
      brandWallet:   nameMap[c.brand_id]?.wallet_balance || 0,
      creatorWallet: nameMap[c.creator_id]?.wallet_balance || 0,
      ageDays: ageInDays(c.paid_at || c.created_at),
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleRelease() {
    if (!selected) return;
    setBusy(true);
    const payout = Number(selected.creator_payout || selected.total_amount);

    const { data: creator, error: fetchErr } = await supabase
      .from("profiles").select("wallet_balance").eq("id", selected.creator_id).single();
    if (fetchErr) { showToast("Could not fetch creator wallet", "error"); setBusy(false); return; }

    const { error: updateErr } = await supabase.from("collabs").update({
      payment_status: "released",
      released_at:    new Date().toISOString(),
      status:         "completed",
      admin_note:     releaseNote || "Admin manual release",
    }).eq("id", selected.id);
    if (updateErr) { showToast("Failed to update collab: " + updateErr.message, "error"); setBusy(false); return; }

    await supabase.from("profiles")
      .update({ wallet_balance: (creator?.wallet_balance || 0) + payout })
      .eq("id", selected.creator_id);

    await Promise.all([
      supabase.from("rubies_transactions").insert({
        user_id:    selected.creator_id,
        type:       "escrow_release",
        amount:     payout,
        status:     "completed",
        note:       releaseNote || "Admin manual release",
        reference:  selected.id,
      }).catch(() => {}),
      supabase.from("wallet_transactions").insert({
        user_id: selected.creator_id,
        type:    "escrow_release",
        amount:  payout,
        note:    `Escrow released by admin: collab ${selected.id?.slice(0, 8)}`,
      }).catch(() => {}),
    ]);

    auditLog?.("escrow_release", "collab", selected.id, `${selected.brandName} × ${selected.creatorName}`, { payout, note: releaseNote });
    showToast(`${fmtMoney(payout)} added to ${selected.creatorName}'s wallet`);
    setReleaseModal(null); setReleaseNote("");
    await load(); setBusy(false);
  }

  async function handleRefund() {
    if (!selected) return;
    setBusy(true);
    await supabase.from("collabs").update({ payment_status: "refunded", refunded_at: new Date().toISOString(), status: "cancelled", admin_note: releaseNote || undefined }).eq("id", selected.id);
    const { data: p } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.brand_id).single();
    saveProfile(selected.brand_id, { wallet_balance: (p?.wallet_balance || 0) + Number(selected.total_amount) });
    auditLog?.("escrow_refund", "collab", selected.id, selected.brandName, { amount: selected.total_amount });
    showToast(`${fmtMoney(selected.total_amount)} refunded to ${selected.brandName}`);
    setReleaseModal(null); setReleaseNote("");
    await load(); setBusy(false);
  }

  async function handleSplit() {
    if (!selected) return;
    setBusy(true);
    const total       = Number(selected.total_amount);
    const brandShare  = Math.round(total * (splitPct / 100));
    const creatorShare = total - brandShare;

    // Refund brand's share to their Supabase wallet_balance (brands use virtual balance)
    const { data: bp } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.brand_id).single();
    await saveProfile(selected.brand_id, { wallet_balance: (bp?.wallet_balance || 0) + brandShare });

    // Credit creator's share to their in-app wallet
    if (creatorShare > 0) {
      const { data: cp } = await supabase.from("profiles").select("wallet_balance").eq("id", selected.creator_id).single();
      const { error: creatorErr } = await supabase.from("profiles")
        .update({ wallet_balance: (cp?.wallet_balance || 0) + creatorShare })
        .eq("id", selected.creator_id);
      if (creatorErr) {
        showToast("Creator wallet update failed: " + creatorErr.message, "error");
        setBusy(false); return;
      }
      await supabase.from("rubies_transactions").insert({
        user_id:   selected.creator_id,
        type:      "escrow_release",
        amount:    creatorShare,
        status:    "completed",
        note:      `Admin split ${splitPct}/${100 - splitPct}`,
        reference: selected.id,
      }).catch(() => {});
      await supabase.from("wallet_transactions").insert({
        user_id: selected.creator_id,
        type:    "escrow_release",
        amount:  creatorShare,
        note:    `Admin split ${splitPct}/${100 - splitPct}`,
      }).catch(() => {});
    }

    await supabase.from("collabs").update({ payment_status: "split", split_at: new Date().toISOString(), status: "completed" }).eq("id", selected.id);
    auditLog?.("escrow_split", "collab", selected.id, `${selected.brandName} × ${selected.creatorName}`, { brandShare, creatorShare, pct: splitPct });
    showToast(`Split: ${fmtMoney(brandShare)} to brand · ${fmtMoney(creatorShare)} to creator`);
    setSplitModal(false);
    await load(); setBusy(false);
  }

  const filtered = escrows.filter(e => {
    const t = search.toLowerCase();
    return !t || e.brandName.toLowerCase().includes(t) || e.creatorName.toLowerCase().includes(t);
  });

  const totalEscrow = escrows.reduce((s, e) => s + Number(e.total_amount || 0), 0);
  const oldEscrows  = escrows.filter(e => e.ageDays >= 14).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Escrow Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">{escrows.length} held · {fmtMoney(totalEscrow)} total escrow</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Escrow",  value: fmtMoney(totalEscrow), color: "#4f46e5" },
          { label: "In Escrow",     value: escrows.length,        color: "#d97706" },
          { label: "14+ Days Old",  value: oldEscrows,            color: "#ef4444" },
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
          <input type="text" placeholder="Search by brand or creator…" value={search}
            onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 400 }}>
        {/* List */}
        <div className="w-80 flex-shrink-0 space-y-1.5 overflow-y-auto" style={{ maxHeight: 560 }}>
          {loading ? <p className="text-center text-sm text-gray-400 py-10">Loading…</p>
          : filtered.length === 0 ? <div className="text-center py-12"><Lock className="w-8 h-8 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">No escrow funds held</p></div>
          : filtered.map(e => (
            <button key={e.id} onClick={() => setSelected(e)}
              className="w-full text-left p-3 rounded-xl transition-all"
              style={{ backgroundColor: selected?.id === e.id ? "#eef2ff" : "#fff", border: `1px solid ${selected?.id === e.id ? "#c7d2fe" : "#e2e8f0"}` }}>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-semibold text-gray-900 truncate">{e.brandName} × {e.creatorName}</p>
                {e.ageDays >= 14 && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ml-1">Old</span>}
              </div>
              <p className="text-sm font-black text-amber-600">{fmtMoney(e.total_amount)}</p>
              <p className="text-xs text-gray-400">{e.ageDays}d · {fmtDate(e.created_at)} · {e.status?.replace(/_/g, " ")}</p>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white overflow-hidden flex flex-col" style={{ border: "1px solid #e2e8f0" }}>
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{selected.brandName} × {selected.creatorName}</h3>
                  <p className="text-xs text-gray-400">{selected.content_type || "Collaboration"} · {selected.ageDays} days in escrow</p>
                </div>
                <p className="text-2xl font-black text-amber-600">{fmtMoney(selected.total_amount)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setReleaseModal("release")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700">
                  <Unlock className="w-3 h-3" /> Release to Creator
                </button>
                <button onClick={() => setReleaseModal("refund")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                  <ArrowDownLeft className="w-3 h-3" /> Refund Brand
                </button>
                <button onClick={() => setSplitModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700">
                  <Split className="w-3 h-3" /> Split
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {[
                ["Total Amount",   fmtMoney(selected.total_amount)],
                ["Platform Fee",   fmtMoney(selected.platform_fee)],
                ["Creator Payout", fmtMoney(selected.creator_payout)],
                ["Collab Status",  selected.status?.replace(/_/g, " ")],
                ["Paid at",        fmtDate(selected.paid_at || selected.created_at)],
                ["Age",            `${selected.ageDays} days`],
                ["Brand Wallet",   fmtMoney(selected.brandWallet)],
                ["Creator Wallet", fmtMoney(selected.creatorWallet)],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">{l}</p>
                  <p className="text-sm font-semibold text-gray-800">{v}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: "1px solid #e2e8f0" }}>
            <div className="text-center"><Lock className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">Select an escrow entry</p></div>
          </div>
        )}
      </div>

      {/* Release/Refund modal */}
      {releaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">{releaseModal === "release" ? "Release to Creator" : "Refund to Brand"}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {releaseModal === "release"
                ? `${fmtMoney(selected?.creator_payout || selected?.total_amount)} will be added to ${selected?.creatorName}'s wallet.`
                : `${fmtMoney(selected?.total_amount)} will be refunded to ${selected?.brandName}'s wallet.`}
            </p>
            <input value={releaseNote} onChange={e => setReleaseNote(stripInjection(e.target.value))}
              placeholder="Admin note (optional)…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setReleaseModal(null); setReleaseNote(""); }} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={releaseModal === "release" ? handleRelease : handleRefund} disabled={busy}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: releaseModal === "release" ? "#16a34a" : "#4f46e5" }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split modal */}
      {splitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Split Escrow — {fmtMoney(selected?.total_amount)}</h3>
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                <span>Brand: {fmtMoney(Math.round(Number(selected?.total_amount || 0) * splitPct / 100))}</span>
                <span>Creator: {fmtMoney(Math.round(Number(selected?.total_amount || 0) * (100 - splitPct) / 100))}</span>
              </div>
              <input type="range" min="0" max="100" value={splitPct} onChange={e => setSplitPct(Number(e.target.value))}
                className="w-full h-2 accent-purple-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{splitPct}% to brand</span>
                <span>{100 - splitPct}% to creator</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSplitModal(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSplit} disabled={busy} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600 disabled:opacity-50">Apply Split</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
