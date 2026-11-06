// Canonical portfolio item shape:
//   { id: string, url: string, type: 'image'|'video', title?: string, visible: boolean }
//
// Bridges two legacy schemas:
//   mobile: { imageUri, mediaType, youtubeUrl, ... }
//   web:    { url, type: 'photo'|'image'|'video', ... }

function isBlobUrl(u) {
  return typeof u === 'string' && u.startsWith('blob:')
}

export function normalizePortfolioItem(raw) {
  if (!raw || typeof raw !== 'object') return null

  let url = null
  let type = 'image'

  // Mobile schema: mediaType field present
  if (raw.mediaType === 'video') {
    url = raw.youtubeUrl || raw.url || null
    type = 'video'
  } else if (raw.mediaType === 'image') {
    url = raw.imageUri || raw.url || null
    type = 'image'
  } else if (raw.imageUri) {
    // Mobile image without explicit mediaType
    url = raw.imageUri
    type = 'image'
  } else if (raw.youtubeUrl) {
    // Mobile video without explicit mediaType
    url = raw.youtubeUrl
    type = 'video'
  } else if (raw.url) {
    // Web schema
    url = raw.url
    type = raw.type === 'video' ? 'video' : 'image'
  }

  if (!url || isBlobUrl(url)) return null

  return {
    id: raw.id != null ? String(raw.id) : String(Date.now()),
    url,
    type,
    title: raw.title || undefined,
    visible: raw.visible !== false,
  }
}

export function normalizePortfolio(items) {
  if (!Array.isArray(items)) return []
  return items.map(normalizePortfolioItem).filter(Boolean)
}
