const partners = ['Particle Network', 'Arbitrum', 'Magic']

export default function PoweredBy() {
  return (
    <div className="border-y border-[var(--color-line)] bg-[var(--color-mink-tint)]/40">
      <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)]">
          Powered by
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {partners.map((p) => (
            <span key={p} className="font-display font-semibold text-[var(--color-ink)]/70 text-sm">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}