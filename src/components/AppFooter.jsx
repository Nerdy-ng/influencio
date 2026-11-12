import { Link } from 'react-router-dom'

const LEGAL = [
  { label: 'Terms & Conditions',   to: '/terms'           },
  { label: 'Privacy Policy',       to: '/privacy'         },
  { label: 'Cookie Policy',        to: '/cookies'         },
  { label: 'Community Guidelines', to: '/acceptable-use'  },
]

export default function AppFooter() {
  return (
    <footer className="w-full border-t" style={{ borderColor: '#e9d5ff', backgroundColor: '#fff' }}>
      <div
        className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ fontSize: '0.75rem' }}
      >
        <p style={{ color: 'rgba(15,0,32,0.35)', whiteSpace: 'nowrap' }}>
          © {new Date().getFullYear()} Brandior / The Owl Company Limited
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {LEGAL.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="transition-colors hover:text-brand-purple"
              style={{ color: 'rgba(15,0,32,0.4)' }}
            >
              {label}
            </Link>
          ))}
          <a
            href="mailto:support@brandior.africa"
            className="transition-colors hover:text-brand-purple"
            style={{ color: 'rgba(15,0,32,0.4)' }}
          >
            Help / Support
          </a>
          <a
            href="https://www.brandior.africa/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-brand-purple"
            style={{ color: 'rgba(15,0,32,0.4)' }}
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
