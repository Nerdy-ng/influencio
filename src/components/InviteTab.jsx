import { useState } from 'react'
import {
  Link2, Copy, CheckCheck, Mail, MessageCircle, Twitter,
  Users, Send, Clock, CheckCircle, Gift, UserPlus,
} from 'lucide-react'

const pink    = '#FF6B9D'
const purple  = '#7c3aed'
const darkPurple = '#4c1d95'

// Mock sent invites
const MOCK_INVITES_TALENT = [
  { id: 1, email: 'marketing@glowupng.com',  name: 'GlowUp Cosmetics',  status: 'accepted', sentAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, email: 'hello@technocorp.africa',  name: 'TechnoCorp Africa',  status: 'pending',  sentAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 3, email: 'brand@fashionhouseafrica.com',name: 'Fashion House Africa',status: 'accepted', sentAt: new Date(Date.now() - 86400000 * 9).toISOString() },
]

const MOCK_INVITES_BRAND = [
  { id: 1, email: 'adaeze@gmail.com',    name: 'Adaeze Okafor',  status: 'accepted', sentAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 2, email: 'chidi.tv@gmail.com',  name: 'Chidi Nwosu',    status: 'pending',  sentAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 3, email: 'fatimahlooks@ng.co',  name: 'Fatimah Looks',  status: 'declined', sentAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 4, email: 'sola.create@gmail.com',name: 'Sola Adesanya', status: 'accepted', sentAt: new Date(Date.now() - 86400000 * 12).toISOString() },
]

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
  const refId    = isTalent ? 'talent_001' : 'brand_demo'
  const role     = isTalent ? 'brand' : 'talent'
  const inviteLink = `https://brandiór.co/join?ref=${refId}&role=${role}`

  const [copied, setCopied]     = useState(false)
  const [email, setEmail]       = useState('')
  const [name, setName]         = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [invites, setInvites]   = useState(isTalent ? MOCK_INVITES_TALENT : MOCK_INVITES_BRAND)

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
    setInvites(prev => [{
      id: Date.now(),
      email: email.trim(),
      name: name.trim() || email.trim(),
      status: 'pending',
      sentAt: new Date().toISOString(),
    }, ...prev])
    setEmail('')
    setName('')
    setSending(false)
    setSent(true)
    setTimeout(() => setSent(false), 2500)
  }

  const accepted = invites.filter(i => i.status === 'accepted').length
  const pending  = invites.filter(i => i.status === 'pending').length

  const whatsappText = isTalent
    ? `Hi! I'm a content creator on Brandiór, Africa's top talent marketplace. I'd love to work with your brand 🚀 Join here: ${inviteLink}`
    : `Hey! I'm a brand on Brandiór looking for talented African creators to collaborate with. Join us here 🎯 ${inviteLink}`

  const emailSubject = isTalent ? 'Work with me on Brandiór' : 'Join Brandiór as a Creator'
  const emailBody    = isTalent
    ? `Hi,\n\nI'm a content creator on Brandiór and I'd love to collaborate with your brand.\n\nSign up here and let's work together: ${inviteLink}\n\nBest,`
    : `Hi,\n\nI'm looking for talented creators on Brandiór to partner with my brand.\n\nJoin here and let's collaborate: ${inviteLink}\n\nBest,`

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
          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 rounded-2xl px-4 py-2.5 text-center">
              <p className="text-xl font-extrabold">{invites.length}</p>
              <p className="text-[11px] text-white/60">Invited</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-2.5 text-center">
              <p className="text-xl font-extrabold">{accepted}</p>
              <p className="text-[11px] text-white/60">Joined</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-2.5 text-center">
              <p className="text-xl font-extrabold">{pending}</p>
              <p className="text-[11px] text-white/60">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite link */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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

        {/* Share buttons */}
        <div className="flex gap-2 mt-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ backgroundColor: '#dcfce7', color: '#166534' }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(whatsappText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
          >
            <Twitter className="w-3.5 h-3.5" />
            X / Twitter
          </a>
        </div>
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
                onChange={e => setName(e.target.value)}
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

      {/* Invite history */}
      {invites.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: purple }} />
              Invite History
            </p>
            <span className="text-xs text-gray-400">{invites.length} sent</span>
          </div>
          <div className="divide-y divide-gray-50">
            {invites.map(inv => {
              const cfg = STATUS_CFG[inv.status] || STATUS_CFG.pending
              return (
                <div key={inv.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: darkPurple }}>
                    {(inv.name || inv.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{inv.name || inv.email}</p>
                    <p className="text-xs text-gray-400 truncate">{inv.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{timeAgo(inv.sentAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
