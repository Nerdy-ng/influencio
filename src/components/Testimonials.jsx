import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "Brandior completely changed how I work with brands. I went from cold DMs to having a full pipeline of quality campaigns. The escrow system means I never stress about payment anymore.",
    name: 'Amara Osei', role: 'Beauty Talent · 284K followers', initials: 'AO', rating: 5, tag: 'Talent',
    tagStyle: 'text-[#FF6B9D] border border-[#FF6B9D]/30 bg-[#FF6B9D]/5',
  },
  {
    quote: "We're a small skincare brand and couldn't afford big agency fees. Brandior lets us run professional influencer campaigns on our own terms. Our last campaign hit 4.2x ROI.",
    name: 'Marcus Ellwood', role: 'Founder, GlowLab Skincare', initials: 'ME', rating: 5, tag: 'Brand',
    tagStyle: 'text-brand-dark border border-brand-dark/20 bg-brand-dark/5',
  },
  {
    quote: "The content approval workflow is a game-changer. Before Brandior, managing talent briefs was a WhatsApp nightmare. Now everything is structured, tracked, and professional.",
    name: 'Priya Kapoor', role: 'Food & Travel Talent · 97K followers', initials: 'PK', rating: 5, tag: 'Talent',
    tagStyle: 'text-[#FF6B9D] border border-[#FF6B9D]/30 bg-[#FF6B9D]/5',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B9D' }}>What People Say</p>
          <h2 className="text-4xl lg:text-5xl font-black text-brand-dark mb-5">Real results, real people</h2>
          <p className="text-brand-dark/50 max-w-lg mx-auto text-lg">
            Don't take our word for it — here's what talents and brands are saying.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          {testimonials.map((t, i) => (
            <div key={i} className="card-hover bg-brand-cream rounded-2xl p-8 shadow-sm border border-brand-sand relative overflow-hidden">
              {/* quote watermark */}
              <div className="absolute top-6 right-6 opacity-[0.05]">
                <Quote className="w-16 h-16 text-brand-dark" fill="currentColor" />
              </div>

              {/* tag — orange for talents */}
              <span className={`inline-block text-xs font-semibold rounded-full px-3 py-1 mb-5 ${t.tagStyle}`}>
                {t.tag}
              </span>

              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-brand-dark/65 leading-relaxed mb-8 text-sm">"{t.quote}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-brand-sand">
                <div className="w-11 h-11 rounded-full bg-brand-dark border border-brand-dark/10 flex items-center justify-center text-white font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-brand-dark text-sm">{t.name}</p>
                  <p className="text-brand-dark/40 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
