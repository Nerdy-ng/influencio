// PRODUCTION NOTE: Image NSFW detection requires integration with:
// - Google Cloud Vision SafeSearch API
// - AWS Rekognition DetectModerationLabels
// - Or a service like Clarifai / Sightengine
// The analyzeImageForNSFW function below is a MOCK for development only.

const REPORTS_KEY = 'brandiór_mod_reports'
const CONFIG_KEY = 'brandiór_mod_config'
const POST_LOG_KEY = 'brandiór_post_log'

// ─────────────────────────────────────────────
// SPAM KEYWORDS
// ─────────────────────────────────────────────

export const SPAM_KEYWORDS = [
  'click here',
  'dm for promo',
  'dm me',
  'follow for follow',
  'f4f',
  'follow back',
  'buy followers',
  'buy likes',
  'get followers fast',
  'whatsapp me',
  'whatsapp only',
  'limited offer',
  'limited time offer',
  'make money fast',
  'earn ₦',
  'earn money online',
  'work from home and earn',
  'guaranteed income',
  'investment opportunity',
  'double your money',
  'join my team',
  'network marketing',
  'link in bio',
  'check my bio',
  '100% legit',
  'no scam',
  'i swear legit',
  'cash out daily',
  'free giveaway',
  'win iphone',
  'repost to win',
  'promote your page',
  'shoutout for shoutout',
  's4s',
  'paypal only',
  'crypto investment',
  'send me your number',
  'call me now',
]

// ─────────────────────────────────────────────
// TEXT SPAM ANALYSIS
// ─────────────────────────────────────────────

export function analyzeTextForSpam(text) {
  if (!text || typeof text !== 'string') {
    return { isSpam: false, score: 0, reasons: [] }
  }

  let score = 0
  const reasons = []
  const lower = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)

  // Rule 1: Contains 2+ URLs (score +20 each)
  const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+/gi
  const urls = text.match(urlPattern) || []
  if (urls.length >= 2) {
    const urlScore = urls.length * 20
    score += urlScore
    reasons.push(`Contains ${urls.length} URLs (+${urlScore} pts)`)
  }

  // Rule 2: Matches any SPAM_KEYWORDS (score +15 each, max 3 matches counted)
  const matchedKeywords = []
  for (const keyword of SPAM_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword)
    }
  }
  const keywordMatches = Math.min(matchedKeywords.length, 3)
  if (keywordMatches > 0) {
    score += keywordMatches * 15
    reasons.push(`Matched spam keywords: "${matchedKeywords.slice(0, 3).join('", "')}" (+${keywordMatches * 15} pts)`)
  }

  // Rule 3: More than 40% ALL CAPS words (score +25)
  if (words.length > 0) {
    const capsWords = words.filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w))
    const capsFraction = capsWords.length / words.length
    if (capsFraction > 0.4) {
      score += 25
      reasons.push(`${Math.round(capsFraction * 100)}% of words are ALL CAPS (+25 pts)`)
    }
  }

  // Rule 4: Repeated characters >4x like "aaaa" or "!!!!" (score +15)
  const repeatedCharPattern = /(.)\1{4,}/
  if (repeatedCharPattern.test(text)) {
    score += 15
    reasons.push('Contains repeated characters (e.g. "aaaa" or "!!!!") (+15 pts)')
  }

  // Rule 5: Contains generic phone number pattern (score +30)
  const genericPhonePattern = /\b(\+?1?\s?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4})\b/
  if (genericPhonePattern.test(text)) {
    score += 30
    reasons.push('Contains phone number pattern (+30 pts)')
  }

  // Rule 6: Text length < 10 chars but has URL (score +40)
  const trimmedLength = text.replace(urlPattern, '').trim().length
  if (trimmedLength < 10 && urls.length > 0) {
    score += 40
    reasons.push('Very short text with URL — likely pure spam link (+40 pts)')
  }

  // Rule 7: More than 5 hashtags (score +10)
  const hashtags = text.match(/#\w+/g) || []
  if (hashtags.length > 5) {
    score += 10
    reasons.push(`Contains ${hashtags.length} hashtags (+10 pts)`)
  }

  // Rule 8: Contains Nigerian phone format (+234 or 0803, 0806, 0807, 0808, 0812, 0816 etc.) (score +25)
  const nigerianPhonePattern = /(\+234|0[789]\d{9}|080[3-9]\d{7}|081[0-9]\d{7})/
  if (nigerianPhonePattern.test(text)) {
    score += 25
    reasons.push('Contains Nigerian phone number format (+25 pts)')
  }

  // Cap at 100
  score = Math.min(score, 100)

  return {
    isSpam: score > 60,
    score,
    reasons,
  }
}

