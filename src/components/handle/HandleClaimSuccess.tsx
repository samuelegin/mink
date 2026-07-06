import { useState } from 'react'
import { Check, ChevronRight, Copy, Share2 } from 'lucide-react'

const BENEFITS = [
  'Send you money with @handle',
  'Find you instantly',
  'Never copy wallet addresses again',
]

const NEXT_STEPS = [
  { label: 'Profile created', done: true },
  { label: 'Send your first payment', done: false },
  { label: 'Share your handle', done: false },
  { label: 'Receive your first payment', done: false },
]

export default function HandleClaimSuccess({
  handle,
  hasExistingActivity = false,
  onContinue,
}: {
  handle: string
  hasExistingActivity?: boolean
  onContinue: () => void
}) {
  const [copied, setCopied] = useState(false)

  function copyHandle() {
    navigator.clipboard.writeText(`@${handle}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function shareHandle() {
    const url = `https://mink.app/pay/${handle}`
    if (navigator.share) {
      navigator.share({ title: 'Pay me on Mink', text: `Pay @${handle} on Mink`, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center px-6 py-10 overflow-y-auto">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-[var(--color-moss)] text-white flex items-center justify-center">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>

        <h1 className="font-display font-bold text-2xl mt-6">Your handle is yours 🎉</h1>
        <p className="text-[var(--color-ink-soft)] mt-2">
          @{handle} has been reserved successfully.
        </p>

        <div className="w-full rounded-[24px] bg-white border border-[var(--color-line)] shadow-sm p-6 mt-6 text-left">
          <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60">Your Mink Handle</p>
          <p className="font-display font-bold text-2xl mt-1">@{handle}</p>
          <p className="text-sm text-[var(--color-ink-soft)] mt-3">Friends can now:</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm">
                <span className="text-[var(--color-mink-deep)] mt-0.5">•</span>
                <span>{benefit.replace('@handle', `@${handle}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-4 hover:bg-[var(--color-mink-deep)] transition-colors mt-6"
        >
          {hasExistingActivity ? 'Go to Home' : 'Start Sending Money'}
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="flex gap-2.5 w-full mt-3">
          <button
            onClick={copyHandle}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] font-medium text-sm py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied' : 'Copy Handle'}
          </button>
          <button
            onClick={shareHandle}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] font-medium text-sm py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share Handle
          </button>
        </div>

        <div className="w-full h-px bg-[var(--color-line)] mt-8" />

        <div className="w-full mt-8">
          <img
            src="/onboarding/celebrate.webp"
            alt="Mascot celebrating with confetti"
            className="h-28 mx-auto object-contain"
          />

          <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mt-4 mb-2 text-left">
            What's next?
          </p>
          <div className="rounded-[24px] bg-white border border-[var(--color-line)] shadow-sm divide-y divide-[var(--color-line)] text-left">
            {NEXT_STEPS.map((step) => (
              <div key={step.label} className="flex items-center gap-3 px-5 py-3.5">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                    step.done
                      ? 'bg-[var(--color-moss)] text-white'
                      : 'bg-[var(--color-mink-tint)] text-[var(--color-ink-soft)]/50'
                  }`}
                >
                  {step.done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </div>
                <span className={`text-sm ${step.done ? 'font-medium' : 'text-[var(--color-ink-soft)]'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[var(--color-ink-soft)]/70 mt-6">
          You can always change your handle later from your profile.
        </p>
      </div>
    </div>
  )
}
