// Site-wide settings — reads/writes from localStorage, dispatches events on change.
// Admin panel uses setSetting() to write; components use getSetting() to read.

const KEYS = {
  platformName:       'brandior_setting_platformName',
  tagline:            'brandior_setting_tagline',
  maintenanceMode:    'brandior_setting_maintenanceMode',
  emailNotifications: 'brandior_setting_emailNotifications',
  platformFee:        'brandior_setting_platformFee',
  countries:          'brandior_setting_countries',
}

const DEFAULTS = {
  platformName:       'Brandiór',
  tagline:            'Connect. Create. Convert.',
  maintenanceMode:    false,
  emailNotifications: true,
  platformFee:        '10',
  countries:          ['Nigeria', 'South Africa', 'Kenya'],
}

export function getSetting(key) {
  const raw = localStorage.getItem(KEYS[key])
  if (raw === null) return DEFAULTS[key]
  try { return JSON.parse(raw) } catch { return raw }
}

export function setSetting(key, value) {
  localStorage.setItem(KEYS[key], JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('brandior:settings-updated', { detail: { key, value } }))
}

export function getAllSettings() {
  return Object.fromEntries(Object.keys(KEYS).map(k => [k, getSetting(k)]))
}

export function saveAllSettings(settingsObj) {
  Object.entries(settingsObj).forEach(([k, v]) => {
    if (KEYS[k]) setSetting(k, v)
  })
}
