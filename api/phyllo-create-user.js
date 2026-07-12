const PHYLLO_BASE_URL = 'https://api.staging.getphyllo.com'

function basicAuth() {
  const CLIENT_ID = process.env.PHYLLO_CLIENT_ID
  const CLIENT_SECRET = process.env.PHYLLO_CLIENT_SECRET
  return Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id, name } = req.body
  if (!user_id) return res.status(400).json({ error: 'user_id is required' })

  try {
    const response = await fetch(`${PHYLLO_BASE_URL}/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth()}`,
      },
      body: JSON.stringify({ name: name || 'Brandior User', external_id: user_id }),
    })

    const data = await response.json()

    // If user already exists with this external_id, fetch them instead
    if (!response.ok && data?.error?.error_code === 'user_exists_with_external_id') {
      const listRes = await fetch(`${PHYLLO_BASE_URL}/v1/users?external_id=${user_id}`, {
        headers: { 'Authorization': `Basic ${basicAuth()}` }
      })
      const listData = await listRes.json()
      const existing = listData.data?.[0]
      if (existing) return res.json({ phyllo_user_id: existing.id, external_id: existing.external_id })
    }

    if (!response.ok) return res.status(response.status).json({ error: data })

    res.json({ phyllo_user_id: data.id, external_id: data.external_id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create Phyllo user' })
  }
}
