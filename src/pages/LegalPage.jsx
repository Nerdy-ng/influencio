import { useParams, useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'

const DEFAULT_CONTENT = {
  terms: `## Acceptance of Terms
By creating an account or using Brandior, you agree to these Terms of Service. If you do not agree, do not use the platform.

## Who Can Use Brandior
You must be at least 18 years old to use Brandior. By registering, you confirm that the information you provide is accurate and that you have the legal capacity to enter into contracts.

## Creator Obligations
Creators must deliver work that meets the agreed brief within the agreed timeframe. Work must be original, must not infringe third-party intellectual property, and must comply with applicable platform guidelines (Instagram, TikTok, YouTube, etc.). Creators are responsible for disclosing paid partnerships as required by law.

## Brand Obligations
Brands must provide a clear and honest brief. Payment must be completed before the creator begins work. Brands may not request work outside the agreed scope without creating a new collab order.

## Payments and Escrow
All payments are processed through Brandior's escrow system. Funds are released to the creator only after the brand approves the delivered work, or after 7 days of non-response following delivery. Brandior is not responsible for delays caused by incorrect payment information.

## Platform Fee
Brandior charges a platform fee on each transaction. This fee is disclosed in the order summary before payment is confirmed. The fee is non-refundable once a collab is in progress.

## Revisions
The number of revisions included in each collab is set by the creator on their rate card. Additional revisions beyond that limit may be charged separately by mutual agreement.

## Prohibited Conduct
You may not use Brandior to: engage in fraud, harassment, or hate speech; circumvent escrow by paying or requesting payment off-platform; impersonate another person or brand; upload content that is illegal, obscene, or defamatory; or attempt to manipulate ratings or reviews.

## Intellectual Property
Upon full payment, the brand receives a non-exclusive licence to use the delivered content for the agreed campaign. Creators retain underlying intellectual property rights unless a full buyout is explicitly agreed in the brief.

## Dispute Resolution
Disputes between brands and creators must first be raised through Brandior's dispute system. Brandior will review evidence from both parties and issue a binding decision. Decisions may be appealed once within 7 days.

## Limitation of Liability
Brandior is a marketplace platform. We are not party to the creative agreement between brands and creators and are not liable for the quality of creative output, missed deadlines caused by third parties, or any indirect loss arising from a collab.

## Termination
Brandior may suspend or terminate accounts that breach these Terms. Users may close their account at any time from their account settings.

## Changes to These Terms
We may update these Terms from time to time. We will notify you by email for material changes. Continued use of the platform after notice constitutes acceptance.

## Contact
Questions about these Terms? Email us at support@brandior.africa`,

  privacy: `## Introduction
Brandior ("we", "us") is committed to protecting your personal data. This Privacy Policy explains what we collect, why, and how you can exercise your rights.

## Information We Collect
When you register: name, email address, password (hashed), account type (brand or creator).
When you use the platform: profile information, rate card data, messages, collab history, payment records, and usage logs.
Automatically: IP address, browser type, device identifiers, and cookies (see Cookie Policy).

## How We Use Your Information
To operate your account and process collabs.
To process payments and manage escrow.
To send transactional emails (confirmation, delivery, payment release).
To detect fraud and enforce our Terms of Service.
To improve the platform through aggregated, anonymised analytics.

## Information Sharing
We do not sell your personal data. We share data only with:
Payment processors to handle escrow transactions.
Email service providers to deliver transactional messages.
Cloud infrastructure providers that host our platform.
Law enforcement when legally required.

## Data Security
We use industry-standard encryption (TLS in transit, AES at rest). Passwords are hashed and never stored in plain text. Access to personal data is restricted to authorised staff only.

## Data Retention
We retain your account data for as long as your account is active. Closed accounts are anonymised after 90 days, except where retention is required by law.

## Your Rights
You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data (subject to legal obligations); object to certain processing; and data portability.
To exercise any of these rights, email support@brandior.africa.

## Children
Brandior is not intended for users under 18. We do not knowingly collect data from minors.

## Changes to This Policy
We will notify you of material changes by email. The updated policy will be posted on this page with a revised date.

## Contact
For privacy questions: support@brandior.africa`,

  cookies: `## What Are Cookies
Cookies are small text files stored on your device when you visit a website. They help us keep you logged in, understand how you use the platform, and improve your experience.

## How We Use Cookies
Essential cookies: Required for the platform to function. These keep you logged in and maintain your session. They cannot be disabled.
Analytics cookies: We use anonymised analytics to understand which pages are visited and how users navigate the platform. This helps us fix bugs and improve features.
Preference cookies: These remember your settings (e.g., display preferences) so you don't have to reset them on each visit.

## We Do Not Use
We do not use advertising or tracking cookies. We do not share cookie data with ad networks.

## Managing Cookies
You can control cookies through your browser settings. Disabling essential cookies will prevent you from logging in. Disabling analytics cookies will not affect your use of the platform.

## Changes
We may update this policy to reflect changes in how we use cookies. The date of the latest revision is shown at the bottom of this page.

## Contact
Questions? Email support@brandior.africa`,
}

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
  const content = localStorage.getItem(config.key) || DEFAULT_CONTENT[type] || ''

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
