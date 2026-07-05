import { useState } from 'react'
import { X, Check, ArrowLeft } from 'lucide-react'
import type { PayContact } from './types'

type Step = 'amount' | 'confirm' | 'success'

const SUGGESTED_NOTES = [
  { emoji: '🍕', label: 'Dinner' },
  { emoji: '☕', label: 'Coffee' },
  { emoji: '🎉', label: 'Gift' },
  { emoji: '🏠', label: 'Rent' },
]

function initials(person: PayContact) {
  return (person.name ?? person.handle).charAt(0).toUpperCase()
}

export default function PaymentSheet({
  person,
  onClose,
  onSend,
}: {
  person: PayContact
  onClose: () => void
  onSend: (amount: number, message: string) => Promise<void>
}) {
  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const numericAmount = parseFloat(amount || '0')
  const canContinue = numericAmount > 0

  async function handleConfirmSend() {
    setSending(true)
    setError(null)
    try {
      await onSend(numericAmount, message)
      setStep('success')
    } catch (err) {
      console.error('Send failed', err)
      setError('Something went wrong sending that. Try again.')
      setStep('amount')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={step === 'success' ? undefined : onClose} />

      <div className="relative w-full sm:max-w-md bg-[var(--color-paper)] rounded-t-3xl sm:rounded-3xl px-6 pt-5 pb-8 sm:pb-6 max-h-[90vh] overflow-y-auto">
        {step !== 'success' && (
          <div className="flex items-center justify-between mb-4">
            {step === 'confirm' ? (
              <button onClick={() => setStep('amount')} aria-label="Back" className="p-1 -ml-1">
                <ArrowLeft className="h-5 w-5 text-[var(--color-ink-soft)]" />
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div className="h-1 w-10 rounded-full bg-[var(--color-line)] sm:hidden" />
            <button onClick={onClose} aria-label="Close" className="p-1 -mr-1">
              <X className="h-5 w-5 text-[var(--color-ink-soft)]" />
            </button>
          </div>
        )}

        {step === 'amount' && (
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden">
              {person.avatarUrl ? (
                <img src={person.avatarUrl} alt={initials(person)} className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-xl text-[var(--color-mink-deep)]">{initials(person)}</span>
              )}
            </div>
            <p className="font-display font-bold text-lg mt-3">{person.name ?? `@${person.handle}`}</p>
            <p className="text-sm text-[var(--color-ink-soft)]">@{person.handle}</p>

            <div className="mt-8 flex items-baseline justify-center gap-1">
              <span className="font-display font-bold text-3xl text-[var(--color-ink-soft)]/50">$</span>
              <input
                autoFocus
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className="font-display font-bold text-5xl w-40 text-center outline-none bg-transparent"
              />
            </div>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's this for?"
              className="mt-6 w-full rounded-full border border-[var(--color-line)] px-5 py-3 text-sm text-center outline-none focus:border-[var(--color-mink)] transition-colors"
            />

            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {SUGGESTED_NOTES.map((note) => (
                <button
                  key={note.label}
                  onClick={() => setMessage(note.emoji + ' ' + note.label)}
                  className="text-xs rounded-full bg-[var(--color-mink-tint)] text-[var(--color-mink-deep)] px-3 py-1.5 hover:bg-[var(--color-mink-light)] transition-colors"
                >
                  {note.emoji} {note.label}
                </button>
              ))}
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <div className="flex gap-2.5 w-full mt-8">
              <button
                onClick={onClose}
                className="flex-1 rounded-full border border-[var(--color-line)] font-semibold py-3.5 hover:bg-[var(--color-mink-tint)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!canContinue}
                className="flex-1 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-3.5 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="flex flex-col items-center text-center py-4">
            <p className="text-sm text-[var(--color-ink-soft)]">You're about to send</p>
            <p className="font-display font-bold text-5xl mt-2">${numericAmount.toFixed(2)}</p>
            <p className="text-sm text-[var(--color-ink-soft)] mt-2">to</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-8 w-8 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden">
                <span className="font-semibold text-sm text-[var(--color-mink-deep)]">{initials(person)}</span>
              </div>
              <p className="font-semibold">{person.name ?? `@${person.handle}`}</p>
            </div>
            {message && <p className="text-sm text-[var(--color-ink-soft)] mt-3">{message}</p>}

            <button
              onClick={handleConfirmSend}
              disabled={sending}
              className="w-full mt-10 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-4 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-60"
            >
              {sending ? 'Sending…' : `Send $${numericAmount.toFixed(2)}`}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center text-center py-6 relative">
            <div className="absolute -top-2 left-1/4 text-2xl float-slow">✨</div>
            <div className="absolute top-4 right-1/4 text-xl float-slow" style={{ animationDelay: '0.6s' }}>
              🎉
            </div>
            <div className="h-16 w-16 rounded-full bg-[var(--color-moss)] text-white flex items-center justify-center">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <p className="font-display font-bold text-2xl mt-5">Money sent.</p>
            <p className="text-sm text-[var(--color-ink-soft)] mt-1">
              ${numericAmount.toFixed(2)} to {person.name ?? `@${person.handle}`}
            </p>
            <button
              onClick={onClose}
              className="w-full mt-8 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-4 hover:bg-[var(--color-mink-deep)] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
