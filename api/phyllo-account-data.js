const PHYLLO_BASE_URL = 'https://api.staging.getphyllo.com'

function basicAuth() {
  const CLIENT_ID = process.env.PHYLLO_CLIENT_ID
  const CLIENT_SECRET = process.env.PHYLLO_CLIENT_SECRET
  return Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id, account_id } = req.query
  if (!user_id || !account_id) return res.status(400).json({ error: 'user_id and account_id required' })

  try {
    const [profileRes, engagementRes] = await Promise.all([
      fetch(`${PHYLLO_BASE_URL}/v1/profiles?account_id=${account_id}&user_id=${user_id}`, {
        headers: { 'Authorization': `Basic ${basicAuth()}` }
      }),
      fetch(`${PHYLLO_BASE_URL}/v1/social/analytics/1d?account_id=${account_id}&user_id=${user_id}`, {
        headers: { 'Authorization': `Basic ${basicAuth()}` }
      }),
    ])

    const profileData = await profileRes.json()
    const engagementData = engagementRes.ok ? await engagementRes.json() : null

    const profile = profileData.data?.[0] || {}
    const engagement = engagementData?.data?.[0] || {}

    res.json({
      handle: profile.url || profile.username || '',
      followers: profile.follower_count || 0,
      engagement_rate: engagement.engagement_rate || profile.engagement_rate || 0,
      full_name: profile.full_name || '',
      profile_pic: profile.image_url || '',
      platform: profile.work_platform?.name || '',
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch account data' })
  }
}
