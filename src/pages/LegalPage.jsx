import { useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'

const DEFAULT_CONTENT = {
  terms: `## Acceptance of Terms
By creating an account on Brandior or using any part of our platform, you ("User") agree to be legally bound by these Terms and Conditions ("Terms"). If you do not agree, you must not use the platform. These Terms constitute a binding contract between you and THE OWL COMPANY, the entity that owns and operates Brandior ("Brandior", "we", "us", "our"). These Terms were last updated in September 2026.

## About Brandior
Brandior is a neutral marketplace platform that connects brands and businesses ("Brands") with content creators, influencers, and creative talent ("Creators"). Brandior is strictly a technology intermediary and connector. We are not a party to any agreement, contract, or creative services arrangement between Brands and Creators. We do not employ Creators, represent Brands, or act as an agent for either party. The creative relationship, obligations, and outcomes between a Brand and a Creator are solely their own affair. Brandior's role is limited to providing the infrastructure — discovery, communication, escrow, and dispute resolution tools — that enables those relationships to form and operate.

## Eligibility
To use Brandior, you must: (a) be at least 18 years old; (b) have the legal capacity to enter into binding contracts under Nigerian law; (c) not be prohibited from using our services under any applicable law; and (d) provide accurate and truthful registration information. By registering, you represent and warrant that all of these conditions are met.

## Account Registration and Security
You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately at support@brandior.africa if you suspect any unauthorised access to your account. Brandior will not be liable for any loss resulting from unauthorised use of your account. You may not share, transfer, or sell your account to another person.

## Creator Obligations and Representations
By registering as a Creator, you represent, warrant, and agree that you will: (a) deliver all commissioned content in accordance with the agreed brief, quality standards, and timeline; (b) produce original content that does not infringe the intellectual property rights of any third party; (c) hold all necessary rights, licences, and permissions to use any third-party material incorporated into your deliverables; (d) comply with all applicable platform guidelines (Meta, TikTok, YouTube, X, Snapchat, etc.) when publishing sponsored content; (e) comply with the Advertising Regulatory Council of Nigeria (ARCON) guidelines and disclose all paid partnerships as required by law; (f) not solicit off-platform payments from Brands for collabs initiated through Brandior; (g) maintain accurate and current information in your profile, including your rate card and portfolio; (h) complete KYC verification to receive payments through our escrow system; and (i) not misrepresent your follower count, engagement rate, or creative capabilities.

## Brand Obligations and Representations
By registering as a Brand, you represent, warrant, and agree that you will: (a) provide a clear, accurate, and lawful brief for each collab; (b) fund the escrow account in full before the Creator begins work; (c) review delivered work promptly and release payment or raise a dispute within 7 days of delivery; (d) not request work outside the agreed scope without creating a new collab order; (e) not request Creators to produce content that is illegal, defamatory, obscene, discriminatory, or that violates any third-party intellectual property; (f) not solicit off-platform payments or contact details from Creators for the purpose of circumventing Brandior's escrow; (g) ensure that any product or service being promoted complies with all applicable Nigerian advertising laws and regulations; (h) not use the delivered content beyond the agreed licence scope without negotiating a full buyout; (i) warrant that your brief is free of third-party intellectual property that you do not have the right to use, including copyrighted music, imagery, logos, trademarks, and character likenesses — you agree to indemnify and hold harmless any Creator who produces content in good faith reliance on your brief, for any IP infringement claim arising directly from instructions you provided in that brief; and (j) not initiate a chargeback, payment reversal, or bank dispute for any transaction where the corresponding collab has been completed or where escrow funds have been legitimately released. Initiating a chargeback in such circumstances constitutes a material breach of these Terms, and Brandior reserves the right to recover the full disputed amount from you, suspend your account, and pursue the matter through legal or debt recovery channels.

## Platform Fee and Minimum Transaction
Brandior charges a platform fee on each successful transaction. The applicable fee is displayed in the order summary before you confirm payment. The platform fee covers escrow management, payment processing, platform infrastructure, and customer support. Platform fees are non-refundable once a collab has commenced, except where a dispute is resolved entirely in the Brand's favour. The minimum transaction value on Brandior is ₦20,000.

## Payments and Escrow
(a) Escrow Process: Brands fund the escrow account before work begins. Funds are held by our licensed payment processor and released to the Creator only upon: (i) Brand approval of delivered work; or (ii) automatic release after 7 calendar days of non-response following delivery notification, whichever occurs first. (b) Valid Delivery: For auto-release to be triggered, a Creator must submit proof of delivery through the platform — this must include the delivered file, link, or documented evidence of completion uploaded within the Brandior collab interface. A status update alone, without accompanying deliverable evidence, does not constitute valid delivery and will not trigger the 7-day auto-release clock. Brandior reserves the right to review delivery evidence before releasing funds where a dispute has been raised. (c) Payment Methods: We accept payments via bank transfer and card (where available) through our payment processor. All transactions are denominated in Nigerian Naira (₦). (d) Refunds: Escrow funds are refunded to the Brand only if: (i) the Creator declines the collab offer; (ii) the Creator fails to deliver within the agreed timeline and no extension has been agreed; or (iii) a dispute is resolved in the Brand's favour. (e) Chargeback Policy: By funding escrow on Brandior, you agree not to initiate a chargeback, bank reversal, or card dispute for any payment where the associated collab has commenced or where funds have been legitimately released per these Terms. Any chargeback initiated in breach of this clause is a material breach of contract, and Brandior will contest all such chargebacks with full transaction evidence. You remain personally liable for the full amount of any fraudulent or improper chargeback, plus reasonable recovery costs. (f) Payment Processor Failure: In the event that our payment processor becomes insolvent, is shut down, or is otherwise unable to process or return escrowed funds due to regulatory action, financial failure, or force majeure, Brandior will make all commercially reasonable efforts to recover and return escrowed funds to the rightful party. Brandior is not liable for losses arising from a payment processor failure that is outside its control, but we will cooperate fully with affected users and relevant authorities to facilitate recovery. (g) Creator Payouts: Released funds are credited to the Creator's wallet and may be withdrawn to a verified Nigerian bank account subject to completed KYC verification. Processing times are subject to banking system delays outside our control. (h) Taxes: Each user is solely responsible for calculating and remitting any applicable taxes (including VAT, withholding tax, or income tax) on amounts received through the platform. Brandior does not withhold or remit taxes on behalf of users.

## KYC / Identity Verification
To receive payments, Creators must complete Know Your Customer (KYC) verification as required by our payment processor and applicable Nigerian financial regulations. We may require: government-issued photo ID, BVN, proof of address, and/or other documents. Failure to complete KYC will prevent payment release. Brandior is not liable for delays in payment caused by incomplete or inaccurate KYC submissions. By submitting KYC documents, you consent to their processing by our payment processor for identity verification purposes.

## Intellectual Property
(a) Creator's IP: Creators retain underlying intellectual property rights in all creative work. Upon full payment release, Brands receive a non-exclusive, royalty-free licence to use the delivered content for the campaign purpose agreed in the brief, unless a full buyout is explicitly agreed in writing. (b) Buyout Terms: Full buyouts (perpetual, unlimited use) must be agreed in the brief and reflected in the collab price. Without an explicit buyout clause, Brands may not use content beyond the agreed campaign. (c) Brandior's IP: All intellectual property in the Brandior platform — including code, design, trademarks, logos, trade names, and brand identity — is owned exclusively by THE OWL COMPANY. You may not copy, reproduce, distribute, or create derivative works from Brandior's platform, code, or brand assets without prior written consent. (d) User Content Licence: By uploading content to your profile or the platform, you grant Brandior a non-exclusive, royalty-free, worldwide licence to display, reproduce, and promote that content for the purpose of operating and marketing the platform.

## Prohibited Conduct
You may not use Brandior to: (a) engage in fraud, deception, or misrepresentation; (b) circumvent escrow by paying or accepting payment off-platform for collabs initiated on Brandior; (c) harass, threaten, or abuse other users; (d) upload content that is illegal, obscene, defamatory, discriminatory, or infringes third-party rights; (e) impersonate any person, brand, or entity; (f) attempt to manipulate ratings, reviews, or platform metrics; (g) use automated tools (bots, scrapers) to access platform data without written authorisation; (h) attempt to reverse-engineer, copy, or replicate Brandior's platform or codebase; (i) use the platform for money laundering, fraud, or any illegal financial activity; or (j) create multiple accounts to evade a suspension or ban. Violations may result in immediate account termination and referral to relevant authorities.

## Revision Policy
The number of revisions included in each collab is set by the Creator in their rate card. Additional revisions beyond that limit may be offered by the Creator at their discretion, at additional cost agreed between the parties. Brandior does not mandate specific revision policies but may consider revision conduct during dispute resolution.

## Dispute Resolution and Escrow Verdicts
By registering on Brandior and accepting these Terms, you expressly and irrevocably consent to Brandior's authority to adjudicate disputes arising from collabs on the platform and to issue binding verdicts on the distribution of escrowed funds. (a) General Disputes — Raise Within 7 Days: For disputes about delivery quality, scope, or non-delivery, either party must raise a dispute through Brandior's built-in dispute system within 7 calendar days of the delivery date or the agreed deadline, whichever is earlier. Both parties must submit all relevant evidence — screenshots, the agreed brief, delivered files, and communication history. Failure to raise a dispute within this window will be treated as acceptance of the delivery and will trigger or confirm fund release. (b) Extended Window for IP and Fraud Claims: Where a dispute involves third-party intellectual property infringement discovered after the 7-day general window, or involves fraud, misrepresentation, or forgery, a dispute may be raised within 30 calendar days of the delivery date. Claims submitted under this extended window must clearly identify the IP right infringed or the nature of the alleged fraud. The 30-day window does not apply to general dissatisfaction with delivered work. (c) Binding Verdict: Brandior will review all submitted evidence and issue a final, binding verdict on how escrowed funds are distributed. By accepting these Terms, you agree that Brandior's verdict is conclusive and enforceable. You waive any right to contest the distribution of escrowed funds on grounds other than manifest fraud by Brandior. (d) Single Appeal: A verdict may be appealed once within 7 days of notification by submitting new evidence not previously available. The outcome of the appeal is final. (e) Brandior's Role in Disputes: When adjudicating, Brandior acts as a neutral administrator, not as a party, arbitrator, or legal representative. Our verdicts reflect a reasonable assessment of the evidence presented. Brandior is not liable for any loss arising from a verdict reached in good faith. (f) Escalation: Disputes not covered by our escrow system — such as claims against Brandior itself — may be referred to arbitration in Lagos, Nigeria, under the Arbitration and Conciliation Act (as amended). The governing law is the law of the Federal Republic of Nigeria.

## Disclaimer of Warranties
The platform is provided "as is" and "as available". Brandior makes no warranty that the platform will be uninterrupted, error-free, or free of viruses or other harmful components. We do not warrant the quality, suitability, or legality of any content created through collabs, or the accuracy of any user-generated profile information.

## No Liability for Transaction Outcomes
Because Brandior is a neutral connector and not a party to any agreement between Brands and Creators, Brandior bears no liability whatsoever for the outcomes of any collab, campaign, or creative engagement facilitated through the platform. This includes but is not limited to: (a) failure of a Creator to deliver work to the Brand's satisfaction; (b) a Brand's rejection of delivered content; (c) underperformance of a campaign or piece of content; (d) any reputational, commercial, or financial loss suffered by either party as a result of a collab; and (e) any disputes between Brands and Creators beyond the scope of our escrow verdict.

## Limitation of Liability
To the maximum extent permitted by applicable Nigerian law, Brandior and THE OWL COMPANY shall not be liable for: (a) any indirect, incidental, consequential, special, or punitive losses of any kind; (b) loss of revenue, profit, goodwill, data, or business opportunity; (c) harm arising from third-party payment processing failures, bank delays, or CBN regulatory actions; (d) loss arising from a dispute verdict issued in good faith; or (e) any claim arising from the actions or inactions of any Brand or Creator on the platform. Where Brandior is found directly and solely negligent in the technical operation of its escrow system — and only in that circumstance — our aggregate liability shall not exceed the platform fee paid on the specific transaction in dispute. By registering and using the platform, you acknowledge and accept that this limitation of liability is a fundamental term of the agreement and a fair allocation of risk between you and Brandior, given that Brandior provides infrastructure at a platform fee and does not control the creative output or business decisions of either party.

## Indemnification
You agree to indemnify and hold harmless Brandior, THE OWL COMPANY, and their officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from: (a) your breach of these Terms; (b) your infringement of any third-party intellectual property; (c) any illegal or prohibited content you upload or commission; or (d) your violation of any applicable law or regulation.

## Termination
(a) By User: You may close your account at any time from your account settings. Any pending collabs or escrow funds must be resolved before account closure. (b) By Brandior: We may suspend or permanently terminate your account for any breach of these Terms, fraudulent activity, harmful conduct, or at our discretion for any reason that threatens the integrity or safety of the platform. We will provide notice where reasonably practicable. (c) Effect of Termination: On termination, your right to access the platform ceases. Sections on intellectual property, dispute resolution, limitation of liability, and indemnification survive termination.

## Force Majeure
Brandior shall not be liable for failure to perform any obligation if that failure is caused by events outside our reasonable control, including but not limited to: internet outages, banking system failures, regulatory changes, acts of God, civil unrest, or government orders.

## Governing Law
These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes not resolved through our internal system shall be subject to the jurisdiction of Nigerian courts or, at our election, arbitration in Lagos, Nigeria.

## Changes to These Terms
We may update these Terms to reflect changes in our business, technology, or applicable law. We will notify you by email for material changes at least 14 days in advance. Continued use of the platform after the effective date constitutes acceptance of the updated Terms. If you do not agree with the updated Terms, you must stop using the platform.

## Contact
Questions about these Terms? Email us at support@brandior.africa. Brandior is operated by THE OWL COMPANY, Nigeria.`,

  privacy: `## Data Controller
Your personal data is controlled by THE OWL COMPANY, the entity that owns and operates the Brandior platform ("Brandior", "we", "us"). Registered address: Nigeria. For all privacy enquiries, contact us at support@brandior.africa. This Privacy Policy was last updated in September 2026.

## Scope
This Privacy Policy applies to all users of the Brandior web application (app.brandior.africa), our mobile applications for Android and iOS, and our website (brandior.africa). It explains what personal data we collect, why we collect it, how we use it, and your rights under the Nigeria Data Protection Act 2023 ("NDPA") and related regulations.

## Information We Collect
Account data: When you register, we collect your full name, email address, account type (Brand or Creator), and a hashed password (we never store your password in plain text). Profile data: Display name, profile photo, bio, social media handles, portfolio links, rate card information, niche categories, and bank account details required for KYC and payouts. KYC data: Government-issued ID, Bank Verification Number (BVN), proof of address, and related verification documents, collected and processed through our licensed payment processor in compliance with Central Bank of Nigeria (CBN) regulations. Transaction data: Collab orders, payment amounts, escrow records, payout history, dispute records, and associated timestamps. Communication data: Messages exchanged with other users through our in-app messaging system, and support correspondence with our team. Usage data: Pages visited, features used, session duration, click patterns, and device or browser information. Technical data: IP address, device identifiers, browser type and version, operating system, and referral URLs.

## How We Use Your Information
We use your personal data to: (a) create and maintain your account; (b) facilitate collab matches between Brands and Creators; (c) process payments, manage escrow, and release funds; (d) conduct KYC verification as required by financial regulations; (e) send transactional emails including account confirmation, payment notifications, delivery alerts, and dispute updates; (f) send personalised onboarding and relationship communications from our team; (g) resolve disputes between users; (h) detect and prevent fraud, abuse, and violations of our Terms; (i) improve the platform through aggregated, anonymised analytics; and (j) comply with applicable Nigerian law, regulations, and court orders.

## Legal Basis for Processing
Under the NDPA 2023, we process your data on the following lawful bases: (a) Contract performance — processing necessary to provide you with our services and fulfil collab agreements; (b) Legal obligation — processing required by Nigerian financial regulations, anti-money laundering laws, and tax laws; (c) Legitimate interests — fraud prevention, platform security, and product improvement, where not overridden by your rights; and (d) Consent — for marketing communications not strictly necessary to perform our services. You may withdraw consent at any time without affecting prior processing.

## Information Sharing
We do not sell your personal data to third parties. We share data only with: (a) Payment processors — our licensed payment processor manages escrow, KYC, and payouts; they process data under their own privacy policy and applicable CBN regulations; (b) Email service providers — we use Resend (resend.com) to deliver transactional emails; only your email address and name are shared for this purpose; (c) Cloud infrastructure — Supabase (supabase.com) is our database and authentication provider and stores platform data in secure cloud infrastructure; (d) Legal authorities — law enforcement agencies, regulators, or courts when we are legally required to disclose data; and (e) Business transfers — if Brandior is acquired, merged, or restructured, your data may be transferred to the acquiring entity subject to equivalent privacy protections.

## International Data Transfers
Some of our service providers, including Supabase and Resend, may store or process data outside Nigeria. Where such transfers occur, we ensure they are subject to appropriate safeguards, including contractual data protection clauses consistent with NDPA requirements, to protect your personal information regardless of where it is processed.

## Data Security
We implement industry-standard security measures, including: TLS encryption for all data in transit; AES-256 encryption for sensitive data at rest; hashed and salted password storage; role-based access controls limiting data access to authorised personnel; and regular security reviews. Despite these measures, no system is completely secure. In the event of a data breach that affects your rights, we will notify you and the Nigeria Data Protection Commission (NDPC) as required by law.

## Data Retention
We retain your account data for as long as your account is active. If you close your account, we anonymise or delete your personal data within 90 days, except where retention is required by Nigerian law. Financial transaction records may be retained for up to 7 years as required by the Financial Reporting Council of Nigeria and anti-money laundering regulations. KYC documents are retained for the period required by our payment processor's regulatory obligations under CBN rules.

## Your Rights Under the NDPA
You have the right to: (a) Access — request a copy of the personal data we hold about you; (b) Correction — ask us to correct inaccurate or incomplete data; (c) Deletion — request that we delete your personal data, subject to our legal obligations; (d) Restriction — ask us to restrict how we process your data in certain circumstances; (e) Objection — object to processing based on our legitimate interests; (f) Data portability — receive your data in a structured, machine-readable format; and (g) Withdraw consent — where we process data based on your consent, you may withdraw it at any time. To exercise any of these rights, email support@brandior.africa. We will respond within 30 days.

## Automated Decision-Making
We do not make solely automated decisions that have legal or significant effects on you. Our creator-brand matching and badge tier systems are assisted by algorithms but reviewed by human oversight and are not the sole basis for consequential decisions.

## Cookies and Local Storage
We use cookies and similar technologies on our web application. Our mobile application uses local device storage to persist your session and preferences. See our Cookie Policy for full details. You can manage cookie preferences through your browser settings.

## Children's Privacy
Brandior is not intended for users under 18 years of age. We do not knowingly collect or process personal data from minors. If we become aware that a minor has registered, we will delete their account and associated data immediately.

## Changes to This Policy
We will notify you of material changes to this Privacy Policy by email at least 14 days before they take effect. The updated policy will be published on this page with a revised date. Continued use of the platform after the effective date constitutes acceptance of the updated policy.

## Contact and Complaints
For privacy questions or to exercise your rights: support@brandior.africa. If you believe we have not handled your data appropriately, you have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng.`,

  cookies: `## What Are Cookies
Cookies are small text files placed on your device when you visit a website or use a web application. They allow us to recognise your device, maintain your session, and remember your preferences. Similar technologies include browser local storage and session identifiers. This Cookie Policy covers our use of all such technologies on the Brandior web application (app.brandior.africa) and website (brandior.africa).

## Essential Cookies
Essential cookies are strictly necessary for the platform to function. They maintain your login session, keep you authenticated across pages, protect against cross-site request forgery (CSRF), and ensure secure connections. These cookies cannot be disabled without preventing you from logging in and using the platform.

## Security Cookies
Security cookies help us detect and prevent fraud, identify suspicious login activity, flag unusual device behaviour, and protect your account from unauthorised access. These are part of our core security infrastructure.

## Preference Cookies
Preference cookies remember your platform settings — such as display preferences, notification choices, and UI configurations — so you do not need to reconfigure them on each visit.

## Analytics Cookies
Analytics cookies collect anonymised, aggregated information about how users navigate the platform. We use this data to identify bugs, improve user flows, and measure feature adoption. No personally identifiable information is transmitted to analytics providers, and no data is used for advertising.

## What We Do Not Use
We do not use advertising cookies, third-party tracking pixels, or cookies that build behavioural profiles for ad targeting. We do not share cookie data with advertising networks or data brokers.

## Managing Cookies
You can manage and delete cookies through your browser settings. Most browsers allow you to view which cookies are set, delete individual or all cookies, and block future cookies from specific sites. Deleting or blocking essential cookies will prevent you from logging in and using the platform. Blocking analytics cookies will not affect your use of the platform.

## Third-Party Cookies
Our payment processor and authentication provider may set their own cookies necessary for payment security and session management. These are governed by their respective privacy and cookie policies, which we recommend you review.

## Mobile App and Local Storage
Our mobile applications (Android and iOS) use local device storage rather than browser cookies to persist your login session and preferences. This data is stored only on your device and is not accessible to Brandior or third parties beyond what is transmitted to our servers during normal platform use.

## Changes
We may update this Cookie Policy as we introduce new features or technologies. Material changes will be noted with a revised date on this page. Continued use of the platform after any change constitutes acceptance.

## Contact
For questions about our use of cookies and similar technologies: support@brandior.africa`,

  'acceptable-use': `## Introduction
This Acceptable Use Policy ("AUP") sets out the standards of conduct required of all users of the Brandior platform, including Brands, Creators, and any third parties acting on their behalf. It supplements our Terms and Conditions and forms part of the binding agreement you enter into when you use Brandior. This AUP was last updated in September 2026.

## Who This Policy Applies To
This AUP applies to every person or entity that accesses or uses the Brandior platform, including our web application, mobile applications, APIs, and any related services. It applies to all content posted, uploaded, transmitted, or commissioned through Brandior, regardless of the user's account type.

## Prohibited Content
You may not create, upload, commission, share, or facilitate the distribution of content on Brandior that: (a) is unlawful under Nigerian or international law; (b) is sexually explicit, pornographic, or sexually exploits minors in any way — zero tolerance, any such content will result in immediate account termination and referral to law enforcement; (c) is hateful, discriminatory, or promotes violence against any person or group based on race, ethnicity, religion, gender, sexuality, disability, or national origin; (d) defames, libels, or makes false factual statements about any identifiable person or business; (e) promotes, glorifies, or facilitates terrorism, extremism, or illegal activity; (f) advertises counterfeit goods, illegal products, or unlicensed financial services; (g) contains malware, viruses, or malicious code; (h) constitutes spam, unsolicited commercial messages, or phishing attempts; or (i) violates the advertising standards set by the Advertising Regulatory Council of Nigeria (ARCON) or any applicable platform guidelines.

## Prohibited Conduct
You may not: (a) impersonate any person, brand, business, or public figure; (b) create false accounts or misrepresent your identity or credentials; (c) circumvent our escrow by soliciting or accepting payment off-platform for collabs initiated on Brandior; (d) use the platform to launder money, facilitate fraud, or engage in any illegal financial transaction; (e) scrape, crawl, or harvest user data without our written consent; (f) reverse-engineer, decompile, or attempt to extract source code from the Brandior platform; (g) attempt to access systems or data that you are not authorised to access; (h) interfere with or disrupt the platform's infrastructure, servers, or network; (i) engage in coordinated inauthentic behaviour to manipulate creator rankings, ratings, or brand visibility; (j) use Brandior to distribute unsolicited communications to users outside the platform's messaging system; or (k) create multiple accounts to evade restrictions placed on any account.

## Creator Content Standards
Creators are personally responsible for all content they produce through Brandior collabs. You must: (a) ensure delivered content matches the agreed brief and is fit for the Brand's stated campaign purpose; (b) disclose all sponsored content clearly and prominently, in accordance with ARCON guidelines and applicable platform policies; (c) not include third-party intellectual property (music, images, logos, trademarks) in deliverables without appropriate licences; (d) not artificially inflate engagement metrics on delivered content; (e) not make false or unsubstantiated claims about the Brand's product or service in any content; and (f) comply with all applicable laws governing advertising, endorsement, and disclosure in Nigeria and in the markets where the content is published.

## Brand Content Standards
Brands are responsible for all briefs issued and for ensuring that any commissioned content complies with applicable law. You must: (a) provide briefs that are lawful, accurate, and do not ask Creators to make false or misleading claims; (b) not use delivered content in ways not covered by the agreed licence; (c) ensure any products or services being promoted are lawful and not counterfeit; (d) not require Creators to publish content that violates platform policies of Instagram, TikTok, YouTube, X, Snapchat, or any other platform; and (e) ensure that you hold the right to commission and use the intellectual property referenced in your briefs.

## Intellectual Property Infringement
Brandior respects intellectual property rights and expects all users to do the same. If you believe that content on our platform infringes your intellectual property, you may submit an infringement notice to support@brandior.africa including: (a) identification of the copyrighted work or trademark claimed to be infringed; (b) identification of the infringing content and where it appears on the platform; (c) your contact information; and (d) a statement that the information in the notice is accurate and that you are the rights owner or authorised to act on their behalf. We will investigate and take appropriate action, which may include removing the content and suspending the responsible account.

## Reporting Violations
If you encounter conduct or content on Brandior that violates this AUP, please report it by emailing support@brandior.africa with: a description of the alleged violation, the relevant username or collab ID, and any evidence. We investigate all credible reports and take action where violations are confirmed. We do not guarantee a specific outcome for every report.

## Enforcement
Violation of this AUP may result in: (a) a formal warning; (b) temporary suspension of your account; (c) permanent termination of your account and all associated data; (d) withholding of escrow funds pending investigation; (e) referral to Nigerian law enforcement authorities or regulatory bodies; and (f) civil legal action. The severity of the response will be proportionate to the nature and impact of the violation, except that certain violations (child exploitation, fraud, terrorism) will result in immediate termination and referral to authorities without prior warning.

## Changes
We may update this Acceptable Use Policy as our platform evolves or as new legal requirements arise. Material changes will be communicated by email at least 14 days before they take effect. Continued use of the platform after the effective date constitutes acceptance.

## Contact
To report a violation or ask questions about this policy: support@brandior.africa`,
}

const DEFAULTS = {
  terms:            { title: 'Terms & Conditions',     key: 'brandior_legal_terms',          path: '/terms' },
  privacy:          { title: 'Privacy Policy',          key: 'brandior_legal_privacy',        path: '/privacy' },
  cookies:          { title: 'Cookie Policy',           key: 'brandior_legal_cookies',        path: '/cookies' },
  'acceptable-use': { title: 'Acceptable Use Policy',  key: 'brandior_legal_acceptable_use', path: '/acceptable-use' },
}

function renderContent(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-xl font-black mt-10 mb-3" style={{ color: '#1e0040' }}>{line.slice(3)}</h2>
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-base font-bold mt-6 mb-2" style={{ color: '#3b0764' }}>{line.slice(4)}</h3>
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="text-sm leading-relaxed mb-2" style={{ color: '#4b5563' }}>{line}</p>
  })
}

