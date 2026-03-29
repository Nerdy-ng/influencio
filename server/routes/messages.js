import { Router } from 'express'

const router = Router()

// ── In-memory store ────────────────────────────────────────────────────────────

let conversations = []

let messages = []

let msgCounter = 20

// ── Helpers ────────────────────────────────────────────────────────────────────

function getConvForUser(userId, userType) {
  return conversations
    .filter(c => userType === 'brand' ? c.brandId === userId : c.talentId === userId)
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
}

// ── Routes ─────────────────────────────────────────────────────────────────────

// GET /api/messages/conversations?userId=&userType=
router.get('/conversations', (req, res) => {
  const { userId, userType } = req.query
  if (!userId || !userType) return res.status(400).json({ error: 'userId and userType required' })
  res.json({ conversations: getConvForUser(userId, userType) })
})

// GET /api/messages/conversations/:id
router.get('/conversations/:id', (req, res) => {
  const conv = conversations.find(c => c.id === req.params.id)
  if (!conv) return res.status(404).json({ error: 'Conversation not found' })
  res.json({ conversation: conv })
})

// Shared helper — also used by applications route
export function createConversation(brandId, talentId, talentName, brandName, talentAvatar, orderId, orderTitle) {
  let conv = conversations.find(c => c.brandId === brandId && c.talentId === talentId)
  if (!conv) {
    conv = {
      id: `conv_${Date.now()}`,
      brandId,
      talentId,
      talentName: talentName || 'Talent',
      brandName: brandName || 'Brand',
      talentAvatar: talentAvatar || `https://i.pravatar.cc/150?u=${talentId}`,
      orderId: orderId || null,
      orderTitle: orderTitle || null,
      lastMessage: null,
      lastMessageAt: new Date().toISOString(),
      unreadBrand: 0,
      unreadTalent: 0,
      createdAt: new Date().toISOString(),
    }
    conversations.push(conv)
  }
  return conv
}

// POST /api/messages/conversations — start or get existing conversation between brand + talent
router.post('/conversations', (req, res) => {
  const { brandId, talentId, talentName, brandName, talentAvatar, orderId, orderTitle } = req.body
  if (!brandId || !talentId) return res.status(400).json({ error: 'brandId and talentId required' })
  const conv = createConversation(brandId, talentId, talentName, brandName, talentAvatar, orderId, orderTitle)
  res.json({ conversation: conv })
})

// GET /api/messages/conversations/:id/messages
router.get('/conversations/:id/messages', (req, res) => {
  const { id } = req.params
  const conv = conversations.find(c => c.id === id)
  if (!conv) return res.status(404).json({ error: 'Conversation not found' })

  const thread = messages
    .filter(m => m.conversationId === id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  res.json({ messages: thread })
})

// POST /api/messages/conversations/:id/messages — send a message (text or offer)
router.post('/conversations/:id/messages', (req, res) => {
  const { id } = req.params
  const { senderId, senderType, body, type, offerData } = req.body
  if (!senderId || !senderType || !body?.trim()) {
    return res.status(400).json({ error: 'senderId, senderType, and body are required' })
  }

  const conv = conversations.find(c => c.id === id)
  if (!conv) return res.status(404).json({ error: 'Conversation not found' })

  const msg = {
    id: `msg_${++msgCounter}_${Date.now()}`,
    conversationId: id,
    senderId,
    senderType,
    body: body.trim(),
    type: type || 'text',
    offerData: type === 'offer' ? { ...offerData, status: 'pending' } : undefined,
    createdAt: new Date().toISOString(),
    read: false,
  }
  messages.push(msg)

  // Update conversation
  conv.lastMessage = msg.body
  conv.lastMessageAt = msg.createdAt
  if (senderType === 'brand') conv.unreadTalent += 1
  else conv.unreadBrand += 1

  res.status(201).json({ message: msg })
})

// PATCH /api/messages/:msgId/offer — update offer status (accepted | declined | countered)
router.patch('/:msgId/offer', (req, res) => {
  const { msgId } = req.params
  const { status } = req.body // 'accepted' | 'declined'
  const msg = messages.find(m => m.id === msgId)
  if (!msg || msg.type !== 'offer') return res.status(404).json({ error: 'Offer message not found' })
  msg.offerData = { ...msg.offerData, status }
  res.json({ message: msg })
})

// PATCH /api/messages/conversations/:id/read — mark all messages as read for a user
router.patch('/conversations/:id/read', (req, res) => {
  const { id } = req.params
  const { userId, userType } = req.body

  const conv = conversations.find(c => c.id === id)
  if (!conv) return res.status(404).json({ error: 'Conversation not found' })

  // Mark messages from the OTHER party as read
  messages
    .filter(m => m.conversationId === id && m.senderType !== userType)
    .forEach(m => { m.read = true })

  if (userType === 'brand') conv.unreadBrand = 0
  else conv.unreadTalent = 0

  res.json({ ok: true })
})

export default router
