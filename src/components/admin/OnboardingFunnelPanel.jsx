import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Users, TrendingDown, RefreshCw, Loader2, ChevronDown } from "lucide-react";

const fmtPct = (n, of) => of === 0 ? "—" : `${Math.round((n / of) * 100)}%`;
const fmtNum = (n) => Number(n || 0).toLocaleString();

const RANGES = [
  { key: "7d",  label: "Last 7 days",  days: 7   },
  { key: "30d", label: "Last 30 days", days: 30  },
  { key: "90d", label: "Last 90 days", days: 90  },
  { key: "all", label: "All time",     days: null },
];

const CREATOR_STEPS = [
  { key: "signed_up",      label: "Signed Up",              desc: "Created a creator account" },
  { key: "profile_filled", label: "Profile Filled",          desc: "Has handle + full name" },
  { key: "rate_card",      label: "Rate Card Added",         desc: "Published at least one rate card" },
  { key: "kyc_submitted",  label: "KYC Submitted",           desc: "Identity verification sent" },
  { key: "kyc_approved",   label: "KYC Approved",            desc: "Identity verified by admin" },
  { key: "first_collab",   label: "First Collab",            desc: "Accepted into a collaboration" },
];

const BRAND_STEPS = [
  { key: "signed_up",      label: "Signed Up",              desc: "Created a brand account" },
  { key: "profile_filled", label: "Profile Filled",          desc: "Has company name" },
  { key: "wallet_funded",  label: "Wallet Funded",           desc: "Added money to wallet" },
  { key: "first_job",      label: "First Job Posted",        desc: "Posted a campaign or job" },
  { key: "first_collab",   label: "First Hire",              desc: "Completed a collab hire" },
];

