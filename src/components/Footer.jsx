import { Zap, Camera, Linkedin, PlayCircle, X } from 'lucide-react'

const links = {
  Product:  ['How it Works', 'For Talents', 'For Brands', 'Pricing', 'Enterprise'],
  Talents: ['Talent Signup', 'Earn with Brandior', 'Talent Resources', 'Media Kit Builder', 'Success Stories'],
  Brands:   ['Brand Signup', 'Post a Campaign', 'Talent Discovery', 'Campaign Analytics', 'Case Studies'],
  Company:  ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact Us'],
}

const socials = [
  { Icon: X,          label: 'X (Twitter)' },
  { Icon: Camera,     label: 'Instagram'   },
  { Icon: Linkedin,   label: 'LinkedIn'    },
  { Icon: PlayCircle, label: 'YouTube'     },
]

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-brand-cream/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-10 mb-14">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-brand-dark border border-brand-cream/10 flex items-center justify-center">
                {/* logo spark icon in orange — small, contained */}
                <Zap className="w-4 h-4 text-brand-orange" />
              </div>
              <span className="text-xl font-bold text-white">Brandior</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs mb-6">
              Nigeria's platform where micro & macro talents connect with SMB brands for
              authentic campaigns and long-term partnerships.
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
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-white/30 hover:text-white text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-brand-cream/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-sm">© {new Date().getFullYear()} Brandior Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" className="text-white/20 hover:text-white/50 text-xs transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
