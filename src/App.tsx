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
import { useAuth } from './context/AuthContext'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)]">
      <div className="h-6 w-6 rounded-full border-2 border-[var(--color-mink)] border-t-transparent animate-spin" />
    </div>
  )
}

function BackendErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-paper)] px-6 text-center">
      <p className="font-display font-bold text-xl">Couldn't reach mink</p>
      <p className="text-sm text-[var(--color-ink-soft)] mt-2 max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold px-6 py-3 hover:bg-[var(--color-mink-deep)] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

function App() {
  const { status, profile, backendStatus, backendError, retryBackendSession, completeOnboarding } = useAuth()

  if (status === 'checking') {
    return <Spinner />
  }

  if (status === 'authenticated') {
    // Onboarding status now lives on the backend profile, so it isn't known
    // until the backend session has resolved — the loading/error checks have
    // to come first instead of after an onboarding check based on local storage.
    if (backendStatus === 'loading' || backendStatus === 'idle') {
      return <Spinner />
    }

    if (backendStatus === 'error') {
      return <BackendErrorScreen message={backendError ?? 'Something went wrong.'} onRetry={retryBackendSession} />
    }

    if (!profile?.onboarding_completed) {
      return <Onboarding onComplete={completeOnboarding} />
    }

    // Handle claiming as a user-facing step is gone. The backend is expected
    // to auto-assign a handle at account creation now — this fallback only
    // guards against a profile that predates that change or a not-yet-synced
    // backend, so the app never hard-fails on a missing handle.
    const handle = profile?.handle ?? `user${profile?.id?.slice(0, 8) ?? ''}`

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
