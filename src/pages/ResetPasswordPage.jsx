import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getLogo } from '../lib/brandSettings'

const darkPurple = '#4c1d95'
const pink = '#FF6B9D'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const logo = getLogo('light')

  useEffect(() => {
    let done = false
    function activate() { if (!done) { done = true; setReady(true) } }

    // If App.jsx already exchanged the code, the session exists — set ready immediately.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) activate()
    })

    // Catch all possible auth events — INITIAL_SESSION fires for late subscribers
    // when the session was already established before this page mounted.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (
        event === 'PASSWORD_RECOVERY' ||
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION'
      )) activate()
    })

    // Fallback: if still not ready after 10 s, the link has expired
    const timer = setTimeout(() => setReady('expired'), 10000)

    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError("Passwords don't match."); return }
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const email = session?.user?.email
    if (email) {
      const { error: diffErr } = await supabase.auth.signInWithPassword({ email, password })
      if (!diffErr) {
        setError('New password must be different from your current password.')
        setLoading(false)
        return
      }
    }
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) {
      if (err.message?.includes('AAL2')) {
        setError('This account has two-factor authentication enabled. Please contact support to reset your password.')
      } else {
        setError(err.message)
      }
      return
    }
    setDone(true)
    await supabase.auth.signOut()
    setTimeout(() => { window.location.href = '/login' }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f3eeff' }}>
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-8">
          {logo
            ? <img src={logo} alt="Brandior" className="h-8 object-contain" />
            : <span className="text-xl font-black" style={{ color: darkPurple }}>Brandior</span>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: '1px solid #e9d5ff' }}>

          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-black mb-2" style={{ color: darkPurple }}>Password updated!</h1>
              <p className="text-sm" style={{ color: '#6b7280' }}>Redirecting you to login…</p>
            </div>

          ) : ready === 'expired' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca' }}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              </div>
              <h1 className="text-xl font-black mb-2" style={{ color: darkPurple }}>Link expired</h1>
              <p className="text-sm mb-5" style={{ color: '#6b7280' }}>This reset link has expired or already been used.</p>
              <Link to="/forgot-password"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: darkPurple }}>
                Request a new link
              </Link>
            </div>

          ) : !ready ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-sm" style={{ color: '#6b7280' }}>Verifying your reset link…</p>
            </div>

          ) : (
            <>
              <h1 className="text-xl font-black mb-1" style={{ color: darkPurple }}>Set new password</h1>
              <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#c4b5fd' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="New password"
                      autoFocus
                      autoComplete="new-password"
                      className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none"
                      style={{ border: '1.5px solid #e9d5ff', color: '#1a1a2e' }}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#c4b5fd' }} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none"
                      style={{
                        border: error
                          ? `1.5px solid ${pink}`
                          : confirm && password && confirm === password
                            ? '1.5px solid #86efac'
                            : '1.5px solid #e9d5ff',
                        color: '#1a1a2e',
                      }}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && password && confirm === password && !error && (
                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#16a34a' }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Passwords match
                    </p>
                  )}
                  {error && <p className="text-xs mt-1.5" style={{ color: pink }}>{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{ backgroundColor: darkPurple }}>
                  {loading
                    ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <><span>Update password</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
