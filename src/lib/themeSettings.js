import { supabase } from './supabase'

// CSS variable name → { db key, display label, default value, description }
export const THEME_VARS = {
  primary:        { key: 'theme_primary',          label: 'Primary Purple',                  default: '#7c3aed', desc: 'Active states, badges, focus rings' },
  secondary:      { key: 'theme_secondary',        label: 'Navbar (logged-out) / Accents',   default: '#c084fc', desc: 'Logged-out navbar background, pill borders' },
  navbarBg:       { key: 'theme_navbar_bg',        label: 'Navbar Background (logged in)',   default: '#e9d5ff', desc: 'Header strip when a user is logged in' },
  dark:           { key: 'theme_dark',             label: 'Dark Purple',                     default: '#4c1d95', desc: '"Get Started" button, deep accent fills' },
  cta:            { key: 'theme_cta',              label: 'CTA / Orange',                    default: '#FA8112', desc: '"Post a Job" and main call-to-action buttons' },
  pink:           { key: 'theme_pink',             label: 'Creator / Pink',                  default: '#FF6B9D', desc: 'Creator highlights, talent accent colour' },
  bodyBg:         { key: 'theme_body_bg',          label: 'Page Background',                 default: '#222222', desc: 'Site-wide body background colour' },
  bodyText:       { key: 'theme_body_text',        label: 'Body Text',                       default: '#FAF3E1', desc: 'Default text colour on dark backgrounds' },
  creatorDashBg:  { key: 'theme_creator_dash_bg',  label: 'Creator Dashboard Sidebar',       default: '#0d0020', desc: 'Creator (talent) dashboard sidebar & nav background' },
  creatorMenuBg:  { key: 'theme_creator_menu_bg',  label: 'Creator Dashboard Menu Color',    default: '#c084fc', desc: 'Active/hover colour for creator menu items' },
  brandDashBg:    { key: 'theme_brand_dash_bg',    label: 'Brand Dashboard Sidebar',         default: '#4c1d95', desc: 'Brand dashboard sidebar & nav background' },
  brandMenuBg:    { key: 'theme_brand_menu_bg',    label: 'Brand Dashboard Menu Color',      default: '#7c3aed', desc: 'Active/hover colour for brand menu items' },
}

// Apply a colors object to CSS custom properties on :root
export function applyTheme(colors = {}) {
  const root = document.documentElement
  Object.entries(THEME_VARS).forEach(([name, cfg]) => {
    root.style.setProperty(`--b-${name}`, colors[name] ?? cfg.default)
  })
}

// Return an object of defaults
export function getThemeDefaults() {
  return Object.fromEntries(Object.entries(THEME_VARS).map(([k, v]) => [k, v.default]))
}

// Fetch colours from Supabase → apply to :root → return colour object
export async function loadThemeFromDB() {
  const keys = Object.values(THEME_VARS).map(v => v.key)
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', keys)

  const keyToName = Object.fromEntries(
    Object.entries(THEME_VARS).map(([name, { key }]) => [key, name])
  )
  const colors = {}
  ;(data || []).forEach(({ key, value }) => {
    const name = keyToName[key]
    if (name && value) colors[name] = value
  })

  applyTheme(colors)
  return colors
}

// Save colours to Supabase → apply immediately
export async function saveThemeToDB(colors) {
  const rows = Object.entries(THEME_VARS).map(([name, { key }]) => ({
    key,
    value: colors[name] ?? THEME_VARS[name].default,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('site_settings').upsert(rows)
  if (error) throw error

  applyTheme(colors)
  window.dispatchEvent(new CustomEvent('brandior:theme-updated', { detail: colors }))
}

// Reset all colours back to defaults in DB and on screen
export async function resetThemeToDB() {
  await saveThemeToDB(getThemeDefaults())
}
