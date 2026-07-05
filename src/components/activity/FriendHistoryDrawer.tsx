import { X } from 'lucide-react'
import { relativeTime } from './activityUtils'
import type { ActivityEntry } from './types'
import type { RecentFriend } from './activityUtils'

export default function FriendHistoryDrawer({
  friend,
  entries,
  onClose,
  onSend,
  onRequest,
}: {
  friend: RecentFriend
  entries: ActivityEntry[]
  onClose: () => void
  onSend: () => void
  onRequest: () => void
}) {
  const name = friend.name ?? `@${friend.handle}`
  const netSign = friend.netBalance >= 0 ? '+' : '-'

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-stretch justify-center lg:justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full lg:w-[420px] lg:h-full bg-[var(--color-paper)] rounded-t-3xl lg:rounded-none lg:rounded-l-3xl px-6 pt-5 pb-8 max-h-[85vh] lg:max-h-none overflow-y-auto">
        <div className="flex items-center justify-end mb-2">
          <button onClick={onClose} aria-label="Close" className="p-1">
            <X className="h-5 w-5 text-[var(--color-ink-soft)]" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden">
            {friend.avatarUrl ? (
              <img src={friend.avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-semibold text-2xl text-[var(--color-mink-deep)]">
                {name.replace('@', '').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="font-display font-bold text-lg mt-3">{name}</p>
          <p className="text-sm text-[var(--color-ink-soft)]">@{friend.handle}</p>

          <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mt-5">Net balance</p>
          <p className={`font-display font-bold text-3xl mt-1 ${friend.netBalance >= 0 ? 'text-[var(--color-moss)]' : ''}`}>
            {netSign}${Math.abs(friend.netBalance).toFixed(2)}
          </p>

          <div className="flex gap-2.5 w-full mt-6">
            <button
              onClick={onSend}
              className="flex-1 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-3 hover:bg-[var(--color-mink-deep)] transition-colors"
            >
              Send Money
            </button>
            <button
              onClick={onRequest}
              className="flex-1 rounded-full border border-[var(--color-line)] font-semibold py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
            >
              Request
            </button>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mb-2">Recent payments</p>
          <div className="flex flex-col divide-y divide-[var(--color-line)]">
            {entries.map((entry) => {
              const isReceived = entry.kind === 'received'
              return (
                <div key={entry.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{isReceived ? 'Paid you' : 'You paid'}</p>
                    {entry.message && <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">{entry.message}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isReceived ? 'text-[var(--color-moss)]' : ''}`}>
                      {isReceived ? '+' : '-'}${entry.amount.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-[var(--color-ink-soft)]/70 mt-0.5">{relativeTime(entry.timestamp)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