// ─────────────────────────────────────────────
// POSTING FREQUENCY CHECK
// ─────────────────────────────────────────────

export function checkPostingFrequency(userId) {
  if (!userId) return { flagged: false, reason: null }

  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minutes
  const maxPosts = 5

  let log = []
  try {
    const raw = localStorage.getItem(POST_LOG_KEY)
    log = raw ? JSON.parse(raw) : []
  } catch {
    log = []
  }

  // Record this check
  log.push({ userId, timestamp: now })

  // Keep only last 24 hours of logs to prevent unbounded growth
  const cutoff24h = now - 24 * 60 * 60 * 1000
  log = log.filter(entry => entry.timestamp > cutoff24h)

  try {
    localStorage.setItem(POST_LOG_KEY, JSON.stringify(log))
  } catch {
    // storage full — ignore
  }

  // Count posts for this user in the last 10 minutes
  const windowStart = now - windowMs
  const recentPosts = log.filter(
    entry => entry.userId === userId && entry.timestamp >= windowStart
  )

  if (recentPosts.length > maxPosts) {
    return {
      flagged: true,
      reason: `User posted ${recentPosts.length} times in the last 10 minutes (limit: ${maxPosts})`,
    }
  }

  return { flagged: false, reason: null }
}

// ─────────────────────────────────────────────
// IMAGE NSFW ANALYSIS (MOCK)
// ─────────────────────────────────────────────

export function analyzeImageForNSFW(imageUrl, context) {
  // In production: replace with call to Google Vision SafeSearch API or AWS Rekognition DetectModerationLabels

  if (!imageUrl || typeof imageUrl !== 'string') {
    return { flagged: false, confidence: 0, reason: null, requiresReview: false }
  }

  const lower = imageUrl.toLowerCase()

  // Check for obvious NSFW URL patterns
  const nsfwPatterns = ['nude', 'nsfw', 'xxx', 'porn', 'explicit', 'naked', 'adult-content']
  for (const pattern of nsfwPatterns) {
    if (lower.includes(pattern)) {
      return {
        flagged: true,
        confidence: 0.99,
        reason: `Image URL contains explicit keyword: "${pattern}"`,
        requiresReview: true,
      }
    }
  }

  // Blob profile images: 30% random chance (demo only)
  if (lower.startsWith('blob:') && context === 'profile') {
    if (Math.random() < 0.30) {
      return {
        flagged: true,
        confidence: parseFloat((0.5 + Math.random() * 0.3).toFixed(2)),
        reason: 'Unverified profile image flagged for manual review (demo detection)',
        requiresReview: true,
      }
    }
  }

  // 5% random chance to flag as low-confidence requires_review
  if (Math.random() < 0.05) {
    return {
      flagged: true,
      confidence: parseFloat((0.1 + Math.random() * 0.25).toFixed(2)),
      reason: 'Low-confidence NSFW signal — requires human review',
      requiresReview: true,
    }
  }

  return {
    flagged: false,
    confidence: 0,
    reason: null,
    requiresReview: false,
  }
}

// ─────────────────────────────────────────────
// REPORT STORAGE
// ─────────────────────────────────────────────

