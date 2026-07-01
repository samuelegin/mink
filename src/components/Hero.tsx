import heroArt from '../assets/hero-otter.png'

export default function Hero() {
  return (
    <section id="top" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-mink-tint)] text-[var(--color-mink-deep)] text-xs font-semibold px-3 py-1.5 font-mono uppercase tracking-wide">
            Built for UXmaxx Hackathon
          </span>

          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.05] mt-6 tracking-tight">
            Send money
            <br />
            like a message.
          </h1>

          <p className="mt-6 text-lg text-[var(--color-ink-soft)] max-w-md leading-relaxed">
            Claim <span className="font-mono text-[var(--color-mink-deep)]">@yourname</span> and pay anyone on mink. No addresses, no gas, no "which chain is this on." We handle that part.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#get-started"
              className="rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold px-7 py-3.5 hover:bg-[var(--color-mink-deep)] transition-colors"
            >
              Get started
            </a>
            <a
              href="#how"
              className="rounded-full border border-[var(--color-ink)]/15 font-semibold px-7 py-3.5 hover:border-[var(--color-ink)]/40 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <div className="absolute -inset-x-10 -inset-y-10 rounded-full bg-[var(--color-mink-light)]/60 blur-3xl" aria-hidden="true" />

          <div className="relative float-slow">
            <img
              src={heroArt}
              alt="An otter illustration holding a phone showing a dollar sign, representing a payment"
              className="w-72 md:w-96 relative z-10"
            />

            <div className="absolute -left-6 top-6 rounded-2xl bg-white border border-[var(--color-line)] shadow-sm px-4 py-2.5 text-sm font-mono z-20">
              @jane
            </div>
            <div className="absolute -right-4 bottom-8 rounded-2xl bg-[var(--color-ink)] text-[var(--color-paper)] shadow-sm px-4 py-2.5 text-sm font-mono z-20">
              sent $12.00
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}