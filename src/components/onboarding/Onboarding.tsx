import { useState } from 'react'
import OnboardingScreen, { type OnboardingStep } from './OnboardingScreen'

const STEPS: OnboardingStep[] = [
  {
    title: 'Claim your @handle',
    subtitle: 'Your handle is your identity on Mink. Friends can pay you without wallet addresses.',
    image: '/onboarding/handle.png',
    imageAlt: 'A mascot holding a card that reads Your handle @sam',
    ctaLabel: 'Continue',
  },
  {
    title: 'Friends pay your handle',
    subtitle: 'People send money to usernames — not long wallet addresses.',
    image: '/onboarding/pay-friends.png',
    imageAlt: 'Two people sending and receiving a payment to @sam',
    ctaLabel: 'Continue',
  },
  {
    title: 'Money arrives instantly',
    subtitle: 'Fast, seamless payments with blockchain completely hidden.',
    image: '/onboarding/instant.png',
    imageAlt: 'A payment of £25.00 arriving instantly from @sam',
    ctaLabel: 'Continue',
  },
  {
    title: 'One balance across every chain',
    subtitle: 'Your assets automatically appear as one unified balance.',
    image: '/onboarding/balance.png',
    imageAlt: 'A mascot holding a glowing balance made of several incoming payments',
    ctaLabel: 'Continue',
  },
  {
    title: "You're ready",
    subtitle: 'Your account is set up. Start sending money like a message.',
    image: '/onboarding/celebrate.png',
    imageAlt: 'A mascot celebrating with a mink flag and confetti',
    ctaLabel: 'Get Started',
  },
]

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = STEPS[stepIndex]

  function handleContinue() {
    if (stepIndex === STEPS.length - 1) {
      onComplete()
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1))
  }

  return (
    <OnboardingScreen
      key={stepIndex}
      step={step}
      stepIndex={stepIndex}
      totalSteps={STEPS.length}
      onContinue={handleContinue}
      onBack={stepIndex > 0 ? handleBack : undefined}
    />
  )
}
