import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import OnboardingIllustration from './OnboardingIllustration'

export type OnboardingStep = {
  title: string
  subtitle: string
  image?: string
  imageAlt: string
  ctaLabel: string
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-lg bg-[var(--color-ink)] flex items-center justify-center shrink-0">
        <span className="text-[var(--color-paper)] font-display font-bold text-xs">m</span>
      </div>
      <span className="font-display font-bold text-base">mink</span>
    </div>
  )
}

function ProgressDots({ stepIndex, totalSteps }: { stepIndex: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === stepIndex ? 'w-6 bg-[var(--color-ink)]' : 'w-1.5 bg-[var(--color-line)]'
          }`}
        />
      ))}
    </div>
  )
}

function useFadeIn(deps: unknown[]) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
  } as const
}

export default function OnboardingScreen({
  step,
  stepIndex,
  totalSteps,
  onContinue,
  onBack,
  eager = false,
}: {
  step: OnboardingStep
  stepIndex: number
  totalSteps: number
  onContinue: () => void
  onBack?: () => void
  eager?: boolean
}) {
  const textStyle = useFadeIn([stepIndex])
  const touchStartX = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const SWIPE_THRESHOLD = 50
    if (deltaX < -SWIPE_THRESHOLD) {
      onContinue()
    } else if (deltaX > SWIPE_THRESHOLD && onBack) {
      onBack()
    }
    touchStartX.current = null
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-paper)]">
      {/* Mobile / tablet: fixed vertical sections, illustration/text/dots/button never overlap */}
      <div
        className="lg:hidden min-h-[100dvh] flex flex-col px-6"
        style={{
          paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center shrink-0">
          <Logo />
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
          <div className="w-full flex items-center justify-center shrink-0">
            <div
              className="w-full max-w-[320px] sm:max-w-[420px] h-[38vh] sm:h-[42vh] [@media(max-height:700px)]:h-[30vh] [@media(max-height:700px)]:sm:h-[32vh]"
            >
              <OnboardingIllustration src={step.image} alt={step.imageAlt} eager={eager} />
            </div>
          </div>

          <div style={textStyle} className="text-center mt-8 max-w-[340px] mx-auto shrink-0">
            <h1 className="font-display font-bold text-3xl sm:text-4xl leading-tight tracking-tight">
              {step.title}
            </h1>
            <p className="mt-4 text-base text-[var(--color-ink-soft)]">{step.subtitle}</p>
          </div>
        </div>

        <div className="shrink-0">
          <div className="flex items-center justify-center mb-7">
            <ProgressDots stepIndex={stepIndex} totalSteps={totalSteps} />
          </div>
          <button
            onClick={onContinue}
            className="w-full max-w-[420px] mx-auto h-14 flex items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold hover:bg-[var(--color-mink-deep)] transition-colors"
          >
            {step.ctaLabel}
          </button>
        </div>
      </div>

      {/* Desktop / large tablet: split-screen hero, Prev/Next controls */}
      <div className="hidden lg:flex min-h-[100dvh] items-center justify-center px-12 xl:px-20">
        <div className="w-full max-w-[1280px] grid grid-cols-2 gap-16 items-center">
          <div style={textStyle} className="flex flex-col max-w-md">
            <Logo />
            <h1 className="font-display font-bold text-5xl leading-[1.1] tracking-tight mt-10">
              {step.title}
            </h1>
            <p className="mt-5 text-lg text-[var(--color-ink-soft)]">{step.subtitle}</p>

            <div className="mt-12 flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  aria-label="Previous"
                  className="h-14 w-14 shrink-0 rounded-full border border-[var(--color-line)] flex items-center justify-center hover:bg-[var(--color-mink-tint)] transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onContinue}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-4 px-8 hover:bg-[var(--color-mink-deep)] transition-colors"
              >
                {step.ctaLabel}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8">
              <ProgressDots stepIndex={stepIndex} totalSteps={totalSteps} />
            </div>
          </div>

          <div className="w-full max-w-[520px] h-[460px] mx-auto">
            <OnboardingIllustration src={step.image} alt={step.imageAlt} delayMs={100} eager={eager} />
          </div>
        </div>
      </div>
    </div>
  )
}
