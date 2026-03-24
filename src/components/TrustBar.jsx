const logos = [
  {
    name: 'NovaSkin',
    svg: (
      <svg viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <circle cx="14" cy="16" r="8" fill="currentColor" opacity="0.15"/>
        <circle cx="14" cy="16" r="4" fill="currentColor"/>
        <text x="28" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">NovaSkin</text>
      </svg>
    ),
  },
  {
    name: 'PeakFit',
    svg: (
      <svg viewBox="0 0 90 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <path d="M6 24 L14 8 L22 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 18 L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <text x="30" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">PeakFit</text>
      </svg>
    ),
  },
  {
    name: 'LoomHaus',
    svg: (
      <svg viewBox="0 0 105 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <rect x="4" y="8" width="18" height="16" rx="3" fill="currentColor" opacity="0.15"/>
        <rect x="8" y="12" width="10" height="8" rx="1.5" fill="currentColor"/>
        <text x="30" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">LoomHaus</text>
      </svg>
    ),
  },
  {
    name: 'BiteBliss',
    svg: (
      <svg viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <path d="M14 6 C8 6 4 10 4 16 C4 22 8 26 14 26 C18 26 22 23 22 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="19" cy="9" r="3" fill="currentColor"/>
        <text x="30" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">BiteBliss</text>
      </svg>
    ),
  },
  {
    name: 'GlowLab',
    svg: (
      <svg viewBox="0 0 95 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <circle cx="14" cy="16" r="6" stroke="currentColor" strokeWidth="2"/>
        <path d="M14 4 L14 7 M14 25 L14 28 M4 16 L7 16 M21 16 L24 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <text x="30" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">GlowLab</text>
      </svg>
    ),
  },
  {
    name: 'UrbanThread',
    svg: (
      <svg viewBox="0 0 118 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <path d="M6 10 L6 20 Q6 26 14 26 Q22 26 22 20 L22 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M6 10 L22 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <text x="30" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">UrbanThread</text>
      </svg>
    ),
  },
  {
    name: 'MindfulBrew',
    svg: (
      <svg viewBox="0 0 118 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <path d="M6 20 Q14 8 22 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M22 16 Q26 12 24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <line x1="6" y1="24" x2="24" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <text x="32" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">MindfulBrew</text>
      </svg>
    ),
  },
  {
    name: 'VerdeFresh',
    svg: (
      <svg viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <path d="M14 24 C14 24 4 18 4 11 C4 7 8 5 11 7 C12 8 13 9 14 11 C15 9 16 8 17 7 C20 5 24 7 24 11 C24 18 14 24 14 24Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
        <text x="30" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">VerdeFresh</text>
      </svg>
    ),
  },
  {
    name: 'SwiftTech',
    svg: (
      <svg viewBox="0 0 105 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <path d="M22 8 L10 17 L16 17 L6 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="30" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">SwiftTech</text>
      </svg>
    ),
  },
  {
    name: 'LuxeNest',
    svg: (
      <svg viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
        <path d="M14 6 L24 14 L24 26 L4 26 L4 14 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" opacity="0.1"/>
        <path d="M9 26 L9 18 L14 18 L14 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <text x="30" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="currentColor">LuxeNest</text>
      </svg>
    ),
  },
]

// duplicate for seamless loop
const allLogos = [...logos, ...logos]

export default function TrustBar() {
  return (
    <section className="bg-white py-12 border-b border-brand-sand">
      <div className="max-w-7xl mx-auto px-6 mb-7 text-center">
        <p className="text-xs font-semibold text-black uppercase tracking-widest">
          Brands and Entrepreneurs Love Us
        </p>
      </div>
      <div className="marquee-container">
        <div className="marquee-track">
          {allLogos.map((brand, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-10 text-brand-dark/25 hover:text-brand-dark/60 transition-colors cursor-default select-none"
            >
              {brand.svg}
              {i < allLogos.length - 1 && (
                <span className="ml-10 w-1 h-1 rounded-full bg-brand-dark/15 inline-block" />
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
