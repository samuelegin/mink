import { useEffect, useRef, useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import OnboardingIllustration from '../onboarding/OnboardingIllustration'
import { getReadContract, getWriteContract, decodeRegistryError } from '../../lib/contracts'
import { USE_MOCK_HANDLE_CLAIM } from '../../lib/mockConfig'
import { mockIsAvailable, mockClaimHandle } from '../../lib/mockHandleRegistry'
import { useAuth } from '../../context/AuthContext'

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const HANDLE_REGEX = /^[a-z0-9_]{1,32}$/

const CLAIM_MESSAGES = [
  'Reserving your handle…',
  'Almost there…',
  'Just a little longer…',
  'Setting things up…',
]

function sanitize(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9_]/g, '')
}

export default function HandleClaimScreen({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth()
  const [value, setValue] = useState('')
  const [availability, setAvailability] = useState<Availability>('idle')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claimedHandle, setClaimedHandle] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!submitting) {
      setMessageIndex(0)
      return
    }
    const interval = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, CLAIM_MESSAGES.length - 1))
    }, 2200)
    return () => clearInterval(interval)
  }, [submitting])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value) {
      setAvailability('idle')
      setSuggestions([])
      return
    }

    if (!HANDLE_REGEX.test(value)) {
      setAvailability('invalid')
      setSuggestions([])
      return
    }

    setAvailability('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const checkAvailable = USE_MOCK_HANDLE_CLAIM
          ? mockIsAvailable
          : async (h: string) => getReadContract().isAvailable(h)

        const available = await checkAvailable(value)
        if (available) {
          setAvailability('available')
          setSuggestions([])
        } else {
          setAvailability('taken')
          const candidates = [`${value}1`, `${value}_`, `${value}${Math.floor(Math.random() * 90 + 10)}`]
          const checks = await Promise.all(
            candidates.map(async (c) => ({ c, ok: await checkAvailable(c).catch(() => false) }))
          )
          setSuggestions(checks.filter((r) => r.ok).map((r) => r.c).slice(0, 3))
        }
      } catch (err) {
        console.error('Availability check failed', err)
        setAvailability('idle')
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  async function handleClaim() {
    if (availability !== 'available' || !user) return
    setSubmitting(true)
    setError(null)
    try {
      if (USE_MOCK_HANDLE_CLAIM) {
        await mockClaimHandle(user.address, value)
      } else {
        const contract = await getWriteContract()
        const tx = await contract.registerHandle(value)
        await tx.wait()
      }
      setClaimedHandle(value)
    } catch (err) {
      console.error('Claim failed', err)
      setError(decodeRegistryError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (claimedHandle) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center px-6 text-center">
        <div className="h-16 w-16 rounded-full bg-[var(--color-moss)] text-white flex items-center justify-center">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <p className="font-display font-bold text-2xl mt-6">Handle Reserved</p>
        <p className="text-[var(--color-ink-soft)] mt-2 max-w-xs">
          You're now <span className="font-semibold text-[var(--color-ink)]">@{claimedHandle}</span>. Friends
          can start sending you money instantly.
        </p>
        <button
          onClick={onComplete}
          className="mt-8 w-full max-w-xs rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-4 hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          Continue to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col px-6 pt-8 pb-8">
      <div className="flex items-center justify-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-[var(--color-ink)] flex items-center justify-center">
          <span className="text-[var(--color-paper)] font-display font-bold text-xs">m</span>
        </div>
        <span className="font-display font-bold text-base">mink</span>
      </div>

      <div className="mx-auto w-full max-w-sm flex flex-col">
        <div className={`h-44 sm:h-52 w-full mt-4 shrink-0 transition-transform ${submitting ? 'animate-pulse' : ''}`}>
          <OnboardingIllustration src="/onboarding/handle.webp" alt="A mascot holding a card that reads Your handle @sam" />
        </div>

        <div className="text-center mt-4 shrink-0">
          <h1 className="font-display font-bold text-2xl tracking-tight">Claim your @handle</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Your handle is how friends find and pay you.
          </p>
        </div>

        <div className="mt-6 shrink-0">
          <div
            className={`flex items-center rounded-full border-2 px-5 py-3.5 transition-colors ${
              availability === 'available'
                ? 'border-[var(--color-moss)]'
                : availability === 'taken' || availability === 'invalid'
                  ? 'border-red-400'
                  : 'border-[var(--color-line)] focus-within:border-[var(--color-mink)]'
            }`}
          >
            <span className="text-[var(--color-ink-soft)]/50 mr-0.5">@</span>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(sanitize(e.target.value))}
              placeholder="yourname"
              maxLength={32}
              disabled={submitting}
              className="flex-1 outline-none bg-transparent text-base disabled:opacity-60"
            />
            {availability === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-ink-soft)]" />}
            {availability === 'available' && <Check className="h-4 w-4 text-[var(--color-moss)]" />}
            {(availability === 'taken' || availability === 'invalid') && <X className="h-4 w-4 text-red-400" />}
          </div>

          <div className="mt-2 min-h-[20px] text-sm text-center">
            {availability === 'available' && <span className="text-[var(--color-moss)]">✓ Available</span>}
            {availability === 'taken' && <span className="text-red-500">Already taken</span>}
            {availability === 'invalid' && (
              <span className="text-red-500">Lowercase letters, numbers, underscore only</span>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setValue(s)}
                  className="text-xs rounded-full bg-[var(--color-mink-tint)] text-[var(--color-mink-deep)] px-3 py-1.5 hover:bg-[var(--color-mink-light)] transition-colors"
                >
                  @{s}
                </button>
              ))}
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}
        </div>
      </div>

      {submitting && (
        <div className="w-full max-w-sm mx-auto mt-6">
          <div className="h-1 w-full rounded-full bg-[var(--color-line)] overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-[var(--color-mink)] animate-indeterminate" />
          </div>
          <p className="text-xs text-[var(--color-ink-soft)] text-center mt-2.5">
            {CLAIM_MESSAGES[messageIndex]}
          </p>
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={availability !== 'available' || submitting}
        className="w-full max-w-sm mx-auto mt-8 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-4 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Claiming…' : 'Continue'}
      </button>
    </div>
  )
}