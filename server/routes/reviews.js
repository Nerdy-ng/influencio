import { Router } from 'express'

const router = Router()

// ── Seed data ────────────────────────────────────────────────────────────────
let reviews = [
  {
    id: 'rev_001',
    talentId: 'talent_1',
    brandId: 'brand_seed_1',
    brandName: 'GlowUp Cosmetics',
    brandInitials: 'GC',
    rating: 5,
    comment: 'Adaeze exceeded every expectation. The reel she created got 3× our usual engagement and the product felt genuinely integrated — not forced. She communicated throughout, delivered early, and the raw footage was excellent. Will definitely book again.',
    campaignType: 'Instagram Reel',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: 'rev_002',
    talentId: 'talent_1',
    brandId: 'brand_seed_2',
    brandName: 'Tecno Mobile Nigeria',
    brandInitials: 'TM',
    rating: 5,
    comment: 'Very professional. She understood the brief immediately, asked the right questions, and delivered a TikTok that genuinely felt like her content — not an ad. 2.1M views in 5 days. Our product team was shocked.',
    campaignType: 'TikTok Campaign',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  },
  {
    id: 'rev_003',
    talentId: 'talent_1',
    brandId: 'brand_seed_3',
    brandName: 'Ada Collections',
    brandInitials: 'AC',
    rating: 4,
    comment: 'Great work overall. The photos were stunning and her audience engagement in the comments was impressive. Took one extra day to deliver but communicated proactively. Minor caption tweak needed but sorted fast. Would hire again.',
    campaignType: 'Fashion Lookbook',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: 'rev_004',
    talentId: 'talent_1',
    brandId: 'brand_seed_4',
    brandName: 'Naija Bites',
    brandInitials: 'NB',
    rating: 5,
    comment: 'Honest, warm, and genuinely persuasive. Her food content brought us a 17% spike in reservations the weekend she posted. Her audience trusts her and it shows in the conversion data. Highly recommend.',
    campaignType: 'Restaurant Campaign',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  },
]

let revCounter = reviews.length

function newId() {
  return `rev_${++revCounter}_${Date.now()}`
}

function calcStats(talentReviews) {
  if (!talentReviews.length) return { avgRating: 0, reviewCount: 0 }
  const sum = talentReviews.reduce((s, r) => s + r.rating, 0)
  return {
    avgRating: Math.round((sum / talentReviews.length) * 10) / 10,
    reviewCount: talentReviews.length,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/reviews?talentId=
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { talentId } = req.query
  if (!talentId) return res.status(400).json({ error: 'talentId required' })

  const talentReviews = reviews
    .filter(r => r.talentId === talentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const stats = calcStats(talentReviews)
  return res.json({ reviews: talentReviews, ...stats })
})

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/reviews
//  Body: { talentId, brandId, brandName, rating, comment, campaignType }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const { talentId, brandId, brandName, rating, comment, campaignType } = req.body

  if (!talentId || !brandId || !rating || !comment?.trim()) {
    return res.status(400).json({ error: 'talentId, brandId, rating, and comment are required' })
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be 1–5' })
  }

  // One review per brand per talent
  const existing = reviews.find(r => r.talentId === talentId && r.brandId === brandId)
  if (existing) {
    // Update existing review
    existing.rating = rating
    existing.comment = comment.trim()
    existing.campaignType = campaignType || existing.campaignType
    existing.updatedAt = new Date().toISOString()
    const talentReviews = reviews.filter(r => r.talentId === talentId)
    return res.json({ review: existing, ...calcStats(talentReviews) })
  }

  const initials = (brandName || 'B')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const review = {
    id: newId(),
    talentId,
    brandId,
    brandName: brandName || 'Brand',
    brandInitials: initials,
    rating,
    comment: comment.trim(),
    campaignType: campaignType || null,
    createdAt: new Date().toISOString(),
  }
  reviews.push(review)

  const talentReviews = reviews.filter(r => r.talentId === talentId)
  return res.status(201).json({ review, ...calcStats(talentReviews) })
})

export default router
