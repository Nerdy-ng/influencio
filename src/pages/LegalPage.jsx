import { useParams, useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'

const DEFAULTS = {
  terms: { title: 'Terms & Conditions', key: 'brandior_legal_terms' },
  privacy: { title: 'Privacy Policy', key: 'brandior_legal_privacy' },
  cookies: { title: 'Cookie Policy', key: 'brandior_legal_cookies' },
}

function renderContent(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-xl font-black mt-8 mb-3" style={{ color: '#1e0040' }}>{line.slice(3)}</h2>
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>{line}</p>
  })
}

export default function LegalPage() {
  const location = useLocation()
  const type = location.pathname.replace('/', '') // 'terms' | 'privacy' | 'cookies'
  const config = DEFAULTS[type] || DEFAULTS.terms
  const content = localStorage.getItem(config.key) || ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{config.title} | Brandior</title>
      </Helmet>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="text-sm font-medium mb-8 inline-block" style={{ color: '#7c3aed' }}>← Back to home</Link>

        {/* Doc switcher */}
        <div className="flex gap-2 mb-8">
          {Object.entries(DEFAULTS).map(([key, val]) => (
            <Link key={key} to={`/${key === 'terms' ? 'terms' : key === 'privacy' ? 'privacy' : 'cookies'}`}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={type === key
                ? { backgroundColor: '#7c3aed', color: '#fff' }
                : { backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
              {val.title}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-black mb-2" style={{ color: '#1e0040' }}>{config.title}</h1>
          <div className="mt-6">
            {content ? renderContent(content) : (
              <p className="text-sm text-gray-400 italic">This document has not been published yet.</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Questions? Email us at <a href="mailto:support@brandior.africa" className="text-indigo-500">support@brandior.africa</a></p>
        </div>
      </div>
    </div>
  )
}
