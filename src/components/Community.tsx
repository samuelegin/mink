import communityPhoto from '../assets/community.jpg'
import { useReveal } from '../hooks/useReveal'

export default function Community() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section id="community" className="py-24 md:py-32 bg-[var(--color-mink-tint)]/50">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 items-center">
        <div ref={ref} className="reveal relative order-2 md:order-1">
          <img
            src={communityPhoto}
            alt="A group of friends sitting together outdoors, chatting"
            className="rounded-3xl w-full h-[420px] object-cover"
          />
          <div className="absolute -bottom-6 -right-4 md:-right-8 rounded-2xl bg-white border border-[var(--color-line)] shadow-lg px-5 py-4">
            <div className="text-xs text-[var(--color-ink-soft)] font-mono">@amaka split dinner</div>
            <div className="font-display font-semibold text-lg mt-0.5">$120.00 → 4 friends</div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-mink-deep)]">
            Built for real friend groups
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 tracking-tight">
            The people you actually
            <br />
            send money to.
          </h2>
          <p className="mt-5 text-[var(--color-ink-soft)] leading-relaxed max-w-md">
            Split a dinner, pay back a friend, settle a group trip. mink is built for the everyday moments money changes hands — not just trading.
          </p>
        </div>
      </div>
    </section>
  )
}