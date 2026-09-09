import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'

const TARGET = new Date('2026-10-09T00:00:00').getTime()

function pad(n) { return String(n).padStart(2, '0') }

export default function Landing() {
  const daysRef    = useRef(null)
  const hoursRef   = useRef(null)
  const minutesRef = useRef(null)
  const secondsRef = useRef(null)

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, TARGET - Date.now())
      if (daysRef.current)    daysRef.current.textContent    = pad(Math.floor(diff / 86400000))
      if (hoursRef.current)   hoursRef.current.textContent   = pad(Math.floor((diff % 86400000) / 3600000))
      if (minutesRef.current) minutesRef.current.textContent = pad(Math.floor((diff % 3600000)  / 60000))
      if (secondsRef.current) secondsRef.current.textContent = pad(Math.floor((diff % 60000)    / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  function handleNotify(e) {
    e.preventDefault()
    const form  = e.currentTarget
    const input = form.querySelector('input[type="email"]')
    const btn   = form.querySelector('button')
    const msg   = document.getElementById('success-msg')
    if (!input.value.trim() || !input.value.includes('@')) {
      input.focus()
      input.style.borderColor = '#ef4444'
      setTimeout(() => { input.style.borderColor = '' }, 1200)
      return
    }
    if (btn)   { btn.textContent = 'Done!'; btn.disabled = true; btn.style.opacity = '0.6' }
    if (input) { input.style.display = 'none' }
    if (msg)   { msg.style.display = 'block' }
  }

  return (
    <>
      <Helmet>
        <title>Brandior — Coming Soon</title>
        <meta name="description" content="A marketplace built for the African creative economy — connecting brands with talented creators, effortlessly." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Helmet>

      <style>{`
        .cs-body {
          background: #0e0020;
          color: #F0EBF8;
          font-family: 'DM Sans', system-ui, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
        }
        .cs-body::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(244,169,66,0.06) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        .cs-page {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: csUp 0.8s ease both;
        }
        @keyframes csUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-wordmark {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.125rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #F0EBF8;
          margin-bottom: 56px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cs-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #F4A942;
          display: inline-block;
          flex-shrink: 0;
        }
        .cs-eyebrow {
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #F4A942;
          margin-bottom: 20px;
        }
        .cs-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 6vw, 3.25rem);
          line-height: 1.1;
          text-align: center;
          color: #F0EBF8;
          margin-bottom: 16px;
        }
        .cs-sub {
          font-size: 1rem;
          font-weight: 300;
          color: #7a6a90;
          text-align: center;
          line-height: 1.6;
          max-width: 420px;
          margin-bottom: 56px;
        }
        .cs-countdown {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 56px;
        }
        .cs-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 80px;
        }
        .cs-digit {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: clamp(3rem, 10vw, 5rem);
          line-height: 1;
          color: #F4A942;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }
        .cs-unit-label {
          font-size: 0.625rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7a6a90;
        }
        .cs-sep {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.5rem, 8vw, 4rem);
          color: rgba(124,58,237,0.18);
          line-height: 1;
          margin-top: 4px;
          user-select: none;
        }
        .cs-divider {
          width: 100%;
          height: 1px;
          background: rgba(240,235,248,0.08);
          margin-bottom: 40px;
        }
        .cs-form-wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .cs-form-label {
          font-size: 0.8125rem;
          color: #7a6a90;
          text-align: center;
        }
        .cs-form-row {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 420px;
        }
        .cs-input {
          flex: 1;
          background: #180430;
          border: 1px solid rgba(124,58,237,0.18);
          border-radius: 10px;
          padding: 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9375rem;
          color: #F0EBF8;
          outline: none;
          transition: border-color 0.2s;
        }
        .cs-input::placeholder { color: #7a6a90; }
        .cs-input:focus { border-color: #7c3aed; }
        .cs-btn {
          background: #F4A942;
          color: #0e0020;
          border: none;
          border-radius: 10px;
          padding: 13px 22px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.15s, transform 0.1s;
        }
        .cs-btn:hover { opacity: 0.88; }
        .cs-btn:active { transform: scale(0.97); }
        .cs-success {
          display: none;
          font-size: 0.875rem;
          color: #F4A942;
          text-align: center;
        }
        .cs-footer {
          margin-top: 48px;
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }
        .cs-footer a {
          font-size: 0.8125rem;
          color: #7a6a90;
          text-decoration: none;
          transition: color 0.15s;
        }
        .cs-footer a:hover { color: #F0EBF8; }
        .cs-signin { color: #7c3aed !important; font-weight: 500; }
        .cs-signin:hover { color: #9f6ff0 !important; }
        @media (max-width: 480px) {
          .cs-countdown { gap: 8px; }
          .cs-unit { min-width: 60px; }
          .cs-sep { display: none; }
          .cs-form-row { flex-direction: column; }
          .cs-btn { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="cs-body">
        <div className="cs-page">
          <div className="cs-wordmark">
            <img src="/logo.png" alt="Brandior logo" style={{width:'32px',height:'32px',objectFit:'contain'}} />
            Brandior
          </div>

          <p className="cs-eyebrow">Coming Soon</p>

          <h1 className="cs-h1">Something big is<br />coming to Nigeria.</h1>


          <div className="cs-countdown">
            <div className="cs-unit">
              <span className="cs-digit" ref={daysRef}>30</span>
              <span className="cs-unit-label">Days</span>
            </div>
            <span className="cs-sep">:</span>
            <div className="cs-unit">
              <span className="cs-digit" ref={hoursRef}>00</span>
              <span className="cs-unit-label">Hours</span>
            </div>
            <span className="cs-sep">:</span>
            <div className="cs-unit">
              <span className="cs-digit" ref={minutesRef}>00</span>
              <span className="cs-unit-label">Minutes</span>
            </div>
            <span className="cs-sep">:</span>
            <div className="cs-unit">
              <span className="cs-digit" ref={secondsRef}>00</span>
              <span className="cs-unit-label">Seconds</span>
            </div>
          </div>

          <div className="cs-divider"></div>

          <div className="cs-form-wrap">
            <p className="cs-form-label">Be the first to know when we launch.</p>
            <form className="cs-form-row" onSubmit={handleNotify}>
              <input type="email" className="cs-input" placeholder="your@email.com" autoComplete="email" />
              <button type="submit" className="cs-btn">Notify me</button>
            </form>
            <p className="cs-success" id="success-msg">You're on the list. We'll be in touch!</p>
          </div>

          <div className="cs-footer">
            <a href="https://app.brandior.africa/login" className="cs-signin">Already have an account? Sign in →</a>
            <a href="mailto:support@brandior.africa">Contact us</a>
          </div>
        </div>
      </div>
    </>
  )
}
