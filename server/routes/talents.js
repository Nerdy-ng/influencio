import { Router } from 'express'
import { mockTalents, mockPackages } from '../db/mockData.js'

const router = Router()

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attach min/max package price to each talent object.
 * Returns a new object — does not mutate the source.
 */
function attachPrices(talent) {
  const pkgs = mockPackages.filter((p) => p.talent_id === talent.id && p.is_active)
  const prices = pkgs.map((p) => p.price_ngn)
  return {
    ...talent,
    min_price_ngn: prices.length ? Math.min(...prices) : null,
    max_price_ngn: prices.length ? Math.max(...prices) : null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/talents
//  Query params: search, niche, minPrice, maxPrice, tier, page, limit
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const {
      search = '',
      niche = '',
      minPrice,
      maxPrice,
      tier = '',
      page = '1',
      limit = '12',
    } = req.query

    const pageNum  = Math.max(1, parseInt(page, 10)  || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 12)

    let results = mockTalents.map(attachPrices)

    // ── search filter (name / handle / niche, case-insensitive)
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      results = results.filter((c) => {
        const inName   = c.name.toLowerCase().includes(term)
        const inHandle = c.handle.toLowerCase().includes(term)
        const inNiches = c.niches.some((n) => n.toLowerCase().includes(term))
        return inName || inHandle || inNiches
      })
    }

    // ── niche filter
    if (niche.trim()) {
      const n = niche.trim().toLowerCase()
      results = results.filter((c) =>
        c.niches.some((cn) => cn.toLowerCase().includes(n))
      )
    }

    // ── tier filter
    if (tier.trim()) {
      const t = tier.trim().toLowerCase()
      results = results.filter((c) => c.tier.toLowerCase() === t)
    }

    // ── price range filter (based on talent's package prices)
    if (minPrice !== undefined) {
      const min = parseInt(minPrice, 10)
      if (!isNaN(min)) {
        results = results.filter(
          (c) => c.max_price_ngn !== null && c.max_price_ngn >= min
        )
      }
    }
    if (maxPrice !== undefined) {
      const max = parseInt(maxPrice, 10)
      if (!isNaN(max)) {
        results = results.filter(
          (c) => c.min_price_ngn !== null && c.min_price_ngn <= max
        )
      }
    }

    // ── pagination
    const total = results.length
    const pages = Math.ceil(total / limitNum) || 1
    const start = (pageNum - 1) * limitNum
    const paginated = results.slice(start, start + limitNum)

    return res.json({
      talents: paginated,
      total,
      page: pageNum,
      pages,
    })
  } catch (err) {
    console.error('[talents] GET / error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/talents/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const talent = mockTalents.find((c) => c.id === req.params.id)
    if (!talent) {
      return res.status(404).json({ error: 'Talent not found' })
    }

    const packages = mockPackages.filter(
      (p) => p.talent_id === talent.id && p.is_active
    )

    return res.json({ ...attachPrices(talent), packages })
  } catch (err) {
    console.error('[talents] GET /:id error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
