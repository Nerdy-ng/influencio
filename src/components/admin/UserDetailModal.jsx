import { useState, useEffect, useRef } from "react";
import {
  X, CheckCircle, Star, DollarSign, Briefcase, Clock, Ban,
  RefreshCw, LogOut, MessageSquareOff, CreditCard, Send, Trash2,
  MoreVertical, ChevronRight, ShieldOff, Image,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const STATUS_COLOR = {
  in_progress:        { bg: "#dbeafe", color: "#1d4ed8" },
  completed:          { bg: "#dcfce7", color: "#16a34a" },
  pending:            { bg: "#fef3c7", color: "#d97706" },
  delivered:          { bg: "#ede9fe", color: "#7c3aed" },
  revision_requested: { bg: "#fee2e2", color: "#dc2626" },
  cancelled:          { bg: "#f1f5f9", color: "#64748b" },
};

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">{title}</p>
      {children}
    </div>
  );
}
function Grid2({ children }) {
  return <div className="grid grid-cols-2 gap-2.5">{children}</div>;
}
function Field({ label, value, full, mono }) {
  return (
    <div className={`p-3 rounded-xl bg-gray-50 ${full ? "col-span-2" : ""}`}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold text-gray-800 break-all ${mono ? "font-mono tracking-tight" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}
function Chip({ label, color }) {
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: color + "18", color }}>
      {label}
    </span>
  );
}
function Empty({ text }) {
  return <div className="py-12 text-center text-sm text-gray-300">{text}</div>;
}

function ActionMenuItem({ icon: Icon, label, color, onClick, danger }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-left transition-colors">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
      <span style={{ color: danger ? color : "#374151" }}>{label}</span>
    </button>
  );
}

