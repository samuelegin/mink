import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PoweredBy from './components/PoweredBy'
import HowItWorks from './components/HowItWorks'
import FeedPreview from './components/FeedPreview'
import UniversalBalance from './components/UniversalBalance'
import Community from './components/Community'
import CTA from './components/CTA'
import Footer from './components/Footer'
import AppShell from './components/app/AppShell'
import Onboarding from './components/onboarding/Onboarding'
import HandleClaimScreen from './components/handle/HandleClaimScreen'
import { useAuth } from './context/AuthContext'
import { useOnboardingStatus } from './hooks/useOnboardingStatus'
import { useHandleStatus } from './hooks/useHandleStatus'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)]">
      <div className="h-6 w-6 rounded-full border-2 border-[var(--color-mink)] border-t-transparent animate-spin" />
    </div>
  )
}

function App() {
  const { status, user } = useAuth()
  const { onboarded, markOnboarded } = useOnboardingStatus(user?.address)
  const { handle, loading: handleLoading, refresh: refreshHandle } = useHandleStatus(user?.address)

  if (status === 'checking') {
    return <Spinner />
  }

  if (status === 'authenticated') {
    if (!onboarded) {
      return <Onboarding onComplete={markOnboarded} />
    }

    if (handleLoading) {
      return <Spinner />
    }

    if (!handle) {
      return <HandleClaimScreen onComplete={refreshHandle} />
    }

    return <AppShell handle={handle} />
  }

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