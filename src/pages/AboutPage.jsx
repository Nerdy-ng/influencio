import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Heart, ShieldCheck, Zap, Users, ArrowRight } from 'lucide-react'

const values = [
  { icon: Heart,        color: '#F72585', title: 'Creator First',    desc: 'We built Brandior so creators set their own rates, own their relationships, and get paid fairly — always.' },
  { icon: ShieldCheck,  color: '#7c3aed', title: 'Transparent Pay',  desc: 'Escrow holds every payment until the work is approved. No surprises, no chasing invoices, no excuses.' },
  { icon: Zap,          color: '#FA8112', title: 'Quality Over Noise', desc: 'We verify brands and surface creators based on fit — not follower count. Real collabs, not vanity metrics.' },
  { icon: Users,        color: '#22c55e', title: 'Both Sides Win',   desc: 'A collab only works when the brand gets results and the creator is proud of what they made. We design for that.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>About Us | Brandior</title>
        <meta name="description" content="Brandior connects brands with the right content creators through transparent pricing, secure escrow payments, and a simple direct-hire flow." />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1e0040 0%, #4c1d95 100%)' }} className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c084fc' }}>Our Story</p>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6" style={{ textWrap: 'balance' }}>
            The creator marketplace built on trust
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto">
            Brandior exists because creator marketing was broken — opaque pricing, missed payments, and no accountability on either side. We're fixing that.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7c3aed' }}>Why We Exist</p>
              <h2 className="text-3xl font-black mb-5" style={{ color: '#1e0040' }}>Creators deserve to be paid like professionals</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Too many talented creators spend more time chasing brands for payment than actually creating. And brands spend thousands on campaigns that never quite feel right because there was no real brief, no clear agreement, no accountability.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Brandior brings both sides into one place — with rate cards, project briefs, escrow payments, and a transparent collab flow — so the creative work can actually happen.
              </p>
            </div>
            <div className="rounded-2xl p-8" style={{ background: '#f8f5ff', border: '1px solid #e9d5ff' }}>
              <div className="space-y-5">
                {[
                  ['Brands', 'Browse verified creators, review rate cards, and pay securely into escrow.'],
                  ['Creators', 'Set your rates, accept collabs, submit work, and get paid on approval.'],
                  ['Platform', 'Holds payment in escrow, mediates disputes, keeps both sides honest.'],
                ].map(([who, what]) => (
                  <div key={who} className="flex gap-4">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: '#7c3aed' }} />
                    <div>
                      <p className="font-bold text-sm mb-1" style={{ color: '#1e0040' }}>{who}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{what}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6" style={{ background: '#faf9ff' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#F72585' }}>What We Stand For</p>
            <h2 className="text-3xl font-black" style={{ color: '#1e0040' }}>Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e9d5ff', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-black text-base mb-2" style={{ color: '#1e0040' }}>{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4" style={{ color: '#1e0040' }}>Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Join as a creator and set your rates, or sign up as a brand and find the right voice for your campaign.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup/creator" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm transition-all" style={{ background: '#F72585' }}>
              Join as a Creator <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/signup/brand" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm transition-all" style={{ background: '#4c1d95' }}>
              Sign up as a Brand <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-gray-400 text-xs mt-6">
            Questions? <Link to="/contact" className="font-semibold" style={{ color: '#7c3aed' }}>Contact us</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
