import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { ActivityEntry } from './types'

export default function TransactionDetailSheet({
  entry,
  onClose,
}: {
  entry: ActivityEntry
  onClose: () => void
}) {
  const isReceived = entry.kind === 'received'
  const name = entry.counterpartyName ?? `@${entry.counterpartyHandle}`
  const date = new Date(entry.timestamp)

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-stretch justify-center lg:justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full lg:w-[420px] lg:h-full bg-[var(--color-paper)] rounded-t-3xl lg:rounded-none lg:rounded-l-3xl px-6 pt-5 pb-8 max-h-[85vh] lg:max-h-none overflow-y-auto">
        <div className="flex items-center justify-end mb-2">
          <button onClick={onClose} aria-label="Close" className="p-1">
            <X className="h-5 w-5 text-[var(--color-ink-soft)]" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="h-20 w-20 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden">
            {entry.avatarUrl ? (
              <img src={entry.avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-semibold text-2xl text-[var(--color-mink-deep)]">
                {name.replace('@', '').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="font-display font-bold text-lg mt-3">{name}</p>
          <p className="text-sm text-[var(--color-ink-soft)]">@{entry.counterpartyHandle}</p>

          <p className={`font-display font-bold text-4xl mt-6 ${isReceived ? 'text-[var(--color-moss)]' : ''}`}>
            {isReceived ? '+' : '-'}${entry.amount.toFixed(2)}
          </p>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">{isReceived ? `${name} paid you` : `You paid ${name}`}</p>

          {entry.message && (
            <div className="mt-5 w-full rounded-2xl bg-[var(--color-mink-tint)] px-4 py-3">
              <p className="text-sm">{entry.message}</p>
            </div>
          )}

          <div className="w-full flex flex-col divide-y divide-[var(--color-line)] mt-6">
            <DetailRow label="Date" value={date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} />
            <DetailRow label="Time" value={date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} />
            <DetailRow label="Status" value={<StatusBadge status={entry.status} />} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-[var(--color-ink-soft)]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}