import { Router } from 'express'

const router = Router()

// ── in-memory notifications store
const notifications = []

// ─────────────────────────────────────────────────────────────────────────────
//  Internal utility — called by orders and payments routes
// ─────────────────────────────────────────────────────────────────────────────
export function createNotification(userId, type, title, body, metadata = {}) {
  const notification = {
    id:         newId(),
    user_id:    userId,
    type,
    title,
    body,
    read:       false,
    metadata,
    created_at: new Date().toISOString(),
  }
  notifications.push(notification)
  return notification
}

function newId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/notifications
//  Query: ?userId=
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { userId } = req.query

    let results = [...notifications]

    if (userId) {
      results = results.filter((n) => n.user_id === userId)
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const unreadCount = results.filter((n) => !n.read).length

    return res.json({ notifications: results, total: results.length, unreadCount })
  } catch (err) {
    console.error('[notifications] GET / error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/notifications/:id/read
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/read', (req, res) => {
  try {
    const idx = notifications.findIndex((n) => n.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Notification not found' })

    notifications[idx] = { ...notifications[idx], read: true }

    return res.json(notifications[idx])
  } catch (err) {
    console.error('[notifications] PATCH /:id/read error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
