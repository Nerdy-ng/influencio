import { Router } from 'express'
import { mockOrders, mockPackages, mockTalents } from '../db/mockData.js'
import { createNotification } from './notifications.js'

const router = Router()

// ── live in-memory store (seeded with mockOrders)
const orders = mockOrders.map((o) => ({ ...o }))

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString()
}

/** Generate a naive UUID-like id */
function newId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function embedDetails(order) {
  const pkg     = mockPackages.find((p) => p.id === order.package_id) || null
  const talent = mockTalents.find((c) => c.id === order.talent_id) || null
  return { ...order, package: pkg, talent }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Allowed status transitions
// ─────────────────────────────────────────────────────────────────────────────
const TRANSITIONS = {
  pending:            ['in_progress', 'cancelled'],
  in_progress:        ['delivered', 'cancelled'],
  delivered:          ['revision_requested', 'completed'],
  revision_requested: ['in_progress', 'cancelled'],
  completed:          [],
  cancelled:          [],
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/orders
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { brandId, talentId, status } = req.query

    let results = [...orders]

    if (brandId)   results = results.filter((o) => o.brand_id   === brandId)
    if (talentId) results = results.filter((o) => o.talent_id === talentId)
    if (status)    results = results.filter((o) => o.status     === status)

    return res.json({ orders: results.map(embedDetails), total: results.length })
  } catch (err) {
    console.error('[orders] GET / error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/orders/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const order = orders.find((o) => o.id === req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    return res.json(embedDetails(order))
  } catch (err) {
    console.error('[orders] GET /:id error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/orders — create order
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { packageId, brandId, brief } = req.body

    if (!packageId || !brandId || !brief) {
      return res.status(400).json({ error: 'packageId, brandId and brief are required' })
    }
    if (!brief.productName || !brief.description) {
      return res.status(400).json({ error: 'brief must include productName and description' })
    }

    const pkg = mockPackages.find((p) => p.id === packageId)
    if (!pkg) return res.status(404).json({ error: 'Package not found' })
    if (!pkg.is_active) return res.status(400).json({ error: 'Package is no longer active' })

    const talent = mockTalents.find((c) => c.id === pkg.talent_id)
    if (!talent) return res.status(404).json({ error: 'Talent not found' })

    const amount         = pkg.price_ngn
    const platformFee    = Math.round(amount * 0.10)
    const talentPayout  = amount - platformFee

    const newOrder = {
      id:                  newId(),
      package_id:          packageId,
      talent_id:          pkg.talent_id,
      brand_id:            brandId,
      status:              'pending',
      payment_status:      'unpaid',
      brief: {
        productName:  brief.productName,
        description:  brief.description,
        instructions: brief.instructions || '',
      },
      delivered_files:     [],
      revisions_requested: 0,
      max_revisions:       pkg.revisions ?? 2,
      amount_ngn:          amount,
      platform_fee_ngn:    platformFee,
      talent_payout_ngn:  talentPayout,
      created_at:          now(),
      updated_at:          now(),
    }

    orders.push(newOrder)

    // notify talent
    createNotification(
      talent.id,
      'new_order',
      'New Order Received!',
      `You have a new order for "${pkg.name}" from brand ${brandId.slice(0, 8)}.`,
      { orderId: newOrder.id, packageId }
    )

    return res.status(201).json(embedDetails(newOrder))
  } catch (err) {
    console.error('[orders] POST / error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/orders/:id/status — update status
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body
    if (!status) return res.status(400).json({ error: 'status is required' })

    const idx = orders.findIndex((o) => o.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Order not found' })

    const order   = orders[idx]
    const allowed = TRANSITIONS[order.status] || []

    if (!allowed.includes(status)) {
      return res.status(422).json({
        error: `Cannot transition from "${order.status}" to "${status}". Allowed: [${allowed.join(', ')}]`,
      })
    }

    orders[idx] = { ...order, status, updated_at: now() }

    // notify brand on key transitions
    if (status === 'in_progress') {
      createNotification(
        order.brand_id,
        'order_in_progress',
        'Talent Started Work',
        `Your order has moved to "In Progress". Delivery expected within ${
          (mockPackages.find((p) => p.id === order.package_id) || {}).delivery_days || '?'
        } days.`,
        { orderId: order.id }
      )
    }
    if (status === 'cancelled') {
      createNotification(
        order.brand_id,
        'order_cancelled',
        'Order Cancelled',
        `Order ${order.id.slice(0, 8)} has been cancelled.`,
        { orderId: order.id }
      )
    }

    return res.json(embedDetails(orders[idx]))
  } catch (err) {
    console.error('[orders] PATCH /:id/status error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/orders/:id/deliver — mark as delivered
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/deliver', (req, res) => {
  try {
    const { files = [] } = req.body

    const idx = orders.findIndex((o) => o.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Order not found' })

    const order = orders[idx]

    if (!['in_progress', 'revision_requested'].includes(order.status)) {
      return res.status(422).json({
        error: `Order must be "in_progress" or "revision_requested" to deliver. Current: "${order.status}"`,
      })
    }

    orders[idx] = {
      ...order,
      status:          'delivered',
      delivered_files: Array.isArray(files) ? files : [files],
      updated_at:      now(),
    }

    // notify brand
    createNotification(
      order.brand_id,
      'delivery_uploaded',
      'Delivery Uploaded!',
      `Your talent has delivered files for order ${order.id.slice(0, 8)}. Please review and approve.`,
      { orderId: order.id, fileCount: orders[idx].delivered_files.length }
    )

    return res.json(embedDetails(orders[idx]))
  } catch (err) {
    console.error('[orders] POST /:id/deliver error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/orders/:id/revision — request revision
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/revision', (req, res) => {
  try {
    const { reason = '' } = req.body

    const idx = orders.findIndex((o) => o.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Order not found' })

    const order = orders[idx]

    if (order.status !== 'delivered') {
      return res.status(422).json({
        error: `Order must be "delivered" to request a revision. Current: "${order.status}"`,
      })
    }

    if (order.revisions_requested >= order.max_revisions) {
      return res.status(422).json({
        error: `Maximum revisions (${order.max_revisions}) already reached. Please approve or contact support.`,
      })
    }

    const newRevCount = order.revisions_requested + 1

    orders[idx] = {
      ...order,
      status:              'revision_requested',
      revisions_requested: newRevCount,
      updated_at:          now(),
    }

    // notify talent
    createNotification(
      order.talent_id,
      'revision_requested',
      'Revision Requested',
      `Brand has requested revision #${newRevCount} for order ${order.id.slice(0, 8)}${reason ? ': ' + reason : '.'}`,
      { orderId: order.id, reason, revisionNumber: newRevCount }
    )

    return res.json(embedDetails(orders[idx]))
  } catch (err) {
    console.error('[orders] POST /:id/revision error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/orders/:id/approve — approve delivery
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/approve', (req, res) => {
  try {
    const idx = orders.findIndex((o) => o.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Order not found' })

    const order = orders[idx]

    if (order.status !== 'delivered') {
      return res.status(422).json({
        error: `Order must be "delivered" to approve. Current: "${order.status}"`,
      })
    }

    orders[idx] = {
      ...order,
      status:         'completed',
      payment_status: 'released',
      updated_at:     now(),
    }

    // notify talent that payout is released
    createNotification(
      order.talent_id,
      'payout_released',
      'Payment Released!',
      `Brand approved your delivery. ₦${order.talent_payout_ngn.toLocaleString()} will be credited to your account within 24 hours.`,
      { orderId: order.id, amount: order.talent_payout_ngn }
    )

    return res.json(embedDetails(orders[idx]))
  } catch (err) {
    console.error('[orders] POST /:id/approve error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Export the live orders array so payments route can update payment_status
export { orders }
export default router
