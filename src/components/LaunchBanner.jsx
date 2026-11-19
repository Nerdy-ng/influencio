import { useEffect, useRef } from 'react'

// Midnight November 30, 2026 in West Africa Time (UTC+1)
const TARGET = new Date('2026-11-30T00:00:00+01:00').getTime()

function pad(n) { return String(n).padStart(2, '0') }

export default function LaunchBanner() {
  const dRef = useRef(null)
  const hRef = useRef(null)
  const mRef = useRef(null)
  const sRef = useRef(null)

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, TARGET - Date.now())
      if (dRef.current) dRef.current.textContent = pad(Math.floor(diff / 86400000))
      if (hRef.current) hRef.current.textContent = pad(Math.floor((diff % 86400000) / 3600000))
      if (mRef.current) mRef.current.textContent = pad(Math.floor((diff % 3600000) / 60000))
      if (sRef.current) sRef.current.textContent = pad(Math.floor((diff % 60000) / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(90deg, #1a0040 0%, #2d0060 50%, #1a0040 100%)',
      borderBottom: '1px solid rgba(124,58,237,0.25)',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F4A942' }}>
        Launching November 30
      </span>

      <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>·</span>

      {/* Countdown units */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[
          { ref: dRef, label: 'D' },
          { ref: hRef, label: 'H' },
          { ref: mRef, label: 'M' },
          { ref: sRef, label: 'S' },
        ].map(({ ref, label }, i) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {i > 0 && <span style={{ color: 'rgba(124,58,237,0.5)', fontWeight: 700, fontSize: '0.75rem', marginRight: '2px' }}>:</span>}
            <span
              ref={ref}
              style={{
                fontFamily: "'Inter', monospace",
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#F0EBF8',
                fontVariantNumeric: 'tabular-nums',
                minWidth: '22px',
                display: 'inline-block',
                textAlign: 'center',
              }}
            >00</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(240,235,248,0.3)', marginLeft: '1px' }}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
