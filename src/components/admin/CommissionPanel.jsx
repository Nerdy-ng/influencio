import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Percent, DollarSign, RefreshCw, Loader2, Save, Search,
  Check, X, User, Building2, ChevronDown, ChevronUp, Info,
  RotateCcw,
} from "lucide-react";

const fmtNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

// ── Type toggle ────────────────────────────────────────────────────────────────
function TypeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-gray-200 w-fit">
      {[
        { key: "percent", label: "Percentage", Icon: Percent },
        { key: "flat",    label: "Flat ₦",     Icon: DollarSign },
      ].map(opt => (
        <button key={opt.key} onClick={() => onChange(opt.key)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-colors"
          style={{
            backgroundColor: value === opt.key ? "#7c3aed" : "white",
            color:           value === opt.key ? "white"    : "#6b7280",
          }}>
          <opt.Icon className="w-3.5 h-3.5" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Commission preview ─────────────────────────────────────────────────────────
function Preview({ type, value, sampleAmount = 50000 }) {
  if (!value) return null;
  const fee = type === "percent"
    ? (sampleAmount * Number(value)) / 100
    : Number(value);
  return (
    <p className="text-xs text-gray-400 mt-1">
      On a {fmtNaira(sampleAmount)} transaction → platform takes{" "}
      <span className="font-bold text-gray-700">{fmtNaira(fee)}</span>
    </p>
  );
}

export default function CommissionPanel({ showToast, auditLog }) {
  // ── Platform defaults ─────────────────────────────────────────────────────
  const [defaults, setDefaults] = useState({
    brand_type:    "percent",
    brand_value:   "15",
    creator_type:  "percent",
    creator_value: "10",
  });
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(true);

  // ── Per-user overrides ────────────────────────────────────────────────────
  const [search, setSearch]         = useState("");
  const [users, setUsers]           = useState([]);
  const [searching, setSearching]   = useState(false);
  const [overrides, setOverrides]   = useState([]);
  const [loadingOverrides, setLoadingOverrides] = useState(true);
  const [savingOverride, setSavingOverride] = useState(null);
  const [expanded, setExpanded]     = useState(null);

  // Inline edit state per user
  const [editState, setEditState] = useState({});

  useEffect(() => { loadDefaults(); loadOverrides(); }, []);

  // ── Load platform defaults ─────────────────────────────────────────────────
  async function loadDefaults() {
    setLoadingDefaults(true);
    const { data } = await supabase
      .from("commission_settings")
      .select("*")
      .eq("id", "default")
      .single();
    if (data) {
      setDefaults({
        brand_type:    data.brand_type    || "percent",
        brand_value:   String(data.brand_value   ?? "15"),
        creator_type:  data.creator_type  || "percent",
        creator_value: String(data.creator_value ?? "10"),
      });
    }
    setLoadingDefaults(false);
  }

  async function saveDefaults() {
    setSavingDefaults(true);
    const { error } = await supabase.from("commission_settings").upsert({
      id:            "default",
      brand_type:    defaults.brand_type,
      brand_value:   Number(defaults.brand_value),
      creator_type:  defaults.creator_type,
      creator_value: Number(defaults.creator_value),
      updated_at:    new Date().toISOString(),
    }, { onConflict: "id" });
    if (error) { showToast?.("Failed to save defaults", "error"); }
    else {
      auditLog?.("commission_defaults_updated", null, null, "Commission");
      showToast?.("Default commission rates saved");
    }
    setSavingDefaults(false);
  }

  // ── Load existing overrides ────────────────────────────────────────────────
  async function loadOverrides() {
    setLoadingOverrides(true);
    const { data } = await supabase
      .from("commission_overrides")
      .select("*, profiles(id, full_name, role, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(100);
    setOverrides(data || []);
    setLoadingOverrides(false);
  }

  // ── Search users ───────────────────────────────────────────────────────────
  async function searchUsers() {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, avatar_url, email")
      .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      .in("role", ["creator", "talent", "brand", "Creator", "Brand"])
      .limit(10);
    setUsers(data || []);
    setSearching(false);
  }

  // ── Save per-user override ─────────────────────────────────────────────────
  async function saveOverride(userId, state) {
    setSavingOverride(userId);
    const { error } = await supabase.from("commission_overrides").upsert({
      user_id:      userId,
      commission_type:  state.type,
      commission_value: Number(state.value),
      note:         state.note || null,
      updated_at:   new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) { showToast?.("Failed to save override", "error"); }
    else {
      auditLog?.("commission_override_set", userId, null, "Commission");
      showToast?.("Custom rate saved");
      loadOverrides();
      setUsers([]);
      setSearch("");
    }
    setSavingOverride(null);
  }

  async function removeOverride(userId) {
    const { error } = await supabase.from("commission_overrides").delete().eq("user_id", userId);
    if (error) { showToast?.("Failed to remove override", "error"); }
    else {
      auditLog?.("commission_override_removed", userId, null, "Commission");
      showToast?.("Override removed — user reverts to platform default");
      setOverrides(prev => prev.filter(o => o.user_id !== userId));
    }
  }

  function initEdit(userId, existing) {
    setEditState(prev => ({
      ...prev,
      [userId]: {
        type:  existing?.commission_type  || "percent",
        value: String(existing?.commission_value ?? ""),
        note:  existing?.note || "",
      },
    }));
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Commission Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Set platform-wide rates and per-user custom overrides</p>
        </div>
        <button onClick={() => { loadDefaults(); loadOverrides(); }}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* ── Platform defaults ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-white p-5 space-y-5" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#ede9fe" }}>
            <Percent className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Platform-wide defaults</p>
            <p className="text-xs text-gray-400">Applied to all users who don't have a custom override</p>
          </div>
        </div>

        {loadingDefaults ? (
          <div className="flex items-center gap-2 text-gray-400 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Brand commission */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-bold text-gray-700">Brand commission</p>
              </div>
              <TypeToggle value={defaults.brand_type} onChange={v => setDefaults(d => ({ ...d, brand_type: v }))} />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">
                  {defaults.brand_type === "percent" ? "%" : "₦"}
                </span>
                <input
                  type="number" min="0" max={defaults.brand_type === "percent" ? "100" : undefined}
                  value={defaults.brand_value}
                  onChange={e => setDefaults(d => ({ ...d, brand_value: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#7c3aed" }}
                  placeholder={defaults.brand_type === "percent" ? "e.g. 15" : "e.g. 5000"}
                />
              </div>
              <Preview type={defaults.brand_type} value={defaults.brand_value} />
            </div>

            {/* Creator commission */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                <p className="text-sm font-bold text-gray-700">Creator commission</p>
              </div>
              <TypeToggle value={defaults.creator_type} onChange={v => setDefaults(d => ({ ...d, creator_type: v }))} />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">
                  {defaults.creator_type === "percent" ? "%" : "₦"}
                </span>
                <input
                  type="number" min="0" max={defaults.creator_type === "percent" ? "100" : undefined}
                  value={defaults.creator_value}
                  onChange={e => setDefaults(d => ({ ...d, creator_value: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#7c3aed" }}
                  placeholder={defaults.creator_type === "percent" ? "e.g. 10" : "e.g. 3000"}
                />
              </div>
              <Preview type={defaults.creator_type} value={defaults.creator_value} />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={saveDefaults} disabled={savingDefaults || loadingDefaults}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: "#7c3aed" }}>
            {savingDefaults ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save defaults
          </button>
        </div>
      </div>

      {/* ── Per-user overrides ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-gray-900">Per-user overrides</p>
          <p className="text-xs text-gray-400 mt-0.5">Search a brand or creator and assign them a custom rate</p>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchUsers()}
              placeholder="Search by name or email…"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#7c3aed" }} />
          </div>
          <button onClick={searchUsers} disabled={searching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
            {searching ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Search className="w-4 h-4 text-gray-400" />}
            Search
          </button>
        </div>

        {/* Search results */}
        {users.length > 0 && (
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
            <p className="px-4 py-2 text-xs font-bold text-gray-400 border-b" style={{ borderColor: "#f3f4f6" }}>
              {users.length} user{users.length !== 1 ? "s" : ""} found
            </p>
            <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
              {users.map(u => {
                const isCreator = ["creator", "talent"].includes((u.role || "").toLowerCase());
                const edit = editState[u.id] || { type: "percent", value: "", note: "" };
                const isExpanded = expanded === u.id;

                return (
                  <div key={u.id} className="overflow-hidden">
                    <button onClick={() => {
                      if (!isExpanded) initEdit(u.id, null);
                      setExpanded(isExpanded ? null : u.id);
                    }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ backgroundColor: isCreator ? "#ede9fe" : "#dbeafe", color: isCreator ? "#7c3aed" : "#0891b2" }}>
                        {(u.full_name || u.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{u.full_name || u.email}</p>
                        <p className="text-xs text-gray-400">{u.email} · {u.role}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: isCreator ? "#ede9fe" : "#dbeafe", color: isCreator ? "#7c3aed" : "#0891b2" }}>
                        {isCreator ? "Creator" : "Brand"}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "#f3f4f6" }}>
                        <p className="text-xs font-bold text-gray-500 pt-3">Custom commission rate</p>
                        <TypeToggle value={edit.type}
                          onChange={v => setEditState(s => ({ ...s, [u.id]: { ...s[u.id], type: v } }))} />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">
                            {edit.type === "percent" ? "%" : "₦"}
                          </span>
                          <input type="number" min="0"
                            value={edit.value}
                            onChange={e => setEditState(s => ({ ...s, [u.id]: { ...s[u.id], value: e.target.value } }))}
                            placeholder={edit.type === "percent" ? "e.g. 8" : "e.g. 2500"}
                            className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                            style={{ "--tw-ring-color": "#7c3aed" }} />
                        </div>
                        <Preview type={edit.type} value={edit.value} />
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">Note (optional)</label>
                          <input value={edit.note}
                            onChange={e => setEditState(s => ({ ...s, [u.id]: { ...s[u.id], note: e.target.value } }))}
                            placeholder="e.g. Preferred partner deal"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
                            style={{ "--tw-ring-color": "#7c3aed" }} />
                        </div>
                        <div className="flex justify-end">
                          <button onClick={() => saveOverride(u.id, edit)}
                            disabled={savingOverride === u.id || !edit.value}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ backgroundColor: "#7c3aed" }}>
                            {savingOverride === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Set override
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Existing overrides list */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active overrides</p>
          {loadingOverrides ? (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : overrides.length === 0 ? (
            <div className="rounded-2xl border p-6 text-center text-gray-400" style={{ borderColor: "#e5e7eb" }}>
              <Info className="w-8 h-8 mx-auto mb-2 opacity-25" />
              <p className="text-sm">No overrides set — all users are on platform defaults</p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
              <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
                {overrides.map(o => {
                  const prof = o.profiles;
                  const isCreator = ["creator", "talent"].includes((prof?.role || "").toLowerCase());
                  const isExpanded = expanded === `override-${o.user_id}`;
                  const edit = editState[`override-${o.user_id}`] || {
                    type:  o.commission_type  || "percent",
                    value: String(o.commission_value ?? ""),
                    note:  o.note || "",
                  };

                  return (
                    <div key={o.user_id} className="overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                          style={{ backgroundColor: isCreator ? "#ede9fe" : "#dbeafe", color: isCreator ? "#7c3aed" : "#0891b2" }}>
                          {(prof?.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{prof?.full_name || o.user_id}</p>
                          <p className="text-xs text-gray-400">
                            {o.commission_type === "percent"
                              ? `${o.commission_value}% commission`
                              : `${fmtNaira(o.commission_value)} flat fee`}
                            {o.note && ` · ${o.note}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => {
                            const key = `override-${o.user_id}`;
                            if (!isExpanded) initEdit(key, o);
                            setExpanded(isExpanded ? null : key);
                          }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => removeOverride(o.user_id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                            <RotateCcw className="w-3.5 h-3.5" title="Revert to default" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "#f3f4f6" }}>
                          <p className="text-xs font-bold text-gray-500 pt-3">Edit override</p>
                          <TypeToggle value={edit.type}
                            onChange={v => setEditState(s => ({ ...s, [`override-${o.user_id}`]: { ...s[`override-${o.user_id}`] || edit, type: v } }))} />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">
                              {edit.type === "percent" ? "%" : "₦"}
                            </span>
                            <input type="number" min="0"
                              value={edit.value}
                              onChange={e => setEditState(s => ({ ...s, [`override-${o.user_id}`]: { ...s[`override-${o.user_id}`] || edit, value: e.target.value } }))}
                              className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                              style={{ "--tw-ring-color": "#7c3aed" }} />
                          </div>
                          <Preview type={edit.type} value={edit.value} />
                          <input value={edit.note}
                            onChange={e => setEditState(s => ({ ...s, [`override-${o.user_id}`]: { ...s[`override-${o.user_id}`] || edit, note: e.target.value } }))}
                            placeholder="Note (optional)"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
                            style={{ "--tw-ring-color": "#7c3aed" }} />
                          <div className="flex justify-end">
                            <button onClick={() => saveOverride(o.user_id, edit)}
                              disabled={savingOverride === o.user_id || !edit.value}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                              style={{ backgroundColor: "#7c3aed" }}>
                              {savingOverride === o.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              Update
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
