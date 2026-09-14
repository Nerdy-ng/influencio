import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Ticket, Loader2, CheckCircle, X } from "lucide-react";

export default function PromoCodeRedeemer({ userId, userRole, userName, onSuccess }) {
  const [code, setCode]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null); // { ok, message, amount }
  const [dismissed, setDismiss] = useState(false);

  if (dismissed) return null;

  async function redeem() {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    const upper = code.trim().toUpperCase();

    // Fetch the code
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", upper)
      .eq("active", true)
      .maybeSingle();

    if (!promo) {
      setResult({ ok: false, message: "Invalid or inactive code." });
      setLoading(false);
      return;
    }

    // Check expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      setResult({ ok: false, message: "This code has expired." });
      setLoading(false);
      return;
    }

    // Check max uses
    if (promo.max_uses && promo.uses_count >= promo.max_uses) {
      setResult({ ok: false, message: "This code has reached its usage limit." });
      setLoading(false);
      return;
    }

    // Check role
    if (promo.target_role !== "all" && promo.target_role !== userRole) {
      setResult({ ok: false, message: `This code is only valid for ${promo.target_role}s.` });
      setLoading(false);
      return;
    }

    // Check if already used by this user
    const { data: alreadyUsed } = await supabase
      .from("promo_code_uses")
      .select("id")
      .eq("code_id", promo.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (alreadyUsed) {
      setResult({ ok: false, message: "You've already redeemed this code." });
      setLoading(false);
      return;
    }

    // Compute discount
    const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", userId).maybeSingle();
    const currentBalance = Number(profile?.wallet_balance || 0);
    let credit;
    if (promo.discount_type === "fixed") {
      credit = Number(promo.discount_value);
    } else {
      // Percentage of current balance (min ₦100 bonus so it's never worthless)
      credit = Math.max(100, Math.round(currentBalance * Number(promo.discount_value) / 100));
    }

    // Credit wallet
    const { error: walletErr } = await supabase
      .from("profiles")
      .update({ wallet_balance: currentBalance + credit })
      .eq("id", userId);

    if (walletErr) {
      setResult({ ok: false, message: "Something went wrong. Please try again." });
      setLoading(false);
      return;
    }

    // Record use + increment counter
    await Promise.all([
      supabase.from("promo_code_uses").insert({
        code_id:         promo.id,
        user_id:         userId,
        user_name:       userName,
        user_role:       userRole,
        discount_applied: credit,
        context:         "wallet_credit",
      }),
      supabase.from("promo_codes").update({ uses_count: (promo.uses_count || 0) + 1 }).eq("id", promo.id),
    ]);

    setResult({ ok: true, message: `₦${credit.toLocaleString()} added to your wallet!`, amount: credit });
    setCode("");
    onSuccess?.(credit);
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setResult(null); }}
            onKeyDown={e => e.key === "Enter" && redeem()}
            placeholder="Enter promo code"
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono font-bold text-gray-800 uppercase focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "#7c3aed" }}
          />
        </div>
        <button onClick={redeem} disabled={loading || !code.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: "#7c3aed" }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
        </button>
      </div>

      {result && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{
            backgroundColor: result.ok ? "#d1fae5" : "#fee2e2",
            color:           result.ok ? "#059669" : "#dc2626",
          }}>
          {result.ok ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <X className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          {result.message}
        </div>
      )}
    </div>
  );
}
