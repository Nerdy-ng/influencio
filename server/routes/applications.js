import { Router } from 'express'
import { createNotification } from './notifications.js'
import { createConversation } from './messages.js'

const router = Router()

// ── In-memory store ─────────────────────────────────────────────────────────
let applications = []
let counter = 0

function newId() {
  return `app_${++counter}_${Date.now()}`
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/applications  — talent submits a proposal
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const {
    jobId, jobTitle, brandId,
    talentId, talentName, talentHandle, talentAvatar,
    message, rate, rateCard,
  } = req.body

  if (!jobId || !talentId || !message?.trim()) {
    return res.status(400).json({ error: 'jobId, talentId, and message are required' })
  }

  // Prevent duplicate applications for same job
  const existing = applications.find(a => a.jobId === jobId && a.talentId === talentId)
  if (existing) return res.json({ application: existing, alreadyApplied: true })

  const app = {
    id: newId(),
    jobId,
    jobTitle: jobTitle || 'Campaign',
    brandId: brandId || null,
    talentId,
    talentName: talentName || 'Creator',
    talentHandle: talentHandle || '',
    talentAvatar: talentAvatar || `https://i.pravatar.cc/150?u=${talentId}`,
    message: message.trim(),
    rate: rate || null,
    rateCard: rateCard || null,
    status: 'pending',      // pending | accepted | rejected
    conversationId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  applications.push(app)

  // Notify the brand
  if (brandId) {
    createNotification(
      brandId,
      'new_application',
      'New Proposal Received',
      `${talentName || 'A creator'} submitted a proposal for "${jobTitle || 'your campaign'}"`,
      { applicationId: app.id, jobId, talentId }
    )
  }

  return res.status(201).json({ application: app })
})

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/applications  — list with optional filters
//  Query: ?jobId=  ?brandId=  ?talentId=
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { jobId, brandId, talentId } = req.query
  let results = [...applications]
  if (jobId)    results = results.filter(a => a.jobId    === jobId)
  if (brandId)  results = results.filter(a => a.brandId  === brandId)
  if (talentId) results = results.filter(a => a.talentId === talentId)
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return res.json({ applications: results, total: results.length })
})

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/applications/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const app = applications.find(a => a.id === req.params.id)
  if (!app) return res.status(404).json({ error: 'Application not found' })
  return res.json({ application: app })
})

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/applications/:id/status  — brand accepts or rejects
//  Body: { status: 'accepted'|'rejected', brandId, brandName }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', (req, res) => {
  const { status, brandId, brandName } = req.body
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be accepted or rejected' })
  }

  const app = applications.find(a => a.id === req.params.id)
  if (!app) return res.status(404).json({ error: 'Application not found' })

  app.status = status
  app.updatedAt = new Date().toISOString()

  if (status === 'accepted') {
    // Create a conversation thread between brand and talent
    const effectiveBrandId = app.brandId || brandId
    if (effectiveBrandId && app.talentId) {
      const conv = createConversation(
        effectiveBrandId,
        app.talentId,
        app.talentName,
        brandName || 'Brand',
        app.talentAvatar,
        null,
        app.jobTitle
      )
      app.conversationId = conv.id

      // Seed the conversation with the talent's original proposal
      // so the brand sees it when they open the thread
      conv.lastMessage = app.message.slice(0, 80)
      conv.lastMessageAt = app.createdAt
      conv.unreadBrand = 1
    }

    createNotification(
      app.talentId,
      'application_accepted',
      '🎉 Proposal Accepted!',
      `${brandName || 'A brand'} accepted your proposal for "${app.jobTitle}". Check your messages!`,
      { applicationId: app.id, jobId: app.jobId, conversationId: app.conversationId }
    )
  } else {
    createNotification(
      app.talentId,
      'application_rejected',
      'Proposal Update',
      `Your proposal for "${app.jobTitle}" was not selected this time. Keep applying!`,
      { applicationId: app.id, jobId: app.jobId }
    )
  }

  return res.json({ application: app })
})

export default router
