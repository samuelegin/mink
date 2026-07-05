import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useAuth } from '../context/AuthContext'

export default function CTA() {
  const ref = useReveal<HTMLDivElement>()
  const { user, status, error, loginWithEmail, loginWithGoogle, logout } = useAuth()
  const [email, setEmail] = useState('')

  const isBusy = status === 'sending' || status === 'checking'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || isBusy) return
    loginWithEmail(email)
  }

  return (
    <section id="get-started" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className="reveal rounded-3xl bg-[var(--color-ink)] text-[var(--color-paper)] px-8 py-16 md:py-20 text-center"
        >
          {status === 'authenticated' && user ? (
            <>
              <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-tight">
                You're in.
              </h2>
              <p className="mt-5 text-[var(--color-paper)]/65 max-w-md mx-auto break-all">
                {user.email ?? 'Signed in with Google'}
                <br />
                <span className="text-[var(--color-paper)]/45 text-sm">{user.address}</span>
              </p>
              <button
                onClick={logout}
                className="inline-block mt-9 rounded-full border border-[var(--color-paper)]/25 text-[var(--color-paper)] font-semibold px-8 py-3.5 hover:bg-[var(--color-paper)]/10 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-tight">
                Claim your handle.
                <br />
                Start sending.
              </h2>
              <p className="mt-5 text-[var(--color-paper)]/65 max-w-md mx-auto">
                No wallet setup, no seed phrase, no chain selector. Just your email and a username.
              </p>

              <form onSubmit={handleSubmit} className="mt-9 flex flex-col items-center gap-3 max-w-sm mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isBusy}
                  className="w-full rounded-full bg-[var(--color-paper)]/10 border border-[var(--color-paper)]/20 px-5 py-3.5 text-[var(--color-paper)] placeholder:text-[var(--color-paper)]/40 outline-none focus:border-[var(--color-mink-light)] transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--color-mink)] text-white font-semibold px-8 py-3.5 hover:bg-[var(--color-mink-light)] hover:text-[var(--color-ink)] transition-colors disabled:opacity-60"
                >
                  {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {status === 'sending' ? 'Check your email…' : "Get started — it's free"}
                </button>

                <div className="flex items-center gap-3 w-full text-[var(--color-paper)]/40 text-xs">
                  <div className="h-px flex-1 bg-[var(--color-paper)]/15" />
                  or
                  <div className="h-px flex-1 bg-[var(--color-paper)]/15" />
                </div>

                <button
                  type="button"
                  onClick={loginWithGoogle}
                  disabled={isBusy}
                  className="w-full rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] font-semibold px-8 py-3.5 hover:bg-[var(--color-paper)]/90 transition-colors disabled:opacity-60"
                >
                  Continue with Google
                </button>
              </form>

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
