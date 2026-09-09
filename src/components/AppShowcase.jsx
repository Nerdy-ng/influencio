import { useEffect, useRef } from 'react'

const pink = '#FF6B9D'
const purp = '#7c3aed'
const gold = '#D4AF37'

export function GooglePlayBadge({ size = 'md' }) {
  const h = size === 'sm' ? 40 : 52
  return (
    <a href="#" aria-label="Get it on Google Play"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 20px',
        border: '1px solid rgba(255,255,255,0.15)',
        textDecoration: 'none', height: h,
        transition: 'transform 0.2s, background 0.2s, border-color 0.2s',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
    >
      <svg width="20" height="22" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.428 0.359C0.159 0.644 0 1.083 0 1.655V18.345C0 18.917 0.159 19.356 0.428 19.641L0.5 19.711L9.786 10.425V10.213V10L0.5 0.713L0.428 0.359Z" fill="url(#gp1)"/>
        <path d="M12.92 13.562L9.786 10.425V10.213V10L12.92 6.863L13.008 6.914L16.726 9.049C17.78 9.649 17.78 10.638 16.726 11.24L13.008 13.375L12.92 13.562Z" fill="url(#gp2)"/>
        <path d="M13.008 13.375L9.786 10.213L0.428 19.641C0.772 20.007 1.338 20.052 1.972 19.693L13.008 13.375Z" fill="url(#gp3)"/>
        <path d="M13.008 6.914L1.972 0.596C1.338 0.236 0.772 0.282 0.428 0.648L9.786 10L13.008 6.914Z" fill="url(#gp4)"/>
        <defs>
          <linearGradient id="gp1" x1="8.786" y1="1.004" x2="-3.37" y2="13.16" gradientUnits="userSpaceOnUse"><stop stopColor="#00A0FF"/><stop offset="1" stopColor="#00B8FF"/></linearGradient>
          <linearGradient id="gp2" x1="18.02" y1="10.213" x2="-0.285" y2="10.213" gradientUnits="userSpaceOnUse"><stop stopColor="#FFE000"/><stop offset="1" stopColor="#FFBD00"/></linearGradient>
          <linearGradient id="gp3" x1="11.01" y1="12.018" x2="-4.17" y2="27.199" gradientUnits="userSpaceOnUse"><stop stopColor="#FF3A44"/><stop offset="1" stopColor="#C31162"/></linearGradient>
          <linearGradient id="gp4" x1="-1.788" y1="-4.58" x2="5.896" y2="3.104" gradientUnits="userSpaceOnUse"><stop stopColor="#32A071"/><stop offset="1" stopColor="#2DA771"/></linearGradient>
        </defs>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter,sans-serif' }}>Get it on</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif', marginTop: 3 }}>Google Play</span>
      </div>
    </a>
  )
}

export function AppStoreBadge({ size = 'md' }) {
  const h = size === 'sm' ? 40 : 52
  return (
    <a href="#" aria-label="Download on the App Store"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 20px',
        border: '1px solid rgba(255,255,255,0.15)',
        textDecoration: 'none', height: h,
        transition: 'transform 0.2s, background 0.2s, border-color 0.2s',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
    >
      <svg width="18" height="22" viewBox="0 0 17 21" fill="white">
        <path d="M8.562 5.148c.908 0 2.043-.614 2.717-1.432.608-.745 1.053-1.786 1.053-2.827 0-.141-.013-.282-.038-.395-.982.037-2.17.655-2.882 1.511-.571.668-1.091 1.696-1.091 2.749 0 .155.025.31.05.373.063.013.127.021.191.021zM5.632 21c1.256 0 1.814-.841 3.384-.841 1.595 0 1.94.814 3.346.814 1.381 0 2.308-1.27 3.183-2.519.982-1.424 1.381-2.821 1.406-2.883-.089-.027-2.745-1.075-2.745-4.023 0-2.52 2.042-3.704 2.156-3.79-1.244-1.79-3.158-1.842-3.714-1.842-1.545 0-2.806.933-3.6.933-.857 0-1.98-.882-3.32-.882C2.666 6.967 0 9.254 0 13.449c0 2.607 1.017 5.364 2.27 7.143C3.363 21.91 4.376 21 5.632 21z"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter,sans-serif' }}>Download on the</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif', marginTop: 3 }}>App Store</span>
      </div>
    </a>
  )
}

