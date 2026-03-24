import { useCallback } from 'react'
import {
  analyzeTextForSpam,
  analyzeImageForNSFW,
  submitReport,
  checkPostingFrequency,
  runProfileScan,
} from '../utils/moderationEngine'

export function useModerationReporter(userId, userName) {
  /**
   * scanText — scans text content for spam.
   * Auto-submits a report if spam is detected.
   * Returns { reported, report } or { reported: false }
   */
  const scanText = useCallback(
    (text, contentType = 'post') => {
      if (!text) return { reported: false }

      const result = analyzeTextForSpam(text)

      if (result.isSpam) {
        const severity =
          result.score >= 80 ? 'high' : result.score >= 60 ? 'medium' : 'low'

        const report = submitReport({
          type: 'spam',
          severity,
          autoDetected: true,
          userId,
          userName,
          contentType,
          contentPreview: text,
          imageUrl: null,
          reasons: result.reasons,
          score: result.score,
          confidence: null,
        })

        return { reported: true, report, result }
      }

      return { reported: false, result }
    },
    [userId, userName]
  )

  /**
   * scanImage — scans an image URL for NSFW content.
   * Auto-submits a report if flagged.
   * Returns { reported, report } or { reported: false }
   */
  const scanImage = useCallback(
    (imageUrl, contentType = 'post') => {
      if (!imageUrl) return { reported: false }

      const context = contentType === 'profile' ? 'profile' : 'post'
      const result = analyzeImageForNSFW(imageUrl, context)

      if (result.flagged) {
        const severity =
          result.confidence >= 0.9
            ? 'critical'
            : result.confidence >= 0.6
            ? 'high'
            : 'medium'

        const report = submitReport({
          type: 'nsfw',
          severity,
          autoDetected: true,
          userId,
          userName,
          contentType,
          contentPreview: `Image: ${imageUrl.slice(0, 80)}`,
          imageUrl,
          reasons: [result.reason].filter(Boolean),
          score: null,
          confidence: result.confidence,
        })

        return { reported: true, report, result }
      }

      return { reported: false, result }
    },
    [userId, userName]
  )

  /**
   * reportManually — user-triggered report. Always submits regardless of analysis.
   * Returns { reported: true, report }
   */
  const reportManually = useCallback(
    (contentType, contentPreview, imageUrl, reason) => {
      const report = submitReport({
        type: 'user_report',
        severity: 'medium',
        autoDetected: false,
        userId,
        userName,
        contentType: contentType || 'post',
        contentPreview: contentPreview || '',
        imageUrl: imageUrl || null,
        reasons: reason ? [reason] : ['User-submitted report'],
        score: null,
        confidence: null,
      })

      return { reported: true, report }
    },
    [userId, userName]
  )

  /**
   * checkFrequency — checks if the current user is posting too fast.
   * Returns { reported, report } or { reported: false }
   */
  const checkFrequency = useCallback(() => {
    const result = checkPostingFrequency(userId)

    if (result.flagged) {
      const report = submitReport({
        type: 'spam_frequency',
        severity: 'medium',
        autoDetected: true,
        userId,
        userName,
        contentType: 'post',
        contentPreview: result.reason || 'Excessive posting frequency detected',
        imageUrl: null,
        reasons: [result.reason].filter(Boolean),
        score: null,
        confidence: null,
      })

      return { reported: true, report, result }
    }

    return { reported: false, result }
  }, [userId, userName])

  /**
   * scanProfile — runs a full scan on a profile object.
   * Returns { reported, reports[] }
   */
  const scanProfile = useCallback(
    (profile) => {
      const enrichedProfile = {
        ...profile,
        id: profile?.id || userId,
        name: profile?.name || userName,
      }

      const reports = runProfileScan(enrichedProfile)

      return {
        reported: reports.length > 0,
        reports,
      }
    },
    [userId, userName]
  )

  return {
    scanText,
    scanImage,
    reportManually,
    checkFrequency,
    scanProfile,
  }
}
