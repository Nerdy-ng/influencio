import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import talentsRouter      from './routes/talents.js'
import packagesRouter      from './routes/packages.js'
import ordersRouter        from './routes/orders.js'
import paymentsRouter      from './routes/payments.js'
import notificationsRouter from './routes/notifications.js'
import messagesRouter      from './routes/messages.js'
import applicationsRouter  from './routes/applications.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

const app  = express()
const PORT = process.env.PORT || 3001

// ─────────────────────────────────────────────────────────────────────────────
//  Global Middleware
// ─────────────────────────────────────────────────────────────────────────────

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS — allow all origins (swap for a whitelist in production)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

  // Pre-flight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  return next()
})

// Request logger (dev-friendly)
app.use((req, _res, next) => {
  const ts = new Date().toISOString()
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`)
  next()
})

// ─────────────────────────────────────────────────────────────────────────────
//  Health Check
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Brandiór API' })
})

// ─────────────────────────────────────────────────────────────────────────────
//  API Routes
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/talents',      talentsRouter)
app.use('/api/packages',      packagesRouter)
app.use('/api/orders',        ordersRouter)
app.use('/api/payments',      paymentsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/messages',     messagesRouter)
app.use('/api/applications', applicationsRouter)

// ─────────────────────────────────────────────────────────────────────────────
//  404 handler for unmatched /api/* routes
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// ─────────────────────────────────────────────────────────────────────────────
//  Serve SPA (Vite build output from ../dist)
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.static(join(__dirname, '../dist')))

// SPA fallback — all non-API routes return index.html
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../dist', 'index.html'))
})

// ─────────────────────────────────────────────────────────────────────────────
//  Global Error Handler
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]', err)
  res.status(500).json({ error: 'Unexpected server error', message: err.message })
})

// ─────────────────────────────────────────────────────────────────────────────
//  Start
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nBrandior API running at http://localhost:${PORT}`)
  console.log(`  GET /api/health`)
  console.log(`  GET /api/talents`)
  console.log(`  GET /api/packages`)
  console.log(`  GET /api/orders`)
  console.log(`  POST /api/payments/initiate`)
  console.log(`  GET /api/notifications\n`)
})
