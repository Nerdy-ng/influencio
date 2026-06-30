import { supabase } from './supabase'

// Returns an array of { date, count } for the last N days from a table
export async function getDailyCount(table, dateCol = 'created_at', days = 30, filter = {}) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  let query = supabase.from(table).select(dateCol).gte(dateCol, since.toISOString())
  Object.entries(filter).forEach(([k, v]) => { query = query.eq(k, v) })
  const { data } = await query

  // Build a map day => count
  const map = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    map[d.toISOString().slice(0, 10)] = 0
  }
  ;(data || []).forEach(row => {
    const day = new Date(row[dateCol]).toISOString().slice(0, 10)
    if (map[day] !== undefined) map[day]++
  })
  return Object.entries(map).map(([date, count]) => ({ date: date.slice(5), count })) // "MM-DD"
}

function dailyCountFromRows(rows, dateCol = 'created_at', days = 30) {
  const since = new Date(); since.setDate(since.getDate() - days)
  const recent = rows.filter(r => new Date(r[dateCol]) >= since)
  const dayMap = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  recent.forEach(r => {
    const day = new Date(r[dateCol]).toISOString().slice(0, 10)
    if (dayMap[day] !== undefined) dayMap[day]++
  })
  return Object.entries(dayMap).map(([date, count]) => ({ date: date.slice(5), count }))
}

export async function getBrandAnalytics(brandId) {
  const [collabsRes, reviewsRes] = await Promise.all([
    supabase.from('collabs').select('*').eq('brand_id', brandId),
    supabase.from('reviews').select('rating').eq('reviewer_id', brandId),
  ])
  const collabs = collabsRes.data || []
  const reviews = reviewsRes.data || []

  const completed = collabs.filter(c => c.status === 'completed').length
  const cancelled = collabs.filter(c => c.status === 'cancelled').length
  const pending = collabs.filter(c => c.status === 'pending').length
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null
  const totalSpent = collabs
    .filter(c => ['paid', 'released'].includes(c.payment_status))
    .reduce((s, c) => s + (c.total_amount || 0), 0)

  // Top creators by number of collabs
  const creatorIds = [...new Set(collabs.map(c => c.creator_id))]
  let topCreators = []
  if (creatorIds.length > 0) {
    const { data: creators } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', creatorIds)
    const nameMap = {}
    ;(creators || []).forEach(c => { nameMap[c.id] = c.full_name })
    const countMap = {}
    collabs.forEach(c => {
      const name = nameMap[c.creator_id] || 'Creator'
      countMap[c.creator_id] = countMap[c.creator_id] || { title: name, count: 0 }
      countMap[c.creator_id].count++
    })
    topCreators = Object.values(countMap).sort((a, b) => b.count - a.count).slice(0, 5)
  }

  const dailyCollabs = dailyCountFromRows(collabs, 'created_at', 30)

  return { totalCollabs: collabs.length, completed, cancelled, pending, totalSpent, avgRating, topCreators, dailyCollabs }
}

export async function getTalentAnalytics(talentId) {
  const [collabsRes, reviewsRes] = await Promise.all([
    supabase.from('collabs').select('*').eq('creator_id', talentId),
    supabase.from('reviews').select('*').eq('talent_id', talentId),
  ])
  const collabs = collabsRes.data || []
  const reviews = reviewsRes.data || []

  const completed = collabs.filter(c => c.status === 'completed').length
  const cancelled = collabs.filter(c => c.status === 'cancelled').length
  const pending = collabs.filter(c => c.status === 'pending').length
  const successRate = collabs.length ? Math.round((completed / collabs.length) * 100) : 0
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null
  const totalEarned = collabs
    .filter(c => c.payment_status === 'released')
    .reduce((s, c) => s + (c.creator_payout || 0), 0)

  const dailyCollabs = dailyCountFromRows(collabs, 'created_at', 30)

  return { totalCollabs: collabs.length, completed, cancelled, pending, successRate, avgRating, totalReviews: reviews.length, totalEarned, dailyCollabs }
}
