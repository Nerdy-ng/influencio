import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Shield, Plus, Loader2, RefreshCw, X, Check, Pencil,
  Save, UserX, UserCheck, ChevronDown, ChevronUp, Search,
  ShieldAlert, ShieldCheck, ShieldOff, Mail, User, Lock,
} from "lucide-react";

const ROLES = ["Admin", "Manager", "Staff"];

const ROLE_CONFIG = {
  Admin:   { color: "#7c3aed", bg: "#ede9fe", Icon: ShieldCheck,  desc: "Full access to all panels and settings" },
  Manager: { color: "#0891b2", bg: "#cffafe", Icon: ShieldAlert,  desc: "Operations access; no team or system settings" },
  Staff:   { color: "#059669", bg: "#d1fae5", Icon: Shield,       desc: "Read-only with limited moderation actions" },
};

const PERMISSION_GROUPS = [
  { key: "dashboard",  label: "Dashboard",  desc: "Overview, analytics, funnel, earnings, SLA, exports" },
  { key: "community",  label: "Community",  desc: "Users, badges, rankings, jobs, pitches, messaging" },
  { key: "finance",    label: "Finance",    desc: "Wallets, payouts, escrow, financials, rubies" },
  { key: "trust",      label: "Trust",      desc: "Disputes, reviews, KYC, fraud, marketplace" },
  { key: "platform",   label: "Platform",   desc: "Announcements, promos, notifications, CMS, AI" },
  { key: "admin",      label: "Admin",      desc: "Team, approvals, system, audit, security, settings" },
];

const ROLE_DEFAULTS = {
  Admin:   { dashboard: true,  community: true,  finance: true,  trust: true,  platform: true,  admin: true  },
  Manager: { dashboard: true,  community: true,  finance: true,  trust: true,  platform: true,  admin: false },
  Staff:   { dashboard: true,  community: false, finance: false, trust: true,  platform: false, admin: false },
};

function PermissionToggle({ enabled, onChange, disabled }) {
  return (
    <button onClick={() => !disabled && onChange(!enabled)} disabled={disabled}
      className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-40"
      style={{ backgroundColor: enabled ? "#7c3aed" : "#d1d5db" }}>
      <span className="absolute top-0.5 transition-all rounded-full w-4 h-4 bg-white shadow"
        style={{ left: enabled ? "calc(100% - 18px)" : "2px" }} />
    </button>
  );
}

