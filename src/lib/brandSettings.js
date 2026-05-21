import { supabase } from './supabase'

export const LOGO_SLOTS = {
  header:    { key: 'logo_header',    label: 'Header / Navbar Logo' },
  footer:    { key: 'logo_footer',    label: 'Footer Logo' },
  auth:      { key: 'logo_auth',      label: 'Login & Signup Logo' },
  landing:   { key: 'logo_landing',   label: 'Landing Page Logo' },
  dashboard: { key: 'logo_dashboard', label: 'Dashboard Sidebar Logo' },
}

const CACHE_PREFIX = 'brandior_logo_'

const SLOT_DEFAULTS = {
  header:    '/logo.png',
  footer:    '/logo.png',
  auth:      '/Brandio.png',
  landing:   '/logo.png',
  dashboard: '/logo.png',
}

// Synchronous read from localStorage cache (for instant initial render)
export function getLogo(slot) {
  const config = LOGO_SLOTS[slot]
  if (!config) return '/logo.png'
  return localStorage.getItem(CACHE_PREFIX + slot) || SLOT_DEFAULTS[slot] || '/logo.png'
}

// Convert a File to a base64 data URL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Upload: convert to base64, save to site_settings table + localStorage
// No Supabase Storage bucket required.
export async function uploadLogoFile(slot, file) {
  const config = LOGO_SLOTS[slot]
  if (!config) throw new Error('Invalid slot: ' + slot)
  const dataUrl = await fileToDataUrl(file)
  await saveLogoUrl(slot, dataUrl)
  return dataUrl
}

// Persist logo value (data URL or remote URL) to Supabase + localStorage cache
export async function saveLogoUrl(slot, url) {
  const config = LOGO_SLOTS[slot]
  if (!config) return

  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: config.key, value: url || null, updated_at: new Date().toISOString() })
  if (error) throw error

  if (url) {
    localStorage.setItem(CACHE_PREFIX + slot, url)
  } else {
    localStorage.removeItem(CACHE_PREFIX + slot)
  }
  window.dispatchEvent(new CustomEvent('brandior:logo-updated', { detail: { slot } }))
}

// Fetch all logo values from Supabase → rebuild localStorage cache → fire event
export async function loadLogosFromDB() {
  const keys = Object.values(LOGO_SLOTS).map(s => s.key)
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', keys)
  if (error || !data) return

  const keyToSlot = Object.fromEntries(
    Object.entries(LOGO_SLOTS).map(([slot, { key }]) => [key, slot])
  )

  // Update cache from DB — only clear slots that are genuinely absent from DB
  const seen = new Set()
  data.forEach(({ key, value }) => {
    const slot = keyToSlot[key]
    if (!slot) return
    seen.add(slot)
    if (value) localStorage.setItem(CACHE_PREFIX + slot, value)
    else localStorage.removeItem(CACHE_PREFIX + slot)
  })
  Object.keys(LOGO_SLOTS).forEach(slot => {
    if (!seen.has(slot)) localStorage.removeItem(CACHE_PREFIX + slot)
  })

  window.dispatchEvent(new CustomEvent('brandior:logo-updated', { detail: { slot: 'all' } }))
}

export async function removeLogoFromDB(slot) {
  const config = LOGO_SLOTS[slot]
  if (!config) return
  await supabase.from('site_settings').delete().eq('key', config.key)
  localStorage.removeItem(CACHE_PREFIX + slot)
  window.dispatchEvent(new CustomEvent('brandior:logo-updated', { detail: { slot } }))
}

// Legacy sync shims
export function setLogo(slot, url) {
  saveLogoUrl(slot, url).catch(console.error)
}
export function removeLogo(slot) {
  removeLogoFromDB(slot).catch(console.error)
}
