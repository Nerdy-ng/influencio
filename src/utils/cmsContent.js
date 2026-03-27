// ─── CMS CONTENT UTILITY ─────────────────────────────────────────────────────
// Pure JS module. No React. Manages editable website content stored in
// localStorage['brandiór_cms'].

const STORAGE_KEY = 'brandiór_cms';
const TIMESTAMPS_KEY = 'brandiór_cms_timestamps';

export const CMS_DEFAULTS = {
  landing: {
    hero: {
      badge: "Africa's #1 Creator Economy Platform",
      headline1: 'Built for Brands.',
      headline2: 'Fueled by',
      headline3: 'Creativity.',
      subheadline: 'We connect brands and entrepreneurs with talents who bring visions to life.',
      cta_primary: 'Grow Your Business',
      cta_secondary: 'Earn as a Talent',
      video_url: '/videos/hero-bg.mp4',
    },
    stats: {
      stat1_value: '500+',
      stat1_label: 'Brands',
      stat2_value: '1,000+',
      stat2_label: 'Talents',
      stat3_value: '₦50M+',
      stat3_label: 'Paid Out',
      trust_text: 'already at home in the Hive.',
    },
    how_it_works: {
      section_label: 'Simple Process',
      section_title: 'How Brandiór Works',
      step1_icon: '🔍',
      step1_title: 'Discover Talents',
      step1_desc: 'Browse our verified creator marketplace filtered by niche, platform, location and engagement.',
      step2_icon: '🤝',
      step2_title: 'Launch a Campaign',
      step2_desc: 'Brief your chosen talent, agree on deliverables and lock in your budget securely.',
      step3_icon: '🚀',
      step3_title: 'Grow Together',
      step3_desc: 'Content goes live, performance is tracked, payment is released on approval.',
    },
    showcase: {
      section_label: 'Talent Marketplace',
      section_title: 'Hire',
      section_title_highlight: 'Talents',
      section_subtitle: 'Creators bringing culture, creativity, and community to every campaign.',
      cta_text: 'Hire Talents',
    },
    footer_cta: {
      headline: 'Ready to grow with the Hive?',
      subtext: 'Join thousands of brands and creators already collaborating on Brandiór.',
      cta_brands: 'Start as a Brand',
      cta_talents: 'Join as a Talent',
    },
  },
  for_talents: {
    hero: {
      badge: 'For Creators',
      headline: 'Turn Your Audience Into Income',
      subheadline: 'Brands are searching for creators like you. Get paid to create content you love.',
      cta_primary: 'Start Earning',
      cta_secondary: 'See How It Works',
    },
    benefits: {
      title: 'Why Talents Love Brandiór',
      benefit1_title: 'Get Discovered',
      benefit1_desc: 'Your profile is visible to hundreds of brands actively looking for creators.',
      benefit2_title: 'Secure Payments',
      benefit2_desc: 'Funds are held in escrow and released only when you deliver.',
      benefit3_title: 'Grow Your Tier',
      benefit3_desc: 'The more campaigns you complete, the higher your tier and earnings.',
    },
  },
  for_brands: {
    hero: {
      badge: 'For Brands',
      headline: 'Find the Right Creator. Every Time.',
      subheadline: 'Access a verified marketplace of African creators ready to amplify your brand.',
      cta_primary: 'Find Talents Now',
      cta_secondary: 'See Pricing',
    },
    benefits: {
      title: 'Why Brands Choose Brandiór',
      benefit1_title: 'Verified Creators',
      benefit1_desc: 'Every talent is vetted for authenticity, engagement quality and content standards.',
      benefit2_title: 'Campaign Management',
      benefit2_desc: 'Brief, review, approve and pay — all in one dashboard.',
      benefit3_title: 'Performance Tracking',
      benefit3_desc: 'Real-time insights on reach, engagement and ROI for every campaign.',
    },
  },
  marketplace: {
    header: {
      title: 'Creator Marketplace',
      subtitle: 'Discover and hire verified African content creators for your next campaign.',
      search_placeholder: 'Search creators by name, niche or location…',
    },
  },
  jobs: {
    header: {
      title: 'Brand Campaigns',
      subtitle: 'Discover paid collaborations posted by brands looking for creators like you.',
      badge: 'Job Board',
    },
  },
  global: {
    navbar: {
      logo_text: 'Brandiór',
      tagline: 'Creator Economy Platform',
    },
    footer: {
      tagline: 'Connecting African brands with creators who matter.',
      copyright: '© 2026 Brandiór. All rights reserved.',
      email: 'hello@brandior.co',
    },
    seo: {
      site_title: "Brandiór — Africa's Creator Economy Platform",
      meta_description: 'Connect brands with African content creators. Launch campaigns, manage deliverables, and grow together.',
    },
  },
};