function PhoneScreen({ variant = 'main' }) {
  const creators = [
    { initials: 'AO', name: 'Amara Osei',   niche: 'Beauty',  followers: '284K', rating: '4.9', color: pink,      verified: true  },
    { initials: 'JM', name: 'Jordan Malik',  niche: 'Fitness', followers: '512K', rating: '4.8', color: '#c4b5fd', verified: true  },
    { initials: 'TO', name: 'Tunde Okafor',  niche: 'Tech',    followers: '143K', rating: '4.6', color: '#60a5fa', verified: false },
  ]
  const w = variant === 'side' ? 210 : 270

  return (
    <div style={{
      width: w, flexShrink: 0,
      background: 'linear-gradient(160deg, #120025 0%, #0a0015 100%)',
      borderRadius: variant === 'side' ? 30 : 42,
      border: `1.5px solid rgba(124,58,237,${variant === 'side' ? 0.25 : 0.45})`,
      boxShadow: variant === 'side'
        ? '0 20px 60px rgba(0,0,0,0.5)'
        : `0 0 0 1px rgba(124,58,237,0.1), 0 50px 100px rgba(0,0,0,0.7), 0 0 80px rgba(124,58,237,0.18)`,
      padding: variant === 'side' ? '10px 6px' : '14px 10px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* pill notch */}
      <div style={{
        width: variant === 'side' ? 60 : 80,
        height: variant === 'side' ? 18 : 22,
        background: '#0a0015',
        borderRadius: '0 0 12px 12px',
        margin: '0 auto 8px',
        border: '1.5px solid rgba(124,58,237,0.2)',
        borderTop: 'none',
      }} />

      <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/logo.png" alt="" style={{ width: variant === 'side' ? 18 : 22, height: variant === 'side' ? 18 : 22, objectFit: 'contain' }} />
          <span style={{ fontSize: variant === 'side' ? 9 : 11, fontWeight: 800, color: '#fff', letterSpacing: '0.08em', fontFamily: 'Inter,sans-serif' }}>BRANDIOR</span>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          </div>
        </div>

        {/* search */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 8, padding: '6px 10px',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter,sans-serif' }}>Find creators…</span>
        </div>

        {/* niche pills */}
        {variant !== 'side' && (
          <div style={{ display: 'flex', gap: 5 }}>
            {[['Fashion', pink], ['Beauty', '#c4b5fd'], ['Tech', '#60a5fa']].map(([l, c]) => (
              <span key={l} style={{
                fontSize: 8, fontWeight: 600, color: c, fontFamily: 'Inter,sans-serif',
                background: `${c}18`, border: `1px solid ${c}33`,
                borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap',
              }}>{l}</span>
            ))}
          </div>
        )}

        {/* creator cards */}
        {creators.slice(0, variant === 'side' ? 2 : 3).map(c => (
          <div key={c.initials} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '7px 8px',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <div style={{
              width: variant === 'side' ? 26 : 30,
              height: variant === 'side' ? 26 : 30,
              borderRadius: 8, flexShrink: 0,
              background: `linear-gradient(135deg, ${c.color}66, ${c.color}22)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800, color: c.color, fontFamily: 'Inter,sans-serif',
            }}>{c.initials}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif' }}>{c.name}</span>
                {c.verified && <svg width="8" height="8" viewBox="0 0 24 24" fill={c.color}><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter,sans-serif', marginTop: 1 }}>{c.niche} · {c.followers}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill={gold}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ fontSize: 9, color: gold, fontWeight: 700, fontFamily: 'Inter,sans-serif' }}>{c.rating}</span>
            </div>
          </div>
        ))}

        {/* bottom nav */}
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
          ].map((icon, i) => (
            <div key={i} style={{
              padding: '5px 8px', borderRadius: 8,
              background: i === 0 ? 'rgba(124,58,237,0.2)' : 'transparent',
            }}>{icon}</div>
          ))}
        </div>
      </div>

      {/* inner glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', height: 80,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

export default function AppShowcase() {
  const sectionRef = useRef(null)
  const leftRef    = useRef(null)
  const phoneWrap  = useRef(null)

  useEffect(() => {
    const els = [leftRef.current, phoneWrap.current].filter(Boolean)
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1'
          entry.target.style.transform = 'translateY(0)'
          observer.unobserve(entry.target)
        }
      }),
      { threshold: 0.15 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #07000f 0%, #0e0020 40%, #0e0020 60%, #07000f 100%)',
      padding: '120px 24px',
    }}>
      {/* ── Background elements ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 50% at 80% 50%, rgba(124,58,237,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 20% 80%, ${pink}0d 0%, transparent 60%)
        `,
      }} />

      {/* decorative ring */}
      <div style={{
        position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)',
        width: 520, height: 520,
        borderRadius: '50%',
        border: '1px solid rgba(124,58,237,0.08)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 'calc(10% - 50px)', top: '50%', transform: 'translateY(-50%)',
        width: 620, height: 620,
        borderRadius: '50%',
        border: '1px solid rgba(124,58,237,0.04)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1140, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        gap: 80, flexWrap: 'wrap', justifyContent: 'center',
      }}>

        {/* ── LEFT: copy ── */}
        <div ref={leftRef} style={{
          flex: '1 1 380px', maxWidth: 500,
          opacity: 0, transform: 'translateY(40px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}>
          {/* eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${purp}25`, border: `1px solid ${purp}50`,
            borderRadius: 100, padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c084fc', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#c084fc', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Inter,sans-serif' }}>Brandior Mobile</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 900, color: '#fff', lineHeight: 1.08,
            marginBottom: 20, fontFamily: 'Inter,sans-serif',
            letterSpacing: '-0.02em',
          }}>
            Your creator
            <br />
            marketplace,
            <br />
            <span style={{
              background: `linear-gradient(90deg, #c084fc 0%, ${pink} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>in your pocket.</span>
          </h2>

          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75,
            marginBottom: 40, maxWidth: 400, fontFamily: 'Inter,sans-serif',
          }}>
            Browse creators, send briefs, track collabs and release payments — all from the Brandior app. Built for Nigeria, built for speed.
          </p>

          {/* feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 44 }}>
            {[
              ['Escrow-protected payments', purp],
              ['Real-time collab messaging', pink],
              ['KYC-verified creator profiles', '#22c55e'],
              ['Instant deal tracking & receipts', gold],
            ].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: `${color}18`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter,sans-serif' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* badges */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <GooglePlayBadge />
            <AppStoreBadge />
          </div>
        </div>

        {/* ── RIGHT: phones ── */}
        <div ref={phoneWrap} style={{
          position: 'relative',
          opacity: 0, transform: 'translateY(60px)',
          transition: 'opacity 1s ease 0.2s, transform 1s cubic-bezier(0.22,1,0.36,1) 0.2s',
          display: 'flex', alignItems: 'flex-end', gap: -20,
          paddingBottom: 40,
        }}>
          {/* background phone (tilted) */}
          <div style={{
            position: 'absolute', left: -90, bottom: 0,
            transform: 'rotate(-8deg) translateY(20px)',
            opacity: 0.45,
            filter: 'blur(1px)',
            zIndex: 0,
          }}>
            <PhoneScreen variant="side" />
          </div>

          {/* main phone */}
          <div style={{
            position: 'relative', zIndex: 1,
            animation: 'phonefloat 5s ease-in-out infinite',
          }}>
            <PhoneScreen variant="main" />
          </div>

          {/* floating stat cards */}
          <div style={{
            position: 'absolute', top: 20, right: -80,
            background: 'rgba(13,0,32,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 14, padding: '12px 16px',
            animation: 'floatcard1 4s ease-in-out infinite',
            zIndex: 2,
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif', marginBottom: 2 }}>Active Collabs</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#c084fc', fontFamily: 'Inter,sans-serif' }}>1,240</div>
          </div>

          <div style={{
            position: 'absolute', bottom: 60, right: -70,
            background: 'rgba(13,0,32,0.85)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${pink}40`,
            borderRadius: 14, padding: '12px 16px',
            animation: 'floatcard2 5s ease-in-out infinite',
            zIndex: 2,
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif', marginBottom: 2 }}>Paid out</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: pink, fontFamily: 'Inter,sans-serif' }}>₦84M+</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes phonefloat  { 0%,100% { transform: translateY(0);     } 50% { transform: translateY(-14px); } }
        @keyframes floatcard1  { 0%,100% { transform: translateY(0);     } 50% { transform: translateY(-8px);  } }
        @keyframes floatcard2  { 0%,100% { transform: translateY(0);     } 50% { transform: translateY(8px);   } }
      `}</style>
    </section>
  )
}
