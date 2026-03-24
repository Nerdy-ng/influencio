import { useState } from 'react'
import { UserCircle, Search, DollarSign, Megaphone, Users, BarChart3 } from 'lucide-react'

const talentSteps = [
  { icon: UserCircle, step: '01', title: 'Build Your Profile',   desc: 'Showcase your niche, audience stats across all platforms, content portfolio, and set your rates. Your media kit is auto-generated.' },
  { icon: Search,     step: '02', title: 'Discover Campaigns',   desc: 'Browse curated brand opportunities matched to your niche and audience. Apply with a personalised pitch in minutes.' },
  { icon: DollarSign, step: '03', title: 'Create & Get Paid',    desc: 'Submit your content for brand approval, hit your deliverables, and receive secure escrow payment — automatically released when done.' },
]

const brandSteps = [
  { icon: Megaphone, step: '01', title: 'Post Your Campaign',  desc: 'Define your goals, target audience, budget, and deliverables. Our guided wizard makes it easy to launch in under 10 minutes.' },
  { icon: Users,     step: '02', title: 'Discover Talents',   desc: 'Our smart matching surfaces the most relevant talents for your brand. Filter by niche, follower count, engagement rate, and more.' },
  { icon: BarChart3, step: '03', title: 'Launch & Measure',    desc: 'Approve content, release payment, and track campaign ROI from your dashboard. Build long-term talent partnerships effortlessly.' },
]

export default function HowItWorks() {
  const [active, setActive] = useState('talent')
  const steps = active === 'talent' ? talentSteps : brandSteps

  return (
    <section id="how-it-works" className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B9D' }}>How It Works</p>
          <h2 className="text-4xl lg:text-5xl font-black text-brand-dark mb-5">Simple. Fast. Effective.</h2>
          <p className="text-brand-dark/50 max-w-xl mx-auto text-lg">
            Whether you're a talent looking for brand deals or a brand hunting for the
            perfect voice — Brandior makes it frictionless.
          </p>

          {/* Tab bar — active = orange text + orange underline */}
          <div className="inline-flex items-end gap-0 mt-10 border-b border-brand-dark/10">
            {['talent', 'brand'].map(tab => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className="relative px-8 py-3 text-sm font-semibold transition-colors"
                style={{ color: active === tab ? '#FF6B9D' : '#0a0a0a' }}
              >
                For {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                <span className={`absolute bottom-[-1px] left-0 right-0 h-0.5 rounded-full transition-all duration-300 ${active === tab ? 'opacity-100' : 'opacity-0'}`}
                  style={{ backgroundColor: '#FF6B9D' }} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-brand-dark/8 z-0" />
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 card-hover group">
              <div className="rounded-2xl p-8 transition-colors shadow-sm" style={
                active === 'talent'
                  ? { backgroundColor: '#e9d5ff', border: '1px solid rgba(192,132,252,0.4)' }
                  : { backgroundColor: '#3b0764', border: '1px solid rgba(192,132,252,0.25)' }
              }>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: active === 'talent' ? '#c084fc' : '#4c1d95' }}>
                    <s.icon className="w-7 h-7" style={{ color: active === 'talent' ? '#fff' : 'rgba(255,255,255,0.8)' }} />
                  </div>
                  <span className="text-4xl font-black" style={{ color: active === 'talent' ? 'rgba(107,33,168,0.25)' : 'rgba(192,132,252,0.3)' }}>{s.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: active === 'talent' ? '#3b0764' : '#fff' }}>{s.title}</h3>
                <div className="w-8 h-0.5 rounded-full mb-3" style={{ backgroundColor: '#c084fc' }} />
                <p className="leading-relaxed text-sm" style={{ color: active === 'talent' ? 'rgba(59,7,100,0.6)' : 'rgba(255,255,255,0.5)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
