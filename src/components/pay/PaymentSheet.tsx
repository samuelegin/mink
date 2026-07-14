import { useEffect, useRef, useState } from 'react'
import { X, ArrowLeft, ChevronDown } from 'lucide-react'
import type { PayContact } from './types'
import { friendlyPaymentError, type PaymentPreview } from '../../lib/paymentClient'
import { universalPaymentClient as paymentClient } from '../../lib/universalPaymentClient'
import { useCountUp } from '../../hooks/useCountUp'

type Step = 'amount' | 'confirm' | 'sending' | 'success' | 'error'

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
  }, deps)
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.98)',
    transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
  } as const
}

export default function PaymentSheet({
  person,
  onClose,
  onSettled,
}: {
  person: PayContact
  onClose: () => void
  onSettled?: () => void
}) {
  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState<PaymentPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const cardStyle = useFadeIn([step])
  const closableRef = useRef(true)

  const numericAmount = parseFloat(amount || '0')
  const canContinue = numericAmount > 0

  function addQuickAmount(delta: number) {
    const current = parseFloat(amount || '0')
    setAmount((current + delta).toFixed(2).replace(/\.00$/, ''))
  }

  async function goToConfirm() {
    setStep('confirm')
    setError(null)
    try {
      const result = await paymentClient.previewPayment({
        handle: person.handle,
        amount: numericAmount,
        note,
      })
      setPreview(result)
    } catch (err) {
      console.error('Preview failed', err)
      setError(friendlyPaymentError(err))
      setStep('amount')
    }
  }

  async function pollUntilSettled(transactionId: string, maxAttempts = 15, intervalMs = 3000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await paymentClient.getTransactionStatus(transactionId)
      if (status.status === 'completed') return
      if (status.status === 'failed') throw new Error('Payment failed on-chain.')
      await new Promise((r) => setTimeout(r, intervalMs))
    }
    // Gave up watching after ~45s, but the tx may still land later — don't
    // claim failure, just stop blocking the UI on it.
  }

  async function handleSend() {
    if (!preview) return
    setStep('sending')
    closableRef.current = false
    try {
      const result = await paymentClient.executePayment(preview, note)
      if (result.status === 'pending') {
        await pollUntilSettled(result.transactionId)
      } else if (result.status === 'failed') {
        throw new Error('Payment failed on-chain.')
      }
      setStep('success')
      onSettled?.()
    } catch (err) {
      console.error('Payment failed', err)
      setError(friendlyPaymentError(err))
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
          <AmountStep
            person={person}
            amount={amount}
            setAmount={setAmount}
            note={note}
            setNote={setNote}
            canContinue={canContinue}
            error={error}
            onQuickAmount={addQuickAmount}
            onCancel={onClose}
            onContinue={goToConfirm}
          />
        )}

        {step === 'confirm' && (
          <ConfirmStep person={person} preview={preview} onSend={handleSend} />
        )}

        {step === 'sending' && <SendingStep person={person} />}

        {step === 'success' && preview && (
          <SuccessStep person={person} amount={preview.total} onClose={onClose} />
        )}

        {step === 'error' && (
          <ErrorStep
            reason={error}
            onRetry={() => setStep('confirm')}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  )
}

