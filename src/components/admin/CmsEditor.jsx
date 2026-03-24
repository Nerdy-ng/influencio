import { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, ChevronDown, ChevronRight, Search, RotateCcw, Save, Check, ExternalLink, AlertTriangle, X } from 'lucide-react';
import {
  getSectionContent,
  saveSection,
  resetSection,
  resetPage,
  hasUnsavedChanges,
  getLastSaved,
  CMS_DEFAULTS,
} from '../../utils/cmsContent';

// ─── PAGE REGISTRY ─────────────────────────────────────────────────────────────

const PAGES = [
  { id: 'landing',     label: 'Home (Landing)', icon: '🏠', url: '/' },
  { id: 'for_talents', label: 'For Talents',    icon: '⭐', url: '/for-talents' },
  { id: 'for_brands',  label: 'For Brands',     icon: '🏢', url: '/for-brands' },
  { id: 'marketplace', label: 'Marketplace',    icon: '🛒', url: '/marketplace' },
  { id: 'jobs',        label: 'Job Board',      icon: '💼', url: '/jobs' },
  { id: 'global',      label: 'Global (Navbar / Footer / SEO)', icon: '🌐', url: null },
];

const SECTION_LABELS = {
  hero:         'Hero Section',
  stats:        'Stats Bar',
  how_it_works: 'How It Works',
  showcase:     'Talent Showcase',
  footer_cta:   'Footer CTA',
  benefits:     'Benefits',
  header:       'Page Header',
  navbar:       'Navbar',
  footer:       'Footer',
  seo:          'SEO / Meta',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function snakeToTitle(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(isoString) {
  if (!isoString) return null;
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function getFieldType(fieldName) {
  if (/_url$/.test(fieldName) || fieldName === 'video_url' || fieldName === 'image_url') return 'url';
  if (/color/.test(fieldName)) return 'color';
  if (/^(desc|subheadline|subtitle|tagline|subtext|meta_description)$/.test(fieldName)) return 'textarea';
  if (/_desc$/.test(fieldName)) return 'textarea';
  return 'text';
}

function isImageUrl(val) {
  return typeof val === 'string' && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(val);
}

function countCustomizedFields(pageId) {
  try {
    const raw = localStorage.getItem('brandiór_cms');
    if (!raw) return 0;
    const all = JSON.parse(raw);
    const pageData = all[pageId] ?? {};
    let count = 0;
    for (const section of Object.values(pageData)) {
      count += Object.keys(section).length;
    }
    return count;
  } catch {
    return 0;
  }
}

function pageHasOverrides(pageId) {
  try {
    const raw = localStorage.getItem('brandiór_cms');
    if (!raw) return false;
    const all = JSON.parse(raw);
    const pageData = all[pageId];
    if (!pageData) return false;
    return Object.values(pageData).some(s => Object.keys(s).length > 0);
  } catch {
    return false;
  }
}

function sectionHasOverrides(pageId, sectionId) {
  try {
    const raw = localStorage.getItem('brandiór_cms');
    if (!raw) return false;
    const all = JSON.parse(raw);
    return Object.keys(all?.[pageId]?.[sectionId] ?? {}).length > 0;
  } catch {
    return false;
  }
}

// ─── FIELD RENDERER ───────────────────────────────────────────────────────────

function FieldInput({ fieldName, value, onChange }) {
  const type = getFieldType(fieldName);
  const label = snakeToTitle(fieldName);

  const labelEl = (
    <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#94a3b8' }}>
      {label}
    </label>
  );

  if (type === 'color') {
    return (
      <div className="mb-4">
        {labelEl}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={e => onChange(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-gray-200"
          />
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
            style={{ borderColor: '#e2e8f0', focusRingColor: '#4f46e5' }}
            placeholder="#000000"
          />
        </div>
      </div>
    );
  }

  if (type === 'url') {
    return (
      <div className="mb-4">
        {labelEl}
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ borderColor: '#e2e8f0' }}
          placeholder="https:// or /path/to/file"
        />
        {isImageUrl(value) && (
          <div className="mt-2">
            <img
              src={value}
              alt="preview"
              className="h-16 rounded border object-cover"
              style={{ borderColor: '#e2e8f0' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="mb-4">
        {labelEl}
        <textarea
          rows={3}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          style={{ borderColor: '#e2e8f0' }}
        />
        <p className="text-right text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>
          {(value || '').length} chars
        </p>
      </div>
    );
  }

  // default text
  return (
    <div className="mb-4">
      {labelEl}
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
        style={{ borderColor: '#e2e8f0' }}
      />
    </div>
  );
}

// ─── LIVE PREVIEW ─────────────────────────────────────────────────────────────

function LivePreview({ sectionId, draft }) {
  if (!draft) return (
    <div className="flex items-center justify-center h-full text-sm" style={{ color: '#94a3b8' }}>
      Select a section to preview
    </div>
  );

  if (sectionId === 'hero') {
    return (
      <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #1a0030, #4f46e5)' }}>
        {draft.badge && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2" style={{ backgroundColor: '#ffffff22', color: '#c4b5fd' }}>
            {draft.badge}
          </span>
        )}
        {draft.headline && (
          <h3 className="text-white font-black text-lg leading-tight">{draft.headline}</h3>
        )}
        {draft.headline1 && (
          <h3 className="text-white font-black text-base leading-tight">
            {draft.headline1} {draft.headline2} <span style={{ color: '#c4b5fd' }}>{draft.headline3}</span>
          </h3>
        )}
        {draft.subheadline && (
          <p className="text-white/70 text-xs mt-1 leading-relaxed">{draft.subheadline}</p>
        )}
        <div className="flex gap-2 mt-3 flex-wrap">
          {draft.cta_primary && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white text-indigo-700">
              {draft.cta_primary}
            </span>
          )}
          {draft.cta_secondary && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full border border-white/40 text-white">
              {draft.cta_secondary}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (sectionId === 'stats') {
    const stats = [
      { val: draft.stat1_value, label: draft.stat1_label },
      { val: draft.stat2_value, label: draft.stat2_label },
      { val: draft.stat3_value, label: draft.stat3_label },
    ];
    return (
      <div className="p-4 rounded-xl bg-indigo-50">
        <div className="flex justify-around mb-2">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-black text-lg" style={{ color: '#4f46e5' }}>{s.val || '—'}</p>
              <p className="text-xs text-gray-500">{s.label || '—'}</p>
            </div>
          ))}
        </div>
        {draft.trust_text && (
          <p className="text-center text-xs text-gray-400 mt-1">{draft.trust_text}</p>
        )}
      </div>
    );
  }

  if (sectionId === 'how_it_works') {
    const steps = [
      { icon: draft.step1_icon, title: draft.step1_title },
      { icon: draft.step2_icon, title: draft.step2_title },
      { icon: draft.step3_icon, title: draft.step3_title },
    ];
    return (
      <div className="p-4 rounded-xl bg-slate-50">
        {draft.section_title && (
          <p className="font-bold text-sm mb-3" style={{ color: '#1e293b' }}>{draft.section_title}</p>
        )}
        <div className="flex gap-2 flex-wrap">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs bg-white rounded-lg px-2 py-1.5 border" style={{ borderColor: '#e2e8f0' }}>
              <span>{s.icon}</span>
              <span className="font-medium" style={{ color: '#1e293b' }}>{s.title || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sectionId === 'showcase') {
    return (
      <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #f3eeff, #e8d5ff)' }}>
        {draft.section_label && (
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#FF6B9D' }}>{draft.section_label}</p>
        )}
        {draft.section_title && (
          <p className="font-black text-base" style={{ color: '#1a0030' }}>
            {draft.section_title} <span style={{ color: '#7c3aed' }}>{draft.section_title_highlight}</span>
          </p>
        )}
        {draft.section_subtitle && (
          <p className="text-xs mt-1" style={{ color: '#6b21a8' }}>{draft.section_subtitle}</p>
        )}
        {draft.cta_text && (
          <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#7c3aed' }}>
            {draft.cta_text}
          </span>
        )}
      </div>
    );
  }

  if (sectionId === 'footer_cta') {
    return (
      <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
        {draft.headline && <p className="text-white font-black text-sm">{draft.headline}</p>}
        {draft.subtext && <p className="text-white/70 text-xs mt-1">{draft.subtext}</p>}
        <div className="flex gap-2 mt-3 flex-wrap">
          {draft.cta_brands && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white text-indigo-700">{draft.cta_brands}</span>
          )}
          {draft.cta_talents && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full border border-white/40 text-white">{draft.cta_talents}</span>
          )}
        </div>
      </div>
    );
  }

  // Generic preview: list field values
  const entries = Object.entries(draft).filter(([, v]) => v && typeof v === 'string');
  return (
    <div className="p-3 rounded-xl bg-slate-50 space-y-2">
      {entries.slice(0, 8).map(([k, v]) => (
        <div key={k}>
          <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#94a3b8' }}>{snakeToTitle(k)}</p>
          <p className="text-xs font-medium" style={{ color: '#1e293b' }}>{v}</p>
        </div>
      ))}
      {entries.length === 0 && (
        <p className="text-xs text-gray-400">No content yet.</p>
      )}
    </div>
  );
}

// ─── SECTION ACCORDION CARD ───────────────────────────────────────────────────

function SectionCard({ pageId, sectionId, isOpen, onToggle, onSectionSaved, onUnsavedChange, searchQuery }) {
  const defaults = CMS_DEFAULTS?.[pageId]?.[sectionId] ?? {};
  const [draft, setDraft] = useState(() => getSectionContent(pageId, sectionId));
  const [savedOk, setSavedOk] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Refresh draft when CMS updates externally
  useEffect(() => {
    const handler = e => {
      if (e.detail?.page === pageId) {
        setDraft(getSectionContent(pageId, sectionId));
      }
    };
    window.addEventListener('brandiór:cms-update', handler);
    return () => window.removeEventListener('brandiór:cms-update', handler);
  }, [pageId, sectionId]);

  const isDirty = hasUnsavedChanges(pageId, sectionId, draft);
  const hasOverrides = sectionHasOverrides(pageId, sectionId);
  const sectionLabel = SECTION_LABELS[sectionId] || snakeToTitle(sectionId);

  // Notify parent of unsaved state
  useEffect(() => {
    onUnsavedChange(sectionId, isDirty);
  }, [isDirty, sectionId, onUnsavedChange]);

  const handleChange = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveSection(pageId, sectionId, draft);
    setSavedOk(true);
    onSectionSaved();
    setTimeout(() => setSavedOk(false), 2000);
  };

  const handleReset = () => {
    resetSection(pageId, sectionId);
    setDraft(getSectionContent(pageId, sectionId));
    setResetConfirm(false);
  };

  // Filter fields by search query
  const fields = Object.keys(defaults);
  const visibleFields = searchQuery
    ? fields.filter(f =>
        f.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snakeToTitle(f).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(draft[f] || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : fields;

  if (searchQuery && visibleFields.length === 0) return null;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#e2e8f0', backgroundColor: '#fff' }}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm" style={{ color: '#1e293b' }}>{sectionLabel}</span>
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />
          )}
          {!isDirty && hasOverrides && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Has saved overrides" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasOverrides && (
            <button
              onClick={e => { e.stopPropagation(); setResetConfirm(true); }}
              className="text-xs font-medium hover:underline"
              style={{ color: '#ef4444' }}
            >
              Reset section
            </button>
          )}
          {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Reset confirm banner */}
      {resetConfirm && (
        <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: '#fef2f2', borderTop: '1px solid #fecaca' }}>
          <p className="text-xs font-medium" style={{ color: '#dc2626' }}>Reset "{sectionLabel}" to default content?</p>
          <div className="flex gap-2">
            <button onClick={() => setResetConfirm(false)} className="text-xs px-2 py-1 rounded border text-gray-600 hover:bg-white">Cancel</button>
            <button onClick={handleReset} className="text-xs px-2 py-1 rounded font-semibold text-white" style={{ backgroundColor: '#dc2626' }}>Reset</button>
          </div>
        </div>
      )}

      {/* Body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: '#f1f5f9' }}>
          {visibleFields.map(field => (
            <FieldInput
              key={field}
              fieldName={field}
              value={draft[field] ?? ''}
              onChange={val => handleChange(field, val)}
            />
          ))}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t" style={{ borderColor: '#f1f5f9' }}>
            <button
              onClick={() => setResetConfirm(true)}
              className="text-xs font-medium hover:underline"
              style={{ color: '#ef4444' }}
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: savedOk ? '#16a34a' : '#4f46e5' }}
            >
              {savedOk ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Section
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CmsEditor() {
  const [activePage, setActivePage] = useState('landing');
  const [openSection, setOpenSection] = useState(null);
  const [previewSection, setPreviewSection] = useState(null);
  const [previewDraft, setPreviewDraft] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSavedMap, setLastSavedMap] = useState({});
  const [unsavedSections, setUnsavedSections] = useState({});
  const [resetPageConfirm, setResetPageConfirm] = useState(false);
  const unsavedRef = useRef({});

  // Build last-saved map on mount + on CMS updates
  const refreshLastSaved = useCallback(() => {
    const map = {};
    for (const p of PAGES) {
      const ts = getLastSaved(p.id);
      if (ts) map[p.id] = ts;
    }
    setLastSavedMap(map);
  }, []);

  useEffect(() => {
    refreshLastSaved();
    const handler = () => refreshLastSaved();
    window.addEventListener('brandiór:cms-update', handler);
    return () => window.removeEventListener('brandiór:cms-update', handler);
  }, [refreshLastSaved]);

  const sections = Object.keys(CMS_DEFAULTS[activePage] ?? {});

  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    setOpenSection(null);
    setPreviewSection(null);
    setPreviewDraft(null);
    setUnsavedSections({});
    unsavedRef.current = {};
    setResetPageConfirm(false);
  };

  const handleToggleSection = (sectionId) => {
    const next = openSection === sectionId ? null : sectionId;
    setOpenSection(next);
    if (next) {
      setPreviewSection(next);
      setPreviewDraft(getSectionContent(activePage, next));
    }
  };

  const handleSectionSaved = () => {
    refreshLastSaved();
    if (previewSection) {
      setPreviewDraft(getSectionContent(activePage, previewSection));
    }
  };

  const handleUnsavedChange = useCallback((sectionId, isDirty) => {
    unsavedRef.current[sectionId] = isDirty;
    setUnsavedSections(prev => {
      if (prev[sectionId] === isDirty) return prev;
      return { ...prev, [sectionId]: isDirty };
    });
  }, []);

  const handleResetPage = () => {
    resetPage(activePage);
    setResetPageConfirm(false);
    setOpenSection(null);
    setPreviewDraft(null);
    refreshLastSaved();
  };

  // Update live preview draft whenever open section changes or user types
  // SectionCard handles its own draft; we listen to events to refresh preview
  useEffect(() => {
    const handler = e => {
      if (e.detail?.page === activePage && previewSection) {
        setPreviewDraft(getSectionContent(activePage, previewSection));
      }
    };
    window.addEventListener('brandiór:cms-update', handler);
    return () => window.removeEventListener('brandiór:cms-update', handler);
  }, [activePage, previewSection]);

  const dirtyNames = Object.entries(unsavedSections)
    .filter(([, v]) => v)
    .map(([k]) => SECTION_LABELS[k] || snakeToTitle(k));

  const currentPageMeta = PAGES.find(p => p.id === activePage);
  const customCount = countCustomizedFields(activePage);
  const totalFields = sections.reduce((sum, s) => sum + Object.keys(CMS_DEFAULTS[activePage]?.[s] ?? {}).length, 0);
  const lastSaved = lastSavedMap[activePage];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f8fafc' }}>

      {/* ── Top Header Bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-white flex items-center justify-between gap-4" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eef2ff' }}>
            <Globe className="w-5 h-5" style={{ color: '#4f46e5' }} />
          </div>
          <div>
            <h1 className="font-bold text-base" style={{ color: '#1e293b' }}>Content Manager</h1>
            <p className="text-xs" style={{ color: '#64748b' }}>Edit your website content without touching code</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs hidden md:block" style={{ color: '#94a3b8' }}>
            Changes are saved to your platform instantly
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search fields…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ borderColor: '#e2e8f0', width: '200px' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Three-Column Layout ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR: Page Tree ──────────────────────────────────── */}
        <aside
          className="flex-shrink-0 overflow-y-auto border-r"
          style={{ width: '220px', backgroundColor: '#0f172a', borderColor: '#1e293b' }}
        >
          <div className="px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#475569' }}>Pages</p>
            <nav className="space-y-1">
              {PAGES.map(page => {
                const isActive = activePage === page.id;
                const hasOverrides = pageHasOverrides(page.id);
                const ts = lastSavedMap[page.id];

                return (
                  <button
                    key={page.id}
                    onClick={() => handlePageChange(page.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActive ? '#312e81' : 'transparent',
                      border: isActive ? '1px solid #4f46e5' : '1px solid transparent',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base flex-shrink-0">{page.icon}</span>
                        <span
                          className="text-xs font-medium leading-tight truncate"
                          style={{ color: isActive ? '#e0e7ff' : '#94a3b8' }}
                        >
                          {page.label}
                        </span>
                      </div>
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: hasOverrides ? '#34d399' : '#334155' }}
                        title={hasOverrides ? 'Has customized content' : 'Using defaults'}
                      />
                    </div>
                    {ts && (
                      <p className="text-[10px] mt-0.5 pl-7" style={{ color: '#475569' }}>
                        Saved {timeAgo(ts)}
                      </p>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── MIDDLE PANEL: Section Accordions ─────────────────────────── */}
        <main className="flex-1 overflow-y-auto px-5 py-5">

          {/* Unsaved changes warning */}
          {dirtyNames.length > 0 && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
              style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                You have unsaved changes in: {dirtyNames.join(', ')}
              </span>
            </div>
          )}

          <div className="space-y-3">
            {sections.map(sectionId => (
              <SectionCard
                key={`${activePage}-${sectionId}`}
                pageId={activePage}
                sectionId={sectionId}
                isOpen={openSection === sectionId}
                onToggle={() => handleToggleSection(sectionId)}
                onSectionSaved={handleSectionSaved}
                onUnsavedChange={handleUnsavedChange}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </main>

        {/* ── RIGHT PANEL: Preview + Page Info ─────────────────────────── */}
        <aside
          className="flex-shrink-0 flex flex-col overflow-y-auto border-l"
          style={{ width: '300px', borderColor: '#e2e8f0' }}
        >

          {/* Live Preview */}
          <div className="p-4 border-b" style={{ borderColor: '#e2e8f0' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>
              Live Preview
            </p>
            <div className="min-h-[140px] flex flex-col justify-start">
              {previewSection && previewDraft ? (
                <LivePreview sectionId={previewSection} draft={previewDraft} />
              ) : (
                <div
                  className="flex items-center justify-center h-[140px] rounded-xl border-2 border-dashed text-xs text-center"
                  style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}
                >
                  Expand a section to<br />see a live preview
                </div>
              )}
            </div>

            {previewSection && (
              <p className="text-[10px] mt-2 font-medium" style={{ color: '#94a3b8' }}>
                Previewing: {SECTION_LABELS[previewSection] || snakeToTitle(previewSection)}
              </p>
            )}
          </div>

          {/* Page Info */}
          <div className="p-4 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>
              Page Info
            </p>

            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: '#e2e8f0' }}>

              {/* URL */}
              {currentPageMeta?.url && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#94a3b8' }}>Page URL</p>
                  <p className="text-xs font-mono font-medium" style={{ color: '#1e293b' }}>{currentPageMeta.url}</p>
                </div>
              )}

              {/* Last saved */}
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#94a3b8' }}>Last Saved</p>
                <p className="text-xs font-medium" style={{ color: '#1e293b' }}>
                  {lastSaved ? new Date(lastSaved).toLocaleString() : 'Never — using defaults'}
                </p>
              </div>

              {/* Customized fields */}
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#94a3b8' }}>Customized Fields</p>
                <p className="text-xs font-medium" style={{ color: '#1e293b' }}>
                  {customCount} of {totalFields} fields
                </p>
              </div>

              {/* Open page link */}
              {currentPageMeta?.url && (
                <a
                  href={currentPageMeta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                  style={{ color: '#4f46e5' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Page
                </a>
              )}

              {/* Reset entire page */}
              <div className="pt-2 border-t" style={{ borderColor: '#f1f5f9' }}>
                {resetPageConfirm ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium" style={{ color: '#dc2626' }}>
                      Reset all content for "{currentPageMeta?.label}" to defaults?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setResetPageConfirm(false)}
                        className="flex-1 text-xs py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResetPage}
                        className="flex-1 text-xs py-1.5 rounded-lg font-semibold text-white"
                        style={{ backgroundColor: '#dc2626' }}
                      >
                        Reset All
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResetPageConfirm(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors"
                    style={{ color: '#dc2626', border: '1px solid #fecaca' }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Entire Page
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
