const PHYLLO_BASE_URL = 'https://api.staging.getphyllo.com'

function basicAuth() {
  const CLIENT_ID = process.env.PHYLLO_CLIENT_ID
  const CLIENT_SECRET = process.env.PHYLLO_CLIENT_SECRET
  return Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phyllo_user_id, products } = req.body
  if (!phyllo_user_id) return res.status(400).json({ error: 'phyllo_user_id is required' })

  try {
    const response = await fetch(`${PHYLLO_BASE_URL}/v1/sdk-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth()}`,
      },
      body: JSON.stringify({
        user_id: phyllo_user_id,
        products: products || ['IDENTITY', 'ENGAGEMENT'],
      }),
    })

    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data })

    res.json({ sdk_token: data.sdk_token, expires_at: data.expires_at })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate SDK token' })
  }
}
