import { useState, useEffect } from 'react'
import {
  Link2, Copy, CheckCheck,
  Users, Send, Clock, CheckCircle, Gift, UserPlus, Loader2,
} from 'lucide-react'
import { stripInjection } from '../utils/sanitize'
import { supabase } from '../lib/supabase'

const purple     = '#7c3aed'
const darkPurple = '#4c1d95'

const AVATAR_COLORS = ['#F72585','#7c3aed','#FA8112','#10b981','#38bdf8','#f59e0b','#c084fc']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const STATUS_CFG = {
  accepted: { label: 'Joined',   bg: '#dcfce7', color: '#166534', icon: CheckCircle },
  pending:  { label: 'Pending',  bg: '#fef9c3', color: '#854d0e', icon: Clock },
  declined: { label: 'Declined', bg: '#fef2f2', color: '#991b1b', icon: null },
}

export default function InviteTab({ userType }) {
  const isTalent = userType === 'talent'

  const [referralCode, setReferralCode] = useState('')
  const [referrals, setReferrals]       = useState([])
  const [loadingRef, setLoadingRef]     = useState(true)

  const [copied, setCopied]     = useState(false)
  const [email, setEmail]       = useState('')
  const [name, setName]         = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingRef(false); return }

      // Load or generate referral code
      let { data: prof } = await supabase.from('profiles').select('referral_code').eq('id', user.id).single()
      let code = prof?.referral_code
      if (!code) {
        const prefix = isTalent ? 'CR' : 'BR'
        code = `BRANDIOR-${prefix}-${user.id.replace(/-/g,'').slice(0,6).toUpperCase()}`
        await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id)
      }
      setReferralCode(code)

      // Load referral history
      const { data: refs } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
      if (refs) {
        setReferrals(refs.map((r, i) => ({
          id: r.id,
          name: r.referee_name || 'New user',
          initials: r.referee_initials || (r.referee_name?.substring(0, 2).toUpperCase() ?? 'NU'),
          color: r.referee_color || AVATAR_COLORS[i % AVATAR_COLORS.length],
          date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: r.status === 'earned' ? 'Earned' : 'Pending',
          amount: `₦${r.amount.toLocaleString()}`,
        })))
      }
      setLoadingRef(false)
    })()
  }, [isTalent])

  const inviteLink = referralCode
    ? `https://app.brandior.africa/signup?ref=${referralCode}`
    : ''

  function copyLink() {
    navigator.clipboard.writeText(inviteLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function sendInvite(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 900))
    setEmail('')
    setName('')
    setSending(false)
    setSent(true)
    setTimeout(() => setSent(false), 2500)
  }

  const earned  = referrals.filter(r => r.status === 'Earned').length
  const pending = referrals.filter(r => r.status === 'Pending').length
  const totalEarned  = referrals.filter(r => r.status === 'Earned').reduce((s, r) => s + parseFloat(r.amount.replace(/[₦,]/g, '')), 0)
  const totalPending = referrals.filter(r => r.status === 'Pending').reduce((s, r) => s + parseFloat(r.amount.replace(/[₦,]/g, '')), 0)

  const whatsappText = isTalent
    ? `Hi! I'm a content creator on Brandior, Africa's top talent marketplace. I'd love to work with your brand 🚀 Join here: ${inviteLink}`
    : `Hey! I'm a brand on Brandior looking for talented African creators to collaborate with. Join us here 🎯 ${inviteLink}`

  const emailSubject = isTalent ? 'Work with me on Brandior' : 'Join Brandior as a Creator'
  const emailBody    = isTalent
    ? `Hi,\n\nI'm a content creator on Brandior and I'd love to collaborate with your brand.\n\nSign up here and let's work together: ${inviteLink}\n\nBest,`
    : `Hi,\n\nI'm looking for talented creators on Brandior to partner with my brand.\n\nJoin here and let's collaborate: ${inviteLink}\n\nBest,`

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="rounded-3xl p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${darkPurple} 0%, #6d28d9 100%)` }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg leading-tight">
                {isTalent ? 'Invite Brands to Hire You' : 'Invite Creators to Join'}
              </h2>
              <p className="text-white/60 text-xs mt-0.5">
                {isTalent
                  ? 'Share your profile link and grow your brand partnerships'
                  : 'Bring talented creators onto the platform to work with'}
              </p>
            </div>
          </div>
          {/* Reward tiers */}
          <div className="flex gap-3 mt-4 bg-white/10 rounded-2xl p-3">
            <div className="flex-1 flex items-center gap-2">
              <UserPlus className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-white">₦2,500</p>
                <p className="text-[10px] text-white/60">Creator joins</p>
              </div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex-1 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-white">₦5,000</p>
                <p className="text-[10px] text-white/60">Brand joins</p>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="flex gap-3 mt-3">
            <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center flex-1">
              <p className="text-xl font-extrabold">{referrals.length}</p>
              <p className="text-[11px] text-white/60">Referred</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center flex-1">
              <p className="text-xl font-extrabold" style={{ color: '#86efac' }}>₦{totalEarned.toLocaleString()}</p>
              <p className="text-[11px] text-white/60">Earned</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center flex-1">
              <p className="text-xl font-extrabold" style={{ color: '#fcd34d' }}>₦{totalPending.toLocaleString()}</p>
              <p className="text-[11px] text-white/60">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite link + referral code */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {loadingRef ? (
          <div className="flex items-center gap-2 py-3 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading your referral code…
          </div>
        ) : (
          <>
            {/* Referral code */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your referral code</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 px-4 py-2.5 rounded-xl text-sm font-mono font-bold tracking-widest text-center"
                style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff', color: darkPurple }}>
                {referralCode}
              </div>
              <button onClick={() => { navigator.clipboard.writeText(referralCode).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white flex-shrink-0 transition-all"
                style={{ backgroundColor: copied ? '#22c55e' : purple }}>
                {copied ? <><CheckCheck className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
        <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Link2 className="w-4 h-4" style={{ color: purple }} />
          Your Invite Link
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-gray-500 truncate"
            style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
            <span className="truncate">{inviteLink}</span>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all"
            style={{ backgroundColor: copied ? '#22c55e' : darkPurple }}
          >
            {copied
              ? <><CheckCheck className="w-4 h-4" /> Copied!</>
              : <><Copy className="w-4 h-4" /> Copy</>
            }
          </button>
        </div>

        {/* Share buttons — logo only */}
        <div className="flex gap-2 mt-3">
          {/* WhatsApp */}
          <a href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
            target="_blank" rel="noopener noreferrer"
            title="Share on WhatsApp"
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#25D366' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          {/* X / Twitter */}
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(whatsappText)}`}
            target="_blank" rel="noopener noreferrer"
            title="Share on X"
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#000' }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          {/* Facebook */}
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`}
            target="_blank" rel="noopener noreferrer"
            title="Share on Facebook"
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#1877F2' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
          </a>
          {/* LinkedIn */}
          <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(inviteLink)}&title=${encodeURIComponent(emailSubject)}`}
            target="_blank" rel="noopener noreferrer"
            title="Share on LinkedIn"
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#0A66C2' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          {/* Telegram */}
          <a href={`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(whatsappText)}`}
            target="_blank" rel="noopener noreferrer"
            title="Share on Telegram"
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#26A5E4' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </a>
        </div>
          </>
        )}
      </div>

      {/* Direct invite form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4" style={{ color: purple }} />
          Send a Direct Invite
        </p>
        <form onSubmit={sendInvite} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                {isTalent ? 'Brand Name' : 'Creator Name'} (optional)
              </label>
              <input
                value={name}
                onChange={e => setName(stripInjection(e.target.value))}
                placeholder={isTalent ? 'e.g. GlowUp Cosmetics' : 'e.g. Adaeze Okafor'}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Email Address *</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                required
                placeholder={isTalent ? 'marketing@brand.com' : 'creator@gmail.com'}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!email.trim() || sending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: sent ? '#22c55e' : darkPurple }}
          >
            {sending
              ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
              : sent
              ? <><CheckCheck className="w-4 h-4" /> Invite Sent!</>
              : <><Send className="w-4 h-4" /> Send Invite</>
            }
          </button>
        </form>
      </div>

      {/* Referral history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: purple }} />
            Your Referrals
          </p>
          <span className="text-xs text-gray-400">{referrals.length} total</span>
        </div>
        {referrals.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400 font-medium">No referrals yet — share your code to start earning!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {referrals.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: r.color }}>
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">Joined {r.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-bold" style={{ color: r.status === 'Earned' ? '#16a34a' : '#b45309' }}>{r.amount}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: r.status === 'Earned' ? '#dcfce7' : '#fef9c3', color: r.status === 'Earned' ? '#15803d' : '#92400e' }}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">Referral rewards are credited once your referred user completes their first collab. Subject to Brandior's referral terms.</p>
    </div>
  )
}
