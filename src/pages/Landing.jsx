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
