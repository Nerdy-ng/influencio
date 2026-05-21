import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import { getSetting } from '../lib/siteSettings'

const gold = '#D4AF37'
const pink = '#FF6B9D'

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('brandiór_user'))
  const [heroVideo, setHeroVideo] = useState(() => getSetting('heroVideo') || '')
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const handler = () => setIsLoggedIn(!!localStorage.getItem('brandiór_user'))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  useEffect(() => {
    function onUpdate(e) {
      if (e.detail?.key === 'heroVideo') {
        const newUrl = e.detail.value || ''
        setHeroVideo(prev => {
          if (prev !== newUrl) setVideoReady(false)
          return newUrl
        })
      }
    }
    window.addEventListener('brandior:settings-updated', onUpdate)
    return () => window.removeEventListener('brandior:settings-updated', onUpdate)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20" style={{ background: '#000' }}>

      {/* ── Video background ── */}
      {heroVideo && (
        <video
          key={heroVideo}
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
        />
      )}

      {/* Gradient overlay — always visible, lightens once video is playing */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.90) 0%, rgba(13,0,32,0.80) 50%, rgba(45,0,96,0.75) 100%)',
          opacity: videoReady ? 0.75 : 1,
          transition: 'opacity 0.6s ease',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 w-full pt-28 pb-20 relative z-10 text-center">
        <div className="space-y-8">

          {/* 1 — Headline */}
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-white">
            Where Creators &amp; Brands
            <br />
            <span style={{ color: '#c084fc' }}>Close Deals.</span>
          </h1>

          {/* 2 — Sub-headline */}
          <p className="text-lg lg:text-xl text-white/55 leading-relaxed max-w-2xl mx-auto">
            We connect brands and entrepreneurs with talents who bring{' '}
            <span className="font-semibold" style={{ color: pink }}>ideas</span> to life.
          </p>

          {/* 3 — Dual-path CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1 justify-center">
            <Link to={isLoggedIn ? '/marketplace' : '/signup'}
              className="group flex items-center justify-center gap-2 bg-white text-brand-dark font-bold px-7 py-4 rounded-full hover:bg-brand-sand transition-colors text-sm">
              {isLoggedIn ? 'Go to Dashboard' : 'Grow Your Business'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to={isLoggedIn ? '/dashboard' : '/signup'}
              className="group flex items-center justify-center gap-2 border border-white/15 text-white/70 font-semibold px-7 py-4 rounded-full transition-all text-sm"
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}>
              <Users className="w-4 h-4" />
              {isLoggedIn ? 'Talent Dashboard' : 'Earn as a Talent'}
            </Link>
          </div>

          {/* 4 — Social platforms */}
          <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-6">
            <p className="text-white/30 text-xs uppercase tracking-widest">Growing Businesses Across Platforms</p>
            <div className="flex items-center justify-center gap-6">
              {/* Instagram */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              {/* TikTok */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z"/>
              </svg>
              {/* YouTube */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
              </svg>
              {/* Twitter/X */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {/* Facebook */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {/* Snapchat */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
              {/* LinkedIn */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
