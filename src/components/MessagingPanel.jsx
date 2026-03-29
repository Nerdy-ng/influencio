import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageSquare, Search, ChevronLeft, Circle, Inbox, MailOpen, ShoppingBag, SlidersHorizontal, Star, EyeOff, MoreVertical, Eye, DollarSign, Check, X, ChevronDown } from 'lucide-react'

const API = 'http://localhost:3001/api'
const purple = '#7c3aed'
const darkPurple = '#4c1d95'
const pink = '#FF6B9D'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days > 6) return new Date(dateStr).toLocaleDateString('en', { day: 'numeric', month: 'short' })
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (mins > 0) return `${mins}m`
  return 'now'
}

function Avatar({ name, src, size = 40 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return src ? (
    <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
      style={{ width: size, height: size, backgroundColor: darkPurple, fontSize: size < 36 ? 11 : 13 }}>
      {initials}
    </div>
  )
}

// ── Conversation list item ────────────────────────────────────────────────────
function ConvItem({ conv, active, userType, onClick, isFav, isHidden, onToggleFav, onToggleHide }) {
  const unread = userType === 'brand' ? conv.unreadBrand : conv.unreadTalent
  const otherName = userType === 'brand' ? conv.talentName : conv.brandName
  const avatar = userType === 'brand' ? conv.talentAvatar : null
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div
      className="relative flex items-center gap-3 px-4 py-3.5 transition-colors group"
      style={{ backgroundColor: active ? '#f3e8ff' : 'transparent' }}
    >
      {/* Clickable area */}
      <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="relative flex-shrink-0">
          <Avatar name={otherName} src={avatar} size={44} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              style={{ backgroundColor: pink }}>{unread > 9 ? '9+' : unread}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-semibold text-gray-900 truncate">{otherName}</p>
            {isFav && <Star className="w-3 h-3 flex-shrink-0" style={{ color: '#D4AF37' }} fill="#D4AF37" />}
            {isHidden && <EyeOff className="w-3 h-3 flex-shrink-0 text-gray-300" />}
          </div>
          {conv.orderTitle && (
            <p className="text-[10px] font-medium mb-0.5 truncate" style={{ color: purple }}>
              {conv.orderTitle}
            </p>
          )}
          <p className={`text-xs truncate ${unread > 0 ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>
            {conv.lastMessage || 'No messages yet'}
          </p>
        </div>
        <span className="text-[11px] text-gray-400 flex-shrink-0 ml-1">{timeAgo(conv.lastMessageAt)}</span>
      </button>

      {/* Three-dot menu */}
      <div ref={menuRef} className="flex-shrink-0">
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg transition-all hover:bg-gray-100"
        >
          <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>
        {menuOpen && (
          <div className="absolute right-3 top-10 z-50 w-36 rounded-xl shadow-lg overflow-hidden"
            style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}>
            <button
              onClick={() => { onToggleFav(conv.id); setMenuOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-left transition-colors hover:bg-gray-50"
            >
              <Star className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} fill={isFav ? '#D4AF37' : 'none'} />
              {isFav ? 'Unfavorite' : 'Favorite'}
            </button>
            <button
              onClick={() => { onToggleHide(conv.id); setMenuOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-left transition-colors hover:bg-gray-50"
            >
              {isHidden
                ? <Eye className="w-3.5 h-3.5 text-gray-400" />
                : <EyeOff className="w-3.5 h-3.5 text-gray-400" />
              }
              {isHidden ? 'Unhide' : 'Hide'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, isMine }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-[72%]">
        <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={{
            backgroundColor: isMine ? darkPurple : '#f3f4f6',
            color: isMine ? 'white' : '#111827',
            borderBottomRightRadius: isMine ? 4 : 16,
            borderBottomLeftRadius: isMine ? 16 : 4,
          }}>
          {msg.body}
        </div>
        <p className={`text-[10px] mt-1 text-gray-400 ${isMine ? 'text-right' : 'text-left'}`}>
          {timeAgo(msg.createdAt)}
          {isMine && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
        </p>
      </div>
    </div>
  )
}

// ── Offer card bubble ─────────────────────────────────────────────────────────
function OfferBubble({ msg, isMine, onRespond }) {
  const offer = msg.offerData || {}
  const status = offer.status || 'pending'

  const statusConfig = {
    pending: { label: 'Awaiting response', bg: '#f3e8ff', border: '#e9d5ff', color: purple },
    accepted: { label: 'Offer accepted', bg: '#f0fdf4', border: '#86efac', color: '#16a34a' },
    declined: { label: 'Offer declined', bg: '#fef2f2', border: '#fca5a5', color: '#dc2626' },
  }
  const sc = statusConfig[status] || statusConfig.pending

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[80%] w-80">
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${sc.border}`, backgroundColor: sc.bg }}>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: darkPurple }}>
            <DollarSign className="w-4 h-4 text-orange-300 flex-shrink-0" />
            <span className="text-sm font-bold text-white">Custom Offer</span>
            {status !== 'pending' && (
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: status === 'accepted' ? '#16a34a' : '#dc2626' }}>
                {status === 'accepted' ? '✓ Accepted' : '✗ Declined'}
              </span>
            )}
          </div>

          {/* Amount */}
          {offer.amount && (
            <div className="px-4 pt-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Proposed Budget</p>
              <p className="text-2xl font-extrabold mt-0.5" style={{ color: pink }}>
                ₦{Number(offer.amount).toLocaleString('en')}
              </p>
            </div>
          )}

          {/* Note */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Project Brief</p>
            <p className="text-sm text-gray-700 leading-relaxed">{msg.body}</p>
          </div>

          {/* Status / Actions */}
          <div className="px-4 pb-3">
            {status === 'pending' && !isMine ? (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => onRespond(msg.id, 'accepted')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                  style={{ backgroundColor: '#16a34a' }}
                >
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button
                  onClick={() => onRespond(msg.id, 'declined')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors"
                  style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            ) : status === 'pending' && isMine ? (
              <p className="text-xs text-center py-1" style={{ color: purple }}>Waiting for response…</p>
            ) : (
              <p className="text-xs text-center py-1 font-medium" style={{ color: sc.color }}>{sc.label}</p>
            )}
          </div>
        </div>
        <p className={`text-[10px] mt-1 text-gray-400 ${isMine ? 'text-right' : 'text-left'}`}>
          {timeAgo(msg.createdAt)}
        </p>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyThread({ otherName }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: '#f3e8ff' }}>
        <MessageSquare className="w-7 h-7" style={{ color: purple }} />
      </div>
      <p className="font-semibold text-gray-700 mb-1">Start a conversation</p>
      <p className="text-sm text-gray-400">
        Send your first message to {otherName || 'this user'}.
      </p>
    </div>
  )
}

