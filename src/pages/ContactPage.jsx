import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Mail, MessageSquare, Send, CheckCircle, MapPin } from 'lucide-react'

const INQUIRY_TYPES = [
  { value: 'brand',     label: 'Brand / Business inquiry' },
  { value: 'creator',   label: 'Creator / Talent inquiry' },
  { value: 'support',   label: 'Technical support' },
  { value: 'billing',   label: 'Billing or payment issue' },
  { value: 'press',     label: 'Press or media' },
  { value: 'other',     label: 'Something else' },
]

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', type: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.type || !form.message.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    // Opens a mailto as fallback — a backend form handler can replace this
    const subject = encodeURIComponent(`[Brandior Contact] ${INQUIRY_TYPES.find(t => t.value === form.type)?.label}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.location.href = `mailto:support@brandior.africa?subject=${subject}&body=${body}`
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 800)
  }

  const inputCls = 'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all'
  const inputStyle = { border: '1.5px solid #e9d5ff', background: '#faf9ff', color: '#1e0040' }
  const focusStyle = { borderColor: '#7c3aed' }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Contact Us | Brandior</title>
        <meta name="description" content="Get in touch with the Brandior team — brand inquiries, creator support, billing, and press." />
      </Helmet>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #1e0040 0%, #4c1d95 100%)' }} className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c084fc' }}>Get in Touch</p>
          <h1 className="text-4xl font-black text-white mb-4">We'd love to hear from you</h1>
          <p className="text-white/60 text-base">Send us a message and we'll get back to you within 24–48 hours.</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10">

          {/* Contact info panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-2xl p-6" style={{ background: '#f8f5ff', border: '1px solid #e9d5ff' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#ede9fe' }}>
                <Mail className="w-5 h-5" style={{ color: '#7c3aed' }} />
              </div>
              <h3 className="font-bold text-sm mb-1" style={{ color: '#1e0040' }}>Email us</h3>
              <a href="mailto:support@brandior.africa" className="text-sm font-semibold" style={{ color: '#7c3aed' }}>
                support@brandior.africa
              </a>
            </div>

            <div className="rounded-2xl p-6" style={{ background: '#f8f5ff', border: '1px solid #e9d5ff' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#ede9fe' }}>
                <MapPin className="w-5 h-5" style={{ color: '#7c3aed' }} />
              </div>
              <h3 className="font-bold text-sm mb-1" style={{ color: '#1e0040' }}>Our office</h3>
              <p className="text-gray-500 text-sm leading-relaxed">4, Bashorun Estate,<br />Kolapo Ishola GRA,<br />Ibadan.</p>
            </div>

            <div className="rounded-2xl p-6" style={{ background: '#f8f5ff', border: '1px solid #e9d5ff' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#ede9fe' }}>
                <MessageSquare className="w-5 h-5" style={{ color: '#7c3aed' }} />
              </div>
              <h3 className="font-bold text-sm mb-1" style={{ color: '#1e0040' }}>Response time</h3>
              <p className="text-gray-500 text-sm">We typically respond within 24–48 business hours.</p>
            </div>

            <div className="rounded-2xl p-6" style={{ background: '#fff0f7', border: '1px solid #fce7f3' }}>
              <h3 className="font-bold text-sm mb-2" style={{ color: '#1e0040' }}>Quick links</h3>
              <ul className="space-y-2">
                {[
                  { label: 'How it Works', href: '/how-it-works' },
                  { label: 'Pricing',       href: '/pricing' },
                  { label: 'For Creators',  href: '/for-talents' },
                  { label: 'For Brands',    href: '/for-brands' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="text-sm font-semibold hover:underline" style={{ color: '#F72585' }}>{label} →</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-black" style={{ color: '#1e0040' }}>Message sent!</h3>
                <p className="text-gray-500 text-sm max-w-xs">Your email client should have opened. We'll reply to <strong>{form.email}</strong> within 48 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', type: '', message: '' }) }}
                  className="mt-2 text-sm font-semibold" style={{ color: '#7c3aed' }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4b5563' }}>Your name</label>
                    <input
                      type="text" placeholder="Adaeze Okafor"
                      value={form.name} onChange={set('name')}
                      className={inputCls} style={inputStyle}
                      onFocus={e => Object.assign(e.target.style, focusStyle)}
                      onBlur={e => Object.assign(e.target.style, { borderColor: '#e9d5ff' })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4b5563' }}>Email address</label>
                    <input
                      type="email" placeholder="adaeze@example.com"
                      value={form.email} onChange={set('email')}
                      className={inputCls} style={inputStyle}
                      onFocus={e => Object.assign(e.target.style, focusStyle)}
                      onBlur={e => Object.assign(e.target.style, { borderColor: '#e9d5ff' })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4b5563' }}>What's this about?</label>
                  <select
                    value={form.type} onChange={set('type')}
                    className={inputCls} style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                    onBlur={e => Object.assign(e.target.style, { borderColor: '#e9d5ff' })}
                  >
                    <option value="">Select a category…</option>
                    {INQUIRY_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4b5563' }}>Your message</label>
                  <textarea
                    rows={6} placeholder="Tell us what's on your mind…"
                    value={form.message} onChange={set('message')}
                    className={inputCls} style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                    onBlur={e => Object.assign(e.target.style, { borderColor: '#e9d5ff' })}
                  />
                </div>

                {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

                <button
                  type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-60"
                  style={{ background: '#4c1d95' }}>
                  {loading ? 'Opening email…' : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
                <p className="text-gray-400 text-xs text-center">
                  By submitting this form you agree to our <Link to="/privacy" className="underline">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
