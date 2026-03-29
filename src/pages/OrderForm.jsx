import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  ChevronLeft, Shield, CheckCircle, Clock, RefreshCw,
  Zap, AlertCircle, Loader2,
} from 'lucide-react'
import { getSetting } from '../lib/siteSettings'

const API = 'http://localhost:3001/api'

const pink = '#FF6B9D'
const darkPurple = '#4c1d95'
const purple = '#7c3aed'

function formatNGN(n) {
  return '₦' + Number(n || 0).toLocaleString('en')
}

const PLATFORM_COLORS = {
  Instagram: '#E1306C',
  TikTok: '#010101',
  YouTube: '#FF0000',
  Twitter: '#1DA1F2',
  Facebook: '#1877F2',
}

const CAMPAIGN_GOALS = [
  'Brand Awareness',
  'Product Launch',
  'Sales Conversion',
  'Follower Growth',
  'Event Promotion',
]

// Mock data for offline mode
const MOCK_PACKAGES = {
  pkg_1: {
    _id: 'pkg_1',
    name: 'Story Feature',
    platform: 'Instagram',
    description: 'Dedicated Instagram Stories feature with authentic reaction content.',
    deliverables: ['3x Instagram Stories', 'Product showcase frame', 'Call-to-action slide', 'Link in bio mention (48hrs)'],
    deliveryDays: 5,
    revisions: 2,
    price: 75000,
    talentId: 'talent_1',
    talentName: 'Adaeze Okafor',
    talentHandle: 'adaeze_glam',
  },
  pkg_2: {
    _id: 'pkg_2',
    name: 'Reel Campaign',
    platform: 'Instagram',
    description: 'High-quality Instagram Reel with trending audio and full post caption.',
    deliverables: ['1x Instagram Reel (30-60s)', 'Full caption + hashtags', 'Pinned to profile for 7 days', 'Performance report after 7 days'],
    deliveryDays: 7,
    revisions: 2,
    price: 150000,
    talentId: 'talent_1',
    talentName: 'Adaeze Okafor',
    talentHandle: 'adaeze_glam',
  },
  pkg_3: {
    _id: 'pkg_3',
    name: 'TikTok Viral Push',
    platform: 'TikTok',
    description: 'Creative TikTok video designed with trending formats and sounds.',
    deliverables: ['1x TikTok video (15-60s)', 'Trending audio/sound selection', 'Engaging caption + hashtags', '2x Story reposts'],
    deliveryDays: 5,
    revisions: 1,
    price: 120000,
    talentId: 'talent_1',
    talentName: 'Adaeze Okafor',
    talentHandle: 'adaeze_glam',
  },
  pkg_4: {
    _id: 'pkg_4',
    name: 'Full Brand Deal',
    platform: 'Instagram',
    description: 'Complete brand integration across all platforms.',
    deliverables: ['1x Instagram Reel', '3x Instagram Stories', '1x TikTok video', '1x YouTube mention', '30-day performance report'],
    deliveryDays: 14,
    revisions: 3,
    price: 350000,
    talentId: 'talent_1',
    talentName: 'Adaeze Okafor',
    talentHandle: 'adaeze_glam',
  },
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-white text-sm font-medium max-w-sm`}
      style={{ backgroundColor: type === 'success' ? '#16a34a' : '#dc2626' }}
    >
      {type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span>{message}</span>
    </div>
  )
}

export default function OrderForm() {
  const { packageId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const talentId = searchParams.get('talentId')

  const [pkg, setPkg] = useState(null)
  const [loadingPkg, setLoadingPkg] = useState(true)

  const [form, setForm] = useState({
    brandName: '',
    productName: '',
    goal: '',
    description: '',
    instructions: '',
    referenceLinks: '',
    targetAudience: '',
    deadline: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // Compute min date for deadline
  const today = new Date()
  const minDeadline = pkg
    ? new Date(today.getTime() + pkg.deliveryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : today.toISOString().split('T')[0]

  useEffect(() => {
    let cancelled = false
    async function loadPkg() {
      setLoadingPkg(true)
      try {
        // Try fetching the talent (which includes packages)
        if (talentId) {
          const res = await fetch(`${API}/talents/${talentId}`)
          if (!res.ok) throw new Error('Not found')
          const data = await res.json()
          const found = (data.packages || []).find(p => p._id === packageId)
          if (found && !cancelled) {
            setPkg({
              ...found,
              talentName: data.name,
              talentHandle: data.handle,
              talentAvatar: data.avatar,
              talentId: data._id || data.id,
            })
          } else {
            throw new Error('Package not found')
          }
        } else {
          const res = await fetch(`${API}/packages/${packageId}`)
          if (!res.ok) throw new Error('Not found')
          const data = await res.json()
          if (!cancelled) setPkg(data)
        }
      } catch {
        // Fallback to mock
        if (!cancelled) {
          setPkg(MOCK_PACKAGES[packageId] || MOCK_PACKAGES.pkg_1)
        }
      } finally {
        if (!cancelled) setLoadingPkg(false)
      }
    }
    loadPkg()
    return () => { cancelled = true }
  }, [packageId, talentId])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.brandName.trim()) e.brandName = 'Brand name is required'
    if (!form.productName.trim()) e.productName = 'Product / Service name is required'
    if (!form.goal) e.goal = 'Please select a campaign goal'
    if (!form.description.trim()) e.description = 'Product description is required'
    if (!form.instructions.trim()) e.instructions = 'Talent brief is required'
    if (!form.targetAudience.trim()) e.targetAudience = 'Target audience is required'
    if (!form.deadline) e.deadline = 'Please select a deadline'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        packageId,
        brandId: 'brand_demo',
        brief: {
          brandName: form.brandName,
          productName: form.productName,
          description: form.description,
          instructions: form.instructions,
          goal: form.goal,
          referenceLinks: form.referenceLinks,
          targetAudience: form.targetAudience,
          deadline: form.deadline,
        },
      }

      let orderId
      try {
        const res = await fetch(`${API}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Server error')
        const data = await res.json()
        orderId = data._id || data.id || 'order_new'
      } catch {
        // Mock success
        orderId = `order_${Date.now()}`
      }

      setToast({ message: 'Order placed successfully! Redirecting...', type: 'success' })
      setTimeout(() => {
        navigate(`/brand-dashboard?newOrder=${orderId}`)
      }, 1500)
    } catch {
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const platformColor = pkg ? (PLATFORM_COLORS[pkg.platform] || '#6b7280') : darkPurple
  const platformFeePercent = Number(getSetting('platformFee')) / 100 || 0.1
  const platformFee = pkg ? Math.round(pkg.price * platformFeePercent) : 0
  const total = pkg ? pkg.price + platformFee : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: darkPurple }}>
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: darkPurple }}>Brandiór</span>
          </Link>
          <Link to="/marketplace" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Browse Talents
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(talentId ? `/creators/${talentId}` : '/marketplace')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {loadingPkg ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Order form — left, 3/5 */}
            <div className="lg:col-span-3">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Tell us about your brand</h1>
              <p className="text-sm text-gray-500 mb-7">Fill in the details below to brief the talent. All fields are required unless marked optional.</p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Brand Name */}
                <FormField label="Brand Name" error={errors.brandName}>
                  <input
                    type="text"
                    name="brandName"
                    value={form.brandName}
                    onChange={handleChange}
                    placeholder="Your brand or company name"
                    className={inputCls(errors.brandName)}
                  />
                </FormField>

                {/* Product Name */}
                <FormField label="Product / Service Name" error={errors.productName}>
                  <input
                    type="text"
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    placeholder="What are you promoting?"
                    className={inputCls(errors.productName)}
                  />
                </FormField>

                {/* Campaign Goal */}
                <FormField label="Campaign Goal" error={errors.goal}>
                  <select
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                    className={inputCls(errors.goal)}
                  >
                    <option value="">Select a goal...</option>
                    {CAMPAIGN_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </FormField>

                {/* Product Description */}
                <FormField label="Product Description" error={errors.description}>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your product/service and what makes it unique"
                    className={inputCls(errors.description)}
                  />
                </FormField>

                {/* Talent Brief */}
                <FormField label="Talent Brief / Instructions" error={errors.instructions}>
                  <textarea
                    name="instructions"
                    value={form.instructions}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Specific instructions for the talent — tone, key messages, dos and don'ts, references…"
                    className={inputCls(errors.instructions)}
                  />
                </FormField>

                {/* Reference Links */}
                <FormField label="Reference Links" note="Optional">
                  <input
                    type="text"
                    name="referenceLinks"
                    value={form.referenceLinks}
                    onChange={handleChange}
                    placeholder="Any reference content URLs (comma-separated)"
                    className={inputCls()}
                  />
                </FormField>

                {/* Target Audience */}
                <FormField label="Target Audience" error={errors.targetAudience}>
                  <input
                    type="text"
                    name="targetAudience"
                    value={form.targetAudience}
                    onChange={handleChange}
                    placeholder="e.g. African women aged 18-35 interested in skincare"
                    className={inputCls(errors.targetAudience)}
                  />
                </FormField>

                {/* Deadline */}
                <FormField label="Deadline" error={errors.deadline}>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    min={minDeadline}
                    className={inputCls(errors.deadline)}
                  />
                  {pkg && (
                    <p className="text-xs text-gray-400 mt-1">
                      Earliest possible: {new Date(minDeadline).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })} ({pkg.deliveryDays} days delivery)
                    </p>
                  )}
                </FormField>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full text-base font-bold text-white transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: submitting ? '#9ca3af' : darkPurple }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Proceed to Payment →'
                  )}
                </button>
              </form>
            </div>

            {/* Order summary sidebar — right, 2/5 */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-5">Order Summary</h2>

                  {pkg && (
                    <>
                      {/* Talent */}
                      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                        <img
                          src={pkg.talentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(pkg.talentName || 'Talent')}&background=7c3aed&color=fff&size=48`}
                          alt={pkg.talentName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-50"
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=C&background=7c3aed&color=fff&size=48` }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{pkg.talentName}</p>
                          <p className="text-xs text-gray-400">@{pkg.talentHandle}</p>
                        </div>
                      </div>

                      {/* Package info */}
                      <div className="mb-5 pb-5 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-bold text-gray-900">{pkg.name}</p>
                          {pkg.platform && (
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: platformColor }}
                            >
                              {pkg.platform}
                            </span>
                          )}
                        </div>

                        {/* Deliverables */}
                        {pkg.deliverables && pkg.deliverables.length > 0 && (
                          <ul className="space-y-1.5 mt-3">
                            {pkg.deliverables.map(d => (
                              <li key={d} className="flex items-start gap-2 text-xs text-gray-600">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Timeline */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {pkg.deliveryDays} days delivery
                          </div>
                          <div className="flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5" />
                            {pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Price breakdown */}
                      <div className="space-y-2.5 mb-5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Package price</span>
                          <span className="font-medium text-gray-800">{formatNGN(pkg.price)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Platform fee (10%)</span>
                          <span className="font-medium text-gray-800">{formatNGN(platformFee)}</span>
                        </div>
                        <div className="h-px bg-gray-100" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="text-xl font-extrabold" style={{ color: pink }}>{formatNGN(total)}</span>
                        </div>
                      </div>

                      {/* Escrow note */}
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                        <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-green-800">Secure Escrow Payment</p>
                          <p className="text-xs text-green-600 mt-0.5">Your payment is held safely until you approve the delivered work.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

function FormField({ label, note, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {note && <span className="ml-1.5 text-xs font-normal text-gray-400">({note})</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

function inputCls(error) {
  return `w-full px-4 py-3 text-sm rounded-2xl border transition-colors focus:outline-none focus:ring-2 ${
    error
      ? 'border-red-300 focus:ring-red-100'
      : 'border-gray-200 focus:ring-purple-100 focus:border-purple-300'
  } bg-white resize-none`
}
