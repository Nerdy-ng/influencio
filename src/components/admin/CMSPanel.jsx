import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { FileText, Plus, Trash2, Save, RotateCcw, ChevronRight } from "lucide-react";

const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');

const CONTENT_TYPES = [
  { key: "faq",          label: "FAQs" },
  { key: "help_article", label: "Help Articles" },
  { key: "terms",        label: "Terms of Service" },
  { key: "privacy",      label: "Privacy Policy" },
  { key: "banner",       label: "Banners" },
  { key: "maintenance",  label: "Maintenance Notices" },
];

export default function CMSPanel({ showToast, auditLog }) {
  const [contentType, setContentType] = useState("faq");
  const [items, setItems]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [editing, setEditing]   = useState({ title: "", body: "", active: true });
  const [isNew, setIsNew]       = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("cms_content").select("*").eq("type", contentType).order("sort_order", { ascending: true }).catch(() => ({ data: [] }));
    setItems(data || []);
    setSelected(null);
    setIsNew(false);
    setLoading(false);
  }

  useEffect(() => { load(); }, [contentType]);

  function startEdit(item) {
    setSelected(item);
    setEditing({ title: item.title || "", body: item.body || item.content || "", active: item.active !== false });
    setIsNew(false);
  }

  function startNew() {
    setSelected(null);
    setEditing({ title: "", body: "", active: true });
    setIsNew(true);
  }

  async function save() {
    if (!editing.title.trim()) { showToast("Title required", "error"); return; }
    setSaving(true);
    const payload = {
      type:    contentType,
      title:   stripInjection(editing.title),
      body:    stripInjection(editing.body),
      content: stripInjection(editing.body),
      active:  editing.active,
      updated_at: new Date().toISOString(),
    };
    if (isNew) {
      const { data } = await supabase.from("cms_content").insert({ ...payload, created_at: new Date().toISOString(), sort_order: items.length }).select().single().catch(() => ({ data: null }));
      if (data) setItems(prev => [...prev, data]);
      auditLog?.("cms_create", contentType, null, editing.title);
      showToast("Content created");
    } else {
      await supabase.from("cms_content").update(payload).eq("id", selected.id).catch(() => {});
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...payload } : i));
      auditLog?.("cms_update", contentType, selected.id, editing.title);
      showToast("Saved");
    }
    setIsNew(false);
    setSaving(false);
  }

  async function deleteItem(id, title) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await supabase.from("cms_content").delete().eq("id", id).catch(() => {});
    setItems(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) { setSelected(null); setIsNew(false); }
    auditLog?.("cms_delete", contentType, id, title);
    showToast("Deleted");
  }

  async function toggleActive(item) {
    await supabase.from("cms_content").update({ active: !item.active }).eq("id", item.id).catch(() => {});
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !item.active } : i));
    if (selected?.id === item.id) setEditing(e => ({ ...e, active: !item.active }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Content Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">FAQs, help articles, legal pages, banners</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Content type tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {CONTENT_TYPES.map(t => (
          <button key={t.key} onClick={() => setContentType(t.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={contentType === t.key ? { backgroundColor: "#4f46e5", color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4" style={{ minHeight: 500 }}>
        {/* Item list */}
        <div className="w-72 flex-shrink-0">
          <div className="mb-2">
            <button onClick={startNew} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <Plus className="w-4 h-4" /> New {CONTENT_TYPES.find(t => t.key === contentType)?.label.replace(/s$/, "")}
            </button>
          </div>
          <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 560 }}>
            {loading ? <p className="text-xs text-gray-400 text-center py-6">Loading…</p>
            : items.length === 0 ? <p className="text-xs text-gray-400 text-center py-6">No content yet</p>
            : items.map(item => (
              <button key={item.id} onClick={() => startEdit(item)}
                className="w-full text-left p-3 rounded-xl transition-all group"
                style={{ backgroundColor: (selected?.id === item.id || (isNew && !selected)) ? "#eef2ff" : "#fff", border: `1px solid ${selected?.id === item.id ? "#c7d2fe" : "#e2e8f0"}` }}>
                <div className="flex items-center gap-2 justify-between">
                  <p className="text-xs font-semibold text-gray-800 truncate flex-1">{item.title}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={item.active ? { backgroundColor: "#dcfce7", color: "#16a34a" } : { backgroundColor: "#f1f5f9", color: "#94a3b8" }}>
                      {item.active ? "Live" : "Off"}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 rounded-2xl bg-white overflow-hidden flex flex-col" style={{ border: "1px solid #e2e8f0" }}>
          {(selected || isNew) ? (
            <>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">{isNew ? `New ${CONTENT_TYPES.find(t => t.key === contentType)?.label.replace(/s$/, "")}` : "Edit Content"}</p>
                <div className="flex gap-2">
                  {!isNew && selected && (
                    <>
                      <button onClick={() => toggleActive(selected)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100">
                        {selected.active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => deleteItem(selected.id, selected.title)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </>
                  )}
                  <button onClick={save} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                    style={{ backgroundColor: "#4f46e5" }}>
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Title</label>
                  <input value={editing.title} onChange={e => setEditing(ed => ({ ...ed, title: stripInjection(e.target.value) }))}
                    placeholder="Enter title…"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Body / Content</label>
                  <textarea rows={12} value={editing.body} onChange={e => setEditing(ed => ({ ...ed, body: stripInjection(e.target.value) }))}
                    placeholder="Enter content (Markdown supported)…"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 resize-none font-mono" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={editing.active} onChange={e => setEditing(ed => ({ ...ed, active: e.target.checked }))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-indigo-500 rounded-full transition-colors relative">
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.active ? "translate-x-4" : ""}`} />
                    </div>
                  </label>
                  <span className="text-sm text-gray-600">{editing.active ? "Live (visible to users)" : "Inactive (hidden)"}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center"><FileText className="w-10 h-10 mx-auto mb-2 text-gray-200" /><p className="text-sm text-gray-400">Select content to edit or create new</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
