import { useReveal } from '../hooks/useReveal'

const sources = [
  { chain: 'Base', amount: '$120.00' },
  { chain: 'Arbitrum', amount: '$50.00' },
  { chain: 'Optimism', amount: '$75.32' },
]

export default function UniversalBalance() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section id="balance" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={ref} className="reveal max-w-xl mx-auto text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-mink-deep)]">
            One balance
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 tracking-tight">
            Your money doesn't
            <br />
            live on one chain.
          </h2>
          <p className="mt-5 text-[var(--color-ink-soft)] leading-relaxed">
            mink pulls your funds together into a single balance, no matter which chain they're actually sitting on.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center max-w-4xl mx-auto">
          <div className="space-y-3">
            {sources.map((s) => (
              <div
                key={s.chain}
                className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-white px-5 py-3.5"
              >
                <span className="text-sm font-medium text-[var(--color-ink-soft)]">{s.chain}</span>
                <span className="font-mono text-sm">{s.amount}</span>
              </div>
            ))}
          </div>

          <svg
            className="hidden md:block w-16 h-24 text-[var(--color-mink)]"
            viewBox="0 0 64 96"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2 12 H40 M2 48 H40 M2 84 H40" stroke="currentColor" strokeWidth="2" className="dash-flow" />
            <path d="M40 12 C 56 12, 56 48, 56 48 C 56 48, 56 84, 40 84" stroke="currentColor" strokeWidth="2" className="dash-flow" />
          </svg>

          <div className="rounded-3xl bg-[var(--color-ink)] text-[var(--color-paper)] p-8 text-center">
            <div className="text-xs font-mono uppercase tracking-widest text-[var(--color-paper)]/60">
              Your balance
            </div>
            <div className="font-display font-bold text-4xl mt-3">$245.32</div>
            <div className="text-sm text-[var(--color-paper)]/60 mt-2">Ready to send, anywhere</div>
          </div>
        </div>
      </div>
    </section>
  )
}