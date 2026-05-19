import crypto from 'crypto'

const PIXEL_ID = 'D866IKRC77UA4I5TEJ60'

function sha256(value) {
  if (!value) return undefined
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const accessToken = process.env.TIKTOK_ACCESS_TOKEN
  if (!accessToken) return res.status(500).json({ error: 'TIKTOK_ACCESS_TOKEN not configured' })

  const { event, email, phone, url, properties = {} } = req.body
  if (!event) return res.status(400).json({ error: 'Missing event name' })

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress
  const userAgent = req.headers['user-agent'] || ''

  const payload = {
    pixel_code: PIXEL_ID,
    events: [
      {
        event,
        event_id: crypto.randomUUID(),
        event_time: Math.floor(Date.now() / 1000),
        user: {
          ...(email  && { email:  sha256(email)  }),
          ...(phone  && { phone:  sha256(phone)  }),
          ...(ip     && { ip }),
          ...(userAgent && { user_agent: userAgent }),
        },
        page: { url: url || 'https://www.brandior.africa' },
        properties: {
          currency: 'USD',
          value: 0,
          content_name: 'Brandior Waitlist',
          content_type: 'product',
          ...properties,
        },
      },
    ],
  }

  const tiktokRes = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
    method: 'POST',
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await tiktokRes.json()
  return res.status(200).json(data)
}
