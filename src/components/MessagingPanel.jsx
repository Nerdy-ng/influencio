import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageSquare, Search, ChevronLeft, Circle, Inbox, MailOpen, ShoppingBag, SlidersHorizontal, Star, EyeOff, MoreVertical, Eye, DollarSign, Check, X, ChevronDown, AlertTriangle, Scale, Paperclip } from 'lucide-react'
import { supabase } from '../lib/supabase'
const stripInjection = (s) => String(s ?? '').replace(/[<>{}\''`]/g, '');
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
  const isFile  = msg.type === 'file'
  const isImage = isFile && msg.fileUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(msg.fileName || '')

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-[72%]">
        {isFile ? (
          isImage ? (
            <a href={msg.fileUrl} target="_blank" rel="noreferrer">
              <img src={msg.fileUrl} alt={msg.fileName}
                className="rounded-2xl max-w-[240px] max-h-[240px] object-cover cursor-pointer"
                style={{ borderBottomRightRadius: isMine ? 4 : 16, borderBottomLeftRadius: isMine ? 16 : 4 }} />
            </a>
          ) : (
            <a href={msg.fileUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl no-underline"
              style={{
                backgroundColor: isMine ? darkPurple : '#f3f4f6',
                borderBottomRightRadius: isMine ? 4 : 16,
                borderBottomLeftRadius: isMine ? 16 : 4,
              }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: isMine ? 'rgba(255,255,255,0.15)' : '#ede9fe' }}>
                <Paperclip className="w-4 h-4" style={{ color: isMine ? 'white' : purple }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: isMine ? 'white' : '#111827' }}>{msg.fileName}</p>
                <p className="text-xs" style={{ color: isMine ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>{msg.fileSize}</p>
              </div>
            </a>
          )
        ) : (
          <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
            style={{
              backgroundColor: isMine ? darkPurple : '#f3f4f6',
              color: isMine ? 'white' : '#111827',
              borderBottomRightRadius: isMine ? 4 : 16,
              borderBottomLeftRadius: isMine ? 16 : 4,
            }}>
            {msg.body}
          </div>
        )}
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
  const [welcomeDismissed, setWelcomeDismissed] = useState(() =>
    userId ? !!localStorage.getItem(`brandior_welcome_msg_${userId}`) : false
  )
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeStatement, setDisputeStatement] = useState('')
  const [submittingDispute, setSubmittingDispute] = useState(false)
  const [disputeFeedback, setDisputeFeedback] = useState(null) // { type: 'success' | 'error', message }

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

  const WELCOME_BODY = userType === 'brand'
    ? `Hi there 👋\n\nWelcome to Brandior — Africa's marketplace for creator collabs.\n\nHere's how it works:\n\n1. Browse the marketplace to find creators by niche, platform, and budget.\n2. Review their rate card to see exactly what they charge before booking.\n3. Set up a collab — your payment goes into escrow and is only released when you approve the delivered content.\n\nIf you have any questions, reach us at support@brandior.africa.\n\n— The Brandior Team`
    : `Hi there 👋\n\nWelcome to Brandior — Africa's platform connecting creators with brands.\n\nHere's how to get started:\n\n1. Complete your profile — add a bio, social handles, and portfolio samples. Brands browse profiles before reaching out.\n2. Set your rate card — this tells brands what you charge for different content types and platforms.\n3. Browse campaigns — explore open briefs and pitch to brands that match your niche.\n\nIf you have any questions, reach us at support@brandior.africa.\n\n— The Brandior Team`

  function dismissWelcome() {
    if (userId) localStorage.setItem(`brandior_welcome_msg_${userId}`, '1')
    setWelcomeDismissed(true)
    if (activeConvId === 'welcome') setActiveConvId(null)
  }

  const activeConv = conversations.find(c => c.id === activeConvId)
  const otherName = activeConvId === 'welcome'
    ? 'Brandior'
    : activeConv
      ? (userType === 'brand' ? activeConv.talentName : activeConv.brandName)
      : ''
  const otherAvatar = activeConv && userType === 'brand' ? activeConv.talentAvatar : null

  // ── Map Supabase snake_case → camelCase ──────────────────────────────────────
  function mapConv(c) {
    return {
      id: c.id,
      brandId: c.brand_id,
      talentId: c.talent_id,
      brandName: c.brand_name,
      talentName: c.talent_name,
      talentAvatar: c.talent_avatar,
      lastMessage: c.last_message,
      lastMessageAt: c.last_message_at,
      unreadBrand: c.unread_brand ?? 0,
      unreadTalent: c.unread_talent ?? 0,
      orderId: c.order_id,
      orderTitle: c.order_title,
      collabId: c.collab_id,
    }
  }

  function mapMsg(m) {
    return {
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderType: m.sender_type,
      body: m.body,
      type: m.type || 'text',
      offerData: m.offer_data,
      fileUrl:   m.file_url  ?? null,
      fileName:  m.file_name ?? null,
      fileSize:  m.file_size ?? null,
      createdAt: m.created_at,
      read: m.read ?? false,
    }
  }

  // ── Fetch conversations ──────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!userId) return
    const col = userType === 'brand' ? 'brand_id' : 'talent_id'
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq(col, userId)
      .order('last_message_at', { ascending: false })
    if (!error && data) setConversations(data.map(mapConv))
  }, [userId, userType])

  useEffect(() => {
    fetchConversations()
    // Real-time: re-fetch when conversations change
    const channel = supabase
      .channel('conversations_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetchConversations)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchConversations])

  // ── Fetch messages in active conv ────────────────────────────────────────────
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    if (!error && data) setMessages(data.map(mapMsg))

    // Mark as read
    const unreadCol = userType === 'brand' ? 'unread_brand' : 'unread_talent'
    await supabase.from('conversations').update({ [unreadCol]: 0 }).eq('id', convId)
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, [userType === 'brand' ? 'unreadBrand' : 'unreadTalent']: 0 } : c
    ))
  }, [userId, userType])

  useEffect(() => {
    if (!activeConvId) return
    fetchMessages(activeConvId)
    // Real-time messages in active conv
    const channel = supabase
      .channel(`messages_${activeConvId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${activeConvId}`,
      }, payload => {
        const newMsg = mapMsg(payload.new)
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
        // reset unread if from other party
        if (newMsg.senderType !== userType) {
          supabase.from('conversations').update({
            [userType === 'brand' ? 'unread_brand' : 'unread_talent']: 0,
          }).eq('id', activeConvId)
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [activeConvId, fetchMessages, userType])

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

    const now = new Date().toISOString()
    const optimistic = {
      id: `opt_${Date.now()}`,
      conversationId: activeConvId,
      senderId: userId,
      senderType: userType,
      body,
      type: 'text',
      createdAt: now,
      read: false,
    }
    setMessages(prev => [...prev, optimistic])
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, lastMessage: body, lastMessageAt: now } : c
    ))

    const otherUnread = userType === 'brand' ? 'unread_talent' : 'unread_brand'
    await Promise.all([
      supabase.from('messages').insert({
        conversation_id: activeConvId,
        sender_id: userId,
        sender_type: userType,
        body,
        type: 'text',
      }),
      supabase.from('conversations').update({
        last_message: body,
        last_message_at: now,
        [otherUnread]: supabase.rpc ? undefined : undefined, // bump handled by trigger or below
      }).eq('id', activeConvId),
    ])
    setSending(false)
  }

  // ── Send file attachment ──────────────────────────────────────────────────────
  async function sendFile(e) {
    const file = e.target.files?.[0]
    if (!file || !activeConvId) return
    e.target.value = ''

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowed.includes(file.type)) {
      alert('Only images (JPG, PNG, WebP) and PDF files are allowed.')
      return
    }

    setSending(true)

    // Optimistic scanning bubble
    const scanId = `scan_${Date.now()}`
    setMessages(prev => [...prev, {
      id: scanId, conversationId: activeConvId, senderId: userId,
      senderType: userType, body: '🔍 Scanning file for safety…',
      type: 'text', createdAt: new Date().toISOString(), read: false,
    }])

    try {
      const path    = `${userId}/${activeConvId}/${Date.now()}-${file.name}`
      const sizeStr = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

      const { error: upErr } = await supabase.storage.from('chat-files').upload(path, file, { contentType: file.type })
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage.from('chat-files').getPublicUrl(path)

      // Virus scan
      const { data: scanResult } = await supabase.functions.invoke('scan-attachment', {
        body: { fileUrl: publicUrl, storagePath: path, bucket: 'chat-files' },
      })

      setMessages(prev => prev.filter(m => m.id !== scanId))

      if (!scanResult?.safe) {
        alert('File blocked — potential security risk detected.')
        setSending(false)
        return
      }

      const now = new Date().toISOString()
      const otherUnread = userType === 'brand' ? 'unread_talent' : 'unread_brand'
      await Promise.all([
        supabase.from('messages').insert({
          conversation_id: activeConvId,
          sender_id: userId,
          sender_type: userType,
          body: null,
          type: 'file',
          file_url:  publicUrl,
          file_name: file.name,
          file_size: sizeStr,
        }),
        supabase.from('conversations').update({
          last_message: `📎 ${file.name}`,
          last_message_at: now,
          [otherUnread]: supabase.rpc ? undefined : undefined,
        }).eq('id', activeConvId),
      ])
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== scanId))
      alert(err?.message || 'Could not upload file. Please try again.')
    } finally {
      setSending(false)
    }
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

    const now = new Date().toISOString()
    const optimistic = {
      id: `opt_offer_${Date.now()}`,
      conversationId: activeConvId,
      senderId: userId,
      senderType: userType,
      body,
      type: 'offer',
      offerData: { amount, status: 'pending' },
      createdAt: now,
      read: false,
    }
    setMessages(prev => [...prev, optimistic])
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, lastMessage: '💰 Offer sent', lastMessageAt: now } : c
    ))

    await Promise.all([
      supabase.from('messages').insert({
        conversation_id: activeConvId,
        sender_id: userId,
        sender_type: userType,
        body,
        type: 'offer',
        offer_data: { amount, status: 'pending' },
      }),
      supabase.from('conversations').update({
        last_message: '💰 Offer sent',
        last_message_at: now,
      }).eq('id', activeConvId),
    ])
    setSending(false)
  }

  // ── Respond to offer (talent side) ───────────────────────────────────────────
  async function respondToOffer(msgId, status) {
    // Skip optimistic rows
    if (String(msgId).startsWith('opt_')) return
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, offerData: { ...m.offerData, status } } : m
    ))
    await supabase.from('messages')
      .update({ offer_data: { ...(messages.find(m => m.id === msgId)?.offerData || {}), status } })
      .eq('id', msgId)
  }

  // ── Raise a dispute ───────────────────────────────────────────────────────────
  async function submitDispute(e) {
    e.preventDefault()
    if (!activeConv || !disputeReason.trim() || submittingDispute) return
    setSubmittingDispute(true)
    setDisputeFeedback(null)

    const statementField = userType === 'brand' ? 'brand_statement' : 'talent_statement'

    const { error } = await supabase.from('disputes').insert({
      collab_id: activeConv.collabId || null,
      brand_id: activeConv.brandId,
      talent_id: activeConv.talentId,
      raised_by: userId,
      raised_by_role: userType,
      reason: disputeReason.trim(),
      [statementField]: disputeStatement.trim() || null,
      status: 'awaiting_response',
    })

    setSubmittingDispute(false)
    if (error) {
      setDisputeFeedback({ type: 'error', message: error.message })
      return
    }
    setDisputeFeedback({ type: 'success', message: 'Dispute submitted. Our team will review it and reach out.' })
    setDisputeReason('')
    setDisputeStatement('')
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
                onChange={e => setSearch(stripInjection(e.target.value))}
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
          {/* ── Welcome pinned thread ── */}
          {!welcomeDismissed && (
            <div
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b transition-colors hover:bg-gray-50"
              style={{ borderColor: '#f3e8ff', backgroundColor: activeConvId === 'welcome' ? '#faf5ff' : undefined }}
              onClick={() => { setActiveConvId('welcome'); setMobileView('thread') }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>B</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-bold text-gray-900">Brandior</p>
                  <p className="text-[11px] text-gray-400">just now</p>
                </div>
                <p className="text-xs text-gray-500 truncate">👋 Welcome to Brandior! Here's how to get started…</p>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: purple }} />
            </div>
          )}

          {filtered.length === 0 && welcomeDismissed ? (
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
        {activeConvId === 'welcome' ? (
          // ── Welcome thread (read-only) ──────────────────────────────
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #f3e8ff' }}>
              <button className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileView('list')}>
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>B</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">Brandior</p>
                <p className="text-xs" style={{ color: purple }}>Platform team</p>
              </div>
              <button onClick={dismissWelcome} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xs">
                Dismiss
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="flex gap-3 max-w-lg">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>B</div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 max-w-sm" style={{ border: '1px solid #f3e8ff' }}>
                  {WELCOME_BODY.split('\n').map((line, i) => (
                    <p key={i} className={`text-sm text-gray-700 ${line === '' ? 'mt-2' : ''}`}>{line || ' '}</p>
                  ))}
                  <p className="text-[10px] text-gray-400 mt-2">Just now</p>
                </div>
              </div>
            </div>
          </div>
        ) : !activeConvId ? (
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
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <Circle className="w-2 h-2 fill-green-500 text-green-500" /> Online
              </span>
              <button
                onClick={() => { setShowDisputeModal(true); setDisputeFeedback(null) }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Raise a dispute</span>
              </button>
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
                    onChange={e => setOfferAmount(stripInjection(e.target.value))}
                    placeholder="Proposed budget (optional)"
                    className="flex-1 text-sm bg-white border border-purple-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={e => setInput(stripInjection(e.target.value))}
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
                {/* File attachment */}
                <label title="Attach file (image or PDF)" className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 cursor-pointer transition-colors hover:bg-purple-50"
                  style={{ color: '#9ca3af' }}>
                  <Paperclip className="w-4 h-4" />
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    className="hidden" onChange={sendFile} disabled={sending} />
                </label>
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
                    onChange={e => setInput(stripInjection(e.target.value))}
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

      {/* ── Raise a dispute modal ── */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6" style={{ border: '1px solid #e9d5ff' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-red-500" /> Raise a Dispute
              </h3>
              <button onClick={() => setShowDisputeModal(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              About your collaboration with {otherName}. Our team will review your evidence and the conversation history before deciding.
            </p>

            {disputeFeedback?.type === 'success' ? (
              <div className="rounded-xl p-4 text-sm text-green-700" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                {disputeFeedback.message}
              </div>
            ) : (
              <form onSubmit={submitDispute} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">What's the issue? <span className="text-red-500">*</span></label>
                  <input
                    value={disputeReason}
                    onChange={e => setDisputeReason(stripInjection(e.target.value))}
                    placeholder="e.g. Delivered content doesn't match the brief"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-800 outline-none"
                    style={{ border: '1px solid #e5e7eb' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Tell us more</label>
                  <textarea
                    value={disputeStatement}
                    onChange={e => setDisputeStatement(stripInjection(e.target.value))}
                    rows={4}
                    placeholder="Explain what happened, with as much detail as possible…"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-800 outline-none resize-none"
                    style={{ border: '1px solid #e5e7eb' }}
                  />
                </div>
                {disputeFeedback?.type === 'error' && (
                  <p className="text-xs text-red-500">{disputeFeedback.message}</p>
                )}
                <button type="submit" disabled={!disputeReason.trim() || submittingDispute}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: '#ef4444' }}>
                  {submittingDispute ? 'Submitting…' : 'Submit Dispute'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