export default function LegalPage() {
  const location = useLocation()
  const type = location.pathname.replace('/', '')
  const config = DEFAULTS[type] || DEFAULTS.terms
  const content = (typeof localStorage !== 'undefined' && localStorage.getItem(config.key)) || DEFAULT_CONTENT[type] || ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{config.title} | Brandior</title>
      </Helmet>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="text-sm font-medium mb-8 inline-block" style={{ color: '#7c3aed' }}>← Back to home</Link>

        {/* Doc switcher */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.entries(DEFAULTS).map(([key, val]) => (
            <Link
              key={key}
              to={val.path}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={type === key
                ? { backgroundColor: '#7c3aed', color: '#fff' }
                : { backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
              {val.title}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-black mb-1" style={{ color: '#1e0040' }}>{config.title}</h1>
          <p className="text-xs mb-6" style={{ color: '#9ca3af' }}>Last updated: September 2026 · Brandior is operated by THE OWL COMPANY, Nigeria</p>
          <div className="mt-6">
            {content ? renderContent(content) : (
              <p className="text-sm text-gray-400 italic">This document has not been published yet.</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Questions? Email us at <a href="mailto:support@brandior.africa" className="text-indigo-500">support@brandior.africa</a></p>
          <p className="text-xs text-gray-300 mt-1">© 2026 Brandior · THE OWL COMPANY · Nigeria</p>
        </div>
      </div>
    </div>
  )
}
