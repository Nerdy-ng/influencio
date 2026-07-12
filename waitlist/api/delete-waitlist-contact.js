const RESEND_API_KEY = process.env.RESEND_API_KEY
const AUDIENCE_CREATORS = '44dedbc3-8ded-4ca8-a079-0e48b8e7566f'
const AUDIENCE_BRANDS   = '933656fe-8f8c-47dc-97a9-7fd5e53a6f37'

async function removeFromAudience(audienceId, email) {
  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
  })
  const data = await res.json()
  const contact = data?.data?.find(c => c.email === email)
  if (!contact) return

  await fetch(`https://api.resend.com/audiences/${audienceId}/contacts/${contact.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { type, old_record } = req.body
    if (type !== 'DELETE' || !old_record?.email) {
      return res.status(200).json({ message: 'Not a delete event, skipped' })
    }

    const { email, role } = old_record
    const audienceId = role === 'creator' ? AUDIENCE_CREATORS : AUDIENCE_BRANDS

    await removeFromAudience(audienceId, email)

    return res.status(200).json({ message: `Removed ${email} from Resend` })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
