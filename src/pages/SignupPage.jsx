import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Zap, Star, TrendingUp, Eye, EyeOff, ArrowRight, CheckCircle, Mail, Lock, User, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

const pink = '#FF6B9D'
const gold = '#D4AF37'
const purple = '#c084fc'
const darkPurple = '#4c1d95'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.32 2.99-2.53 4zm-3.1-17.3c.06 2.06-1.52 3.8-3.44 3.63-.27-1.82 1.57-3.78 3.44-3.63z"/>
    </svg>
  )
}

function RoleCard({ role, selected, onSelect }) {
  const isTalent = role === 'talent'
  const accent = isTalent ? pink : purple
  const Icon = isTalent ? Star : TrendingUp
  return (
    <button
      onClick={() => onSelect(role)}
      className="flex-1 rounded-2xl p-4 text-left transition-all duration-200 relative overflow-hidden bg-white"
      style={{
        border: selected ? `2px solid ${accent}` : '2px solid #e9d5ff',
        boxShadow: selected ? `0 4px 20px ${accent}18` : 'none',
      }}
    >
      {selected && <CheckCircle className="absolute top-3 right-3 w-4 h-4" style={{ color: accent }} />}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: selected ? `${accent}15` : '#f3eeff' }}>
        <Icon className="w-4 h-4" style={{ color: selected ? accent : '#a855f7' }} />
      </div>
      <p className="font-bold text-brand-dark text-sm mb-0.5 capitalize">{role}</p>
      <p className="text-brand-dark/40 text-xs leading-relaxed">
        {isTalent ? 'Monetise your audience & land brand deals' : 'Find talents & launch campaigns'}
      </p>
    </button>
  )
}