// ─── PRIVATE HELPERS ──────────────────────────────────────────────────────────

function _loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function _saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage quota exceeded or private mode — fail silently
  }
}

function _loadTimestamps() {
  try {
    const raw = localStorage.getItem(TIMESTAMPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function _saveTimestamps(ts) {
  try {
    localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(ts));
  } catch {}
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Returns a single field value from CMS data, with fallback to defaults then ''.
 * @param {string} page
 * @param {string} section
 * @param {string} field
 * @returns {string}
 */
export function getContent(page, section, field) {
  const all = _loadAll();
  const saved = all?.[page]?.[section]?.[field];
  if (saved !== undefined && saved !== null) return saved;
  const def = CMS_DEFAULTS?.[page]?.[section]?.[field];
  if (def !== undefined && def !== null) return def;
  return '';
}

/**
 * Returns merged object of defaults + saved overrides for a section.
 * @param {string} page
 * @param {string} section
 * @returns {object}
 */
export function getSectionContent(page, section) {
  const defaults = CMS_DEFAULTS?.[page]?.[section] ?? {};
  const all = _loadAll();
  const saved = all?.[page]?.[section] ?? {};
  return { ...defaults, ...saved };
}

/**
 * Returns full page content — all sections merged.
 * @param {string} page
 * @returns {object}
 */
export function getPageContent(page) {
  const pageDefaults = CMS_DEFAULTS?.[page] ?? {};
  const all = _loadAll();
  const savedPage = all?.[page] ?? {};

  const result = {};
  const allSections = new Set([...Object.keys(pageDefaults), ...Object.keys(savedPage)]);
  for (const section of allSections) {
    result[section] = {
      ...(pageDefaults[section] ?? {}),
      ...(savedPage[section] ?? {}),
    };
  }
  return result;
}

/**
 * Saves section data to localStorage and dispatches a 'brandiór:cms-update' event.
 * @param {string} page
 * @param {string} section
 * @param {object} data
 */
export function saveSection(page, section, data) {
  const all = _loadAll();
  if (!all[page]) all[page] = {};
  all[page][section] = { ...(all[page][section] ?? {}), ...data };
  _saveAll(all);
  saveLastSaved(page);
  window.dispatchEvent(new CustomEvent('brandiór:cms-update', { detail: { page, section } }));
}

/**
 * Removes saved overrides for a section (reverts to defaults).
 * @param {string} page
 * @param {string} section
 */
export function resetSection(page, section) {
  const all = _loadAll();
  if (all[page]) {
    delete all[page][section];
    if (Object.keys(all[page]).length === 0) delete all[page];
  }
  _saveAll(all);
  window.dispatchEvent(new CustomEvent('brandiór:cms-update', { detail: { page, section } }));
}

/**
 * Resets all sections for a page.
 * @param {string} page
 */
export function resetPage(page) {
  const all = _loadAll();
  delete all[page];
  _saveAll(all);
  const ts = _loadTimestamps();
  delete ts[page];
  _saveTimestamps(ts);
  window.dispatchEvent(new CustomEvent('brandiór:cms-update', { detail: { page, section: null } }));
}

/**
 * Compares draft to saved overrides and returns true if there are unsaved changes.
 * @param {string} page
 * @param {string} section
 * @param {object} draftData
 * @returns {boolean}
 */
export function hasUnsavedChanges(page, section, draftData) {
  const saved = getSectionContent(page, section);
  const draftKeys = Object.keys(draftData);
  for (const key of draftKeys) {
    if (String(draftData[key]) !== String(saved[key] ?? '')) return true;
  }
  return false;
}

/**
 * Returns ISO timestamp of last save for a page, or null.
 * @param {string} page
 * @returns {string|null}
 */
export function getLastSaved(page) {
  const ts = _loadTimestamps();
  return ts[page] ?? null;
}

/**
 * Updates the last saved timestamp for a page.
 * @param {string} page
 */
export function saveLastSaved(page) {
  const ts = _loadTimestamps();
  ts[page] = new Date().toISOString();
  _saveTimestamps(ts);
}
