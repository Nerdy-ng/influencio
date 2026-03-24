import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, SlidersHorizontal, Star, Filter, ArrowRight,
  Receipt, CheckCircle2, Download,
  Bell, Package, MessageSquare, AlertCircle, Zap,
  Headphones, ChevronRight, BadgeCheck, TrendingUp,
  Users
} from 'lucide-react'

const tabs = [
  { id: 'discovery',     label: 'Discovery Engine',   icon: Search      },
  { id: 'transactions',  label: 'Transactions',       icon: Receipt     },
  { id: 'notifications', label: 'Notifications',      icon: Bell        },
  { id: 'support',       label: 'Support',            icon: Headphones  },
]

/* ── 1. DISCOVERY ── */
const ALL_NICHES = [
  { label: 'Beauty',   emoji: '💄', count: '47 creators' },
  { label: 'Food',     emoji: '🍽️', count: '38 creators' },
  { label: 'Tech',     emoji: '📱', count: '29 creators' },
  { label: 'Fashion',  emoji: '👗', count: '54 creators' },
  { label: 'Fitness',  emoji: '💪', count: '33 creators' },
  { label: 'Health',   emoji: '🏥', count: '26 creators' },
  { label: 'Comedy',   emoji: '😂', count: '41 creators' },
  { label: 'Finance',  emoji: '💼', count: '22 creators' },
  { label: 'Travel',   emoji: '✈️', count: '19 creators' },
  { label: 'Lifestyle',emoji: '🌟', count: '35 creators' },
]

const discoveryTalents = [
  { initials: 'AO', name: 'Amara Osei',    niche: 'Beauty',   followers: '284K', rating: 4.9, color: '#FF6B9D', verified: true  },
  { initials: 'JM', name: 'Jordan Malik',  niche: 'Fitness',  followers: '512K', rating: 4.8, color: '#c084fc', verified: true  },
  { initials: 'PK', name: 'Priya Kapoor',  niche: 'Food',     followers: '97K',  rating: 5.0, color: '#D4AF37', verified: false },
  { initials: 'KA', name: 'Kwame Asante',  niche: 'Comedy',   followers: '890K', rating: 4.7, color: '#FF6B9D', verified: true  },
  { initials: 'TO', name: 'Tunde Okafor',  niche: 'Tech',     followers: '143K', rating: 4.6, color: '#3b82f6', verified: true  },
  { initials: 'NE', name: 'Ngozi Eze',     niche: 'Fashion',  followers: '320K', rating: 4.8, color: '#a78bfa', verified: true  },
  { initials: 'CB', name: 'Chisom Bello',  niche: 'Health',   followers: '78K',  rating: 4.7, color: '#22c55e', verified: true  },
  { initials: 'FA', name: 'Femi Adeyemi',  niche: 'Finance',  followers: '61K',  rating: 4.5, color: '#f59e0b', verified: false },
  { initials: 'SA', name: 'Sola Adewale',  niche: 'Travel',   followers: '205K', rating: 4.9, color: '#06b6d4', verified: true  },
  { initials: 'IA', name: 'Ifunanya Agu',  niche: 'Lifestyle',followers: '112K', rating: 4.6, color: '#ec4899', verified: true  },
]