const talentOptions = [
  { id: 'Content Talent',   emoji: '🎬', desc: 'Videos, Reels, TikToks & more' },
  { id: 'Voiceover Artist',  emoji: '🎙️', desc: 'Ads, explainers, brand narration' },
  { id: 'Brand Ambassador',  emoji: '🤝', desc: 'Long-term brand representation' },
  { id: 'Product Reviewer',  emoji: '⭐', desc: 'Honest reviews & unboxings' },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState('role')
  const [role, setRole] = useState(() => {
    const r = searchParams.get('role')
    return r === 'brand' ? 'brand' : 'talent'
  })
  const [talentTypes, setTalentTypes] = useState([])
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.includes('@')) e.email = 'Enter a valid email'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setAuthError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, role, talent_types: talentTypes } },
    })
    setLoading(false)
    if (error) { setAuthError(error.message); return }
    setStep('confirm')
  }

  async function handleGoogleSignup() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { queryParams: { prompt: 'select_account' } },
    })
    setLoading(false)
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: '#f3eeff' }}>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: darkPurple }}>
          <Zap className="w-4 h-4" style={{ color: '#FA8112' }} />
        </div>
        <span className="text-lg font-bold tracking-tight" style={{ color: darkPurple }}>Brandiór</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>

        {/* STEP: ROLE SELECTION */}
        {step === 'role' && (
          <div>
            <h1 className="text-2xl font-black text-brand-dark mb-1">Create your account</h1>
            <p className="text-brand-dark/40 text-sm mb-6">How will you be using Brandiór?</p>

            <div className="flex gap-3 mb-6">
              <RoleCard role="talent" selected={role === 'talent'} onSelect={setRole} />
              <RoleCard role="brand" selected={role === 'brand'} onSelect={setRole} />
            </div>

            <button
              onClick={() => setStep(role === 'talent' ? 'talent' : 'form')}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: darkPurple }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-brand-dark/35 text-xs mt-5">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: darkPurple }}>Log in</Link>
            </p>
          </div>
        )}

        {/* STEP: TALENT TYPE (talents only) */}
        {step === 'talent' && (
          <div>
            <button onClick={() => setStep('role')} className="flex items-center gap-1 text-brand-dark/35 hover:text-brand-dark text-xs mb-5 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <h1 className="text-2xl font-black text-brand-dark mb-1">What best describes you?</h1>
            <p className="text-brand-dark/40 text-sm mb-6">Select all that apply — brands will match you based on these.</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {talentOptions.map(({ id, emoji, desc }) => {
                const selected = talentTypes.includes(id)
                return (
                  <button key={id}
                    onClick={() => setTalentTypes(prev =>
                      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
                    )}
                    className="flex flex-col items-center gap-2 py-5 px-3 rounded-2xl text-center transition-all"
                    style={{
                      backgroundColor: selected ? '#f3eeff' : '#fafafa',
                      border: selected ? `2px solid ${darkPurple}` : '2px solid #e9d5ff',
                    }}>
                    <span className="text-3xl">{emoji}</span>
                    <p className="font-bold text-brand-dark text-xs leading-tight">{id}</p>
                    <p className="text-brand-dark/35 text-[10px] leading-snug">{desc}</p>
                    {selected && <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: darkPurple }} />}
                  </button>
                )
              })}
            </div>

            {talentTypes.length > 0 && (
              <p className="text-center text-xs text-brand-dark/40 mb-3">
                {talentTypes.length} selected: <span style={{ color: darkPurple }} className="font-semibold">{talentTypes.join(', ')}</span>
              </p>
            )}

            <button
              onClick={() => setStep('form')}
              disabled={talentTypes.length === 0}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{ backgroundColor: darkPurple }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-brand-dark/35 text-xs mt-5">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: darkPurple }}>Log in</Link>
            </p>
          </div>
        )}

        {/* STEP: REGISTRATION FORM */}
        {step === 'form' && (
          <div>
            <button onClick={() => setStep('role')} className="flex items-center gap-1 text-brand-dark/35 hover:text-brand-dark text-xs mb-5 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <h1 className="text-2xl font-black text-brand-dark mb-1">
              {role === 'talent' ? 'Join as a Talent' : 'Join as a Brand'}
            </h1>
            <p className="text-brand-dark/40 text-sm mb-6">Free forever. No credit card required.</p>

            {/* Social login buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-brand-dark text-sm border transition-all hover:bg-gray-50 disabled:opacity-60"
                style={{ borderColor: '#e9d5ff' }}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-brand-dark/8" />
              <span className="text-brand-dark/30 text-xs">or sign up with email</span>
              <div className="flex-1 h-px bg-brand-dark/8" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-brand-dark/50 text-xs font-medium mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/25" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Amara Osei"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-brand-dark placeholder-brand-dark/25 outline-none transition-all"
                    style={{ border: errors.name ? `1.5px solid ${pink}` : '1.5px solid #e9d5ff' }}
                  />
                </div>
                {errors.name && <p className="text-xs mt-1" style={{ color: pink }}>{errors.name}</p>}
              </div>

              <div>
                <label className="text-brand-dark/50 text-xs font-medium mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/25" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="amara@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-brand-dark placeholder-brand-dark/25 outline-none transition-all"
                    style={{ border: errors.email ? `1.5px solid ${pink}` : '1.5px solid #e9d5ff' }}
                  />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: pink }}>{errors.email}</p>}
              </div>

              <div>
                <label className="text-brand-dark/50 text-xs font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/25" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-brand-dark placeholder-brand-dark/25 outline-none transition-all"
                    style={{ border: errors.password ? `1.5px solid ${pink}` : '1.5px solid #e9d5ff' }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-dark/25 hover:text-brand-dark/50 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: pink }}>{errors.password}</p>}
              </div>

              <p className="text-brand-dark/30 text-[11px] leading-relaxed">
                By creating an account you agree to our{' '}
                <a href="#" className="font-medium" style={{ color: purple }}>Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="font-medium" style={{ color: purple }}>Privacy Policy</a>.
              </p>

              {authError && (
                <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ color: pink, backgroundColor: '#fff0f5' }}>{authError}</p>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ backgroundColor: darkPurple }}>
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-brand-dark/35 text-xs mt-5">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: darkPurple }}>Log in</Link>
            </p>
          </div>
        )}

        {/* STEP: EMAIL CONFIRMATION */}
        {step === 'confirm' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: `${purple}18`, border: `2px solid ${purple}30` }}>
              <Mail className="w-7 h-7" style={{ color: purple }} />
            </div>

            <h1 className="text-2xl font-black text-brand-dark mb-2">Check your inbox</h1>
            <p className="text-brand-dark/40 text-sm mb-1">We sent a confirmation link to</p>
            <p className="font-semibold text-sm mb-6" style={{ color: gold }}>{form.email}</p>

            <div className="rounded-2xl p-4 mb-6 text-left space-y-3" style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
              {[
                'Click the link in the email to confirm your account',
                "You'll be taken to your profile to complete setup",
                'Start applying for gigs or posting opportunities',
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: purple }}>{i + 1}</span>
                  <p className="text-brand-dark/60 text-sm">{s}</p>
                </div>
              ))}
            </div>

            <button onClick={async () => {
                const { data } = await supabase.auth.getSession()
                if (data.session) {
                  const u = data.session.user
                  localStorage.setItem('brandiór_user', u.id)
                  localStorage.setItem('brandiór_role', u.user_metadata?.role || role)
                }
                navigate(role === 'brand' ? '/marketplace' : '/jobs')
              }}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mb-3"
              style={{ backgroundColor: darkPurple }}>
              Go to My Dashboard <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-brand-dark/30 text-xs">
              Didn't receive it?{' '}
              <button className="font-semibold" style={{ color: purple }}>Resend email</button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
