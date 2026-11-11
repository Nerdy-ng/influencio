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

    const { data, error } = await supabase.functions.invoke("redeem-promo-code", {
      body: { code: code.trim().toUpperCase() },
    });

    if (error || !data?.ok) {
      setResult({ ok: false, message: data?.message ?? "Something went wrong. Please try again." });
      setLoading(false);
      return;
    }

    const credit = data.credit ?? 0;
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