export default function OnboardingFunnelPanel({ showToast }) {
  const [role, setRole]       = useState("creator");
  const [range, setRange]     = useState("30d");
  const [loading, setLoading] = useState(false);
  const [funnel, setFunnel]   = useState(null);
  const [showRange, setShowRange] = useState(false);

  useEffect(() => { load(role, range); }, [role, range]);

  async function load(r, rng) {
    setLoading(true);
    setFunnel(null);
    try {
      const cutoff = RANGES.find(x => x.key === rng)?.days
        ? new Date(Date.now() - RANGES.find(x => x.key === rng).days * 86400000).toISOString()
        : null;

      if (r === "creator") {
        const data = await loadCreatorFunnel(cutoff);
        setFunnel(data);
      } else {
        const data = await loadBrandFunnel(cutoff);
        setFunnel(data);
      }
    } catch (e) {
      showToast?.("Failed to load funnel data", "error");
    }
    setLoading(false);
  }

  async function loadCreatorFunnel(cutoff) {
    // Step 1: Signed up
    let q1 = supabase.from("profiles").select("id, handle, full_name, created_at", { count: "exact" }).eq("role", "creator");
    if (cutoff) q1 = q1.gte("created_at", cutoff);
    const { count: signedUp, data: creators } = await q1;
    const creatorIds = (creators || []).map(c => c.id);

    if (!creatorIds.length) return buildSteps(CREATOR_STEPS, [0, 0, 0, 0, 0, 0]);

    // Step 2: Profile filled (has handle AND full_name)
    const profileFilled = (creators || []).filter(c => c.handle && c.full_name).length;

    // Step 3: Rate card added
    const { count: rateCard } = await supabase
      .from("rate_cards")
      .select("creator_id", { count: "exact", head: true })
      .in("creator_id", creatorIds);

    // Step 4: KYC submitted
    const { count: kycSubmitted } = await supabase
      .from("kyc_submissions")
      .select("user_id", { count: "exact", head: true })
      .in("user_id", creatorIds);

    // Step 5: KYC approved
    const { count: kycApproved } = await supabase
      .from("kyc_submissions")
      .select("user_id", { count: "exact", head: true })
      .in("user_id", creatorIds)
      .eq("status", "approved");

    // Step 6: First collab as creator
    const { data: collabData } = await supabase
      .from("collabs")
      .select("creator_id")
      .in("creator_id", creatorIds)
      .not("status", "eq", "cancelled");
    const uniqueCollabCreators = new Set((collabData || []).map(c => c.creator_id)).size;

    return buildSteps(CREATOR_STEPS, [
      signedUp || 0,
      profileFilled,
      rateCard || 0,
      kycSubmitted || 0,
      kycApproved || 0,
      uniqueCollabCreators,
    ]);
  }

  async function loadBrandFunnel(cutoff) {
    // Step 1: Signed up
    let q1 = supabase.from("profiles").select("id, company_name, full_name, wallet_balance, created_at", { count: "exact" }).eq("role", "brand");
    if (cutoff) q1 = q1.gte("created_at", cutoff);
    const { count: signedUp, data: brands } = await q1;
    const brandIds = (brands || []).map(b => b.id);

    if (!brandIds.length) return buildSteps(BRAND_STEPS, [0, 0, 0, 0, 0]);

    // Step 2: Profile filled (has company_name)
    const profileFilled = (brands || []).filter(b => b.company_name || b.full_name).length;

    // Step 3: Wallet funded (wallet_balance > 0)
    const walletFunded = (brands || []).filter(b => Number(b.wallet_balance || 0) > 0).length;

    // Step 4: First job/campaign posted — check collabs table as brand
    const { data: jobData } = await supabase
      .from("collabs")
      .select("brand_id")
      .in("brand_id", brandIds);
    const uniqueBrandsWithJobs = new Set((jobData || []).map(c => c.brand_id)).size;

    // Step 5: First hire (collab not cancelled or pending)
    const { data: hireData } = await supabase
      .from("collabs")
      .select("brand_id")
      .in("brand_id", brandIds)
      .in("status", ["active", "completed", "in_review", "delivered"]);
    const uniqueBrandsHired = new Set((hireData || []).map(c => c.brand_id)).size;

    return buildSteps(BRAND_STEPS, [
      signedUp || 0,
      profileFilled,
      walletFunded,
      uniqueBrandsWithJobs,
      uniqueBrandsHired,
    ]);
  }

  function buildSteps(stepDefs, counts) {
    const topCount = counts[0] || 0;
    return stepDefs.map((step, i) => ({
      ...step,
      count:    counts[i] || 0,
      pctTotal: topCount === 0 ? 0 : Math.round((counts[i] / topCount) * 100),
      dropOff:  i === 0 ? null : counts[i - 1] === 0 ? null : Math.round(((counts[i - 1] - counts[i]) / counts[i - 1]) * 100),
    }));
  }

  const steps = role === "creator" ? CREATOR_STEPS : BRAND_STEPS;
  const activeRange = RANGES.find(r => r.key === range);
  const topCount = funnel?.[0]?.count || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Onboarding Funnel</h2>
          <p className="text-sm text-gray-500 mt-0.5">Where users drop off on their way to activation</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range picker */}
          <div className="relative">
            <button onClick={() => setShowRange(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm text-gray-600 hover:bg-gray-50"
              style={{ borderColor: "#e5e7eb" }}>
              {activeRange?.label} <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showRange && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border shadow-lg overflow-hidden" style={{ borderColor: "#e5e7eb", minWidth: 140 }}>
                {RANGES.map(r => (
                  <button key={r.key} onClick={() => { setRange(r.key); setShowRange(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    style={{ color: range === r.key ? "#7c3aed" : "#374151", fontWeight: range === r.key ? 700 : 400 }}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => load(role, range)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Role toggle */}
      <div className="flex gap-2">
        {[
          { key: "creator", label: "Creators" },
          { key: "brand",   label: "Brands"   },
        ].map(opt => (
          <button key={opt.key} onClick={() => setRole(opt.key)}
            className="px-5 py-2 rounded-full text-sm font-bold transition-all"
            style={{
              backgroundColor: role === opt.key ? "#7c3aed" : "white",
              color:           role === opt.key ? "white" : "#6b7280",
              border:          `1px solid ${role === opt.key ? "#7c3aed" : "#e5e7eb"}`,
            }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Funnel */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Running funnel analysis…
        </div>
      ) : !funnel ? null : (
        <div className="space-y-3">
          {/* Summary bar */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ backgroundColor: "#7c3aed10", border: "1px solid #7c3aed30" }}>
            <Users className="w-4 h-4" style={{ color: "#7c3aed" }} />
            <p className="text-sm font-bold text-gray-800">
              {fmtNum(topCount)} {role}s signed up in the {activeRange?.label.toLowerCase()}
            </p>
          </div>

          {/* Step bars */}
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
            {funnel.map((step, i) => {
              const barWidth = topCount === 0 ? 0 : Math.max(2, Math.round((step.count / topCount) * 100));
              const isLast   = i === funnel.length - 1;

              // Colour: green at top, orange in middle, red at end if drop-off is severe
              const hue = step.pctTotal >= 60 ? "#059669" : step.pctTotal >= 30 ? "#d97706" : "#dc2626";

              return (
                <div key={step.key} className={`px-5 py-4 ${!isLast ? "border-b" : ""}`} style={{ borderColor: "#f3f4f6" }}>
                  <div className="flex items-start gap-4">
                    {/* Step number */}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5"
                      style={{ backgroundColor: hue + "20", color: hue }}>
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Label row */}
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{step.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-black text-gray-900">{fmtNum(step.count)}</p>
                          <p className="text-xs font-semibold" style={{ color: hue }}>{fmtPct(step.count, topCount)} of signups</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#f3f4f6" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%`, backgroundColor: hue }} />
                      </div>

                      {/* Drop-off badge */}
                      {step.dropOff !== null && step.dropOff > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: step.dropOff >= 40 ? "#dc2626" : "#d97706" }}>
                          <TrendingDown className="w-3 h-3" />
                          <span className="font-semibold">{step.dropOff}% dropped off</span>
                          <span className="text-gray-400">— {fmtNum((funnel[i - 1]?.count || 0) - step.count)} didn't reach this step</span>
                        </div>
                      )}
                      {step.dropOff === 0 && (
                        <p className="mt-2 text-xs text-green-600 font-semibold">No drop-off from previous step</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insight callouts */}
          <InsightCallouts funnel={funnel} role={role} />
        </div>
      )}
    </div>
  );
}

function InsightCallouts({ funnel, role }) {
  if (!funnel?.length) return null;

  // Find the biggest drop-off step
  const worstStep = funnel
    .filter(s => s.dropOff !== null)
    .sort((a, b) => (b.dropOff || 0) - (a.dropOff || 0))[0];

  const activationStep = role === "creator" ? funnel.find(s => s.key === "first_collab") : funnel.find(s => s.key === "first_collab");
  const activationRate = funnel[0]?.count ? Math.round((activationStep?.count || 0) / funnel[0].count * 100) : 0;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {worstStep && worstStep.dropOff > 0 && (
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#fee2e220", border: "1px solid #fecaca" }}>
          <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Biggest Drop-off</p>
          <p className="text-sm font-bold text-red-800">{worstStep.label}</p>
          <p className="text-xs text-red-600 mt-0.5">{worstStep.dropOff}% of users who reached the previous step didn't complete this one</p>
        </div>
      )}
      {activationStep && (
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#7c3aed10", border: "1px solid #7c3aed30" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#7c3aed" }}>Activation Rate</p>
          <p className="text-2xl font-black" style={{ color: "#7c3aed" }}>{activationRate}%</p>
          <p className="text-xs text-gray-500 mt-0.5">of signups completed their first {role === "creator" ? "collab" : "hire"}</p>
        </div>
      )}
    </div>
  );
}