function AmountStep({
  person,
  amount,
  setAmount,
  note,
  setNote,
  canContinue,
  error,
  onQuickAmount,
  onCancel,
  onContinue,
}: {
  person: PayContact
  amount: string
  setAmount: (v: string) => void
  note: string
  setNote: (v: string) => void
  canContinue: boolean
  error: string | null
  onQuickAmount: (delta: number) => void
  onCancel: () => void
  onContinue: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden">
        {person.avatarUrl ? (
          <img src={person.avatarUrl} alt={initials(person)} className="w-full h-full object-cover" />
        ) : (
          <span className="font-semibold text-lg text-[var(--color-mink-deep)]">{initials(person)}</span>
        )}
      </div>
      <p className="font-display font-bold text-base mt-2">{person.name ?? `@${person.handle}`}</p>
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
            onClick={() => onQuickAmount(amt)}
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
          onClick={onCancel}
          className="flex-1 rounded-full border border-[var(--color-line)] font-semibold py-3.5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="flex-1 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-3.5 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function ConfirmStep({
  person,
  preview,
  onSend,
}: {
  person: PayContact
  preview: PaymentPreview | null
  onSend: () => void
}) {
  const animatedTotal = useCountUp(preview?.total ?? 0)

  if (!preview) {
    return (
      <div className="flex flex-col items-center py-10">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--color-mink)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--color-ink-soft)] mt-4">Preparing your payment…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center py-2">
      <p className="text-sm text-[var(--color-ink-soft)]">Sending</p>
      <p className="font-display font-bold text-5xl mt-1">${animatedTotal.toFixed(2)}</p>
      <p className="text-sm text-[var(--color-ink-soft)] mt-1">to</p>
      <div className="flex items-center gap-2 mt-2">
        <div className="h-8 w-8 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden">
          <span className="font-semibold text-sm text-[var(--color-mink-deep)]">{initials(person)}</span>
        </div>
        <p className="font-semibold">{person.name ?? `@${person.handle}`}</p>
      </div>

      <div className="w-full rounded-2xl bg-white border border-[var(--color-line)] mt-6 divide-y divide-[var(--color-line)] text-left">
        <Row label="Network" value={preview.sourceChain} />
        <Row label="Fee" value={preview.networkFee === 0 ? 'Free' : `$${preview.networkFee.toFixed(2)}`} />
        <Row label="Estimated arrival" value={preview.estimatedArrival} />
      </div>

      <div className="w-full flex items-center justify-between mt-4 px-1">
        <span className="font-semibold">Total</span>
        <span className="font-display font-bold text-lg">${preview.total.toFixed(2)}</span>
      </div>

      <button
        onClick={onSend}
        className="w-full mt-6 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-4 hover:bg-[var(--color-mink-deep)] transition-colors"
      >
        Send Payment
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[var(--color-ink-soft)]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function SendingStep({ person }: { person: PayContact }) {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--color-mink-tint)]" />
        <div className="absolute inset-0 rounded-full border-4 border-[var(--color-mink)] border-t-transparent animate-spin" />
      </div>
      <p className="font-display font-bold text-lg mt-6">Sending your payment…</p>
      <p className="text-sm text-[var(--color-ink-soft)] mt-1">
        to {person.name ?? `@${person.handle}`}
      </p>
      <p className="text-xs text-[var(--color-ink-soft)]/70 mt-4">Please don't close this window.</p>
    </div>
  )
}

function SuccessStep({
  person,
  amount,
  onClose,
}: {
  person: PayContact
  amount: number
  onClose: () => void
}) {
  const style = useFadeIn([])
  return (
    <div style={style} className="flex flex-col items-center text-center py-4">
      <img src="/pay/success.webp" alt="Mascot celebrating a successful payment" className="h-32 object-contain" />
      <p className="font-display font-bold text-2xl mt-4">Money sent</p>
      <p className="text-[var(--color-ink-soft)] mt-1">
        ${amount.toFixed(2)} sent to {person.name ?? `@${person.handle}`}
      </p>
      <p className="text-xs text-[var(--color-ink-soft)]/70 mt-1">On its way — usually settles within a minute.</p>

      <button
        onClick={onClose}
        className="w-full mt-7 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-4 hover:bg-[var(--color-mink-deep)] transition-colors"
      >
        Done
      </button>
      <button className="w-full mt-2.5 rounded-full text-sm font-medium text-[var(--color-ink-soft)] py-2.5 hover:bg-[var(--color-mink-tint)] transition-colors">
        View receipt
      </button>
    </div>
  )
}

function ErrorStep({
  reason,
  onRetry,
  onCancel,
}: {
  reason: string | null
  onRetry: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <img src="/home/empty-activity.webp" alt="Mascot looking concerned" className="h-28 object-contain" />
      <p className="font-display font-bold text-lg mt-4">Payment couldn't be completed</p>
      <p className="text-sm text-[var(--color-ink-soft)] mt-1">{reason ?? 'Something went wrong.'}</p>

      <div className="flex gap-2.5 w-full mt-7">
        <button
          onClick={onCancel}
          className="flex-1 rounded-full border border-[var(--color-line)] font-semibold py-3.5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          className="flex-1 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-3.5 hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}