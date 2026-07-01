import { Heart, MessageCircle } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const feed = [
  { from: '@sam', to: '@jane', emoji: '🍕', note: 'Friday pizza', amount: '$12.00', likes: 4, comments: 1 },
  { from: '@mike', to: '@dave', emoji: '🎮', note: 'Split the game', amount: '$40.00', likes: 2, comments: 0 },
  { from: '@you', to: '@amaka', emoji: '🚕', note: 'Ride home', amount: '$8.50', likes: 6, comments: 2 },
]

function initials(handle: string) {
  return handle.replace('@', '').slice(0, 2).toUpperCase()
}

export default function FeedPreview() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section className="py-24 md:py-32 bg-[var(--color-mink-tint)]/50">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 items-center">
        <div ref={ref} className="reveal">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-mink-deep)]">
            The feed
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 tracking-tight leading-tight">
            Payments are more fun
            <br />
            out loud.
          </h2>
          <p className="mt-5 text-[var(--color-ink-soft)] leading-relaxed max-w-md">
            No balances, no wallet addresses, no blockchain jargon. Just who paid who, for what — with a like and a comment if you're feeling it.
          </p>
        </div>

        <div className="space-y-4">
          {feed.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-[var(--color-line)] p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--color-mink)] text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                  {initials(item.from)}
                </div>
                <p className="text-sm leading-snug">
                  <span className="font-semibold">{item.from}</span>
                  <span className="text-[var(--color-ink-soft)]"> paid </span>
                  <span className="font-semibold">{item.to}</span>
                  <span className="ml-1">{item.emoji}</span>
                  <br />
                  <span className="text-[var(--color-ink-soft)]">{item.note}</span>
                </p>
                <span className="ml-auto font-mono font-semibold text-[var(--color-mink-deep)] shrink-0">
                  {item.amount}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-5 text-[var(--color-ink-soft)]">
                <span className="flex items-center gap-1.5 text-sm">
                  <Heart size={16} /> {item.likes}
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  <MessageCircle size={16} /> {item.comments}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}