// ── Main MessagingPanel ───────────────────────────────────────────────────────
export default function MessagingPanel({ userId, userType, initialConvId, onUnreadChange }) {
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(initialConvId || null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [msgFilter, setMsgFilter] = useState('all') // 'all' | 'unread' | 'orders' | 'favorites' | 'hidden'
  const [showFilters, setShowFilters] = useState(false)
  const [favConvs, setFavConvs] = useState({})   // { convId: true }
  const [hiddenConvs, setHiddenConvs] = useState({}) // { convId: true }
  const [mobileView, setMobileView] = useState(initialConvId ? 'thread' : 'list') // 'list' | 'thread'
  const [showOfferPanel, setShowOfferPanel] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')

  const bottomRef = useRef(null)
  const pollRef = useRef(null)
  const filterRef = useRef(null)

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activeConv = conversations.find(c => c.id === activeConvId)
  const otherName = activeConv
    ? (userType === 'brand' ? activeConv.talentName : activeConv.brandName)
    : ''
  const otherAvatar = activeConv && userType === 'brand' ? activeConv.talentAvatar : null

  // ── Fetch conversations ──────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/messages/conversations?userId=${userId}&userType=${userType}`)
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {
      // fallback silent — keep existing state
    }
  }, [userId, userType])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  // ── Fetch messages in active conv ────────────────────────────────────────────
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return
    try {
      const res = await fetch(`${API}/messages/conversations/${convId}/messages`)
      const data = await res.json()
      setMessages(data.messages || [])
      // mark as read
      await fetch(`${API}/messages/conversations/${convId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType }),
      })
      // update local unread count
      setConversations(prev => prev.map(c =>
        c.id === convId
          ? { ...c, [userType === 'brand' ? 'unreadBrand' : 'unreadTalent']: 0 }
          : c
      ))
    } catch { /* silent */ }
  }, [userId, userType])

  useEffect(() => {
    if (!activeConvId) return
    fetchMessages(activeConvId)
    clearInterval(pollRef.current)
    pollRef.current = setInterval(() => fetchMessages(activeConvId), 5000)
    return () => clearInterval(pollRef.current)
  }, [activeConvId, fetchMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Select conversation ───────────────────────────────────────────────────────
  function openConv(convId) {
    setActiveConvId(convId)
    setMobileView('thread')
  }

  // ── Send message ─────────────────────────────────────────────────────────────
  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || !activeConvId || sending) return
    const body = input.trim()
    setInput('')
    setSending(true)

    const optimistic = {
      id: `opt_${Date.now()}`,
      conversationId: activeConvId,
      senderId: userId,
      senderType: userType,
      body,
      type: 'text',
      createdAt: new Date().toISOString(),
      read: false,
    }
    setMessages(prev => [...prev, optimistic])
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, lastMessage: body, lastMessageAt: optimistic.createdAt } : c
    ))

    try {
      await fetch(`${API}/messages/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, senderType: userType, body }),
      })
    } catch { /* optimistic already shown */ }
    setSending(false)
  }

  // ── Send offer ────────────────────────────────────────────────────────────────
  async function sendOffer(e) {
    e.preventDefault()
    if (!input.trim() || !activeConvId || sending) return
    const body = input.trim()
    const amount = offerAmount.replace(/[^0-9]/g, '')
    setInput('')
    setOfferAmount('')
    setShowOfferPanel(false)
    setSending(true)

    const optimistic = {
      id: `opt_offer_${Date.now()}`,
      conversationId: activeConvId,
      senderId: userId,
      senderType: userType,
      body,
      type: 'offer',
      offerData: { amount, status: 'pending' },
      createdAt: new Date().toISOString(),
      read: false,
    }
    setMessages(prev => [...prev, optimistic])
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, lastMessage: '💰 Offer sent', lastMessageAt: optimistic.createdAt } : c
    ))

    try {
      await fetch(`${API}/messages/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, senderType: userType, body, type: 'offer', offerData: { amount } }),
      })
    } catch { /* optimistic shown */ }
    setSending(false)
  }

  // ── Respond to offer (talent side) ───────────────────────────────────────────
  async function respondToOffer(msgId, status) {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, offerData: { ...m.offerData, status } } : m
    ))
    try {
      await fetch(`${API}/messages/${msgId}/offer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch { /* optimistic shown */ }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function toggleFav(convId) {
    setFavConvs(prev => ({ ...prev, [convId]: !prev[convId] }))
  }
  function toggleHide(convId) {
    setHiddenConvs(prev => ({ ...prev, [convId]: !prev[convId] }))
  }

  // ── Filter conversations ──────────────────────────────────────────────────────
  const filtered = conversations.filter(c => {
    const name = userType === 'brand' ? c.talentName : c.brandName
    const nameMatch = name.toLowerCase().includes(search.toLowerCase())
    const unread = userType === 'brand' ? c.unreadBrand : c.unreadTalent
    if (msgFilter === 'hidden') return nameMatch && !!hiddenConvs[c.id]
    if (msgFilter === 'favorites') return nameMatch && !!favConvs[c.id] && !hiddenConvs[c.id]
    // default filters skip hidden
    if (hiddenConvs[c.id] && msgFilter !== 'hidden') return false
    const unreadMatch = msgFilter !== 'unread' || unread > 0
    const orderMatch = msgFilter !== 'orders' || !!c.orderId
    return nameMatch && unreadMatch && orderMatch
  })

  const totalUnread = conversations.reduce((sum, c) =>
    sum + (userType === 'brand' ? c.unreadBrand : c.unreadTalent), 0)

  useEffect(() => {
    onUnreadChange?.(totalUnread)
  }, [totalUnread, onUnreadChange])

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[500px] rounded-3xl overflow-hidden shadow-sm"
      style={{ border: '1px solid #e9d5ff' }}>

      {/* ── Conversation list ── */}
      <div className={`flex flex-col bg-white ${mobileView === 'thread' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0`}
        style={{ borderRight: '1px solid #f3e8ff' }}>

        {/* Header */}
        <div className="px-4 pt-5 pb-3" style={{ borderBottom: '1px solid #f3e8ff' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base">Messages</h2>
            {totalUnread > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: pink }}>{totalUnread} new</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#f9f5ff' }}>
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(v => !v)}
                title="Filter"
                className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors"
                style={{
                  backgroundColor: showFilters || msgFilter !== 'all' ? darkPurple : '#f3e8ff',
                  color: showFilters || msgFilter !== 'all' ? 'white' : purple,
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              {/* Dropdown */}
              {showFilters && (
                <div
                  className="absolute right-0 top-11 z-50 w-44 rounded-2xl shadow-lg overflow-hidden"
                  style={{ border: '1px solid #e9d5ff', backgroundColor: 'white' }}
                >
                  {[
                    { value: 'all',       icon: Inbox,       title: 'All Messages' },
                    { value: 'unread',    icon: MailOpen,    title: 'Unread' },
                    { value: 'orders',    icon: ShoppingBag, title: 'With Orders' },
                    { value: 'favorites', icon: Star,        title: 'Favorites' },
                    { value: 'hidden',    icon: EyeOff,      title: 'Hidden' },
                  ].map(({ value, icon: Icon, title }) => (
                    <button
                      key={value}
                      onClick={() => { setMsgFilter(value); setShowFilters(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                      style={{
                        backgroundColor: msgFilter === value ? '#f3e8ff' : 'transparent',
                        color: msgFilter === value ? darkPurple : '#374151',
                        fontWeight: msgFilter === value ? 600 : 400,
                      }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: msgFilter === value ? darkPurple : '#9ca3af' }} />
                      {title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <MessageSquare className="w-8 h-8 mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">No conversations yet</p>
            </div>
          ) : (
            filtered.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                active={conv.id === activeConvId}
                userType={userType}
                onClick={() => openConv(conv.id)}
                isFav={!!favConvs[conv.id]}
                isHidden={!!hiddenConvs[conv.id]}
                onToggleFav={toggleFav}
                onToggleHide={toggleHide}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Thread panel ── */}
      <div className={`flex-1 flex flex-col bg-white ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {!activeConvId ? (
          // No conversation selected
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
              style={{ backgroundColor: '#f3e8ff' }}>
              <MessageSquare className="w-8 h-8" style={{ color: purple }} />
            </div>
            <p className="font-bold text-gray-700 text-lg mb-2">Your messages</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Select a conversation from the list to read and reply to messages.
            </p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #f3e8ff' }}>
              <button className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileView('list')}>
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <Avatar name={otherName} src={otherAvatar} size={40} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{otherName}</p>
                {activeConv?.orderTitle && (
                  <p className="text-xs truncate" style={{ color: purple }}>
                    Re: {activeConv.orderTitle}
                  </p>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <Circle className="w-2 h-2 fill-green-500 text-green-500" /> Online
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {messages.length === 0 ? (
                <EmptyThread otherName={otherName} />
              ) : (
                messages.map(msg =>
                  msg.type === 'offer' ? (
                    <OfferBubble
                      key={msg.id}
                      msg={msg}
                      isMine={msg.senderId === userId}
                      onRespond={respondToOffer}
                    />
                  ) : (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isMine={msg.senderId === userId}
                    />
                  )
                )
              )}
              <div ref={bottomRef} />
            </div>

            {/* Offer panel */}
            {showOfferPanel && (
              <form onSubmit={sendOffer}
                className="px-4 pt-3 pb-1"
                style={{ borderTop: '1px solid #f3e8ff', backgroundColor: '#faf5ff' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" style={{ color: purple }} />
                    Make an Offer
                  </p>
                  <button type="button" onClick={() => setShowOfferPanel(false)}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-600">₦</span>
                  <input
                    value={offerAmount}
                    onChange={e => setOfferAmount(e.target.value)}
                    placeholder="Proposed budget (optional)"
                    className="flex-1 text-sm bg-white border border-purple-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Describe your project, deliverables, timeline…"
                    rows={2}
                    className="flex-1 text-sm bg-white border border-purple-200 rounded-xl px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-purple-100"
                    style={{ maxHeight: 100 }}
                  />
                  <button type="submit" disabled={!input.trim() || sending}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40"
                    style={{ backgroundColor: darkPurple }}>
                    Send
                  </button>
                </div>
              </form>
            )}

            {/* Input */}
            {!showOfferPanel && (
              <form onSubmit={sendMessage}
                className="flex items-end gap-2 px-4 py-3"
                style={{ borderTop: '1px solid #f3e8ff' }}>
                {/* Offer trigger — brand only */}
                {userType === 'brand' && (
                  <button
                    type="button"
                    onClick={() => setShowOfferPanel(true)}
                    title="Make an Offer"
                    className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors"
                    style={{ backgroundColor: '#f3e8ff', color: purple }}
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 flex items-end rounded-2xl overflow-hidden px-4 py-2.5"
                  style={{ border: '1px solid #e9d5ff', backgroundColor: '#f9f5ff', minHeight: 46 }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) sendMessage(e)
                    }}
                    placeholder="Type a message…"
                    rows={1}
                    className="flex-1 text-sm text-gray-800 bg-transparent outline-none resize-none leading-relaxed"
                    style={{ maxHeight: 120 }}
                  />
                </div>
                <button type="submit" disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: darkPurple }}>
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
