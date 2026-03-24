import { Router } from 'express'
import { orders } from './orders.js'
import { createNotification } from './notifications.js'

const router = Router()

// ── in-memory map: paymentReference → orderId
const paymentRefs = new Map()

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────
function now() {
  return new Date().toISOString()
}

function findOrder(orderId) {
  return orders.find((o) => o.id === orderId)
}

function findOrderByRef(ref) {
  const orderId = paymentRefs.get(ref)
  if (!orderId) return null
  return orders.find((o) => o.id === orderId) || null
}

function updateOrderPaymentStatus(orderId, paymentStatus) {
  const idx = orders.findIndex((o) => o.id === orderId)
  if (idx === -1) return false
  orders[idx] = { ...orders[idx], payment_status: paymentStatus, updated_at: now() }
  return true
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/payments/initiate
//  Body: { orderId, email }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/initiate', (req, res) => {
  try {
    const { orderId, email } = req.body

    if (!orderId || !email) {
      return res.status(400).json({ error: 'orderId and email are required' })
    }

    const order = findOrder(orderId)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    if (order.payment_status === 'escrow' || order.payment_status === 'released') {
      return res.status(422).json({
        error: `Order has already been paid. Payment status: "${order.payment_status}"`,
      })
    }

    if (order.payment_status === 'refunded') {
      return res.status(422).json({ error: 'This order was refunded and cannot be paid again.' })
    }

    // Generate Paystack-style reference
    const reference = 'PAY_' + orderId.slice(0, 8).toUpperCase() + '_' + Date.now()
    paymentRefs.set(reference, orderId)

    // Update order to escrow (simulating successful Paystack checkout)
    updateOrderPaymentStatus(orderId, 'escrow')

    // Notify brand
    createNotification(
      order.brand_id,
      'payment_initiated',
      'Payment in Escrow',
      `₦${order.amount_ngn.toLocaleString()} has been placed in escrow for order ${orderId.slice(0, 8)}. The talent will be notified to begin work.`,
      { orderId, reference, amount: order.amount_ngn }
    )

    // Notify talent that payment is secured
    createNotification(
      order.talent_id,
      'payment_secured',
      'Payment Secured in Escrow',
      `Brand payment of ₦${order.amount_ngn.toLocaleString()} is in escrow. You can now begin work on order ${orderId.slice(0, 8)}.`,
      { orderId, amount: order.amount_ngn }
    )

    return res.json({
      authorizationUrl: `https://paystack.com/pay/stub-${reference.toLowerCase()}`,
      reference,
      orderId,
      amount_ngn: order.amount_ngn,
      email,
      status: 'initiated',
    })
  } catch (err) {
    console.error('[payments] POST /initiate error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/payments/webhook
//  Simulate Paystack webhook: { event, data: { reference } }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', (req, res) => {
  try {
    const { event, data } = req.body

    if (!event || !data) {
      return res.status(400).json({ error: 'event and data are required' })
    }

    if (event === 'charge.success') {
      const { reference } = data

      if (!reference) {
        return res.status(400).json({ error: 'data.reference is required for charge.success' })
      }

      const order = findOrderByRef(reference)

      if (!order) {
        // Paystack expects 200 even for unknown refs (idempotency)
        console.warn('[payments/webhook] Unknown reference:', reference)
        return res.sendStatus(200)
      }

      if (order.payment_status !== 'escrow') {
        updateOrderPaymentStatus(order.id, 'escrow')

        createNotification(
          order.brand_id,
          'payment_confirmed',
          'Payment Confirmed',
          `Paystack confirmed your payment of ₦${order.amount_ngn.toLocaleString()} for order ${order.id.slice(0, 8)}.`,
          { orderId: order.id, reference }
        )
      }
    }

    // Always return 200 to Paystack
    return res.sendStatus(200)
  } catch (err) {
    console.error('[payments] POST /webhook error:', err)
    // Still return 200 so Paystack does not retry
    return res.sendStatus(200)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/payments/status/:orderId
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status/:orderId', (req, res) => {
  try {
    const order = findOrder(req.params.orderId)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    return res.json({
      orderId:        order.id,
      paymentStatus:  order.payment_status,
      amount:         order.amount_ngn,
      fee:            order.platform_fee_ngn,
      talentPayout:  order.talent_payout_ngn,
    })
  } catch (err) {
    console.error('[payments] GET /status/:orderId error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