export default function AdminRolesPanel({ showToast, auditLog }) {
  const [admins, setAdmins]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(null);
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName]   = useState("");
  const [inviteRole, setInviteRole]   = useState("Staff");
  const [inviting, setInviting]       = useState(false);

  // Current admin's name (from JWT)
  const [myEmail, setMyEmail] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("brandiór_admin_token");
      if (raw) {
        const p = JSON.parse(atob(raw.split(".")[1] ?? "e30="));
        setMyEmail(p?.email || "");
      }
    } catch {}
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setAdmins(data || []);
    setLoading(false);
  }

  async function invite() {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      showToast?.("Email and name are required", "error");
      return;
    }
    setInviting(true);
    const perms = { ...ROLE_DEFAULTS[inviteRole] };
    const { error } = await supabase.from("admin_users").insert({
      email:       inviteEmail.trim().toLowerCase(),
      name:        inviteName.trim(),
      role:        inviteRole,
      permissions: perms,
      is_active:   true,
    });
    if (error) {
      showToast?.(error.message?.includes("duplicate") ? "That email already exists" : "Failed to create admin", "error");
    } else {
      auditLog?.("admin_invited", { email: inviteEmail, role: inviteRole });
      showToast?.(`${inviteName} added as ${inviteRole}`);
      setInviteEmail(""); setInviteName(""); setInviteRole("Staff");
      setShowInvite(false);
      load();
    }
    setInviting(false);
  }

  async function savePermissions(admin) {
    setSaving(admin.id);
    const { error } = await supabase.from("admin_users")
      .update({ permissions: admin.permissions, role: admin.role })
      .eq("id", admin.id);
    if (error) {
      showToast?.("Failed to save permissions", "error");
    } else {
      auditLog?.("permissions_updated", { email: admin.email });
      showToast?.(`Permissions saved for ${admin.name || admin.email}`);
    }
    setSaving(null);
  }

  async function toggleActive(admin) {
    const next = !admin.is_active;
    const { error } = await supabase.from("admin_users")
      .update({ is_active: next })
      .eq("id", admin.id);
    if (error) {
      showToast?.("Failed to update status", "error");
    } else {
      auditLog?.(next ? "admin_reactivated" : "admin_deactivated", { email: admin.email });
      showToast?.(`${admin.name || admin.email} ${next ? "reactivated" : "deactivated"}`);
      setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, is_active: next } : a));
    }
  }

  function updateLocalPerm(adminId, key, val) {
    setAdmins(prev => prev.map(a =>
      a.id === adminId
        ? { ...a, permissions: { ...a.permissions, [key]: val } }
        : a
    ));
  }

  function updateLocalRole(adminId, role) {
    setAdmins(prev => prev.map(a =>
      a.id === adminId
        ? { ...a, role, permissions: { ...ROLE_DEFAULTS[role] } }
        : a
    ));
  }

  const filtered = admins.filter(a =>
    !search ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = admins.filter(a => a.is_active).length;
  const adminCount    = admins.filter(a => a.role === "Admin").length;
  const managerCount  = admins.filter(a => a.role === "Manager").length;
  const staffCount    = admins.filter(a => a.role === "Staff").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Admin Roles & Permissions</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage admin accounts and control panel access per role</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#7c3aed" }}>
            <Plus className="w-4 h-4" /> Add Admin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active",   value: activeCount,  color: "#059669" },
          { label: "Admins",   value: adminCount,   color: "#7c3aed" },
          { label: "Managers", value: managerCount, color: "#0891b2" },
          { label: "Staff",    value: staffCount,   color: "#059669" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e5e7eb" }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Role descriptions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {ROLES.map(r => {
          const cfg = ROLE_CONFIG[r];
          return (
            <div key={r} className="rounded-2xl border p-4" style={{ borderColor: cfg.color + "30", backgroundColor: cfg.bg + "60" }}>
              <cfg.Icon className="w-4 h-4 mb-2" style={{ color: cfg.color }} />
              <p className="text-sm font-bold" style={{ color: cfg.color }}>{r}</p>
              <p className="text-xs text-gray-500 mt-0.5">{cfg.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: "#7c3aed40" }}>
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900">Add new admin</p>
            <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Full name</label>
              <input value={inviteName} onChange={e => setInviteName(e.target.value)}
                placeholder="e.g. Tunde Bakare"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7c3aed" }} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Email address</label>
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="e.g. tunde@brandior.africa" type="email"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7c3aed" }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2">Role</label>
            <div className="flex gap-2 flex-wrap">
              {ROLES.map(r => {
                const cfg = ROLE_CONFIG[r];
                const sel = inviteRole === r;
                return (
                  <button key={r} onClick={() => setInviteRole(r)}
                    className="px-4 py-2 rounded-full text-sm font-bold border transition-all"
                    style={{
                      backgroundColor: sel ? cfg.color : "white",
                      color:           sel ? "white"    : cfg.color,
                      borderColor:     cfg.color,
                    }}>
                    {r}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ROLE_CONFIG[inviteRole].desc}</p>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowInvite(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={invite} disabled={inviting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: "#7c3aed" }}>
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add {inviteRole}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#7c3aed" }} />
      </div>

      {/* Admin list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 rounded-2xl border" style={{ borderColor: "#e5e7eb" }}>
          <User className="w-10 h-10 mb-3 opacity-25" />
          <p className="font-semibold">No admin accounts yet</p>
          <p className="text-xs mt-1 text-gray-300">Click "Add Admin" to create the first one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const cfg      = ROLE_CONFIG[a.role] || ROLE_CONFIG.Staff;
            const isOpen   = expanded === a.id;
            const isMe     = a.email === myEmail;
            const perms    = a.permissions || {};

            return (
              <div key={a.id} className="rounded-2xl border bg-white overflow-hidden"
                style={{ borderColor: a.is_active ? cfg.color + "30" : "#e5e7eb" }}>
                {/* Card header */}
                <div className="flex items-center gap-3 px-5 py-4 flex-wrap">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                    {(a.name || a.email || "?")[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{a.name || a.email}</p>
                      {isMe && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#7c3aed20", color: "#7c3aed" }}>You</span>
                      )}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>{a.role}</span>
                      {!a.is_active && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{a.email}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isMe && (
                      <button onClick={() => toggleActive(a)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
                        style={{
                          borderColor: a.is_active ? "#dc2626" : "#059669",
                          color:       a.is_active ? "#dc2626" : "#059669",
                        }}>
                        {a.is_active
                          ? <><UserX className="w-3 h-3" /> Deactivate</>
                          : <><UserCheck className="w-3 h-3" /> Reactivate</>
                        }
                      </button>
                    )}
                    <button onClick={() => setExpanded(isOpen ? null : a.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50">
                      <Pencil className="w-3 h-3" />
                      Permissions
                      {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Permissions editor */}
                {isOpen && (
                  <div className="border-t px-5 py-4 space-y-4" style={{ borderColor: "#f3f4f6" }}>
                    {/* Role selector */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-2">Role</p>
                      <div className="flex gap-2 flex-wrap">
                        {ROLES.map(r => {
                          const rc = ROLE_CONFIG[r];
                          const sel = a.role === r;
                          return (
                            <button key={r} onClick={() => updateLocalRole(a.id, r)}
                              className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                              style={{
                                backgroundColor: sel ? rc.color : "white",
                                color:           sel ? "white"  : rc.color,
                                borderColor:     rc.color,
                              }}>
                              {r}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{ROLE_CONFIG[a.role]?.desc}</p>
                    </div>

                    {/* Permission toggles */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-2">Panel access</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {PERMISSION_GROUPS.map(g => (
                          <div key={g.key} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "#fafafa" }}>
                            <PermissionToggle
                              enabled={!!perms[g.key]}
                              onChange={v => updateLocalPerm(a.id, g.key, v)}
                              disabled={false}
                            />
                            <div>
                              <p className="text-xs font-bold text-gray-700">{g.label}</p>
                              <p className="text-xs text-gray-400">{g.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end">
                      <button onClick={() => savePermissions(a)} disabled={saving === a.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                        style={{ backgroundColor: "#7c3aed" }}>
                        {saving === a.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Save className="w-4 h-4" />
                        }
                        Save permissions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div className="rounded-2xl border p-4 flex items-start gap-3" style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}>
        <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-gray-500">Permission enforcement</p>
          <p className="text-xs text-gray-400 mt-0.5">
            These settings record each admin's intended access level. The actual nav groups visible in the panel are controlled by the role system.
            Full enforcement (hiding nav items based on permissions) can be wired from the <code className="font-mono bg-gray-100 px-1 rounded text-gray-600">permissions</code> column in <code className="font-mono bg-gray-100 px-1 rounded text-gray-600">admin_users</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
