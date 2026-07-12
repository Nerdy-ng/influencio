import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Camera, Linkedin, PlayCircle, X } from 'lucide-react'
import { getLogo } from '../lib/brandSettings'
import { getSetting } from '../lib/siteSettings'

const links = {
  Product: [
    { label: 'How it Works',  to: '/how-it-works' },
    { label: 'For Creators',  to: '/for-talents'  },
    { label: 'For Brands',    to: '/for-brands'   },
    { label: 'Pricing',       to: '/pricing'      },
    { label: 'Contact Us',    to: '/contact'      },
  ],
  Creators: [
    { label: 'Creator Signup',    to: '/signup/creator'  },
    { label: 'How Creators Earn', to: '/for-talents'     },
    { label: 'How It Works',      to: '/how-it-works'    },
    { label: 'Browse Brands',     to: '/marketplace'     },
    { label: 'Creator FAQ',       to: '/how-it-works'    },
  ],
  Brands: [
    { label: 'Brand Signup',      to: '/signup/brand'   },
    { label: 'Find Creators',     to: '/marketplace'    },
    { label: 'How Escrow Works',  to: '/how-it-works'   },
    { label: 'Pricing',           to: '/pricing'        },
    { label: 'Contact Sales',     to: '/contact'        },
  ],
  Company: [
    { label: 'About Us',    to: '/about'   },
    { label: 'Contact',     to: '/contact' },
    { label: 'Privacy',     to: '/privacy' },
    { label: 'Terms',       to: '/terms'   },
    { label: 'Cookies',     to: '/cookies' },
  ],
}

const socials = [
  { Icon: X,          label: 'X (Twitter)' },
  { Icon: Camera,     label: 'Instagram'   },
  { Icon: Linkedin,   label: 'LinkedIn'    },
  { Icon: PlayCircle, label: 'YouTube'     },
]

export default function Footer() {
  const [footerLogo, setFooterLogo] = useState(() => getLogo('footer'))
  const [platformName, setPlatformName] = useState(() => getSetting('platformName'))
  const [tagline, setTagline] = useState(() => getSetting('tagline'))
  useEffect(() => {
    function onLogoUpdate() { setFooterLogo(getLogo('footer')) }
    function onSettingsUpdate(e) {
      if (e.detail?.key === 'platformName') setPlatformName(e.detail.value)
      if (e.detail?.key === 'tagline') setTagline(e.detail.value)
    }
    window.addEventListener('brandior:logo-updated', onLogoUpdate)
    window.addEventListener('brandior:settings-updated', onSettingsUpdate)
    return () => {
      window.removeEventListener('brandior:logo-updated', onLogoUpdate)
      window.removeEventListener('brandior:settings-updated', onSettingsUpdate)
    }
  }, [])

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-brand-cream/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-10 mb-14">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-5">
              {footerLogo
                ? <img src={footerLogo} alt="Brandior" className="w-8 h-8 rounded-lg object-contain" />
                : <div className="w-8 h-8 rounded-lg bg-brand-dark border border-brand-cream/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-brand-orange" />
                  </div>
              }
              <span className="text-xl font-bold text-white">{platformName}</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs mb-6">
              {tagline}
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-9 h-9 rounded-full bg-brand-cream/5 hover:bg-brand-cream/10 flex items-center justify-center text-white/30 hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-5">{category}</h4>
              <ul className="space-y-3">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-white/30 hover:text-white text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-brand-cream/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-sm">© {new Date().getFullYear()} {platformName} Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {[
              { label: 'Privacy Policy',  to: '/privacy' },
              { label: 'Terms of Service', to: '/terms'  },
              { label: 'Cookie Policy',   to: '/cookies' },
            ].map(({ label, to }) => (
              <Link key={label} to={to} className="text-white/20 hover:text-white/50 text-xs transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
