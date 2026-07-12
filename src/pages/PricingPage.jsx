import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

const creatorPerks = [
  'Free to join — no subscription',
  'Set your own rates (min. ₦20,000)',
  'Secure escrow on every collab',
  'Rate card visible to all brands',
  'Up to 2 content niches on your profile',
  'Direct messaging with brands',
  'Collab history and ratings',
  'Dispute mediation included',
]

const brandPerks = [
  'No monthly subscription',
  'Pay only when you book a collab',
  'Browse all creator profiles free',
  'Transparent rate cards upfront',
  'Escrow holds payment until approval',
  'Request revisions before releasing funds',
  'Campaign analytics dashboard',
  'Dispute mediation included',
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Pricing | Brandior</title>
        <meta name="description" content="Brandior is free for creators. Brands pay per collab with no subscription. A transparent platform fee is included in every transaction." />
      </Helmet>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #1e0040 0%, #4c1d95 100%)' }} className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c084fc' }}>Pricing</p>
          <h1 className="text-4xl font-black text-white mb-4">No surprises. No subscriptions.</h1>
          <p className="text-white/60 text-base">Creators join free. Brands pay per collab. The platform fee is shown upfront on every order.</p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

          {/* Creator card */}
          <div className="rounded-2xl p-8 flex flex-col" style={{ border: '2px solid #F72585', background: '#fff5f9' }}>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 self-start rounded-full px-3 py-1" style={{ background: '#F72585', color: '#fff' }}>
              For Creators
            </div>
            <div className="mb-2">
              <span className="text-5xl font-black" style={{ color: '#1e0040' }}>Free</span>
            </div>
            <p className="text-gray-500 text-sm mb-8">
              Join and build your profile at no cost. You only earn — Brandior never charges creators a subscription.
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {creatorPerks.map(p => (
                <li key={p} className="flex items-start gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#F72585' }} />
                  {p}
                </li>
              ))}
            </ul>
            <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(247,37,133,0.07)', border: '1px solid rgba(247,37,133,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#F72585' }}>
                A small platform fee is deducted from each collab payout. This is shown to you before you accept any brief.
              </p>
            </div>
            <Link to="/signup/creator" className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm" style={{ background: '#F72585' }}>
              Join as a Creator — Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Brand card */}
          <div className="rounded-2xl p-8 flex flex-col" style={{ border: '2px solid #4c1d95', background: '#f8f5ff' }}>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 self-start rounded-full px-3 py-1" style={{ background: '#4c1d95', color: '#fff' }}>
              For Brands
            </div>
            <div className="mb-2">
              <span className="text-5xl font-black" style={{ color: '#1e0040' }}>Pay-as-you-go</span>
            </div>
            <p className="text-gray-500 text-sm mb-8">
              Browse creators and build your brief for free. Only pay when you book a collab — no lock-in, no monthly fee.
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {brandPerks.map(p => (
                <li key={p} className="flex items-start gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#4c1d95' }} />
                  {p}
                </li>
              ))}
            </ul>
            <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(76,29,149,0.06)', border: '1px solid rgba(76,29,149,0.15)' }}>
              <p className="text-xs font-semibold" style={{ color: '#4c1d95' }}>
                The platform fee is added to the creator's rate and shown clearly in the order summary before you pay.
              </p>
            </div>
            <Link to="/signup/brand" className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm" style={{ background: '#4c1d95' }}>
              Sign Up as a Brand <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Escrow callout */}
      <section className="py-14 px-6" style={{ background: '#faf9ff' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: '#ede9fe' }}>
            <ShieldCheck className="w-7 h-7" style={{ color: '#7c3aed' }} />
          </div>
          <h2 className="text-2xl font-black mb-4" style={{ color: '#1e0040' }}>Every transaction is protected by escrow</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed mb-8">
            When a brand books a collab, they pay the full amount upfront. Brandior holds it in escrow until the creator delivers and the brand approves. If the creator doesn't deliver, the brand gets a full refund. If the brand ghosts after delivery, the funds are auto-released to the creator.
          </p>
          <Link to="/how-it-works" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: '#7c3aed' }}>
            See how the full flow works <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black mb-10 text-center" style={{ color: '#1e0040' }}>Pricing FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'What is the platform fee?', a: 'The platform fee is a percentage added to each transaction. The exact amount is displayed in the order summary before either party confirms the collab.' },
              { q: 'Is there a minimum collab value?', a: 'Yes. The minimum is ₦20,000. Creators set their own rates above that floor.' },
              { q: 'Can I negotiate outside the platform?', a: 'All payments must go through Brandior\'s escrow to protect both parties. Off-platform payments void the escrow guarantee and dispute protection.' },
              { q: 'What if a collab is cancelled?', a: 'If cancelled before the creator starts work, a full refund is issued. If cancelled mid-delivery, Brandior mediates a fair split based on the work completed.' },
              { q: 'Do brands pay for browsing and messaging?', a: 'No. Browsing creator profiles and exchanging messages is free. You only pay when you formally book a collab through the order flow.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl p-5 bg-white" style={{ border: '1px solid #e9d5ff' }}>
                <p className="font-bold text-sm mb-2" style={{ color: '#1e0040' }}>{q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-10">
            Still unsure? <Link to="/contact" className="font-semibold" style={{ color: '#7c3aed' }}>Talk to us →</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