function DiscoveryPanel() {
  const [activeFilter, setActiveFilter] = useState('All')
  const filters = ['All', ...ALL_NICHES.map(n => n.label)]

  const filtered = activeFilter === 'All'
    ? discoveryTalents.slice(0, 4)
    : discoveryTalents.filter(c => c.niche === activeFilter)

  return (
    <div className="space-y-5">
      {/* Search bar — display only, not interactive */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3 select-none"
          style={{ border: '1px solid #e9d5ff', backgroundColor: '#faf8ff', cursor: 'default' }}>
          <Search className="w-4 h-4 text-brand-dark/30 flex-shrink-0" />
          <span className="flex-1 text-sm text-brand-dark/25">Search talents by name, niche, or location...</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium select-none"
          style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff', color: '#6b21a8', cursor: 'default' }}>
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </div>
      </div>

      {/* Active filter tags */}
      <div className="flex gap-3 flex-wrap">
        {['Followers: 50K+', 'Eng. Rate: 4%+', 'Location: Nigeria', 'Platform: Instagram'].map(f => (
          <span key={f} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full select-none"
            style={{ backgroundColor: '#FF6B9D15', color: '#FF6B9D', border: '1px solid #FF6B9D30' }}>
            <Filter className="w-3 h-3" /> {f}
          </span>
        ))}
      </div>

      {/* Niche filter chips — clickable with emoji */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveFilter('All')}
          className="text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
          style={activeFilter === 'All'
            ? { backgroundColor: '#4c1d95', color: '#fff' }
            : { backgroundColor: '#f3eeff', color: '#6b21a8', border: '1px solid #e9d5ff' }}>
          All
        </button>
        {ALL_NICHES.map(n => (
          <button key={n.label} onClick={() => setActiveFilter(n.label)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
            style={activeFilter === n.label
              ? { backgroundColor: '#4c1d95', color: '#fff' }
              : { backgroundColor: '#f3eeff', color: '#6b21a8', border: '1px solid #e9d5ff' }}>
            <span>{n.emoji}</span> {n.label}
          </button>
        ))}
      </div>

      {/* Talent cards */}
      <p className="text-xs text-brand-dark/30">{filtered.length} talents found</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((c, i) => (
          <div key={i} className="rounded-2xl p-4 transition-all hover:-translate-y-0.5 cursor-default"
            style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff', boxShadow: '0 2px 12px rgba(192,132,252,0.08)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: c.color }}>
                {c.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-brand-dark font-semibold text-sm truncate">{c.name}</p>
                  {c.verified && <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.color }} />}
                </div>
                <p className="text-brand-dark/40 text-xs">{c.niche}</p>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-brand-dark/50"><Users className="w-3 h-3 inline mr-0.5" />{c.followers}</span>
              <span className="font-bold flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{c.rating}</span>
            </div>
            <div className="w-full mt-3 py-2 rounded-xl text-xs font-semibold text-white text-center select-none"
              style={{ backgroundColor: c.color }}>
              View Profile
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between rounded-2xl px-6 py-4 mt-2"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' }}>
        <div>
          <p className="text-white font-bold text-sm">500+ verified creators ready to work</p>
          <p className="text-white/50 text-xs mt-0.5">Browse the full marketplace — filter by niche, budget & platform</p>
        </div>
        <Link to="/marketplace"
          className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full text-white flex-shrink-0 transition-all hover:scale-105"
          style={{ backgroundColor: '#FF6B9D', boxShadow: '0 4px 14px rgba(255,107,157,0.4)' }}>
          Browse All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  )
}

/* ── 3. TRANSACTIONS ── */
const transactions = [
  { brand: 'GlowLab',    title: 'Instagram Reel',         amount: '₦350,000', status: 'Completed', date: 'Mar 18, 2025', color: '#22c55e'  },
  { brand: 'PeakFit',    title: 'YouTube Review',          amount: '₦980,000', status: 'In Escrow', date: 'Mar 21, 2025', color: '#c084fc'  },
  { brand: 'UrbanThread', title: 'Eid Lookbook',           amount: '₦220,000', status: 'Pending',   date: 'Mar 22, 2025', color: '#D4AF37'  },
  { brand: 'MindfulBrew', title: 'TikTok Integration',     amount: '₦180,000', status: 'Completed', date: 'Mar 10, 2025', color: '#22c55e'  },
]

function TransactionsPanel() {
  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned',    value: '₦6.2M',  color: '#c084fc', sub: 'All time'       },
          { label: 'In Escrow',       value: '₦980K',  color: '#D4AF37', sub: 'Being held'     },
          { label: 'This Month',      value: '₦1.73M', color: '#FF6B9D', sub: 'March 2025'     },
          { label: 'Active Orders',   value: '3',       color: '#FF6B9D', sub: 'In progress'    },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: `${s.color}10`, border: `1px solid ${s.color}25` }}>
            <p className="text-xs text-brand-dark/40 mb-1">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-brand-dark/30 text-[10px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
        <div className="px-5 py-3 flex justify-between items-center" style={{ backgroundColor: '#f9f5ff' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/40">Order History</p>
          <button className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#c084fc' }}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        {transactions.map((t, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4 border-b last:border-0" style={{ borderColor: '#f3eeff', backgroundColor: '#fff' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ backgroundColor: t.color }}>
              {t.brand.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-brand-dark font-semibold text-sm">{t.title}</p>
              <p className="text-brand-dark/40 text-xs">{t.brand} · {t.date}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{
                color: t.status === 'Completed' ? '#22c55e' : t.status === 'In Escrow' ? '#c084fc' : '#D4AF37',
                backgroundColor: t.status === 'Completed' ? '#22c55e18' : t.status === 'In Escrow' ? '#c084fc18' : '#D4AF3718',
              }}>
              {t.status}
            </span>
            <p className="font-black text-brand-dark text-sm flex-shrink-0">{t.amount}</p>
            <button className="text-brand-dark/20 hover:text-brand-dark/50 flex-shrink-0">
              <Receipt className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 4. NOTIFICATIONS ── */
const notifications = [
  { icon: CheckCircle2, color: '#22c55e', title: 'Payment Released!',        body: 'GlowLab has approved your Reel. ₦350,000 sent to your wallet.',       time: '2m ago',  unread: true  },
  { icon: Package,      color: '#c084fc', title: 'New Campaign Match',        body: 'PeakFit Nigeria — your profile matches their new Fitness campaign.',   time: '15m ago', unread: true  },
  { icon: MessageSquare,color: '#FF6B9D', title: 'Message from UrbanThread',  body: '"Hey Amara, can we adjust the brief slightly? Check your inbox."',     time: '1h ago',  unread: true  },
  { icon: AlertCircle,  color: '#D4AF37', title: 'Deadline Reminder',         body: 'Your Eid Lookbook content is due in 3 days. Stay on track!',           time: '3h ago',  unread: false },
  { icon: Zap,          color: '#FF6B9D', title: 'Profile Milestone!',        body: "You've hit 284K followers. Your reach badge has been upgraded.",        time: '1d ago',  unread: false },
  { icon: TrendingUp,   color: '#c084fc', title: 'Campaign Performance',      body: 'Your GlowLab Reel is trending — 2.1M views in 48 hours.',              time: '2d ago',  unread: false },
]

function NotificationsPanel() {
  const [filter, setFilter] = useState('all')

  const shown = notifications.filter(n => filter === 'all' || (filter === 'unread' && n.unread))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl p-1" style={{ backgroundColor: '#f3eeff' }}>
          {['all', 'unread'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={filter === f ? { backgroundColor: '#4c1d95', color: '#fff' } : { color: '#6b21a8' }}>
              {f} {f === 'unread' && <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5">3</span>}
            </button>
          ))}
        </div>
        <button className="text-xs font-medium" style={{ color: '#c084fc' }}>Mark all read</button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e9d5ff' }}>
        {shown.map((n, i) => (
          <div key={i} className="flex items-start gap-4 px-5 py-4 border-b last:border-0 cursor-pointer transition-colors"
            style={{ borderColor: '#f3eeff', backgroundColor: n.unread ? '#faf8ff' : '#fff' }}>
            {n.unread && <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#c084fc' }} />}
            {!n.unread && <div className="w-1.5 h-1.5 mt-2 flex-shrink-0" />}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${n.color}15` }}>
              <n.icon className="w-4 h-4" style={{ color: n.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-brand-dark font-semibold text-sm">{n.title}</p>
              <p className="text-brand-dark/50 text-xs leading-relaxed mt-0.5">{n.body}</p>
            </div>
            <span className="text-brand-dark/25 text-xs flex-shrink-0 mt-0.5">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 4. SUPPORT ── */
const chatMessages = [
  { from: 'agent', text: 'Hi Amara! 👋 How can I help you today?',                            time: '10:02' },
  { from: 'user',  text: "Hi, I haven't received my payment for the GlowLab campaign yet.",   time: '10:04' },
  { from: 'agent', text: 'Let me check that for you. Could you share the order ID?',           time: '10:04' },
  { from: 'user',  text: "Sure — it's ORD-2025-0342.",                                         time: '10:05' },
  { from: 'agent', text: "Found it! The payment is processing. It'll arrive within 2 hours. Sorry for the delay!", time: '10:06' },
]

function SupportPanel() {
  const [visible, setVisible] = useState(1)
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visible, typing])

  useEffect(() => {
    if (visible >= chatMessages.length) {
      const t = setTimeout(() => { setVisible(1); setTyping(false) }, 3500)
      return () => clearTimeout(t)
    }
    const t1 = setTimeout(() => setTyping(true), 700)
    const t2 = setTimeout(() => { setTyping(false); setVisible(v => v + 1) }, 700 + 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [visible])

  const nextFrom = visible < chatMessages.length ? chatMessages[visible].from : null

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Tickets sidebar */}
      <div className="lg:w-64 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/30">My Tickets</p>
        {[
          { id: 'TKT-091', title: 'Payment delay',      status: 'Open',     color: '#22c55e' },
          { id: 'TKT-088', title: 'Brief edit request', status: 'Resolved', color: '#c084fc' },
          { id: 'TKT-075', title: 'Login issue',        status: 'Resolved', color: '#c084fc' },
        ].map((t, i) => (
          <div key={i} className="rounded-xl p-3 cursor-pointer transition-all"
            style={{ backgroundColor: i === 0 ? '#f3eeff' : '#fff', border: '1px solid #e9d5ff' }}>
            <div className="flex justify-between items-start">
              <p className="text-brand-dark font-semibold text-xs">{t.title}</p>
              <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ color: t.color, backgroundColor: `${t.color}15` }}>{t.status}</span>
            </div>
            <p className="text-brand-dark/30 text-[10px] mt-1">{t.id}</p>
          </div>
        ))}
        <button className="w-full py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: '#4c1d95' }}>
          + New Ticket
        </button>
      </div>

      {/* Chat window */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col" style={{ border: '1px solid #e9d5ff', minHeight: '340px' }}>
        {/* Chat header */}
        <div className="px-5 py-3.5 flex items-center gap-3" style={{ backgroundColor: '#4c1d95' }}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Brandiór Support</p>
            <p className="text-white/50 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online · Avg reply 3 min
            </p>
          </div>
        </div>

        {/* Messages — animated, no input */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ backgroundColor: '#faf8ff', height: '260px' }}>
          {chatMessages.slice(0, visible).map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}
              style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: m.from === 'user' ? '#FF6B9D' : '#4c1d95' }}>
                {m.from === 'user' ? 'AO' : 'TS'}
              </div>
              <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${m.from === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                style={{ backgroundColor: m.from === 'user' ? '#4c1d95' : '#fff', border: m.from !== 'user' ? '1px solid #e9d5ff' : 'none' }}>
                <p className="text-xs leading-relaxed" style={{ color: m.from === 'user' ? '#fff' : '#374151' }}>{m.text}</p>
                <p className="text-[10px] mt-1 text-right" style={{ color: m.from === 'user' ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>{m.time}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && nextFrom && (
            <div className={`flex gap-3 ${nextFrom === 'user' ? 'flex-row-reverse' : ''}`}
              style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: nextFrom === 'user' ? '#FF6B9D' : '#4c1d95' }}>
                {nextFrom === 'user' ? 'AO' : 'TS'}
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1"
                style={{ backgroundColor: '#fff', border: '1px solid #e9d5ff' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/30 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── MAIN ── */
export default function PlatformPreview() {
  const [activeTab, setActiveTab] = useState('discovery')

  return (
    <section className="py-28" style={{ background: 'linear-gradient(135deg, #f3eeff 0%, #e8d5ff 100%)' }}>
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B9D' }}>Platform Features</p>
          <h2 className="text-4xl lg:text-5xl font-black text-brand-dark mb-4">
            Built for the full<br />
            <span style={{ color: '#4c1d95' }}>talent journey</span>
          </h2>
          <p className="text-brand-dark/50 max-w-lg mx-auto">
            Every tool you need — from signing up to getting paid — in one seamless platform.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={activeTab === t.id
                ? { backgroundColor: '#4c1d95', color: '#fff', boxShadow: '0 4px 16px rgba(76,29,149,0.25)' }
                : { backgroundColor: 'rgba(255,255,255,0.7)', color: '#6b21a8', border: '1px solid #e9d5ff' }}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Panels — all stay mounted; CSS hides inactive ones to preserve state */}
        <div className="rounded-3xl p-7 shadow-xl" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(192,132,252,0.25)', backdropFilter: 'blur(12px)', minHeight: '480px' }}>
          <div style={{ display: activeTab === 'discovery'     ? 'block' : 'none' }}><DiscoveryPanel /></div>
          <div style={{ display: activeTab === 'transactions'  ? 'block' : 'none' }}><TransactionsPanel /></div>
          <div style={{ display: activeTab === 'notifications' ? 'block' : 'none' }}><NotificationsPanel /></div>
          <div style={{ display: activeTab === 'support'       ? 'block' : 'none' }}><SupportPanel /></div>
        </div>
      </div>
    </section>
  )
}
