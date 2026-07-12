import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getLogo } from '../lib/brandSettings'

const purple = '#c084fc'
const darkPurple = '#4c1d95'
const pink = '#FF6B9D'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const logo = getLogo('light')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@')) { setError('Enter a valid email address.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f3eeff' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          {logo
            ? <img src={logo} alt="Brandior" className="h-8 object-contain" />
            : <span className="text-xl font-black" style={{ color: darkPurple }}>Brandior</span>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: '1px solid #e9d5ff' }}>

          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-black mb-2" style={{ color: darkPurple }}>Check your inbox</h1>
              <p className="text-sm mb-1" style={{ color: '#4b5563' }}>
                If <span className="font-semibold" style={{ color: darkPurple }}>{email.trim()}</span> is registered with Brandior, you'll receive a reset link shortly.
              </p>
              <p className="text-xs mt-3 mb-6" style={{ color: '#9ca3af' }}>
                The link expires in 1 hour. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-xs font-semibold underline mb-4 block mx-auto"
                style={{ color: darkPurple, background: 'none', border: 'none', cursor: 'pointer' }}>
                Wrong email? Try again
              </button>
              <Link to="/login"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: darkPurple }}>
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <h1 className="text-xl font-black mb-1" style={{ color: darkPurple }}>Reset password</h1>
              <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#c4b5fd' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoFocus
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{ border: error ? `1.5px solid ${pink}` : '1.5px solid #e9d5ff', color: '#1a1a2e' }}
                    />
                  </div>
                  {error && <p className="text-xs mt-1.5" style={{ color: pink }}>{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{ backgroundColor: darkPurple }}>
                  {loading
                    ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <><span>Send reset link</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-center text-xs mt-5" style={{ color: '#9ca3af' }}>
                Remember it?{' '}
                <Link to="/login" className="font-semibold" style={{ color: darkPurple }}>Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
