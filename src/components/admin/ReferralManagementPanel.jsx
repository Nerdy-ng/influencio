import { useState, useEffect } from "react";
import { saveProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import { Gift, RotateCcw, Search, AlertTriangle, Ban, ChevronDown } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function ReferralManagementPanel({ showToast, auditLog }) {
  const [referrers, setReferrers] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState(null);
  const [selected, setSelected]   = useState(null);
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase.from("referrals").select("*").order("created_at", { ascending: false });
    const list = rows || [];
    const ids = [...new Set(list.map(r => r.referrer_id).filter(Boolean))];
    let nameMap = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, handle, referral_code, referral_disabled, referral_reward").in("id", ids);
      (profs || []).forEach(p => { nameMap[p.id] = p; });
    }
    setReferrals(list);
    // Build leaderboard
    const board = {};
    list.forEach(r => {
      if (!r.referrer_id) return;
      if (!board[r.referrer_id]) board[r.referrer_id] = { profile: nameMap[r.referrer_id] || {}, count: 0, earnings: 0 };
      board[r.referrer_id].count += 1;
      board[r.referrer_id].earnings += Number(r.reward_amount || 0);
    });
    setReferrers(Object.entries(board).map(([id, v]) => ({
      id,
      name: v.profile.full_name || v.profile.handle || id.slice(0, 8),
      code: v.profile.referral_code || "—",
      count: v.count,
      earnings: v.earnings,
      disabled: v.profile.referral_disabled || false,
      _profile: v.profile,
    })).sort((a, b) => b.count - a.count));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleDisable(userId, currentlyDisabled, name) {
    setBusy(userId);
    saveProfile(userId, { referral_disabled: !currentlyDisabled });
    auditLog?.(currentlyDisabled ? "enable_referral" : "disable_referral", "profile", userId, name);
    showToast(currentlyDisabled ? "Referral re-enabled" : "Referral program disabled for this user");
    load();
    setBusy(null);
  }

  async function adjustReward() {
    if (!selected || !adjustAmount) return;
    setBusy(selected.id);
    saveProfile(selected.id, { referral_reward: Number(adjustAmount) });
    showToast(`Reward adjusted to ${fmtMoney(adjustAmount)}`);
    setAdjustModal(false); setAdjustAmount("");
    load();
    setBusy(null);
  }

  const filtered = referrers.filter(r => {
    const t = search.toLowerCase();
    return !t || r.name.toLowerCase().includes(t) || r.code.toLowerCase().includes(t);
  });

  const totalReferrals = referrals.length;
  const totalEarnings = referrals.reduce((s, r) => s + Number(r.reward_amount || 0), 0);
  const suspiciousCount = referrers.filter(r => r.count >= 20 && r.earnings > 50000).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Referral Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">{totalReferrals} referrals · {fmtMoney(totalEarnings)} total rewards · {suspiciousCount} suspicious</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Referrals",   value: totalReferrals,        color: "#4f46e5" },
          { label: "Rewards Paid",      value: fmtMoney(totalEarnings), color: "#16a34a" },
          { label: "Suspicious",        value: suspiciousCount,       color: "#ef4444" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {suspiciousCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{suspiciousCount} user(s) have high referral counts with large rewards — review for potential fraud.</p>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search by name or referral code…" value={search}
          onChange={e => setSearch(stripInjection(e.target.value))}
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-gray-200 outline-none focus:border-indigo-400 bg-white shadow-sm" />
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">#</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Referrer</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Code</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Referrals</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Earned</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center text-sm text-gray-400 py-8">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-sm text-gray-400 py-8">No referrals</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={r.id} className={r.disabled ? "opacity-50" : r.count >= 20 ? "bg-red-50" : ""}>
                <td className="px-4 py-3 text-xs font-bold text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{r.name}</td>
                <td className="px-4 py-3"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded-lg font-mono text-indigo-600">{r.code}</code></td>
                <td className="px-4 py-3 font-bold text-gray-700">{r.count} {r.count >= 20 && <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />}</td>
                <td className="px-4 py-3 font-bold text-green-600">{fmtMoney(r.earnings)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: r.disabled ? "#fee2e2" : "#dcfce7", color: r.disabled ? "#dc2626" : "#16a34a" }}>
                    {r.disabled ? "Disabled" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => toggleDisable(r.id, r.disabled, r.name)} disabled={busy === r.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 disabled:opacity-50">
                      <Ban className="w-3 h-3" /> {r.disabled ? "Enable" : "Disable"}
                    </button>
                    <button onClick={() => { setSelected(r); setAdjustAmount(""); setAdjustModal(true); }}
                      className="px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                      Adjust
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adjustModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Adjust Referral Reward — {selected.name}</h3>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">New reward per referral (₦)</label>
            <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="e.g. 500"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setAdjustModal(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={adjustReward} disabled={busy === selected.id || !adjustAmount} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 disabled:opacity-50">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
