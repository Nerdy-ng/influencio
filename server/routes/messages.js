import { Router } from 'express'

const router = Router()

// ── In-memory store ────────────────────────────────────────────────────────────

let conversations = [
  {
    id: 'conv_001',
    brandId: 'brand_demo',
    talentId: 'talent_001',
    talentName: 'Adaeze Okafor',
    brandName: 'DemoHub',
    talentAvatar: 'https://i.pravatar.cc/150?u=adaeze_okafor',
    orderId: 'order_001',
    orderTitle: 'Instagram Reel Package',
    lastMessage: 'Sure! I'll have the first draft ready by Friday.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    unreadBrand: 1,
    unreadTalent: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'conv_002',
    brandId: 'brand_demo',
    talentId: 'talent_003',
    talentName: 'Chiamaka Eze',
    brandName: 'DemoHub',
    talentAvatar: 'https://i.pravatar.cc/150?u=chiamaka_eze',
    orderId: 'order_002',
    orderTitle: 'YouTube Integration',
    lastMessage: 'Can you send over the product samples by Wednesday?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    unreadBrand: 0,
    unreadTalent: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'conv_003',
    brandId: 'brand_demo',
    talentId: 'talent_005',
    talentName: 'Tunde Bakare',
    brandName: 'DemoHub',
    talentAvatar: 'https://i.pravatar.cc/150?u=tunde_bakare',
    orderId: null,
    orderTitle: null,
    lastMessage: 'Hey! Interested in a long-term partnership?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadBrand: 0,
    unreadTalent: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
]

let messages = [
  // conv_001
  { id: 'msg_001', conversationId: 'conv_001', senderId: 'brand_demo', senderType: 'brand', body: 'Hi Adaeze! We love your content style. Just placed an order for the Instagram Reel package.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: true },
  { id: 'msg_002', conversationId: 'conv_001', senderId: 'talent_001', senderType: 'talent', body: 'Thank you so much! I\'m excited to work on this. Could you share more details about the product tone you\'re going for?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(), read: true },
  { id: 'msg_003', conversationId: 'conv_001', senderId: 'brand_demo', senderType: 'brand', body: 'We\'re going for a fun, youthful vibe. Think vibrant energy, upbeat music, and a 30-second hook that drives people to the link in bio.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(), read: true },
  { id: 'msg_004', conversationId: 'conv_001', senderId: 'talent_001', senderType: 'talent', body: 'Perfect! That\'s totally my style. I\'ll send a draft script for approval before shooting. Do you have any reference reels you like?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
  { id: 'msg_005', conversationId: 'conv_001', senderId: 'brand_demo', senderType: 'brand', body: 'Yes! Check out @chicstyle.ng and @lagoslife.official — something in that direction. We\'ll send over product samples today.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: true },
  { id: 'msg_006', conversationId: 'conv_001', senderId: 'talent_001', senderType: 'talent', body: 'Sure! I\'ll have the first draft ready by Friday.', createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), read: false },

  // conv_002
  { id: 'msg_007', conversationId: 'conv_002', senderId: 'talent_003', senderType: 'talent', body: 'Hi! I received the order. Really looking forward to this YouTube integration. Quick question — is the product available in Abuja or only Lagos?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), read: true },
  { id: 'msg_008', conversationId: 'conv_002', senderId: 'brand_demo', senderType: 'brand', body: 'We can ship nationwide! I\'ll have our team contact you with logistics details.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(), read: true },
  { id: 'msg_009', conversationId: 'conv_002', senderId: 'talent_003', senderType: 'talent', body: 'Great. I\'m thinking a 5-minute dedicated segment at the 3-minute mark. It\'ll get the highest retention. Does that work?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), read: true },
  { id: 'msg_010', conversationId: 'conv_002', senderId: 'brand_demo', senderType: 'brand', body: 'Sounds perfect! Let\'s do it.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(), read: true },
  { id: 'msg_011', conversationId: 'conv_002', senderId: 'talent_003', senderType: 'talent', body: 'Can you send over the product samples by Wednesday?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), read: false },

  // conv_003
  { id: 'msg_012', conversationId: 'conv_003', senderId: 'brand_demo', senderType: 'brand', body: 'Hi Tunde! We\'ve been following your tech content and it\'s impressive. Would you be open to a long-term ambassador deal?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), read: true },
  { id: 'msg_013', conversationId: 'conv_003', senderId: 'talent_005', senderType: 'talent', body: 'Hey! Interested in a long-term partnership?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
]

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

// POST /api/messages/conversations — start or get existing conversation between brand + talent
router.post('/conversations', (req, res) => {
  const { brandId, talentId, talentName, brandName, talentAvatar, orderId, orderTitle } = req.body
  if (!brandId || !talentId) return res.status(400).json({ error: 'brandId and talentId required' })

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
