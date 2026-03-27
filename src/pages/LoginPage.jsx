import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getLogo } from '../lib/brandSettings'

const purple = '#c084fc'
const darkPurple = '#4c1d95'
const pink = '#FF6B9D'

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

const countryCodes = [
  { code: '+234', flag: '🇳🇬', label: 'NG' },
  { code: '+233', flag: '🇬🇭', label: 'GH' },
  { code: '+254', flag: '🇰🇪', label: 'KE' },
  { code: '+27',  flag: '🇿🇦', label: 'ZA' },
  { code: '+44',  flag: '🇬🇧', label: 'UK' },
  { code: '+1',   flag: '🇺🇸', label: 'US' },
]

// ── Caricature SVG Illustration ──────────────────────────────────────────────
function TalentIllustration() {
  return (
    <svg viewBox="0 0 420 540" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

      {/* ── Background blobs ── */}
      <ellipse cx="210" cy="500" rx="170" ry="28" fill="#d8b4fe" opacity="0.25" />
      <circle cx="80" cy="120" r="55" fill="#ede9fe" opacity="0.5" />
      <circle cx="350" cy="80" r="40" fill="#fce7f3" opacity="0.5" />
      <circle cx="340" cy="420" r="50" fill="#ede9fe" opacity="0.4" />

      {/* ══════════════════════════════════════════
          CREATOR 1 — Centre: Camera Girl (Beauty)
          Skin: warm dark brown
      ══════════════════════════════════════════ */}

      {/* Body / outfit — pink crop top */}
      <rect x="152" y="310" width="116" height="90" rx="20" fill="#FF6B9D" />
      {/* collar detail */}
      <path d="M185 310 Q210 330 235 310" stroke="#e05590" strokeWidth="2" fill="none" />
      {/* arms */}
      <ellipse cx="148" cy="340" rx="18" ry="38" rx="18" fill="#6B3A1F" transform="rotate(-10 148 340)" />
      <ellipse cx="272" cy="335" rx="18" ry="38" fill="#6B3A1F" transform="rotate(10 272 335)" />
      {/* hands */}
      <circle cx="138" cy="375" r="13" fill="#7B4422" />
      <circle cx="282" cy="370" r="13" fill="#7B4422" />

      {/* Camera held in right hand */}
      <rect x="256" y="350" width="46" height="34" rx="7" fill="#1a1a2e" />
      <circle cx="279" cy="367" r="10" fill="#374151" />
      <circle cx="279" cy="367" r="6" fill="#111827" />
      <circle cx="279" cy="367" r="2.5" fill="#c084fc" />
      <rect x="290" y="353" width="10" height="7" rx="2" fill="#374151" />
      {/* lens ring */}
      <circle cx="279" cy="367" r="8" fill="none" stroke="#6B7280" strokeWidth="1" />

      {/* Ring light glow behind head */}
      <circle cx="210" cy="220" r="72" fill="none" stroke="#fde68a" strokeWidth="6" opacity="0.5" />
      <circle cx="210" cy="220" r="80" fill="none" stroke="#fde68a" strokeWidth="2" opacity="0.25" />

      {/* Neck */}
      <rect x="196" y="285" width="28" height="30" rx="8" fill="#7B4422" />

      {/* Head */}
      <ellipse cx="210" cy="222" rx="58" ry="65" fill="#6B3A1F" />

      {/* Natural hair — big afro puff */}
      <ellipse cx="210" cy="170" rx="68" ry="58" fill="#1a0a00" />
      <ellipse cx="155" cy="195" rx="28" ry="32" fill="#1a0a00" />
      <ellipse cx="265" cy="195" rx="28" ry="32" fill="#1a0a00" />
      <ellipse cx="210" cy="148" rx="52" ry="38" fill="#1a0a00" />
      {/* hair shine */}
      <ellipse cx="195" cy="160" rx="14" ry="8" fill="#3d1f0a" opacity="0.6" />

      {/* Hair accessories — cute scrunchie */}
      <circle cx="210" cy="145" r="10" fill="#FF6B9D" opacity="0.8" />
      <ellipse cx="210" cy="145" rx="14" ry="6" fill="#e0529e" opacity="0.7" />

      {/* Face features */}
      {/* Forehead highlight */}
      <ellipse cx="210" cy="200" rx="28" ry="12" fill="#7B4422" opacity="0.5" />
      {/* Eyes */}
      <ellipse cx="188" cy="218" rx="10" ry="11" fill="#fff" />
      <ellipse cx="232" cy="218" rx="10" ry="11" fill="#fff" />
      <circle cx="190" cy="220" r="7" fill="#1a0a00" />
      <circle cx="234" cy="220" r="7" fill="#1a0a00" />
      <circle cx="192" cy="218" r="2.5" fill="#fff" />
      <circle cx="236" cy="218" r="2.5" fill="#fff" />
      {/* Lashes */}
      <path d="M179 211 Q183 207 188 209" stroke="#1a0a00" strokeWidth="2" strokeLinecap="round" />
      <path d="M223 209 Q228 207 232 211" stroke="#1a0a00" strokeWidth="2" strokeLinecap="round" />
      {/* Eyebrows */}
      <path d="M179 207 Q188 202 198 206" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M222 206 Q232 202 241 207" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Nose */}
      <path d="M204 228 Q210 238 216 228" stroke="#4a2310" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="205" cy="232" r="3.5" fill="#4a2310" opacity="0.5" />
      <circle cx="215" cy="232" r="3.5" fill="#4a2310" opacity="0.5" />
      {/* Big smile */}
      <path d="M193 248 Q210 264 227 248" stroke="#4a2310" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Teeth */}
      <path d="M196 250 Q210 262 224 250 Q210 268 196 250Z" fill="white" opacity="0.9" />
      {/* Cheek blush */}
      <ellipse cx="178" cy="240" rx="12" ry="7" fill="#FF6B9D" opacity="0.3" />
      <ellipse cx="242" cy="240" rx="12" ry="7" fill="#FF6B9D" opacity="0.3" />
      {/* Earrings */}
      <circle cx="152" cy="228" r="5" fill="#D4AF37" />
      <circle cx="268" cy="228" r="5" fill="#D4AF37" />
      <circle cx="152" cy="237" r="3" fill="#D4AF37" opacity="0.7" />
      <circle cx="268" cy="237" r="3" fill="#D4AF37" opacity="0.7" />

      {/* Legs */}
      <rect x="170" y="395" width="30" height="75" rx="12" fill="#2d1b69" />
      <rect x="220" y="395" width="30" height="75" rx="12" fill="#2d1b69" />
      {/* Shoes */}
      <ellipse cx="185" cy="470" rx="20" ry="10" fill="#1a0a00" />
      <ellipse cx="235" cy="470" rx="20" ry="10" fill="#1a0a00" />

      {/* ══════════════════════════════════════════
          CREATOR 2 — Left: Mic Guy (Music/Comedy)
          Skin: deep brown
      ══════════════════════════════════════════ */}

      {/* Body — yellow hoodie */}
      <rect x="30" y="330" width="90" height="80" rx="18" fill="#D4AF37" />
      {/* hoodie pocket */}
      <rect x="55" y="375" width="42" height="25" rx="8" fill="#b8960a" />
      {/* arms */}
      <ellipse cx="28" cy="360" rx="14" ry="32" fill="#3d1f0a" transform="rotate(-8 28 360)" />
      <ellipse cx="122" cy="358" rx="14" ry="32" fill="#3d1f0a" transform="rotate(5 122 358)" />
      {/* hands */}
      <circle cx="22" cy="390" r="11" fill="#4a2810" />
      <circle cx="128" cy="387" r="11" fill="#4a2810" />

      {/* Mic in left hand */}
      <rect x="5" y="370" width="14" height="36" rx="5" fill="#374151" />
      <ellipse cx="12" cy="368" rx="10" ry="12" fill="#6B7280" />
      <ellipse cx="12" cy="368" rx="7" ry="9" fill="#9CA3AF" />
      {/* mic grill lines */}
      <line x1="6" y1="366" x2="18" y2="366" stroke="#6B7280" strokeWidth="1" opacity="0.5" />
      <line x1="5" y1="370" x2="19" y2="370" stroke="#6B7280" strokeWidth="1" opacity="0.5" />

      {/* Neck */}
      <rect x="65" y="308" width="22" height="26" rx="7" fill="#3d1f0a" />

      {/* Head */}
      <ellipse cx="76" cy="265" rx="46" ry="50" fill="#3d1f0a" />

      {/* Locs / dreadlocks */}
      <rect x="40" y="228" width="8" height="55" rx="4" fill="#1a0a00" transform="rotate(-12 40 228)" />
      <rect x="52" y="220" width="8" height="60" rx="4" fill="#1a0a00" transform="rotate(-6 52 220)" />
      <rect x="65" y="218" width="8" height="58" rx="4" fill="#1a0a00" />
      <rect x="78" y="218" width="8" height="60" rx="4" fill="#1a0a00" />
      <rect x="91" y="220" width="8" height="58" rx="4" fill="#1a0a00" transform="rotate(5 91 220)" />
      <rect x="103" y="226" width="8" height="52" rx="4" fill="#1a0a00" transform="rotate(10 103 226)" />
      {/* locs tips */}
      {[40,52,65,78,91,103].map((x, i) => (
        <circle key={i} cx={x + 4} cy={[283,280,276,278,279,278][i]} r="4" fill="#2d1200" />
      ))}

      {/* Headphones on head */}
      <path d="M34 255 Q76 228 118 255" stroke="#c084fc" strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="28" y="252" width="14" height="20" rx="5" fill="#7c3aed" />
      <rect x="114" y="252" width="14" height="20" rx="5" fill="#7c3aed" />

      {/* Face */}
      <ellipse cx="76" cy="268" rx="22" ry="10" fill="#4a2810" opacity="0.4" />
      {/* Eyes */}
      <ellipse cx="62" cy="258" rx="8" ry="8.5" fill="#fff" />
      <ellipse cx="90" cy="258" rx="8" ry="8.5" fill="#fff" />
      <circle cx="64" cy="260" r="5.5" fill="#1a0a00" />
      <circle cx="92" cy="260" r="5.5" fill="#1a0a00" />
      <circle cx="65.5" cy="258" r="2" fill="#fff" />
      <circle cx="93.5" cy="258" r="2" fill="#fff" />
      {/* Eyebrows — raised (expressive) */}
      <path d="M54 249 Q62 244 70 248" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M82 248 Q90 244 98 249" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Nose */}
      <path d="M70 270 Q76 278 82 270" stroke="#2d1200" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="71" cy="274" r="3" fill="#2d1200" opacity="0.4" />
      <circle cx="81" cy="274" r="3" fill="#2d1200" opacity="0.4" />
      {/* Open mouth laughing */}
      <path d="M62 283 Q76 298 90 283" fill="#1a0a00" />
      <path d="M64 285 Q76 296 88 285" fill="white" opacity="0.9" />
      {/* Cheeks */}
      <ellipse cx="52" cy="275" rx="9" ry="6" fill="#FF6B9D" opacity="0.25" />
      <ellipse cx="100" cy="275" rx="9" ry="6" fill="#FF6B9D" opacity="0.25" />

      {/* Legs */}
      <rect x="48" y="405" width="24" height="65" rx="10" fill="#1e3a5f" />
      <rect x="78" y="405" width="24" height="65" rx="10" fill="#1e3a5f" />
      {/* Sneakers */}
      <ellipse cx="60" cy="470" rx="18" ry="9" fill="#fff" />
      <ellipse cx="90" cy="470" rx="18" ry="9" fill="#fff" />
      <ellipse cx="55" cy="469" rx="8" ry="5" fill="#c084fc" />
      <ellipse cx="85" cy="469" rx="8" ry="5" fill="#c084fc" />

      {/* ══════════════════════════════════════════
          CREATOR 3 — Right: Phone Girl (Lifestyle)
          Skin: medium brown
      ══════════════════════════════════════════ */}

      {/* Body — lilac/purple dress */}
      <path d="M310 320 Q295 380 288 420 L372 420 Q365 380 350 320 Z" fill="#c084fc" />
      {/* belt */}
      <rect x="296" y="330" width="68" height="10" rx="4" fill="#7c3aed" />

      {/* arms */}
      <ellipse cx="288" cy="348" rx="13" ry="34" fill="#8B5E3C" transform="rotate(-15 288 348)" />
      <ellipse cx="372" cy="345" rx="13" ry="34" fill="#8B5E3C" transform="rotate(12 372 345)" />
      {/* hands */}
      <circle cx="277" cy="380" r="11" fill="#9B6A40" />
      <circle cx="381" cy="376" r="11" fill="#9B6A40" />

      {/* Phone held up in right hand (selfie mode) */}
      <rect x="362" y="344" width="26" height="44" rx="5" fill="#111827" />
      <rect x="364" y="346" width="22" height="40" rx="4" fill="#1e3a5f" />
      {/* phone screen glow */}
      <rect x="364" y="346" width="22" height="40" rx="4" fill="#c084fc" opacity="0.3" />
      {/* front camera dot */}
      <circle cx="375" cy="350" r="2" fill="#374151" />
      {/* selfie on screen (tiny face) */}
      <circle cx="375" cy="366" r="8" fill="#8B5E3C" opacity="0.8" />

      {/* Neck */}
      <rect x="320" y="298" width="20" height="26" rx="6" fill="#8B5E3C" />

      {/* Head */}
      <ellipse cx="330" cy="258" rx="48" ry="52" fill="#8B5E3C" />

      {/* Braids / box braids */}
      <rect x="295" y="220" width="7" height="65" rx="3.5" fill="#1a0a00" transform="rotate(-8 295 220)" />
      <rect x="307" y="215" width="7" height="70" rx="3.5" fill="#1a0a00" transform="rotate(-4 307 215)" />
      <rect x="320" y="212" width="7" height="72" rx="3.5" fill="#1a0a00" />
      <rect x="333" y="212" width="7" height="72" rx="3.5" fill="#1a0a00" />
      <rect x="346" y="215" width="7" height="68" rx="3.5" fill="#1a0a00" transform="rotate(4 346 215)" />
      <rect x="358" y="220" width="7" height="62" rx="3.5" fill="#1a0a00" transform="rotate(8 358 220)" />
      {/* braid top — half-up */}
      <ellipse cx="330" cy="220" rx="46" ry="22" fill="#1a0a00" />
      {/* braid highlights */}
      <rect x="321" y="213" width="3" height="68" rx="1.5" fill="#3d1f0a" opacity="0.5" />
      <rect x="335" y="213" width="3" height="68" rx="1.5" fill="#3d1f0a" opacity="0.5" />
      {/* bead accessories on braids */}
      <circle cx="299" cy="275" r="4" fill="#D4AF37" />
      <circle cx="361" cy="275" r="4" fill="#FF6B9D" />
      <circle cx="310" cy="282" r="3" fill="#c084fc" />
      <circle cx="350" cy="282" r="3" fill="#D4AF37" />

      {/* Face */}
      <ellipse cx="330" cy="262" rx="24" ry="10" fill="#6B3A1F" opacity="0.35" />
      {/* Eyes — almond shape */}
      <ellipse cx="314" cy="252" rx="9" ry="9.5" fill="#fff" />
      <ellipse cx="346" cy="252" rx="9" ry="9.5" fill="#fff" />
      <circle cx="316" cy="254" r="6.5" fill="#1a0a00" />
      <circle cx="348" cy="254" r="6.5" fill="#1a0a00" />
      <circle cx="317.5" cy="252" r="2.5" fill="#fff" />
      <circle cx="349.5" cy="252" r="2.5" fill="#fff" />
      {/* winged liner */}
      <path d="M305 248 Q312 244 320 247" stroke="#1a0a00" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M303 249 L307 245" stroke="#1a0a00" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M340 247 Q348 244 355 248" stroke="#1a0a00" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M353 249 L357 245" stroke="#1a0a00" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyebrows */}
      <path d="M305 244 Q314 239 323 243" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M337 243 Q346 239 355 244" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Nose */}
      <path d="M324 265 Q330 273 336 265" stroke="#5a3015" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="325" cy="269" r="3" fill="#5a3015" opacity="0.4" />
      <circle cx="335" cy="269" r="3" fill="#5a3015" opacity="0.4" />
      {/* Smile — cute smirk */}
      <path d="M318 281 Q330 293 342 281" stroke="#5a3015" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Lipstick */}
      <path d="M320 282 Q330 291 340 282 Q330 294 320 282Z" fill="#FF6B9D" opacity="0.85" />
      {/* Cheeks */}
      <ellipse cx="303" cy="270" rx="10" ry="7" fill="#FF6B9D" opacity="0.28" />
      <ellipse cx="357" cy="270" rx="10" ry="7" fill="#FF6B9D" opacity="0.28" />
      {/* Earrings — hoops */}
      <circle cx="282" cy="262" r="7" fill="none" stroke="#D4AF37" strokeWidth="3" />
      <circle cx="378" cy="262" r="7" fill="none" stroke="#D4AF37" strokeWidth="3" />

      {/* Legs */}
      <rect x="304" y="415" width="24" height="65" rx="10" fill="#3d1f0a" />
      <rect x="332" y="415" width="24" height="65" rx="10" fill="#3d1f0a" />
      {/* heels */}
      <ellipse cx="316" cy="480" rx="16" ry="7" fill="#FF6B9D" />
      <ellipse cx="344" cy="480" rx="16" ry="7" fill="#FF6B9D" />
      <rect x="320" y="480" width="4" height="12" rx="2" fill="#e0529e" />
      <rect x="348" y="480" width="4" height="12" rx="2" fill="#e0529e" />

      {/* ── Floating decorative elements ── */}

      {/* Stars around illustration */}
      <path d="M50 80 L53 70 L56 80 L66 83 L56 86 L53 96 L50 86 L40 83 Z" fill="#D4AF37" opacity="0.7" />
      <path d="M370 140 L372 133 L374 140 L381 142 L374 144 L372 151 L370 144 L363 142 Z" fill="#c084fc" opacity="0.8" />
      <path d="M390 320 L392 314 L394 320 L400 322 L394 324 L392 330 L390 324 L384 322 Z" fill="#FF6B9D" opacity="0.7" />
      <path d="M20 320 L22 314 L24 320 L30 322 L24 324 L22 330 L20 324 L14 322 Z" fill="#D4AF37" opacity="0.6" />

      {/* Floating hearts */}
      <path d="M60 180 C60 175 65 170 70 175 C75 170 80 175 80 180 C80 185 70 193 70 193 C70 193 60 185 60 180Z" fill="#FF6B9D" opacity="0.5" />
      <path d="M350 200 C350 196 354 193 357 196 C360 193 364 196 364 200 C364 204 357 210 357 210 C357 210 350 204 350 200Z" fill="#FF6B9D" opacity="0.4" />

      {/* Floating icons — sparkles */}
      <circle cx="395" cy="240" r="4" fill="#D4AF37" opacity="0.6" />
      <circle cx="400" cy="255" r="2.5" fill="#c084fc" opacity="0.5" />
      <circle cx="20" cy="260" r="3" fill="#FF6B9D" opacity="0.5" />
      <circle cx="30" cy="240" r="5" fill="#D4AF37" opacity="0.4" />

      {/* Play button badge floating */}
      <circle cx="115" cy="180" r="18" fill="#7c3aed" opacity="0.85" />
      <path d="M110 173 L110 187 L122 180 Z" fill="white" />

      {/* "LIVE" badge */}
      <rect x="355" y="155" width="42" height="18" rx="9" fill="#FF6B9D" />
      <text x="364" y="168" fontFamily="sans-serif" fontSize="9" fontWeight="bold" fill="white">LIVE</text>
      <circle cx="359" cy="164" r="3" fill="white" opacity="0.9" />

    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('talent')
  const [method, setMethod] = useState('email')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countryCode, setCountryCode] = useState(countryCodes[0])
  const [showCodes, setShowCodes] = useState(false)
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [authLogo, setAuthLogo] = useState(() => getLogo('auth'))
  useEffect(() => {
    function onLogoUpdate() { setAuthLogo(getLogo('auth')) }
    window.addEventListener('brandior:logo-updated', onLogoUpdate)
    return () => window.removeEventListener('brandior:logo-updated', onLogoUpdate)
  }, [])

  function validate() {
    const e = {}
    if (method === 'email' && !form.identifier.includes('@')) e.identifier = 'Enter a valid email address'
    if (method === 'phone' && form.identifier.replace(/\D/g, '').length < 7) e.identifier = 'Enter a valid phone number'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setAuthError('')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.identifier,
      password: form.password,
    })
    setLoading(false)
    if (error) { setAuthError(error.message); return }
    localStorage.setItem('brandiór_user', data.user.id)
    localStorage.setItem('brandiór_role', role)
    navigate(role === 'brand' ? '/brand-dashboard' : '/dashboard')
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f3eeff' }}>

      {/* ── Left: Illustration panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-10 relative overflow-hidden">
        {/* subtle gradient backdrop */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #ede9fe 0%, #f3eeff 60%, #fce7f3 100%)' }} />
        {/* dot texture */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #c084fc 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 w-full max-w-sm">
          <TalentIllustration />
        </div>

        {/* Caption */}
        <div className="relative z-10 text-center mt-2">
          <p className="font-black text-2xl" style={{ color: darkPurple }}>
            Where talents <span style={{ color: pink }}>thrive.</span>
          </p>
          <p className="text-brand-dark/40 text-sm mt-1">Brands. Talents. One platform.</p>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          {authLogo
            ? <img src={authLogo} alt="Brandior" className="w-8 h-8 rounded-lg object-contain" />
            : <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: darkPurple }}>
                <Zap className="w-4 h-4" style={{ color: '#FA8112' }} />
              </div>
          }
          <span className="text-lg font-bold tracking-tight" style={{ color: darkPurple }}>Brandiór</span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid #e9d5ff' }}>
          <h1 className="text-2xl font-black text-brand-dark mb-1">Welcome back</h1>
          <p className="text-brand-dark/40 text-sm mb-5">Log in to your Brandiór account.</p>

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ backgroundColor: '#f3eeff' }}>
            {['talent', 'brand'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className="flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all"
                style={role === r
                  ? { backgroundColor: '#4c1d95', color: 'white', boxShadow: '0 2px 8px rgba(76,29,149,0.3)' }
                  : { color: '#9ca3af' }}>
                {r === 'talent' ? '⭐ Talent' : '🏢 Brand'}
              </button>
            ))}
          </div>

          {/* Social login buttons */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={async () => {
                setLoading(true)
                await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://app.brandior.africa' } })
                setLoading(false)
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-brand-dark text-sm border transition-all hover:bg-gray-50 disabled:opacity-60"
              style={{ borderColor: '#e9d5ff' }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-brand-dark/8" />
            <span className="text-brand-dark/30 text-xs">or</span>
            <div className="flex-1 h-px bg-brand-dark/8" />
          </div>

          {/* Email / Phone tab */}
          <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ backgroundColor: '#f3eeff' }}>
            {[
              { id: 'email', label: 'Email',  icon: Mail },
              { id: 'phone', label: 'Phone',  icon: Phone },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setMethod(id); handleChange('identifier', '') }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: method === id ? '#fff' : 'transparent',
                  color: method === id ? darkPurple : 'rgba(10,10,10,0.35)',
                  boxShadow: method === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              {method === 'email' ? (
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/25" />
                  <input
                    type="email"
                    value={form.identifier}
                    onChange={e => handleChange('identifier', e.target.value)}
                    placeholder="Email address"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-brand-dark placeholder-brand-dark/25 outline-none transition-all"
                    style={{ border: errors.identifier ? `1.5px solid ${pink}` : '1.5px solid #e9d5ff' }}
                  />
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-shrink-0">
                    <button type="button" onClick={() => setShowCodes(v => !v)}
                      className="h-full flex items-center gap-1.5 px-3 rounded-xl text-sm transition-all"
                      style={{ border: '1.5px solid #e9d5ff', minWidth: 82, backgroundColor: '#fff' }}>
                      <span>{countryCode.flag}</span>
                      <span className="text-brand-dark/50 text-xs">{countryCode.code}</span>
                      <ChevronDown className="w-3 h-3 text-brand-dark/25" />
                    </button>
                    {showCodes && (
                      <div className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden shadow-lg z-20 bg-white"
                        style={{ border: '1px solid #e9d5ff', minWidth: 150 }}>
                        {countryCodes.map(c => (
                          <button key={c.code} type="button"
                            onClick={() => { setCountryCode(c); setShowCodes(false) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-dark hover:bg-gray-50 transition-colors">
                            <span>{c.flag}</span>
                            <span className="text-brand-dark/40 text-xs">{c.label}</span>
                            <span className="ml-auto text-xs text-brand-dark/50">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/25" />
                    <input
                      type="tel"
                      value={form.identifier}
                      onChange={e => handleChange('identifier', e.target.value)}
                      placeholder="Phone number"
                      autoComplete="tel"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-brand-dark placeholder-brand-dark/25 outline-none"
                      style={{ border: errors.identifier ? `1.5px solid ${pink}` : '1.5px solid #e9d5ff' }}
                    />
                  </div>
                </div>
              )}
              {errors.identifier && <p className="text-xs mt-1.5" style={{ color: pink }}>{errors.identifier}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/25" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-brand-dark placeholder-brand-dark/25 outline-none"
                  style={{ border: errors.password ? `1.5px solid ${pink}` : '1.5px solid #e9d5ff' }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-dark/25 hover:text-brand-dark/50 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5" style={{ color: pink }}>{errors.password}</p>}
            </div>

            <div className="text-right">
              <a href="#" className="text-xs font-medium" style={{ color: purple }}>Forgot password?</a>
            </div>

            {authError && (
              <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ color: pink, backgroundColor: '#fff0f5' }}>{authError}</p>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ backgroundColor: darkPurple }}>
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>Log in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-brand-dark/35 text-xs mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold" style={{ color: darkPurple }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
