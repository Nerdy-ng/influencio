/**
 * Brandiór Moderation Embed Script
 * Drop-in moderation scanner for any page.
 * Usage: <script src="/moderation-embed.js"></script>
 *
 * No React, no imports — pure vanilla JS.
 */

;(function (window, document) {
  'use strict'

  var REPORTS_KEY = 'brandiór_mod_reports'
  var DEVMODE_KEY = 'brandiór_mod_devmode'

  // ─── Condensed spam keywords list ──────────────────────────────────────────

  var SPAM_KEYWORDS = [
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

  var NSFW_URL_PATTERNS = ['nude', 'nsfw', 'xxx', 'porn', 'explicit', 'naked', 'adult-content']

  var PHONE_PATTERN = /(\+234|0[789]\d{9}|080[3-9]\d{7}|081[0-9]\d{7}|\b(\+?1?\s?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4})\b)/

  // ─── Utility: schedule non-blocking work ───────────────────────────────────

  function scheduleWork(fn) {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(fn, { timeout: 2000 })
    } else {
      setTimeout(fn, 0)
    }
  }

  // ─── Core scan functions ───────────────────────────────────────────────────

  /**
   * Scan text for spam signals.
   * Returns { isSpam, score, reasons[] }
   */
  function scan(text) {
    if (!text || typeof text !== 'string') return { isSpam: false, score: 0, reasons: [] }

    var score = 0
    var reasons = []
    var lower = text.toLowerCase()
    var words = text.split(/\s+/).filter(Boolean)

    // 2+ URLs
    var urls = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/gi) || []
    if (urls.length >= 2) {
      score += urls.length * 20
      reasons.push('Contains ' + urls.length + ' URLs')
    }

    // Spam keywords
    var matched = []
    for (var i = 0; i < SPAM_KEYWORDS.length; i++) {
      if (lower.indexOf(SPAM_KEYWORDS[i]) !== -1) {
        matched.push(SPAM_KEYWORDS[i])
      }
    }
    var kwCount = Math.min(matched.length, 3)
    if (kwCount > 0) {
      score += kwCount * 15
      reasons.push('Matched spam keywords: ' + matched.slice(0, 3).join(', '))
    }

    // ALL CAPS
    if (words.length > 0) {
      var capsWords = words.filter(function (w) {
        return w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)
      })
      if (capsWords.length / words.length > 0.4) {
        score += 25
        reasons.push('Excessive ALL CAPS usage')
      }
    }

    // Repeated characters
    if (/(.)\1{4,}/.test(text)) {
      score += 15
      reasons.push('Contains repeated characters')
    }

    // Phone number
    if (PHONE_PATTERN.test(text)) {
      score += 30
      reasons.push('Contains phone number pattern')
    }

    // Too many hashtags
    var hashtags = text.match(/#\w+/g) || []
    if (hashtags.length > 5) {
      score += 10
      reasons.push('Contains ' + hashtags.length + ' hashtags')
    }

    score = Math.min(score, 100)

    return {
      isSpam: score > 60,
      score: score,
      reasons: reasons,
    }
  }

  /**
   * Scan image src for NSFW URL patterns.
   * Returns { flagged, reason }
   */
  function scanImage(src) {
    if (!src || typeof src !== 'string') return { flagged: false, reason: null }

    var lower = src.toLowerCase()
    for (var i = 0; i < NSFW_URL_PATTERNS.length; i++) {
      if (lower.indexOf(NSFW_URL_PATTERNS[i]) !== -1) {
        return {
          flagged: true,
          reason: 'Image URL contains explicit keyword: "' + NSFW_URL_PATTERNS[i] + '"',
        }
      }
    }

    return { flagged: false, reason: null }
  }

  // ─── Report persistence ────────────────────────────────────────────────────

  function report(data) {
    var id = 'MOD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase()

    var fullReport = {
      id: id,
      type: data.type || 'user_report',
      severity: data.severity || 'medium',
      autoDetected: data.autoDetected !== undefined ? data.autoDetected : true,
      status: 'pending',
      userId: data.userId || 'embed-scanner',
      userName: data.userName || 'Embed Scanner',
      contentType: data.contentType || 'post',
      contentPreview: data.contentPreview
        ? String(data.contentPreview).slice(0, 120)
        : '',
      imageUrl: data.imageUrl || null,
      reasons: Array.isArray(data.reasons) ? data.reasons : [],
      score: data.score !== undefined ? data.score : null,
      confidence: data.confidence !== undefined ? data.confidence : null,
      timestamp: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      action: null,
    }

    var reports = getReports()
    reports.push(fullReport)

    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
    } catch (e) {
      // storage full
    }

    // Dispatch custom event
    try {
      var event = new CustomEvent('brandiór:moderation-report', {
        detail: fullReport,
        bubbles: true,
      })
      window.dispatchEvent(event)
    } catch (e) {
      // non-browser
    }

    return fullReport
  }

  function getReports() {
    try {
      var raw = localStorage.getItem(REPORTS_KEY)
      var parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }

  // ─── DOM overlay badge for flagged images ──────────────────────────────────

  function addWarningOverlay(imgElement) {
    if (imgElement.__brandiórOverlay) return

    imgElement.__brandiórOverlay = true

    var wrapper = document.createElement('span')
    wrapper.style.cssText = 'position:relative;display:inline-block;'

    var badge = document.createElement('span')
    badge.textContent = '\u26A0'
    badge.title = 'Brandiór: Flagged content'
    badge.style.cssText = [
      'position:absolute',
      'top:4px',
      'right:4px',
      'background:rgba(249,115,22,0.92)',
      'color:#fff',
      'font-size:14px',
      'line-height:1',
      'padding:3px 5px',
      'border-radius:4px',
      'z-index:9999',
      'pointer-events:none',
      'font-family:sans-serif',
    ].join(';')

    var parent = imgElement.parentNode
    if (parent) {
      parent.insertBefore(wrapper, imgElement)
      wrapper.appendChild(imgElement)
      wrapper.appendChild(badge)
    }
  }

  // ─── Process a single text node ───────────────────────────────────────────

  function processTextNode(node) {
    var text = node.textContent || ''
    if (text.trim().length < 10) return

    scheduleWork(function () {
      var result = scan(text)
      if (result.isSpam) {
        report({
          type: 'spam',
          severity: result.score >= 80 ? 'high' : 'medium',
          autoDetected: true,
          contentType: 'post',
          contentPreview: text,
          reasons: result.reasons,
          score: result.score,
        })
      }
    })
  }

  // ─── Process a single image element ───────────────────────────────────────

  function processImageElement(img) {
    var src = img.src || img.getAttribute('src') || ''
    if (!src) return

    scheduleWork(function () {
      var result = scanImage(src)
      if (result.flagged) {
        report({
          type: 'nsfw',
          severity: 'high',
          autoDetected: true,
          contentType: 'post',
          imageUrl: src,
          contentPreview: 'Image: ' + src.slice(0, 80),
          reasons: [result.reason],
          confidence: 0.95,
        })
        addWarningOverlay(img)
      }
    })
  }

  // ─── Walk existing DOM nodes ───────────────────────────────────────────────

  function walkNode(node) {
    if (!node) return

    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'IMG') {
        processImageElement(node)
      }
      // Walk children
      var children = node.childNodes
      for (var i = 0; i < children.length; i++) {
        walkNode(children[i])
      }
    }
  }

  // ─── MutationObserver: watch for new content ───────────────────────────────

  var observer = new MutationObserver(function (mutations) {
    for (var m = 0; m < mutations.length; m++) {
      var mutation = mutations[m]
      var added = mutation.addedNodes

      for (var n = 0; n < added.length; n++) {
        var node = added[n]

        scheduleWork((function (capturedNode) {
          return function () {
            walkNode(capturedNode)
          }
        })(node))
      }
    }
  })

  // ─── Dev mode badge ────────────────────────────────────────────────────────

  function mountDevBadge() {
    if (document.getElementById('brandiór-dev-badge')) return

    var badge = document.createElement('div')
    badge.id = 'brandiór-dev-badge'
    badge.textContent = '\uD83D\uDEE1 Moderation Active'
    badge.style.cssText = [
      'position:fixed',
      'bottom:16px',
      'left:16px',
      'background:rgba(30,41,59,0.92)',
      'color:#e2e8f0',
      'font-size:11px',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'font-weight:600',
      'padding:6px 10px',
      'border-radius:8px',
      'z-index:999999',
      'pointer-events:none',
      'box-shadow:0 4px 12px rgba(0,0,0,0.3)',
      'letter-spacing:0.02em',
    ].join(';')

    document.body.appendChild(badge)
  }

  // ─── Initialise ───────────────────────────────────────────────────────────

  function init() {
    // Scan existing DOM
    scheduleWork(function () {
      walkNode(document.body)
    })

    // Observe future mutations
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Dev badge
    if (localStorage.getItem(DEVMODE_KEY) === 'true') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountDevBadge)
      } else {
        mountDevBadge()
      }
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  window.BrandiórMod = {
    scan: scan,
    scanImage: scanImage,
    report: report,
    getReports: getReports,
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})(window, document)
