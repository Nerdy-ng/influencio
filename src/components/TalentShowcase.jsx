import { useState, useEffect } from 'react'
import { Play, BadgeCheck } from 'lucide-react'
import { getSectionContent } from '../utils/cmsContent'

const talents = [
  { name: 'Amara Osei',   handle: '@amaraosei',  niche: 'Beauty & Skincare', location: 'Lagos, NG',   followers: '284K', engagement: '6.4%', verified: true,  initials: 'AO', accent: '#FF6B9D', video: null },
  { name: 'Jordan Malik', handle: '@jordanmalik', niche: 'Fitness & Health',  location: 'Accra, GH',   followers: '512K', engagement: '4.8%', verified: true,  initials: 'JM', accent: '#FF6B9D', video: null },
  { name: 'Priya Kapoor', handle: '@priyakapoor', niche: 'Food & Travel',     location: 'Nairobi, KE', followers: '97K',  engagement: '9.1%', verified: false, initials: 'PK', accent: '#D4AF37', video: null },
  { name: 'Leon Dubois',  handle: '@leondubois',  niche: 'Tech & Gaming',     location: 'Nairobi, KE', followers: '1.2M', engagement: '3.2%', verified: true,  initials: 'LD', accent: '#FF6B9D', video: null },
  { name: 'Sofia Reyes',  handle: '@sofiareyes',  niche: 'Fashion & Style',   location: 'Accra, GH',   followers: '178K', engagement: '7.6%', verified: true,  initials: 'SR', accent: '#FF6B9D', video: null },
  { name: 'Kwame Asante', handle: '@kwameasante', niche: 'Comedy & Skits',    location: 'Kumasi, GH',  followers: '890K', engagement: '8.3%', verified: true,  initials: 'KA', accent: '#D4AF37', video: null },
]

// duplicate for seamless infinite loop
const allTalents = [...talents, ...talents]

function TalentCard({ c }) {
  return (
    <div
      className="relative flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer"
      style={{ width: '220px', height: '380px' }}
    >
      {/* Video / placeholder */}
      {c.video ? (
        <video src={c.video} className="w-full h-full object-cover" autoPlay muted loop playsInline />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, #111 60%, ${c.accent}18)` }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white border-2"
            style={{ borderColor: c.accent, backgroundColor: `${c.accent}22` }}
          >
            {c.initials}
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${c.accent}cc` }}
        >
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: c.accent }} />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-1 mb-0.5">
          <p className="text-white font-bold text-sm truncate">{c.name}</p>
          {c.verified && <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.accent }} />}
        </div>
        <p className="text-white/40 text-xs mb-2">{c.handle} · {c.location}</p>
        <span
          className="inline-block text-[10px] font-semibold rounded-full px-2 py-0.5 mb-3"
          style={{ color: c.accent, backgroundColor: `${c.accent}18`, border: `1px solid ${c.accent}33` }}
        >
          {c.niche}
        </span>
        <div className="flex gap-4">
          <div>
            <p className="text-white font-bold text-xs">{c.followers}</p>
            <p className="text-white/30 text-[9px] uppercase tracking-wide">Followers</p>
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: c.accent }}>{c.engagement}</p>
            <p className="text-white/30 text-[9px] uppercase tracking-wide">Eng. Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TalentShowcase() {
  const [cms, setCms] = useState(() => getSectionContent('landing', 'showcase'))

  useEffect(() => {
    const handler = e => {
      if (e.detail?.page === 'landing') setCms(getSectionContent('landing', 'showcase'))
    }
    window.addEventListener('brandiór:cms-update', handler)
    return () => window.removeEventListener('brandiór:cms-update', handler)
  }, [])

  return (
    <section id="talents" className="py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f3eeff 0%, #e8d5ff 100%)' }}>
      <div className="max-w-7xl mx-auto px-6 mb-14">
        <div className="flex flex-col items-center">
          <div className="w-fit">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B9D' }}>
              {cms.section_label}
            </p>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{ color: '#1a0030' }}>
              {cms.section_title} <span style={{ color: '#7c3aed' }}>{cms.section_title_highlight}</span>
            </h2>
          </div>
        </div>
        <p className="text-sm mt-3 whitespace-nowrap text-center" style={{ color: '#6b21a8' }}>
          {cms.section_subtitle}
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <a href="/signup?role=brand"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
          style={{ backgroundColor: '#7c3aed', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
          {cms.cta_text}
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      <div className="talent-scroll-container">
        <div className="talent-scroll-track">
          {allTalents.map((c, i) => (
            <TalentCard key={i} c={c} />
          ))}
        </div>
      </div>
    </section>
  )
}
