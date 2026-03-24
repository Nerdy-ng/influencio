import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Building2 } from 'lucide-react'

const pink = '#FF6B9D'

export default function CTA() {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: '#0d0020' }}>
      <div className="max-w-5xl mx-auto text-center">

        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: pink }}>
          Who are you joining as?
        </p>

        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
          Your Next Big Partnership
          <br />
          Starts <span style={{ color: pink }}>Here.</span>
        </h2>

        <p className="text-white/40 text-lg mb-14 max-w-xl mx-auto leading-relaxed">
          Whether you're a talent ready to monetise your audience or a brand ready to grow — Brandiór is your launchpad.
        </p>

        {/* Two-path cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto mb-10">
          {/* Talent card */}
          <Link to="/for-talents"
            className="group rounded-3xl p-7 text-left transition-all hover:scale-105"
            style={{ backgroundColor: `${pink}18`, border: `1px solid ${pink}33` }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${pink}25` }}>
              <Zap className="w-5 h-5" style={{ color: pink }} />
            </div>
            <p className="text-lg font-extrabold text-white mb-1">I'm a Creator</p>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">Build your profile, get hired by brands, and earn consistently.</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold transition-all"
              style={{ color: pink }}>
              Get started free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Brand card */}
          <Link to="/for-brands"
            className="group rounded-3xl p-7 text-left transition-all hover:scale-105"
            style={{ backgroundColor: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(124,58,237,0.25)' }}>
              <Building2 className="w-5 h-5" style={{ color: '#c4b5fd' }} />
            </div>
            <p className="text-lg font-extrabold text-white mb-1">I'm a Brand</p>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">Discover verified African creators and run campaigns with full escrow protection.</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold transition-all"
              style={{ color: '#c4b5fd' }}>
              Browse creators <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* trust bullets */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {['No setup fees', 'Free to join', 'Escrow protected', '24/7 Support'].map(item => (
            <span key={item} className="flex items-center gap-1.5 text-white/30 text-sm">
              <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: pink }} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
