import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Search, FileText, CreditCard, Star, User, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react'

const brandSteps = [
  { icon: Search,      color: '#7c3aed', n: '01', title: 'Find your creator',     desc: 'Browse verified creator profiles. Review their rate card — content types, durations, platform fees — all upfront. No negotiating in the dark.' },
  { icon: FileText,    color: '#FA8112', n: '02', title: 'Send a project brief',   desc: 'Fill in your campaign goal, product, hashtags, and deadline. The creator reviews it before accepting — so you both know exactly what\'s been agreed.' },
  { icon: CreditCard,  color: '#4c1d95', n: '03', title: 'Pay into escrow',        desc: 'Payment is held securely until you approve the delivered work. The creator knows payment is guaranteed; you know the work must meet the brief.' },
  { icon: Star,        color: '#22c55e', n: '04', title: 'Review and release',     desc: 'Once the creator delivers, review the content. Request a revision if needed (up to the agreed rounds), then approve to release payment.' },
]

const creatorSteps = [
  { icon: User,       color: '#F72585', n: '01', title: 'Build your rate card',    desc: 'Set your prices per content type, duration, and platform. You\'re in control — the minimum is ₦20,000 and you set everything above that.' },
  { icon: Briefcase,  color: '#7c3aed', n: '02', title: 'Get discovered',          desc: 'Brands search by niche, platform, and budget. When you\'re a fit, they send you a brief. You review it, accept or decline — no pressure.' },
  { icon: ShieldCheck, color: '#FA8112', n: '03', title: 'Deliver your work',      desc: 'Create the content, upload your deliverables, and submit. Payment is already in escrow — it\'s waiting for your approval, not a brand\'s promise.' },
  { icon: Star,       color: '#22c55e', n: '04', title: 'Get paid and grow',       desc: 'Once the brand approves, payment is released to your wallet instantly. Build your rating, grow your portfolio, unlock higher-value collabs.' },
]

function StepCard({ icon: Icon, color, n, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="w-px flex-1 mt-2" style={{ background: `${color}20` }} />
      </div>
      <div className="pb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: `${color}80` }}>{n}</p>
        <h3 className="font-black text-base mb-2" style={{ color: '#1e0040' }}>{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>How It Works | Brandior</title>
        <meta name="description" content="Learn how Brandior connects brands and creators — from discovery to payment — with escrow protection and transparent pricing." />
      </Helmet>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #1e0040 0%, #4c1d95 100%)' }} className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c084fc' }}>The Process</p>
          <h1 className="text-4xl font-black text-white mb-4">Simple. Transparent. Protected.</h1>
          <p className="text-white/60 text-base max-w-lg mx-auto">
            Brandior handles the entire collab flow — from discovery to payment — so brands and creators can focus on the work.
          </p>
        </div>
      </section>

      {/* Escrow explainer */}
      <section className="py-10 px-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#ede9fe' }}>
            <ShieldCheck className="w-6 h-6" style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <h2 className="font-black text-sm" style={{ color: '#1e0040' }}>Every collab is protected by escrow</h2>
            <p className="text-gray-500 text-sm mt-1">
              Payment is collected from the brand upfront and held by Brandior until the creator delivers and the brand approves. Neither side can be left out of pocket.
            </p>
          </div>
        </div>
      </section>

      {/* Two-column steps */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">

          {/* For Brands */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-bold uppercase tracking-widest" style={{ background: '#ede9fe', color: '#4c1d95' }}>
              <Briefcase className="w-3.5 h-3.5" /> For Brands
            </div>
            <div>
              {brandSteps.map(s => <StepCard key={s.n} {...s} />)}
            </div>
            <Link to="/signup/brand" className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white text-sm mt-2" style={{ background: '#4c1d95' }}>
              Start as a Brand <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* For Creators */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-bold uppercase tracking-widest" style={{ background: '#fff0f7', color: '#F72585' }}>
              <User className="w-3.5 h-3.5" /> For Creators
            </div>
            <div>
              {creatorSteps.map(s => <StepCard key={s.n} {...s} />)}
            </div>
            <Link to="/signup/creator" className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white text-sm mt-2" style={{ background: '#F72585' }}>
              Join as a Creator <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ strip */}
      <section className="py-16 px-6" style={{ background: '#faf9ff' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black mb-10 text-center" style={{ color: '#1e0040' }}>Common questions</h2>
          <div className="space-y-5">
            {[
              { q: 'What if the brand disappears after I deliver?', a: 'They can\'t. Payment is in escrow before you start work. If a brand fails to respond for 7 days after delivery, Brandior releases the funds to you automatically.' },
              { q: 'Can I revise my rate card?', a: 'Yes, anytime. Your updated rates apply to new collabs — ongoing collabs keep the rate that was agreed at the time of booking.' },
              { q: 'What does Brandior charge?', a: 'Brandior takes a platform fee on each transaction. This is shown to both parties upfront in the order summary — no hidden charges.' },
              { q: 'What if I\'m not satisfied with the work as a brand?', a: 'You can request revisions up to the number agreed on your collab. If the creator doesn\'t deliver to the brief, you can raise a dispute and Brandior will mediate.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl p-5" style={{ border: '1px solid #e9d5ff' }}>
                <p className="font-bold text-sm mb-2" style={{ color: '#1e0040' }}>{q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-10">
            More questions? <Link to="/contact" className="font-semibold" style={{ color: '#7c3aed' }}>Contact us →</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
