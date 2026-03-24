import { Router } from 'express'
import { mockPackages, mockTalents } from '../db/mockData.js'

const router = Router()

// ─────────────────────────────────────────────────────────────────────────────
//  Helper — embed talent info into a package object
// ─────────────────────────────────────────────────────────────────────────────
function embedTalent(pkg) {
  const talent = mockTalents.find((c) => c.id === pkg.talent_id) || null
  return { ...pkg, talent }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/packages
//  Query params: talentId, platform, maxPrice
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { talentId, platform, maxPrice } = req.query

    let results = mockPackages.filter((p) => p.is_active)

    if (talentId) {
      results = results.filter((p) => p.talent_id === talentId)
    }

    if (platform) {
      const plat = platform.toLowerCase()
      results = results.filter((p) => p.platform.toLowerCase().includes(plat))
    }

    if (maxPrice !== undefined) {
      const max = parseInt(maxPrice, 10)
      if (!isNaN(max)) {
        results = results.filter((p) => p.price_ngn <= max)
      }
    }

    return res.json({ packages: results.map(embedTalent), total: results.length })
  } catch (err) {
    console.error('[packages] GET / error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/packages/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const pkg = mockPackages.find((p) => p.id === req.params.id)
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' })
    }
    return res.json(embedTalent(pkg))
  } catch (err) {
    console.error('[packages] GET /:id error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
