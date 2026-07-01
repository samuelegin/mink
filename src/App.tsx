import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PoweredBy from './components/PoweredBy'
import HowItWorks from './components/HowItWorks'
import FeedPreview from './components/FeedPreview'
import UniversalBalance from './components/UniversalBalance'
import Community from './components/Community'
import CTA from './components/CTA'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <PoweredBy />
        <HowItWorks />
        <FeedPreview />
        <UniversalBalance />
        <Community />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default App