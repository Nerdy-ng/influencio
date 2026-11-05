// Brandior canonical creator ranking — V1
// Phase 2 Architecture: 5 trigger-maintained signals, DB-persisted config

export const ALGO_DEFAULTS = {
  weights: { rating: 35, tier: 30, verified: 15, spark: 12, activity: 8 },
  activity_window_days: 90,
  newcomer_boost_enabled: false,
  newcomer_boost_days: 90,
  newcomer_boost_pct: 5,
}

const TIER_NORM = {
  'top-rated': 1.0,
  'next-rated': 0.60,
  'fast-rising': 0.25,
}

export function validateWeights(w) {
  if (!w || typeof w !== 'object') return false
  const keys = ['rating', 'tier', 'verified', 'spark', 'activity']
  for (const k of keys) {
    if (!Number.isFinite(Number(w[k])) || Number(w[k]) < 0) return false
  }
  const total = keys.reduce((s, k) => s + Number(w[k]), 0)
  return Math.abs(total - 100) < 0.5
}

export function parseAlgoConfig(raw) {
  if (!raw || typeof raw !== 'object') return { ...ALGO_DEFAULTS }
  if (!validateWeights(raw.weights)) return { ...ALGO_DEFAULTS }
  const w = raw.weights
  return {
    weights: {
      rating:   Number(w.rating),
      tier:     Number(w.tier),
      verified: Number(w.verified),
      spark:    Number(w.spark),
      activity: Number(w.activity),
    },
    activity_window_days:   Number.isFinite(Number(raw.activity_window_days)) && raw.activity_window_days >= 1 ? Number(raw.activity_window_days) : 90,
    newcomer_boost_enabled: raw.newcomer_boost_enabled === true,
    newcomer_boost_days:    Number.isFinite(Number(raw.newcomer_boost_days)) ? Number(raw.newcomer_boost_days) : 90,
    newcomer_boost_pct:     Number.isFinite(Number(raw.newcomer_boost_pct)) ? Number(raw.newcomer_boost_pct) : 5,
  }
}

// creator shape expected:
//   avgRating (0-5), tier (null|'fast-rising'|'next-rated'|'top-rated'),
//   identityVerified (bool), sparkEarned (bool),
//   updatedAt (ISO string|null), createdAt (ISO string|null)
export function calcScore(creator, config) {
  const cfg = config || ALGO_DEFAULTS
  const w = cfg.weights

  const rating_norm   = Math.min(1, Math.max(0, (Number(creator.avgRating) || 0) / 5))
  const tier_norm     = TIER_NORM[creator.tier] ?? 0
  const verified_norm = creator.identityVerified ? 1 : 0
  const spark_norm    = creator.sparkEarned ? 1 : 0

  let activity_norm = 0
  if (creator.updatedAt) {
    const days = (Date.now() - new Date(creator.updatedAt).getTime()) / 86400000
    activity_norm = Math.max(0, 1 - days / (cfg.activity_window_days || 90))
  }

  let score =
    rating_norm   * ((w.rating   || 0) / 100) +
    tier_norm     * ((w.tier     || 0) / 100) +
    verified_norm * ((w.verified || 0) / 100) +
    spark_norm    * ((w.spark    || 0) / 100) +
    activity_norm * ((w.activity || 0) / 100)

  if (cfg.newcomer_boost_enabled && creator.createdAt) {
    const daysSinceJoin = (Date.now() - new Date(creator.createdAt).getTime()) / 86400000
    if (daysSinceJoin < (cfg.newcomer_boost_days || 90)) {
      score += (cfg.newcomer_boost_pct || 5) / 100
    }
  }

  return Math.min(1, Math.max(0, Number.isFinite(score) ? score : 0))
}

// Module-level cache — loaded once per web session
let _cachedConfig = null

export async function loadAlgoConfig(supabaseClient) {
  if (_cachedConfig) return _cachedConfig
  try {
    const { data } = await supabaseClient
      .from('site_settings')
      .select('value')
      .eq('key', 'app_config')
      .maybeSingle()
    if (data?.value) {
      const parsed = JSON.parse(data.value)
      _cachedConfig = parseAlgoConfig(parsed?.algo)
    }
  } catch {}
  return _cachedConfig ?? { ...ALGO_DEFAULTS }
}

export function invalidateAlgoCache() {
  _cachedConfig = null
}