export function submitReport(report) {
  const id = `MOD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  const fullReport = {
    id,
    type: report.type || 'user_report',
    severity: report.severity || 'medium',
    autoDetected: report.autoDetected !== undefined ? report.autoDetected : false,
    status: 'pending',
    userId: report.userId || 'unknown',
    userName: report.userName || 'Unknown User',
    contentType: report.contentType || 'post',
    contentPreview: report.contentPreview
      ? String(report.contentPreview).slice(0, 120)
      : '',
    imageUrl: report.imageUrl || null,
    reasons: Array.isArray(report.reasons) ? report.reasons : [],
    score: report.score !== undefined ? report.score : null,
    confidence: report.confidence !== undefined ? report.confidence : null,
    timestamp: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    action: null,
  }

  // Load existing reports
  let reports = []
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    reports = raw ? JSON.parse(raw) : []
  } catch {
    reports = []
  }

  reports.push(fullReport)

  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
  } catch {
    // storage full
  }

  // Dispatch custom DOM event
  try {
    const event = new CustomEvent('brandiór:moderation-report', {
      detail: fullReport,
      bubbles: true,
    })
    window.dispatchEvent(event)
  } catch {
    // non-browser environment
  }

  return fullReport
}

// ─────────────────────────────────────────────
// GET REPORTS
// ─────────────────────────────────────────────

export function getReports(filters = {}) {
  let reports = []
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    reports = raw ? JSON.parse(raw) : []
  } catch {
    reports = []
  }

  // Sort newest first
  reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const { status, type, severity, limit } = filters

  if (status) {
    reports = reports.filter(r => r.status === status)
  }
  if (type) {
    reports = reports.filter(r => r.type === type)
  }
  if (severity) {
    reports = reports.filter(r => r.severity === severity)
  }
  if (limit && typeof limit === 'number') {
    reports = reports.slice(0, limit)
  }

  return reports
}

// ─────────────────────────────────────────────
// UPDATE REPORT STATUS
// ─────────────────────────────────────────────

export function updateReportStatus(reportId, status, reviewedBy, action) {
  let reports = []
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    reports = raw ? JSON.parse(raw) : []
  } catch {
    reports = []
  }

  const index = reports.findIndex(r => r.id === reportId)
  if (index === -1) return null

  reports[index] = {
    ...reports[index],
    status: status || reports[index].status,
    reviewedBy: reviewedBy || null,
    reviewedAt: new Date().toISOString(),
    action: action || null,
  }

  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
  } catch {
    // storage full
  }

  return reports[index]
}

// ─────────────────────────────────────────────
// MODERATION STATS
// ─────────────────────────────────────────────

export function getModerationStats() {
  let reports = []
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    reports = raw ? JSON.parse(raw) : []
  } catch {
    reports = []
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    spam: reports.filter(r => r.type === 'spam' || r.type === 'spam_frequency').length,
    nsfw: reports.filter(r => r.type === 'nsfw').length,
    thisWeek: reports.filter(r => new Date(r.timestamp) > weekAgo).length,
    autoDetected: reports.filter(r => r.autoDetected === true).length,
  }
}

// ─────────────────────────────────────────────
// FULL PROFILE SCAN
// ─────────────────────────────────────────────

export function runProfileScan(profile) {
  if (!profile) return []

  const submitted = []
  const userId = profile.id || profile.userId || 'unknown'
  const userName = profile.name || profile.userName || 'Unknown'

  // Scan bio text for spam
  const bioText = profile.bio || profile.description || ''
  if (bioText) {
    const textResult = analyzeTextForSpam(bioText)
    if (textResult.isSpam) {
      const severity = textResult.score >= 80 ? 'high' : textResult.score >= 60 ? 'medium' : 'low'
      const report = submitReport({
        type: 'spam',
        severity,
        autoDetected: true,
        userId,
        userName,
        contentType: 'bio',
        contentPreview: bioText,
        imageUrl: null,
        reasons: textResult.reasons,
        score: textResult.score,
        confidence: null,
      })
      submitted.push(report)
    }
  }

  // Scan avatar URL for NSFW
  const avatarUrl = profile.avatar || profile.avatarUrl || profile.profilePhoto || ''
  if (avatarUrl) {
    const imageResult = analyzeImageForNSFW(avatarUrl, 'profile')
    if (imageResult.flagged) {
      const severity = imageResult.confidence >= 0.9 ? 'critical' : imageResult.confidence >= 0.6 ? 'high' : 'medium'
      const report = submitReport({
        type: 'nsfw',
        severity,
        autoDetected: true,
        userId,
        userName,
        contentType: 'profile_photo',
        contentPreview: `Profile photo: ${avatarUrl.slice(0, 80)}`,
        imageUrl: avatarUrl,
        reasons: [imageResult.reason].filter(Boolean),
        score: null,
        confidence: imageResult.confidence,
      })
      submitted.push(report)
    }
  }

  // Check posting frequency
  const freqResult = checkPostingFrequency(userId)
  if (freqResult.flagged) {
    const report = submitReport({
      type: 'spam_frequency',
      severity: 'medium',
      autoDetected: true,
      userId,
      userName,
      contentType: 'post',
      contentPreview: freqResult.reason || 'Excessive posting frequency detected',
      imageUrl: null,
      reasons: [freqResult.reason].filter(Boolean),
      score: null,
      confidence: null,
    })
    submitted.push(report)
  }

  return submitted
}
