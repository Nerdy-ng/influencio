import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Ticket, Plus, Trash2, Edit3, Loader2, X, Save, Copy,
  CheckCircle, Users, TrendingUp, Calendar, RefreshCw,
  ChevronDown, ChevronUp,
} from "lucide-react";

const fmtMoney  = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtPct    = (n) => `${Number(n || 0)}%`;
const isExpired = (d) => d && new Date(d) < new Date();

const BLANK = {
  code: "", description: "", discount_type: "fixed", discount_value: "",
  max_uses: "", expires_at: "", target_role: "all", active: true,
};

const ROLE_LABELS = { all: "Everyone", creator: "Creators", brand: "Brands" };

export default function PromoCouponPanel({ showToast, auditLog }) {
  const [codes, setCodes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [uses, setUses]         = useState({});
  const [loadingUses, setLoadingUses] = useState({});
  const [copied, setCopied]     = useState(null);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("brandiór_admin_token");
      if (raw) {
        const p = JSON.parse(atob(raw.split(".")[1] ?? "e30="));
        setAdminName(p?.name || "Admin");
      }
    } catch {}
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    setCodes(data || []);
    setLoading(false);
  }

  async function loadUses(codeId) {
    setLoadingUses(prev => ({ ...prev, [codeId]: true }));
    const { data } = await supabase
      .from("promo_code_uses")
      .select("*")
      .eq("code_id", codeId)
      .order("used_at", { ascending: false })
      .limit(20);
    setUses(prev => ({ ...prev, [codeId]: data || [] }));
    setLoadingUses(prev => ({ ...prev, [codeId]: false }));
  }

  function toggleExpand(id) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!uses[id]) loadUses(id);
  }

  function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code   = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm(f => ({ ...f, code }));
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function save() {
    const code = form.code.trim().toUpperCase();
    if (!code) { showToast?.("Code is required", "error"); return; }
    if (!form.discount_value || isNaN(Number(form.discount_value))) { showToast?.("Discount value is required", "error"); return; }
    setSaving(true);
    const payload = {
      code,
      description:    form.description.trim() || null,
      discount_type:  form.discount_type,
      discount_value: Number(form.discount_value),
      max_uses:       form.max_uses ? Number(form.max_uses) : null,
      expires_at:     form.expires_at || null,
      target_role:    form.target_role,
      active:         form.active,
      created_by:     adminName,
    };
    let error;
    if (form.id) {
      ({ error } = await supabase.from("promo_codes").update(payload).eq("id", form.id));
    } else {
      ({ error } = await supabase.from("promo_codes").insert(payload));
    }
    if (error) {
      showToast?.(error.code === "23505" ? "That code already exists" : "Failed to save", "error");
    } else {
      auditLog?.("promo_saved", { code });
      showToast?.(form.id ? "Code updated" : "Code created");
      setForm(null);
      load();
    }
    setSaving(false);
  }

  async function toggleActive(c) {
    await supabase.from("promo_codes").update({ active: !c.active }).eq("id", c.id);
    setCodes(prev => prev.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
    showToast?.(!c.active ? "Code activated" : "Code deactivated");
  }

  async function deleteCode(id, code) {
    setDeleting(id);
    await supabase.from("promo_codes").delete().eq("id", id);
    auditLog?.("promo_deleted", { code });
    setCodes(prev => prev.filter(x => x.id !== id));
    showToast?.(`${code} deleted`);
    setDeleting(null);
  }

  // Stats
  const totalCodes  = codes.length;
  const activeCodes = codes.filter(c => c.active && !isExpired(c.expires_at)).length;
  const totalUses   = codes.reduce((s, c) => s + (c.uses_count || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Promo & Coupon Codes</h2>
          <p className="text-sm text-gray-500 mt-0.5">Codes give users a wallet credit when redeemed</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => setForm({ ...BLANK })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: "#7c3aed" }}>
            <Plus className="w-4 h-4" /> New Code
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Codes",   value: totalCodes,  Icon: Ticket,    color: "#7c3aed" },
          { label: "Active",        value: activeCodes, Icon: CheckCircle, color: "#059669" },
          { label: "Total Redemptions", value: totalUses, Icon: Users,  color: "#0891b2" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e5e7eb" }}>
            <s.Icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {form && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: "#7c3aed40", backgroundColor: "#7c3aed06" }}>
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-800">{form.id ? "Edit Code" : "New Promo Code"}</p>
            <button onClick={() => setForm(null)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>

          {/* Code field */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Code</label>
            <div className="flex gap-2">
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. LAUNCH50"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-gray-800 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7c3aed" }} />
              <button onClick={generateCode}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:bg-gray-50">
                Generate
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Description (internal)</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Launch campaign for new creators"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#7c3aed" }} />
          </div>

          {/* Discount type + value */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Discount Type</label>
              <div className="flex gap-2">
                {[
                  { key: "fixed",      label: "Fixed ₦" },
                  { key: "percentage", label: "Percentage %" },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setForm(f => ({ ...f, discount_type: opt.key }))}
                    className="flex-1 py-2 rounded-xl border text-xs font-bold transition-all"
                    style={{
                      backgroundColor: form.discount_type === opt.key ? "#7c3aed12" : "white",
                      borderColor:     form.discount_type === opt.key ? "#7c3aed" : "#e5e7eb",
                      color:           form.discount_type === opt.key ? "#7c3aed" : "#6b7280",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                {form.discount_type === "fixed" ? "Amount (₦)" : "Percentage (%)"}
              </label>
              <input type="number" min="0" value={form.discount_value}
                onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                placeholder={form.discount_type === "fixed" ? "e.g. 5000" : "e.g. 20"}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7c3aed" }} />
            </div>
          </div>

          {/* Limits */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Max Uses (blank = unlimited)</label>
              <input type="number" min="1" value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                placeholder="e.g. 100"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7c3aed" }} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />Expires (blank = never)
              </label>
              <input type="datetime-local" value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7c3aed" }} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Show To</label>
              <select value={form.target_role} onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7c3aed" }}>
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
              style={{ backgroundColor: form.active ? "#7c3aed" : "#d1d5db" }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: form.active ? "calc(100% - 18px)" : "2px" }} />
            </button>
            <span className="text-sm text-gray-600">{form.active ? "Active — users can redeem now" : "Inactive — code is disabled"}</span>
          </div>

          {/* Save */}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setForm(null)} className="px-4 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100">Cancel</button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: "#7c3aed" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {form.id ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Codes list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : codes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-2xl text-gray-400" style={{ borderColor: "#e5e7eb" }}>
          <Ticket className="w-10 h-10 mb-3 opacity-25" />
          <p className="font-semibold">No promo codes yet</p>
          <p className="text-xs mt-1 text-gray-300">Create one to give users wallet credits</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
            {codes.map(c => {
              const expired  = isExpired(c.expires_at);
              const maxed    = c.max_uses && c.uses_count >= c.max_uses;
              const isOpen   = expanded === c.id;
              const statusOk = c.active && !expired && !maxed;

              return (
                <div key={c.id}>
                  {/* Row */}
                  <div className="flex items-center gap-3 px-5 py-4 flex-wrap">
                    {/* Code badge */}
                    <div className="flex items-center gap-2 min-w-0">
                      <code className="text-sm font-black tracking-wider text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {c.code}
                      </code>
                      <button onClick={() => copyCode(c.code)} className="p-1 rounded hover:bg-gray-100">
                        {copied === c.code ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                      </button>
                    </div>

                    {/* Discount pill */}
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#7c3aed15", color: "#7c3aed" }}>
                      {c.discount_type === "fixed" ? fmtMoney(c.discount_value) : fmtPct(c.discount_value)}
                      {c.discount_type === "fixed" ? " credit" : " off"}
                    </span>

                    {/* Role */}
                    <span className="text-xs text-gray-400">{ROLE_LABELS[c.target_role]}</span>

                    {/* Uses */}
                    <span className="text-xs text-gray-400">
                      <TrendingUp className="w-3 h-3 inline mr-0.5" />
                      {c.uses_count}{c.max_uses ? `/${c.max_uses}` : ""} uses
                    </span>

                    {/* Expiry */}
                    {c.expires_at && (
                      <span className="text-xs text-gray-400">
                        <Calendar className="w-3 h-3 inline mr-0.5" />Expires {fmtDate(c.expires_at)}
                      </span>
                    )}

                    {/* Description */}
                    {c.description && <span className="text-xs text-gray-300 truncate max-w-[200px]">{c.description}</span>}

                    {/* Status badge */}
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto"
                      style={{
                        backgroundColor: statusOk ? "#d1fae5" : expired ? "#fee2e2" : maxed ? "#fef3c7" : "#f3f4f6",
                        color:           statusOk ? "#059669" : expired ? "#dc2626" : maxed ? "#d97706" : "#9ca3af",
                      }}>
                      {statusOk ? "Active" : expired ? "Expired" : maxed ? "Maxed out" : "Inactive"}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleActive(c)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-xs text-gray-400 transition-colors">
                        {c.active ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => setForm({ ...c, expires_at: c.expires_at?.slice(0,16) || "", max_uses: c.max_uses ?? "", discount_value: c.discount_value ?? "" })}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit3 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button onClick={() => deleteCode(c.id, c.code)} disabled={deleting === c.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40">
                        {deleting === c.id ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
                      </button>
                      <button onClick={() => toggleExpand(c.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Usage list */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t" style={{ borderColor: "#f3f4f6", backgroundColor: "#fafafa" }}>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-4 mb-3">Recent redemptions</p>
                      {loadingUses[c.id] ? (
                        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                        </div>
                      ) : !uses[c.id]?.length ? (
                        <p className="text-sm text-gray-400 py-4">No redemptions yet</p>
                      ) : (
                        <div className="space-y-2">
                          {uses[c.id].map(u => (
                            <div key={u.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{u.user_name || "Unknown"}</p>
                                <p className="text-xs text-gray-400">{u.user_role} · {fmtDate(u.used_at)}</p>
                              </div>
                              <p className="text-sm font-bold" style={{ color: "#059669" }}>
                                +{c.discount_type === "fixed" ? fmtMoney(u.discount_applied) : fmtPct(u.discount_applied)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