export default function UserDetailModal({ user, onClose, onAction }) {
  const isCreator = ["creator", "Talent", "talent"].includes(user.role);
  const accentColor = isCreator ? "#7c3aed" : "#0ea5e9";
  const accentBg    = isCreator ? "#ede9fe" : "#dbeafe";

  const [profile,  setProfile]  = useState(user._raw || null);
  const [collabs,  setCollabs]  = useState([]);
  const [pitches,  setPitches]  = useState([]);
  const [rateCard, setRateCard] = useState(null);
  const [referrals,setReferrals]= useState([]);
  const [ratings,  setRatings]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("overview");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      const idField = isCreator ? "creator_id" : "brand_id";
      const [profileRes, collabRes, referralRes, ratingRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("collabs")
          .select("id, content_type, status, total_amount, creator_payout, platform_fee, payment_status, created_at, updated_at")
          .eq(idField, user.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("referrals")
          .select("id, referee_name, status, amount, created_at")
          .eq("referrer_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("collab_ratings")
          .select("*").eq("reviewer_id", user.id)
          .order("created_at", { ascending: false }).limit(20),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      setCollabs(collabRes.data || []);
      setReferrals(referralRes.data || []);
      setRatings(ratingRes.data || []);

      if (isCreator) {
        const [rateCardRes, pitchRes] = await Promise.all([
          supabase.from("rate_cards").select("*").eq("creator_id", user.id).single(),
          supabase.from("job_applications")
            .select("id, pitch, rate, status, created_at")
            .eq("creator_id", user.id).order("created_at", { ascending: false }).limit(30),
        ]);
        setRateCard(rateCardRes.data || null);
        setPitches(pitchRes.data || []);
      }
      setLoading(false);
    }
    load();
  }, [user.id]);

  const restrictions    = profile?.restrictions || {};
  const wallet          = profile?.wallet_balance || 0;
  const extraPitches    = profile?.extra_pitches || 0;
  const avgRating       = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : null;
  const monthStart      = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthlyPitches  = pitches.filter(p => new Date(p.created_at) >= monthStart).length;
  const activeCollabs   = collabs.filter(c => ["in_progress", "delivered", "revision_requested"].includes(c.status)).length;
  const totalEarned     = collabs.filter(c => c.status === "completed").reduce((s, c) => s + (c.creator_payout || c.total_amount || 0), 0);
  const totalSpent      = collabs.filter(c => c.payment_status !== "unpaid").reduce((s, c) => s + (c.total_amount || 0), 0);

  const creatorTabs = ["overview", "collabs", "portfolio", "social_niches", "rate_card", "wallet_pitches", "referrals"];
  const brandTabs   = ["overview", "campaigns", "company", "wallet", "payments"];
  const TABS        = isCreator ? creatorTabs : brandTabs;
  const TAB_LABEL   = {
    overview:       "Overview",
    collabs:        `Collabs (${collabs.length})`,
    portfolio:      `Portfolio (${(profile?.portfolio || []).length})`,
    social_niches:  "Social & Niches",
    rate_card:      "Rate Card",
    wallet_pitches: "Wallet & Pitches",
    referrals:      `Referrals (${referrals.length})`,
    campaigns:      `Campaigns (${collabs.length})`,
    company:        "Company Info",
    wallet:         "Wallet",
    payments:       "Payments",
  };

  function act(type, ...args) {
    setMoreOpen(false);
    onAction?.(type, user.id, ...args);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={user.name}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
              : <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                  style={{ backgroundColor: accentColor }}>
                  {user.avatar}
                </div>
            }
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900">{user.name}</p>
                {user.verified && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={user.status === "active"
                    ? { backgroundColor: "#dcfce7", color: "#16a34a" }
                    : user.status === "suspended"
                    ? { backgroundColor: "#fef3c7", color: "#d97706" }
                    : { backgroundColor: "#fee2e2", color: "#dc2626" }}>
                  {user.status}
                </span>
                {Object.entries(restrictions).filter(([, v]) => v).map(([k]) => (
                  <span key={k} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 flex-shrink-0">
                    {k} off
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {profile?.email || "—"} · {isCreator ? "Creator" : "Brand"} · Joined {user.joined}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
            {!user.verified && (
              <button onClick={() => act("verify")}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg text-white"
                style={{ backgroundColor: "#16a34a" }}>
                <CheckCircle className="w-3 h-3" /> Verify
              </button>
            )}
            <button onClick={() => act("suspend")}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg"
              style={user.status === "suspended"
                ? { backgroundColor: "#dcfce7", color: "#16a34a" }
                : { backgroundColor: "#fef3c7", color: "#d97706" }}>
              {user.status === "suspended" ? "Unsuspend" : "Suspend"}
            </button>

            {/* ⋯ More */}
            <div className="relative" ref={moreRef}>
              <button onClick={() => setMoreOpen(o => !o)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 min-w-56">
                  <ActionMenuItem icon={Ban}           label="Ban user"          color="#dc2626" danger onClick={() => act("ban")} />
                  <ActionMenuItem icon={RefreshCw}     label="Reset password"    color="#4f46e5"       onClick={() => act("resetPassword")} />
                  <ActionMenuItem icon={LogOut}        label="Force logout"      color="#d97706"       onClick={() => act("forceLogout")} />
                  <div className="border-t border-gray-100 my-1.5" />
                  <ActionMenuItem icon={MessageSquareOff}
                    label={restrictions.messaging ? "Enable messaging" : "Disable messaging"}
                    color="#6366f1" onClick={() => act("toggleRestriction", "messaging")} />
                  <ActionMenuItem icon={CreditCard}
                    label={restrictions.withdrawals ? "Enable withdrawals" : "Disable withdrawals"}
                    color="#f97316" onClick={() => act("toggleRestriction", "withdrawals")} />
                  {isCreator && (
                    <ActionMenuItem icon={Send}
                      label={restrictions.pitching ? "Enable pitching" : "Disable pitching"}
                      color="#7c3aed" onClick={() => act("toggleRestriction", "pitching")} />
                  )}
                  {!isCreator && (
                    <ActionMenuItem icon={Briefcase}
                      label={restrictions.campaigns ? "Enable campaigns" : "Disable campaigns"}
                      color="#0ea5e9" onClick={() => act("toggleRestriction", "campaigns")} />
                  )}
                  <div className="border-t border-gray-100 my-1.5" />
                  <ActionMenuItem icon={Trash2} label="Delete account" color="#ef4444" danger onClick={() => act("delete")} />
                </div>
              )}
            </div>

            <button onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 flex-shrink-0">
          {(isCreator ? [
            { label: "Wallet",       value: `₦${wallet.toLocaleString()}`,    color: "#16a34a" },
            { label: "Total Collabs",value: collabs.length,                    color: accentColor },
            { label: "Avg Rating",   value: avgRating ? `${avgRating}★` : "—",color: "#f59e0b" },
            { label: "Pitches Left", value: Math.max(0, 10 - monthlyPitches) + extraPitches, color: "#4f46e5" },
          ] : [
            { label: "Wallet",     value: `₦${wallet.toLocaleString()}`,     color: "#16a34a" },
            { label: "Campaigns",  value: collabs.length,                    color: accentColor },
            { label: "Completed",  value: collabs.filter(c => c.status === "completed").length, color: "#16a34a" },
            { label: "Total Spent",value: `₦${totalSpent.toLocaleString()}`, color: "#7c3aed" },
          ]).map(s => (
            <div key={s.label} className="px-4 py-3">
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className="text-base font-black tabular-nums mt-0.5" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 px-5 pt-3 overflow-x-auto flex-shrink-0 pb-0.5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
              style={tab === t ? { backgroundColor: accentBg, color: accentColor } : { color: "#94a3b8" }}>
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-5 pt-3">
          {loading
            ? <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
            : renderTab()}
        </div>
      </div>
    </div>
  );

  function renderTab() {
    if (tab === "overview")       return renderOverview();
    if (tab === "collabs")        return renderCollabs();
    if (tab === "campaigns")      return renderCollabs();
    if (tab === "portfolio")      return renderPortfolio();
    if (tab === "social_niches")  return renderSocialNiches();
    if (tab === "rate_card")      return renderRateCard();
    if (tab === "wallet_pitches") return renderWalletPitches();
    if (tab === "wallet")         return renderWalletOnly();
    if (tab === "referrals")      return renderReferrals();
    if (tab === "company")        return renderCompany();
    if (tab === "payments")       return renderPayments();
    return null;
  }

  function renderOverview() {
    return (
      <div>
        <Section title="Profile Info">
          <Grid2>
            <Field label="Full Name"     value={profile?.full_name} />
            <Field label={isCreator ? "Handle" : "Company"} value={profile?.handle || profile?.company_name} />
            <Field label="Email"         value={profile?.email} />
            <Field label="Phone"         value={profile?.phone} />
            <Field label="Location"      value={profile?.location} />
            <Field label="Referral Code" value={profile?.referral_code} mono />
            {profile?.bio && <Field label="Bio" value={profile.bio} full />}
          </Grid2>
        </Section>
        {isCreator && (
          <Section title="Creator Info">
            <Grid2>
              <Field label="Tier"          value={user.tier} />
              <Field label="Total Earned"  value={`₦${totalEarned.toLocaleString()}`} />
              <Field label="Active Collabs"value={activeCollabs} />
              <Field label="Extra Pitches" value={extraPitches} />
            </Grid2>
          </Section>
        )}
        <Section title="Account">
          <Grid2>
            <Field label="Status"       value={user.status} />
            <Field label="Verified"     value={user.verified ? "Yes ✓" : "Not verified"} />
            <Field label="Joined"       value={user.joined} />
            <Field label="Restrictions" value={Object.entries(restrictions).filter(([, v]) => v).map(([k]) => k).join(", ") || "None"} />
          </Grid2>
        </Section>
      </div>
    );
  }

  function renderCollabs() {
    return collabs.length === 0 ? <Empty text="No collabs yet" /> : (
      <div className="space-y-2">
        {collabs.map(c => {
          const sc = STATUS_COLOR[c.status] ?? { bg: "#f1f5f9", color: "#64748b" };
          return (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-800">{c.content_type || "Collab"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(c.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-gray-700">₦{(c.total_amount || 0).toLocaleString()}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={sc}>
                  {c.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderPortfolio() {
    const items = profile?.portfolio || [];
    return items.length === 0 ? <Empty text="No portfolio items yet" /> : (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
            {item.uri || item.media_url ? (
              <div className="bg-gray-100 aspect-video">
                <img src={item.uri || item.media_url} alt={item.title || ""}
                  className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="bg-gray-50 aspect-video flex items-center justify-center">
                <Image className="w-6 h-6 text-gray-300" />
              </div>
            )}
            {(item.title || item.caption) && (
              <div className="p-2.5">
                <p className="text-xs font-semibold text-gray-700 truncate">{item.title || item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderSocialNiches() {
    const niches  = profile?.niches || [];
    const skills  = profile?.skills || [];
    const socials = profile?.socials || profile?.social_accounts || {};
    return (
      <div>
        <Section title="Niches">
          {niches.length === 0
            ? <p className="text-sm text-gray-400">No niches set</p>
            : <div className="flex flex-wrap gap-2">{niches.map(n => <Chip key={n} label={n} color="#7c3aed" />)}</div>}
        </Section>
        <Section title="Skills">
          {skills.length === 0
            ? <p className="text-sm text-gray-400">No skills set</p>
            : <div className="flex flex-wrap gap-2">{skills.map(s => <Chip key={s} label={s} color="#0ea5e9" />)}</div>}
        </Section>
        <Section title="Social Accounts">
          {Object.keys(socials).length === 0
            ? <p className="text-sm text-gray-400">No social accounts linked</p>
            : <div className="space-y-2">
                {Object.entries(socials).map(([platform, handle]) => (
                  <div key={platform} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                    <span className="text-sm font-semibold text-gray-700 capitalize">{platform}</span>
                    <span className="text-sm text-gray-500">{handle}</span>
                  </div>
                ))}
              </div>}
        </Section>
      </div>
    );
  }

  function renderRateCard() {
    if (!rateCard) return <Empty text="No rate card set up yet" />;
    const durations = Array.isArray(rateCard.durations) ? rateCard.durations : [];
    const platforms = Array.isArray(rateCard.platforms) ? rateCard.platforms : [];
    const addons    = Array.isArray(rateCard.addons)    ? rateCard.addons    : [];
    return (
      <div>
        {durations.length > 0 && (
          <Section title="Durations & Base Prices">
            <div className="space-y-1.5">
              {durations.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">{d.label || d}</span>
                  {d.price !== undefined && <span className="text-sm font-bold text-gray-900">₦{Number(d.price).toLocaleString()}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}
        {platforms.length > 0 && (
          <Section title="Platforms & Posting Fees">
            <div className="space-y-1.5">
              {platforms.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">{p.name || p}</span>
                  {p.fee !== undefined && <span className="text-sm font-bold text-gray-900">+₦{Number(p.fee).toLocaleString()}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}
        {addons.length > 0 && (
          <Section title="Add-ons">
            <div className="space-y-1.5">
              {addons.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">{a.label || a.name || a}</span>
                  {a.price !== undefined && <span className="text-sm font-bold text-gray-900">+₦{Number(a.price).toLocaleString()}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}
        {!durations.length && !platforms.length && !addons.length && <Empty text="Rate card is empty" />}
      </div>
    );
  }

  function renderWalletPitches() {
    const freeRemaining = Math.max(0, 10 - monthlyPitches);
    const totalLeft     = freeRemaining + extraPitches;
    return (
      <div>
        <Section title="Wallet">
          <div className="p-4 rounded-xl" style={{ backgroundColor: "#f0fdf4" }}>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Balance</p>
            <p className="text-2xl font-black text-green-700 tabular-nums mt-0.5">₦{wallet.toLocaleString()}</p>
          </div>
        </Section>
        <Section title="Pitch Balance">
          <Grid2>
            <div className="p-3 rounded-xl bg-purple-50">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Used this month</p>
              <p className="text-xl font-black text-purple-700 mt-0.5 tabular-nums">{monthlyPitches}</p>
            </div>
            <div className="p-3 rounded-xl bg-pink-50">
              <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Extra pitches</p>
              <p className="text-xl font-black text-pink-700 mt-0.5 tabular-nums">{extraPitches}</p>
            </div>
          </Grid2>
          <div className="mt-2 p-3 rounded-xl bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Total remaining</span>
            <span className="text-sm font-black text-gray-900 tabular-nums">{totalLeft}</span>
          </div>
        </Section>
        {pitches.length > 0 && (
          <Section title={`Recent Pitches (${pitches.length})`}>
            <div className="space-y-2">
              {pitches.slice(0, 8).map(p => (
                <div key={p.id} className="flex items-start justify-between p-2.5 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-600 truncate flex-1 mr-2">{p.pitch ? p.pitch.slice(0, 80) + "…" : "No pitch text"}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.rate && <span className="text-xs font-bold text-gray-700">₦{Number(p.rate).toLocaleString()}</span>}
                    <span className="text-xs capitalize px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: p.status === "accepted" ? "#dcfce7" : p.status === "rejected" ? "#fee2e2" : "#fef3c7",
                        color: p.status === "accepted" ? "#16a34a" : p.status === "rejected" ? "#dc2626" : "#d97706",
                      }}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    );
  }

  function renderWalletOnly() {
    return (
      <div>
        <Section title="Wallet">
          <div className="p-4 rounded-xl" style={{ backgroundColor: "#f0fdf4" }}>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Balance</p>
            <p className="text-2xl font-black text-green-700 tabular-nums mt-0.5">₦{wallet.toLocaleString()}</p>
          </div>
        </Section>
      </div>
    );
  }

  function renderReferrals() {
    return referrals.length === 0 ? <Empty text="No referrals yet" /> : (
      <div className="space-y-2">
        {referrals.map(r => (
          <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-800">{r.referee_name || "New user"}</p>
              <p className="text-xs text-gray-400">{timeAgo(r.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold" style={{ color: "#16a34a" }}>+₦{(r.amount || 0).toLocaleString()}</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{ backgroundColor: r.status === "earned" ? "#dcfce7" : "#fef3c7", color: r.status === "earned" ? "#16a34a" : "#d97706" }}>
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderCompany() {
    return (
      <Section title="Company Information">
        <Grid2>
          <Field label="Company Name" value={profile?.company_name} />
          <Field label="Owner Name"   value={profile?.owner_name} />
          <Field label="Industry"     value={profile?.industry} />
          <Field label="Website"      value={profile?.website} />
          <Field label="Phone"        value={profile?.phone} />
          <Field label="Location"     value={profile?.location} />
          {profile?.bio && <Field label="About" value={profile.bio} full />}
        </Grid2>
      </Section>
    );
  }

  function renderPayments() {
    const paid = collabs.filter(c => c.payment_status !== "unpaid");
    return paid.length === 0 ? <Empty text="No payment history yet" /> : (
      <div className="space-y-2">
        {paid.map(c => {
          const sc = STATUS_COLOR[c.status] ?? { bg: "#f1f5f9", color: "#64748b" };
          return (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-800">{c.content_type || "Collab"}</p>
                <p className="text-xs text-gray-400">{timeAgo(c.created_at)} · {c.payment_status}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-gray-800">₦{(c.total_amount || 0).toLocaleString()}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={sc}>
                  {c.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
