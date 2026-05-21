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

export async function getBrandAnalytics(brandId) {
  const [appsRes, jobsRes, reviewsRes] = await Promise.all([
    supabase.from('applications').select('*').eq('brand_id', brandId),
    supabase.from('jobs').select('*').eq('brand_id', brandId),
    supabase.from('reviews').select('rating').eq('reviewer_id', brandId),
  ])
  const apps = appsRes.data || []
  const jobs = jobsRes.data || []
  const reviews = reviewsRes.data || []

  const accepted = apps.filter(a => a.status === 'accepted').length
  const rejected = apps.filter(a => a.status === 'rejected').length
  const pending = apps.filter(a => a.status === 'pending').length
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // Applications per job
  const jobMap = {}
  jobs.forEach(j => { jobMap[j.id] = { title: j.title, count: 0 } })
  apps.forEach(a => { if (jobMap[a.job_id]) jobMap[a.job_id].count++ })
  const appsPerJob = Object.values(jobMap).sort((a, b) => b.count - a.count).slice(0, 5)

  // Daily applications last 30 days
  const since = new Date(); since.setDate(since.getDate() - 30)
  const recentApps = apps.filter(a => new Date(a.created_at) >= since)
  const dayMap = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  recentApps.forEach(a => {
    const day = new Date(a.created_at).toISOString().slice(0, 10)
    if (dayMap[day] !== undefined) dayMap[day]++
  })
  const dailyApps = Object.entries(dayMap).map(([date, count]) => ({ date: date.slice(5), count }))

  return { totalApps: apps.length, accepted, rejected, pending, totalJobs: jobs.length, avgRating, appsPerJob, dailyApps }
}

export async function getTalentAnalytics(talentId) {
  const [appsRes, reviewsRes] = await Promise.all([
    supabase.from('applications').select('*').eq('talent_id', talentId),
    supabase.from('reviews').select('*').eq('talent_id', talentId),
  ])
  const apps = appsRes.data || []
  const reviews = reviewsRes.data || []

  const accepted = apps.filter(a => a.status === 'accepted').length
  const rejected = apps.filter(a => a.status === 'rejected').length
  const pending = apps.filter(a => a.status === 'pending').length
  const successRate = apps.length ? Math.round((accepted / apps.length) * 100) : 0
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // Daily applications last 30 days
  const since = new Date(); since.setDate(since.getDate() - 30)
  const recentApps = apps.filter(a => new Date(a.created_at) >= since)
  const dayMap = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  recentApps.forEach(a => {
    const day = new Date(a.created_at).toISOString().slice(0, 10)
    if (dayMap[day] !== undefined) dayMap[day]++
  })
  const dailyApps = Object.entries(dayMap).map(([date, count]) => ({ date: date.slice(5), count }))

  return { totalApps: apps.length, accepted, rejected, pending, successRate, avgRating, totalReviews: reviews.length, dailyApps }
}
