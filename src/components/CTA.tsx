import { useReveal } from '../hooks/useReveal'

export default function CTA() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section id="get-started" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className="reveal rounded-3xl bg-[var(--color-ink)] text-[var(--color-paper)] px-8 py-16 md:py-20 text-center"
        >
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-tight">
            Claim your handle.
            <br />
            Start sending.
          </h2>
          <p className="mt-5 text-[var(--color-paper)]/65 max-w-md mx-auto">
            No wallet setup, no seed phrase, no chain selector. Just your email and a username.
          </p>
          <a
            href="#"
            className="inline-block mt-9 rounded-full bg-[var(--color-mink)] text-white font-semibold px-8 py-3.5 hover:bg-[var(--color-mink-light)] hover:text-[var(--color-ink)] transition-colors"
          >
            Get started — it's free
          </a>
        </div>
      </div>
    </section>
  )
}