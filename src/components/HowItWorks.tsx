import { useReveal } from '../hooks/useReveal'
import iconHandle from '../assets/icon-handle.png'
import iconTransfer from '../assets/icon-transfer.png'
import iconDone from '../assets/icon-done.png'

const steps = [
  {
    tag: '@claim',
    title: 'Claim your handle',
    body: 'Sign up with your email. mink sets up your account behind the scenes — no seed phrase to write down, nothing to lose.',
    icon: iconHandle,
  },
  {
    tag: '@send',
    title: 'Pay anyone, any chain',
    body: 'Type their handle, enter an amount, hit send. mink figures out the chain and the gas so you never have to.',
    icon: iconTransfer,
  },
  {
    tag: '@done',
    title: 'Settled. Instantly.',
    body: 'Your friend sees the money land in one balance — not a list of six different networks.',
    icon: iconDone,
  },
]

function StepCard({ step, i }: { step: (typeof steps)[number]; i: number }) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className="reveal rounded-3xl border border-[var(--color-line)] bg-white p-8"
      style={{ transitionDelay: `${i * 90}ms` }}
    >
      <img src={step.icon} alt="" className="h-14 w-14" aria-hidden="true" />
      <div className="mt-6 font-mono text-sm text-[var(--color-mink-deep)]">{step.tag}</div>
      <h3 className="font-display font-semibold text-xl mt-1">{step.title}</h3>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">{step.body}</p>
    </div>
  )
}

export default function HowItWorks() {
  const headingRef = useReveal<HTMLDivElement>()
  return (
    <section id="how" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={headingRef} className="reveal max-w-xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-mink-deep)]">
            How it works
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 tracking-tight">
            Three steps
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <StepCard key={s.tag} step={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}