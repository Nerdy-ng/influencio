import { useEffect, useRef, useState } from 'react'
import { getReports, getModerationStats, updateReportStatus } from '../utils/moderationEngine'

// ─── Severity colour map ──────────────────────────────────────────────────────
const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

const TYPE_LABELS = {
  spam: 'SPAM',
  nsfw: 'NSFW',
  spam_frequency: 'FREQUENCY',
  user_report: 'USER REPORT',
}

function Badge({ children, bg, color = '#fff', style = {} }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: bg,
        color,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '16px 20px',
        minWidth: '130px',
        flex: '1 1 130px',
      }}
    >
      <div style={{ fontSize: '28px', fontWeight: 700, color: accent || '#1e293b' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

function ReportCard({ report, onAction }) {
  const [imageRevealed, setImageRevealed] = useState(false)
  const severityColor = SEVERITY_COLORS[report.severity] || '#94a3b8'

  const formattedTime = (() => {
    try {
      return new Date(report.timestamp).toLocaleString()
    } catch {
      return report.timestamp
    }
  })()

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '12px',
        background: '#ffffff',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: '#1e293b',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* Severity badge */}
        <Badge bg={severityColor} style={{ textTransform: 'uppercase' }}>
          {report.severity}
        </Badge>

        {/* Type badge */}
        <Badge bg="#334155" color="#e2e8f0">
          {TYPE_LABELS[report.type] || report.type.toUpperCase()}
        </Badge>

        {/* Auto-detected vs User reported */}
        {report.autoDetected ? (
          <Badge bg="#7c3aed" color="#ede9fe">
            Auto-detected
          </Badge>
        ) : (
          <Badge bg="#1d4ed8" color="#dbeafe">
            User Reported
          </Badge>
        )}

        {/* Requires review */}
        {report.type === 'nsfw' && (
          <Badge bg="#92400e" color="#fef3c7">
            Requires human review
          </Badge>
        )}

        {/* Report ID (right-aligned) */}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '11px',
            color: '#64748b',
            fontFamily: 'monospace',
          }}
        >
          {report.id}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        {/* User + content type */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: '#475569',
              flexShrink: 0,
            }}
          >
            {(report.userName || '?')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
              {report.userName}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {report.contentType} &middot; {formattedTime}
            </div>
          </div>
        </div>

        {/* Content preview */}
        {report.contentPreview && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '13px',
              color: '#475569',
              marginBottom: '10px',
              fontStyle: 'italic',
              wordBreak: 'break-word',
            }}
          >
            "{report.contentPreview}"
          </div>
        )}

        {/* NSFW image thumbnail */}
        {report.imageUrl && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={report.imageUrl}
                alt="Flagged content"
                onError={e => { e.target.style.display = 'none' }}
                style={{
                  maxWidth: '160px',
                  maxHeight: '120px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  filter: imageRevealed ? 'none' : 'blur(8px)',
                  transition: 'filter 0.2s',
                  display: 'block',
                }}
              />
              {!imageRevealed && (
                <button
                  onClick={() => setImageRevealed(true)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Click to reveal
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reasons */}
        {report.reasons && report.reasons.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div
              style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}
            >
              DETECTION REASONS
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
              {report.reasons.map((r, i) => (
                <li key={i} style={{ fontSize: '12px', color: '#475569', marginBottom: '2px' }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Score / Confidence */}
        {(report.score !== null || report.confidence !== null) && (
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#64748b',
            }}
          >
            {report.score !== null && (
              <span>
                Spam score:{' '}
                <strong style={{ color: report.score > 60 ? '#ef4444' : '#334155' }}>
                  {report.score}/100
                </strong>
              </span>
            )}
            {report.confidence !== null && (
              <span>
                NSFW confidence:{' '}
                <strong style={{ color: report.confidence > 0.7 ? '#ef4444' : '#334155' }}>
                  {(report.confidence * 100).toFixed(0)}%
                </strong>
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        {report.status === 'pending' ? (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <ActionButton
              label="Approve"
              bg="#dcfce7"
              color="#15803d"
              hoverBg="#bbf7d0"
              onClick={() => onAction(report.id, 'reviewed', 'moderator', 'approved')}
            />
            <ActionButton
              label="Remove Content"
              bg="#fee2e2"
              color="#b91c1c"
              hoverBg="#fecaca"
              onClick={() => onAction(report.id, 'actioned', 'moderator', 'content_removed')}
            />
            <ActionButton
              label="Warn User"
              bg="#fef3c7"
              color="#92400e"
              hoverBg="#fde68a"
              onClick={() => onAction(report.id, 'actioned', 'moderator', 'user_warned')}
            />
            <ActionButton
              label="Ban User"
              bg="#1e293b"
              color="#f8fafc"
              hoverBg="#334155"
              onClick={() => onAction(report.id, 'actioned', 'moderator', 'user_banned')}
            />
          </div>
        ) : (
          <div
            style={{
              fontSize: '12px',
              color: '#64748b',
              padding: '6px 10px',
              background: '#f8fafc',
              borderRadius: '6px',
              display: 'inline-block',
            }}
          >
            Status:{' '}
            <strong style={{ textTransform: 'capitalize' }}>{report.status}</strong>
            {report.action && (
              <>
                {' '}
                &mdash; Action:{' '}
                <strong style={{ textTransform: 'capitalize' }}>
                  {report.action.replace(/_/g, ' ')}
                </strong>
              </>
            )}
            {report.reviewedAt && (
              <>
                {' '}
                &mdash;{' '}
                {(() => {
                  try { return new Date(report.reviewedAt).toLocaleString() } catch { return '' }
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionButton({ label, bg, color, hoverBg, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        background: hovered ? hoverBg : bg,
        color,
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  )
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function AdminModerationDashboard() {
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    spam: 0,
    nsfw: 0,
    thisWeek: 0,
    autoDetected: 0,
  })

  // Filters
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const listenerRef = useRef(null)

  function loadData() {
    const filters = {}
    if (filterType !== 'all') filters.type = filterType
    if (filterSeverity !== 'all') filters.severity = filterSeverity
    if (filterStatus !== 'all') filters.status = filterStatus

    setReports(getReports(filters))
    setStats(getModerationStats())
  }

  // Initial load
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterSeverity, filterStatus])

  // Listen for new reports in real time
  useEffect(() => {
    function handleNewReport(e) {
      setReports(prev => {
        const exists = prev.some(r => r.id === e.detail.id)
        if (exists) return prev
        return [e.detail, ...prev]
      })
      setStats(getModerationStats())
    }

    window.addEventListener('brandiór:moderation-report', handleNewReport)
    listenerRef.current = handleNewReport

    return () => window.removeEventListener('brandiór:moderation-report', handleNewReport)
  }, [])

  function handleAction(reportId, status, reviewedBy, action) {
    updateReportStatus(reportId, status, reviewedBy, action)
    loadData()
  }

  function clearReviewed() {
    // Remove reviewed/actioned reports from localStorage
    let allReports = getReports({})
    const pending = allReports.filter(r => r.status === 'pending')
    try {
      localStorage.setItem('brandiór_mod_reports', JSON.stringify(pending))
    } catch {
      // ignore
    }
    loadData()
  }

  const filterButtonStyle = (active) => ({
    padding: '5px 12px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: active ? '#3b82f6' : '#e2e8f0',
    background: active ? '#eff6ff' : '#ffffff',
    color: active ? '#1d4ed8' : '#64748b',
    fontSize: '12px',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '24px 16px',
        color: '#1e293b',
      }}
    >
      {/* Page title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>
          Content Moderation
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
          Review flagged content and take action.
        </p>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        <StatCard label="Total Reports" value={stats.total} />
        <StatCard label="Pending Review" value={stats.pending} accent="#f97316" />
        <StatCard label="Spam Reports" value={stats.spam} accent="#ef4444" />
        <StatCard label="NSFW Reports" value={stats.nsfw} accent="#8b5cf6" />
        <StatCard label="This Week" value={stats.thisWeek} accent="#3b82f6" />
        <StatCard label="Auto-Detected" value={stats.autoDetected} accent="#7c3aed" />
      </div>

      {/* Filter row */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          alignItems: 'center',
        }}
      >
        {/* Type filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All Types' },
            { value: 'spam', label: 'Spam' },
            { value: 'nsfw', label: 'NSFW' },
            { value: 'spam_frequency', label: 'Frequency' },
            { value: 'user_report', label: 'User Reports' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              style={filterButtonStyle(filterType === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }} />

        {/* Severity filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All Severity' },
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterSeverity(opt.value)}
              style={filterButtonStyle(filterSeverity === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }} />

        {/* Status filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'reviewed', label: 'Reviewed' },
            { value: 'actioned', label: 'Actioned' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              style={filterButtonStyle(filterStatus === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report list */}
      {reports.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#94a3b8',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px dashed #e2e8f0',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            {'\u{1F6E1}'}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: '#475569' }}>
            No reports found
          </div>
          <div style={{ fontSize: '13px' }}>
            {filterType !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting the filters above.'
              : 'All content is clear. No flagged items at this time.'}
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginBottom: '12px',
            }}
          >
            Showing {reports.length} report{reports.length !== 1 ? 's' : ''}
          </div>
          {reports.map(report => (
            <ReportCard key={report.id} report={report} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* Footer actions */}
      {reports.some(r => r.status !== 'pending') && (
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={clearReviewed}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#64748b',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Clear All Reviewed
          </button>
        </div>
      )}
    </div>
  )
}
