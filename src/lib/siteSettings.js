import { supabase } from './supabase'

const KEYS = {
  platformName:       'setting_platformName',
  tagline:            'setting_tagline',
  maintenanceMode:    'setting_maintenanceMode',
  emailNotifications: 'setting_emailNotifications',
  platformFee:        'setting_platformFee',
  countries:          'setting_countries',
  heroVideo:          'setting_heroVideo',
  loginIllustration:  'setting_loginIllustration',
  tiktokPixelId:      'setting_tiktok_pixel_id',
  featureMarketplace:   'feature_marketplace',
  featureJobBoard:      'feature_job_board',
  featureCreatorSignup: 'feature_creator_signup',
  featureBrandSignup:   'feature_brand_signup',
  featureMessaging:     'feature_messaging',
  featureWallet:        'feature_wallet',
  featureReferrals:     'feature_referrals',
  featureReviews:       'feature_reviews',
  featureProposals:     'feature_proposals',
  featureAI:            'feature_ai',
}

const DEFAULTS = {
  platformName:       'Brandior',
  tagline:            'Connect. Create. Convert.',
  maintenanceMode:    false,
  emailNotifications: true,
  platformFee:        '10',
  countries:          ['Nigeria', 'South Africa', 'Kenya'],
  heroVideo:          '',
  loginIllustration:  '',
  tiktokPixelId:      'D866IKRC77UA4I5TEJ60',
  featureMarketplace:   true,
  featureJobBoard:      true,
  featureCreatorSignup: true,
  featureBrandSignup:   true,
  featureMessaging:     true,
  featureWallet:        true,
  featureReferrals:     true,
  featureReviews:       true,
  featureProposals:     true,
  featureAI:            true,
}

const CACHE_PREFIX = 'brandior_setting_'

// Synchronous read from localStorage cache (instant)
export function getSetting(key) {
  const raw = localStorage.getItem(CACHE_PREFIX + key)
  if (raw === null) return DEFAULTS[key]
  try { return JSON.parse(raw) } catch { return raw }
}

// Fire event so components update
function dispatch(key, value) {
  window.dispatchEvent(new CustomEvent('brandior:settings-updated', { detail: { key, value } }))
}

// Save one setting to Supabase + localStorage
export async function setSetting(key, value) {
  const dbKey = KEYS[key]
  if (!dbKey) return
  const serialised = JSON.stringify(value)
  localStorage.setItem(CACHE_PREFIX + key, serialised)
  dispatch(key, value)
  await supabase
    .from('site_settings')
    .upsert({ key: dbKey, value: serialised, updated_at: new Date().toISOString() })
}

// Fetch all settings from Supabase → update localStorage cache → fire events
export async function loadSettingsFromDB() {
  const dbKeys = Object.values(KEYS)
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', dbKeys)
  if (error || !data) return

  const dbToAppKey = Object.fromEntries(
    Object.entries(KEYS).map(([appKey, dbKey]) => [dbKey, appKey])
  )
  data.forEach(({ key, value }) => {
    const appKey = dbToAppKey[key]
    if (!appKey || value === null) return
    localStorage.setItem(CACHE_PREFIX + appKey, value)
    try { dispatch(appKey, JSON.parse(value)) } catch { dispatch(appKey, value) }
  })
}

export function getAllSettings() {
  return Object.fromEntries(Object.keys(KEYS).map(k => [k, getSetting(k)]))
}

export async function saveAllSettings(settingsObj) {
  await Promise.all(
    Object.entries(settingsObj)
      .filter(([k]) => KEYS[k])
      .map(([k, v]) => setSetting(k, v))
  )
}
