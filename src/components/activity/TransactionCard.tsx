import StatusBadge from './StatusBadge'
import { relativeTime } from './activityUtils'
import type { ActivityEntry } from './types'

function displayName(entry: ActivityEntry) {
  return entry.counterpartyName ?? `@${entry.counterpartyHandle}`
}

export default function TransactionCard({
  entry,
  onSelect,
}: {
  entry: ActivityEntry
  onSelect: (entry: ActivityEntry) => void
}) {
  const isReceived = entry.kind === 'received'
  const sign = isReceived ? '+' : '-'
  const amountColor = isReceived ? 'text-[var(--color-moss)]' : 'text-[var(--color-ink)]'

  return (
    <button
      onClick={() => onSelect(entry)}
      className="w-full text-left rounded-[22px] bg-white border border-[var(--color-line)] shadow-sm p-4 flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
    >
      <div className="h-12 w-12 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden shrink-0">
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt={displayName(entry)} className="w-full h-full object-cover" />
        ) : (
          <span className="font-semibold text-[var(--color-mink-deep)]">
            {displayName(entry).replace('@', '').charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {isReceived ? (
            <>
              {displayName(entry)} <span className="text-[var(--color-ink-soft)] font-normal">paid you</span>
            </>
          ) : (
            <>
              <span className="text-[var(--color-ink-soft)] font-normal">You paid</span> {displayName(entry)}
            </>
          )}
        </p>
        {entry.message && <p className="text-sm text-[var(--color-ink-soft)] truncate mt-0.5">{entry.message}</p>}
        <p className="text-xs text-[var(--color-ink-soft)]/70 mt-1">{relativeTime(entry.timestamp)}</p>
      </div>

      <div className="text-right shrink-0">
        <p className={`font-semibold text-base ${amountColor}`}>
          {sign}${entry.amount.toFixed(2)}
        </p>
        <div className="mt-1.5">
          <StatusBadge status={entry.status} />
        </div>
      </div>
    </button>
  )
}