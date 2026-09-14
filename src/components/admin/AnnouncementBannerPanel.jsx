import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Megaphone, Plus, Trash2, Edit3, Loader2, CheckCircle,
  AlertTriangle, Info, Zap, Eye, EyeOff, Calendar, X, Save,
} from "lucide-react";

const TYPE_CONFIG = {
  info:    { label: "Info",    color: "#0891b2", bg: "#e0f2fe", Icon: Info         },
  success: { label: "Success", color: "#059669", bg: "#d1fae5", Icon: CheckCircle  },
  warning: { label: "Warning", color: "#d97706", bg: "#fef3c7", Icon: AlertTriangle },
  urgent:  { label: "Urgent",  color: "#dc2626", bg: "#fee2e2", Icon: Zap          },
};

const ROLE_LABELS = { all: "Everyone", creator: "Creators only", brand: "Brands only" };

const BLANK = { message: "", type: "info", target_role: "all", active: true, starts_at: "", ends_at: "" };

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

export default function AnnouncementBannerPanel({ showToast, auditLog }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [form, setForm]                   = useState(null);   // null = closed, obj = open
  const [saving, setSaving]               = useState(false);
  const [deleting, setDeleting]           = useState(null);
  const [adminName, setAdminName]         = useState("Admin");

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
      .from("platform_announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.message.trim()) { showToast?.("Message is required", "error"); return; }
    setSaving(true);
    const payload = {
      message:     form.message.trim(),
      type:        form.type,
      target_role: form.target_role,
      active:      form.active,
      starts_at:   form.starts_at || null,
      ends_at:     form.ends_at   || null,
      created_by:  adminName,
    };
    let error;
    if (form.id) {
      ({ error } = await supabase.from("platform_announcements").update(payload).eq("id", form.id));
    } else {
      ({ error } = await supabase.from("platform_announcements").insert(payload));
    }
    if (error) { showToast?.("Failed to save", "error"); }
    else {
      auditLog?.("announcement_saved", { message: payload.message.slice(0, 60) });
      showToast?.(form.id ? "Announcement updated" : "Announcement created");
      setForm(null);
      load();
    }
    setSaving(false);
  }

  async function toggleActive(ann) {
    await supabase.from("platform_announcements").update({ active: !ann.active }).eq("id", ann.id);
    auditLog?.("announcement_toggled", { id: ann.id, active: !ann.active });
    setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, active: !a.active } : a));
    showToast?.(!ann.active ? "Banner activated" : "Banner deactivated");
  }

  async function deleteAnn(id) {
    setDeleting(id);
    await supabase.from("platform_announcements").delete().eq("id", id);
    auditLog?.("announcement_deleted", { id });
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    showToast?.("Announcement deleted");
    setDeleting(null);
  }

  const activeCount = announcements.filter(a => a.active).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Platform Announcement Banners</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount > 0 ? `${activeCount} banner${activeCount > 1 ? "s" : ""} currently showing` : "No banners currently active"}
          </p>
        </div>
        <button onClick={() => setForm({ ...BLANK })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: "#7c3aed" }}>
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>

      {/* Create / Edit form */}
      {form && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: "#7c3aed40", backgroundColor: "#7c3aed08" }}>
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-800">{form.id ? "Edit Banner" : "New Banner"}</p>
            <button onClick={() => setForm(null)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Message</label>
            <textarea rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Type the announcement message shown to users…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#7c3aed" }} />
          </div>

          {/* Type + Role row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Banner Type</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => setForm(f => ({ ...f, type: key }))}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all"
                    style={{
                      backgroundColor: form.type === key ? cfg.bg : "white",
                      borderColor:     form.type === key ? cfg.color : "#e5e7eb",
                      color:           form.type === key ? cfg.color : "#6b7280",
                    }}>
                    <cfg.Icon className="w-3.5 h-3.5" /> {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Show To</label>
              <div className="space-y-2">
                {Object.entries(ROLE_LABELS).map(([key, lbl]) => (
                  <button key={key} onClick={() => setForm(f => ({ ...f, target_role: key }))}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all"
                    style={{
                      backgroundColor: form.target_role === key ? "#7c3aed12" : "white",
                      borderColor:     form.target_role === key ? "#7c3aed" : "#e5e7eb",
                      color:           form.target_role === key ? "#7c3aed" : "#6b7280",
                    }}>
                    <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${form.target_role === key ? "border-purple-600 bg-purple-600" : "border-gray-300"}`} />
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />Start Date (optional)
              </label>
              <input type="datetime-local" value={form.starts_at}
                onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7c3aed" }} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />End Date (optional)
              </label>
              <input type="datetime-local" value={form.ends_at}
                onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7c3aed" }} />
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
            <span className="text-sm text-gray-600">{form.active ? "Active — will show immediately" : "Inactive — saved but hidden"}</span>
          </div>

          {/* Preview */}
          {form.message.trim() && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preview</p>
              <BannerPreview ann={form} />
            </div>
          )}

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

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 border rounded-2xl" style={{ borderColor: "#e5e7eb" }}>
          <Megaphone className="w-10 h-10 mb-3 opacity-25" />
          <p className="font-semibold">No announcements yet</p>
          <p className="text-xs mt-1 text-gray-300">Create one to broadcast a message across the platform</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => {
            const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
            return (
              <div key={ann.id} className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: ann.active ? cfg.color + "40" : "#e5e7eb" }}>
                {/* Banner preview strip */}
                <BannerPreview ann={ann} />

                {/* Meta row */}
                <div className="px-5 py-3 flex flex-wrap items-center gap-3 border-t" style={{ borderColor: "#f3f4f6" }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="text-xs text-gray-400">→ {ROLE_LABELS[ann.target_role]}</span>
                  {ann.starts_at && <span className="text-xs text-gray-400">From {fmtDate(ann.starts_at)}</span>}
                  {ann.ends_at   && <span className="text-xs text-gray-400">Until {fmtDate(ann.ends_at)}</span>}
                  <span className="text-xs text-gray-300 ml-auto">{fmtDate(ann.created_at)} · {ann.created_by}</span>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(ann)}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors"
                      style={{
                        borderColor:     ann.active ? "#7c3aed" : "#d1d5db",
                        color:           ann.active ? "#7c3aed" : "#9ca3af",
                        backgroundColor: ann.active ? "#7c3aed0d" : "transparent",
                      }}>
                      {ann.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {ann.active ? "Active" : "Hidden"}
                    </button>
                    <button onClick={() => setForm({ ...ann, starts_at: ann.starts_at?.slice(0,16) || "", ends_at: ann.ends_at?.slice(0,16) || "" })}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => deleteAnn(ann.id)} disabled={deleting === ann.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40">
                      {deleting === ann.id ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BannerPreview({ ann }) {
  const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
  return (
    <div className="flex items-start gap-3 px-5 py-3" style={{ backgroundColor: cfg.bg }}>
      <cfg.Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
      <p className="text-sm font-medium leading-snug flex-1" style={{ color: cfg.color }}>
        {ann.message || <span className="opacity-40 italic">Your message will appear here…</span>}
      </p>
    </div>
  );
}
