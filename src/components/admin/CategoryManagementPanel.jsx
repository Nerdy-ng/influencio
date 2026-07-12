import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Tag, Plus, Trash2, Save, RotateCcw } from "lucide-react";

const CATEGORY_TYPES = [
  { key: "niches",         label: "Niches / Creator Types",   placeholder: "e.g. Fashion, Tech, Beauty" },
  { key: "industries",     label: "Industries",               placeholder: "e.g. E-commerce, Banking" },
  { key: "skills",         label: "Skills",                   placeholder: "e.g. Video Editing, Photography" },
  { key: "platforms",      label: "Platforms",                placeholder: "e.g. Instagram, TikTok, YouTube" },
  { key: "content_types",  label: "Content Types",            placeholder: "e.g. Reel, Review, Tutorial" },
  { key: "languages",      label: "Languages",                placeholder: "e.g. English, Yoruba" },
  { key: "locations",      label: "Locations / Cities",       placeholder: "e.g. Lagos, Abuja" },
  { key: "creator_levels", label: "Creator Levels",           placeholder: "e.g. Nano, Micro, Macro" },
  { key: "badges",         label: "Badges",                   placeholder: "e.g. Verified, Top Creator" },
];

export default function CategoryManagementPanel({ showToast, auditLog }) {
  const [activeType, setActiveType] = useState("niches");
  const [categories, setCategories] = useState({});
  const [newItem, setNewItem]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key, value").in("key", CATEGORY_TYPES.map(t => `cat_${t.key}`));
    const obj = {};
    CATEGORY_TYPES.forEach(t => { obj[t.key] = []; });
    (data || []).forEach(r => {
      const key = r.key.replace("cat_", "");
      try { obj[key] = JSON.parse(r.value) || []; } catch { obj[key] = []; }
    });
    setCategories(obj);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function addItem() {
    const val = newItem.trim();
    if (!val) return;
    const current = categories[activeType] || [];
    if (current.includes(val)) { showToast("Already exists", "error"); return; }
    const updated = [...current, val];
    setCategories(prev => ({ ...prev, [activeType]: updated }));
    setNewItem("");
  }

  function removeItem(item) {
    setCategories(prev => ({ ...prev, [activeType]: (prev[activeType] || []).filter(i => i !== item) }));
  }

  async function save() {
    setSaving(true);
    const upserts = Object.entries(categories).map(([key, value]) => ({
      key: `cat_${key}`,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString(),
    }));
    await supabase.from("site_settings").upsert(upserts, { onConflict: "key" }).catch(() => {});
    auditLog?.("update_categories", "categories", null, activeType);
    showToast("Categories saved");
    setSaving(false);
  }

  const activeList = categories[activeType] || [];
  const activeMeta = CATEGORY_TYPES.find(t => t.key === activeType);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Category Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage all dropdown options used across the platform</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={save} disabled={saving || loading} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: "#4f46e5" }}>
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Type sidebar */}
        <div className="w-52 flex-shrink-0 space-y-0.5">
          {CATEGORY_TYPES.map(t => (
            <button key={t.key} onClick={() => setActiveType(t.key)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeType === t.key ? { backgroundColor: "#eef2ff", color: "#4f46e5" } : { color: "#64748b" }}>
              <span>{t.label}</span>
              <span className="ml-2 text-xs opacity-60">{(categories[t.key] || []).length}</span>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><Tag className="w-4 h-4 text-indigo-500" /> {activeMeta?.label}</p>
            <span className="text-xs font-semibold text-gray-400">{activeList.length} items</span>
          </div>

          {/* Add new */}
          <div className="flex gap-2 mb-4">
            <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder={activeMeta?.placeholder}
              onKeyDown={e => e.key === "Enter" && addItem()}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400" />
            <button onClick={addItem} disabled={!newItem.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#4f46e5" }}>
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Items grid */}
          {activeList.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-300">No items yet. Add some above.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeList.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                  <span>{item}</span>
                  <button onClick={() => removeItem(item)} className="ml-0.5 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
