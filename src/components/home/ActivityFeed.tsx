import EmptyStateIllustration from './EmptyStateIllustration'

export type ActivityItem = {
  id: string
  kind: 'received' | 'sent' | 'requested'
  counterparty: string
  amount: number
  note?: string
  timestamp: string
}

function formatAmount(item: ActivityItem) {
  const sign = item.kind === 'sent' ? '-' : '+'
  return `${sign}$${item.amount.toFixed(2)}`
}

function amountColor(item: ActivityItem) {
  if (item.kind === 'sent') return 'text-[var(--color-ink)]'
  return 'text-[var(--color-moss)]'
}

function description(item: ActivityItem) {
  if (item.kind === 'received') return `${item.counterparty} paid you`
  if (item.kind === 'sent') return `You paid ${item.counterparty}`
  return `${item.counterparty} requested`
}

export default function ActivityFeed({
  items = [],
  onSendMoney,
}: {
  items?: ActivityItem[]
  onSendMoney?: () => void
}) {
  return (
    <div>
      <h3 className="font-display font-bold text-base">Activity</h3>

      {items.length === 0 ? (
        <div className="mt-3 pt-4 border-t border-[var(--color-line)]">
          <EmptyStateIllustration
            image="/home/empty-activity.png"
            alt="Mascot looking through a magnifying glass beside an empty activity card"
            title="Your payments will appear here"
            subtitle="Send money to your first friend."
            compact
            actionLabel={onSendMoney ? 'Send money' : undefined}
            onAction={onSendMoney}
          />
        </div>
      ) : (
        <div className="mt-3 flex flex-col divide-y divide-[var(--color-line)]">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{description(item)}</p>
                {item.note && <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">{item.note}</p>}
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${amountColor(item)}`}>{formatAmount(item)}</p>
                <p className="text-[11px] text-[var(--color-ink-soft)]/70 mt-0.5">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}