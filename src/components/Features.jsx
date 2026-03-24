import { Zap, Shield, MessageSquare, CheckSquare, BarChart2, BadgeCheck } from 'lucide-react'

const features = [
  { icon: Zap,           title: 'Smart Matching',          tag: 'AI Powered',  desc: 'AI-powered algorithm surfaces the most relevant talent-brand pairings based on niche, audience overlap, engagement, and budget fit.' },
  { icon: Shield,        title: 'Secure Escrow Payments',  tag: 'Protected',   desc: 'Funds are held safely until deliverables are approved. No more chasing payments or unpaid work. Talents get paid on time, every time.' },
  { icon: MessageSquare, title: 'Built-in Messaging',      tag: 'Real-time',   desc: 'Communicate directly with brands or talents through our integrated messaging system. Share briefs, feedback, and files in one thread.' },
  { icon: CheckSquare,   title: 'Content Approval Flow',   tag: 'Streamlined', desc: 'Structured content submission and revision workflow. Request edits, leave feedback, and approve content with a clear audit trail.' },
  { icon: BarChart2,     title: 'Analytics Dashboard',     tag: 'Insights',    desc: 'Track earnings, campaign performance, engagement metrics, and audience growth. Brands get ROI data; talents get proof of impact.' },
  { icon: BadgeCheck,    title: 'Verified Talent Badges', tag: 'Trusted',     desc: 'Verified social stats mean brands can trust the numbers they see. We cross-check follower counts and engagement with platform APIs.' },
]

export default function Features() {
  return (
    <section className="py-28" style={{ background: 'linear-gradient(135deg, #f3eeff 0%, #e8d5ff 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B9D' }}>Platform Features</p>
          <h2 className="text-4xl lg:text-5xl font-black text-brand-dark mb-5">
            Everything you need to collaborate at scale
          </h2>
          <p className="text-brand-dark/50 max-w-xl mx-auto text-lg">
            Brandior packs all the tools talents and brands need into one clean, intuitive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card-hover group rounded-2xl p-7 shadow-sm transition-all" style={{ backgroundColor: '#c084fc22', border: '1px solid #a855f740' }}>
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                  <f.icon className="w-6 h-6" style={{ color: '#D4AF37' }} />
                </div>
                {/* orange tag — secondary accent */}
                <span className="text-xs font-semibold rounded-full px-3 py-1"
                  style={{ color: '#FF6B9D', border: '1px solid #FF6B9D40' }}>
                  {f.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-brand-dark mb-2">{f.title}</h3>
              <div className="w-8 h-0.5 rounded-full mb-3 transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{ backgroundColor: '#FF6B9D' }} />
              <p className="text-brand-dark/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
