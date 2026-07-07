import { useEffect, useRef, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import type { PayContact } from './types'
import { getUserByHandle } from '../../lib/api/users'
import { createPaymentRequest } from '../../lib/api/paymentRequests'

type Step = 'amount' | 'sending' | 'success' | 'error'

const QUICK_AMOUNTS = [5, 10, 20, 50]

const CATEGORY_PILLS = [
  { emoji: '🍔', label: 'Food' },
  { emoji: '☕', label: 'Coffee' },
  { emoji: '🎁', label: 'Gift' },
  { emoji: '🏠', label: 'Rent' },
]

function initials(person: PayContact) {
  return (person.name ?? person.handle).charAt(0).toUpperCase()
}

function useFadeIn(deps: unknown[]) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.98)',
    transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
  } as const
}

/**
 * Mirrors PaymentSheet.tsx's structure (amount + note entry, confirmation, sent
 * state) but for POST /api/v1/payment-requests, which is a genuinely new flow —
 * there was no existing "request money" UI to swap a mock out of.
 *
 * The API takes a payer_id, not a handle, so this resolves the handle to a user
 * id via GET /users/{handle} first.
 */
export default function RequestMoneySheet({
  person,
  onClose,
  onSent,
}: {
  person: PayContact
  onClose: () => void
  onSent?: () => void
}) {
  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const cardStyle = useFadeIn([step])
  const closableRef = useRef(true)

  const numericAmount = parseFloat(amount || '0')
  const canContinue = numericAmount > 0

  function addQuickAmount(delta: number) {
    const current = parseFloat(amount || '0')
    setAmount((current + delta).toFixed(2).replace(/\.00$/, ''))
  }

  async function handleRequest() {
    if (!canContinue) return
    setStep('sending')
    setError(null)
    closableRef.current = false
    try {
      const payer = await getUserByHandle(person.handle)
      await createPaymentRequest({ payerId: payer.id, amount: numericAmount, note: note || undefined })
      setStep('success')
      onSent?.()
    } catch (err) {
      console.error('Payment request failed', err)
      setError("We couldn't send that request. Check the handle and try again.")
      setStep('error')
    } finally {
      closableRef.current = true
    }
  }

  function handleBackdropClose() {
    if (closableRef.current) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleBackdropClose} />

      <div
        style={cardStyle}
        className="relative w-full sm:max-w-[480px] bg-[var(--color-paper)] rounded-t-3xl sm:rounded-3xl px-7 pt-4 pb-8 sm:pb-6 max-h-[90vh] overflow-y-auto"
      >
        {step !== 'sending' && step !== 'success' && (
          <div className="flex items-center justify-between mb-3">
            <div className="w-6" />
            <div className="h-1 w-10 rounded-full bg-[var(--color-line)] sm:hidden" />
            <button onClick={onClose} aria-label="Close" className="p-1 -mr-1">
              <X className="h-5 w-5 text-[var(--color-ink-soft)]" />
            </button>
          </div>
        )}

        {step === 'amount' && (
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden">
              {person.avatarUrl ? (
                <img src={person.avatarUrl} alt={initials(person)} className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-lg text-[var(--color-mink-deep)]">{initials(person)}</span>
              )}
            </div>
            <p className="font-display font-bold text-base mt-2">Request from {person.name ?? `@${person.handle}`}</p>
            <p className="text-xs text-[var(--color-ink-soft)]">@{person.handle}</p>

            <div className="mt-5 flex items-center justify-center gap-1.5">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-3xl text-[var(--color-ink-soft)]/50">$</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  className="font-display font-bold text-5xl w-36 text-center outline-none bg-transparent"
                />
              </div>
              <button className="flex items-center gap-0.5 text-xs text-[var(--color-ink-soft)]/60 rounded-full border border-[var(--color-line)] px-2 py-1 mt-2">
                USD <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => addQuickAmount(amt)}
                  className="text-xs font-semibold rounded-full bg-[var(--color-mink-tint)] text-[var(--color-mink-deep)] px-3 py-1.5 hover:bg-[var(--color-mink-light)] transition-colors"
                >
                  +${amt}
                </button>
              ))}
            </div>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this for?"
              className="mt-5 w-full rounded-full border border-[var(--color-line)] px-5 py-3 text-sm text-center outline-none focus:border-[var(--color-mink)] transition-colors"
            />

            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {CATEGORY_PILLS.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setNote(`${cat.emoji} ${cat.label}`)}
                  className="text-xs rounded-full bg-[var(--color-mink-tint)] text-[var(--color-mink-deep)] px-3 py-1.5 hover:bg-[var(--color-mink-light)] transition-colors"
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <div className="flex gap-2.5 w-full mt-7">
              <button
                onClick={onClose}
                className="flex-1 rounded-full border border-[var(--color-line)] font-semibold py-3.5 hover:bg-[var(--color-mink-tint)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                disabled={!canContinue}
                className="flex-1 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-3.5 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-40"
              >
                Request
              </button>
            </div>
          </div>
        )}

        {step === 'sending' && (
          <div className="flex flex-col items-center text-center py-10">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--color-mink-tint)]" />
              <div className="absolute inset-0 rounded-full border-4 border-[var(--color-mink)] border-t-transparent animate-spin" />
            </div>
            <p className="font-display font-bold text-lg mt-6">Sending your request…</p>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">to {person.name ?? `@${person.handle}`}</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center text-center py-4">
            <p className="font-display font-bold text-2xl mt-4">Request sent</p>
            <p className="text-[var(--color-ink-soft)] mt-1">
              ${numericAmount.toFixed(2)} requested from {person.name ?? `@${person.handle}`}
            </p>
            <button
              onClick={onClose}
              className="w-full mt-7 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-4 hover:bg-[var(--color-mink-deep)] transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center text-center py-6">
            <p className="font-display font-bold text-lg mt-4">Request couldn't be sent</p>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">{error}</p>
            <div className="flex gap-2.5 w-full mt-7">
              <button
                onClick={onClose}
                className="flex-1 rounded-full border border-[var(--color-line)] font-semibold py-3.5 hover:bg-[var(--color-mink-tint)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('amount')}
                className="flex-1 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-3.5 hover:bg-[var(--color-mink-deep)] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
