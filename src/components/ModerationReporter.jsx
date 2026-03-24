import { useEffect, useRef, useState } from 'react'
import { Flag } from 'lucide-react'
import { useModerationReporter } from '../hooks/useModerationReporter'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or promotional content' },
  { value: 'nsfw', label: 'Inappropriate / nudity' },
  { value: 'misleading', label: 'Misleading information' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' },
]

export default function ModerationReporter({
  contentId,
  contentType = 'post',
  contentText,
  imageUrl,
  authorId,
  authorName,
  autoScan = true,
}) {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [alreadyAutoReported, setAlreadyAutoReported] = useState(false)
  const popoverRef = useRef(null)
  const buttonRef = useRef(null)

  const { scanText, scanImage, reportManually } = useModerationReporter(authorId, authorName)

  // Auto-scan on mount
  useEffect(() => {
    if (!autoScan) return

    let reported = false

    if (contentText) {
      const textResult = scanText(contentText, contentType)
      if (textResult.reported) reported = true
    }

    if (imageUrl && !reported) {
      const imgResult = scanImage(imageUrl, contentType)
      if (imgResult.reported) reported = true
    }

    if (reported) setAlreadyAutoReported(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId])

  // Close popover on outside click
  useEffect(() => {
    if (!open) return

    function handleClickOutside(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleSelectReason(reason) {
    const preview = contentText || imageUrl || `[${contentType}] ${contentId}`
    reportManually(contentType, preview, imageUrl || null, reason.label)
    setOpen(false)
    setConfirmed(true)

    setTimeout(() => setConfirmed(false), 3000)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Report button */}
      <button
        ref={buttonRef}
        onClick={() => {
          if (!confirmed) setOpen(prev => !prev)
        }}
        title="Report this content"
        aria-label="Report this content"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          background: 'transparent',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          color: confirmed ? '#16a34a' : '#94a3b8',
          transition: 'color 0.15s, border-color 0.15s',
          lineHeight: 1,
        }}
        onMouseEnter={e => {
          if (!confirmed) e.currentTarget.style.color = '#64748b'
        }}
        onMouseLeave={e => {
          if (!confirmed) e.currentTarget.style.color = '#94a3b8'
        }}
      >
        <Flag size={12} strokeWidth={1.8} />
        {confirmed ? 'Reported' : 'Report'}
      </button>

      {/* Confirmation toast */}
      {confirmed && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#15803d',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            zIndex: 1000,
          }}
          role="status"
          aria-live="polite"
        >
          Reported — our team will review this.
        </div>
      )}

      {/* Dropdown popover */}
      {open && !confirmed && (
        <div
          ref={popoverRef}
          role="menu"
          aria-label="Report reason"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 1000,
            minWidth: '210px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 14px 6px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            Why are you reporting this?
          </div>

          {REPORT_REASONS.map(reason => (
            <button
              key={reason.value}
              role="menuitem"
              onClick={() => handleSelectReason(reason)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#334155',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {reason.label}
            </button>
          ))}

          <div
            style={{
              padding: '6px 14px 10px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
