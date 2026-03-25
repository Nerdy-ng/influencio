import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import TrustBar from '../components/TrustBar'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import TalentShowcase from '../components/TalentShowcase'
import Testimonials from '../components/Testimonials'
import Pricing from '../components/Pricing'
import PlatformPreview from '../components/PlatformPreview'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Brandior — Where Creators & Brands Grow Together in Africa</title>
        <meta name="description" content="Brandior connects African creators and brands. Find influencer deals, UGC opportunities, and launch campaigns across Nigeria, Ghana, Kenya and beyond." />
        <meta property="og:title" content="Brandior — Where Creators & Brands Grow Together" />
        <meta property="og:description" content="Connect with top African creators and brands. Find deals, launch campaigns, grow together." />
        <meta property="og:url" content="https://brandior.africa" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://brandior.africa" />
      </Helmet>
      <Navbar />
      <Hero />
      <TrustBar />
      <TalentShowcase />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <PlatformPreview />
      <CTA />
      <Footer />
    </div>
  )
}
