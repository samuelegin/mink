import type { ActivityEntry } from './types'

export default function InsightsSidebar({ entries }: { entries: ActivityEntry[] }) {
  const hasData = entries.length > 0

  const totalSent = entries.filter((e) => e.kind === 'sent').reduce((sum, e) => sum + e.amount, 0)
  const sentCount = entries.filter((e) => e.kind === 'sent').length
  const average = sentCount > 0 ? totalSent / sentCount : 0

  return (
    <div className="hidden lg:flex flex-col gap-6 w-[260px] shrink-0">
      <InsightRow label="Most paid friend" value={hasData ? '—' : 'No data yet'} />
      <InsightRow label="Most received from" value={hasData ? '—' : 'No data yet'} />
      <InsightRow label="Average payment" value={hasData ? `$${average.toFixed(2)}` : '—'} />

      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mb-2">Top contacts</p>
        {hasData ? (
          <div className="flex flex-col gap-1">{/* populate once real contact frequency data exists */}</div>
        ) : (
          <p className="text-sm text-[var(--color-ink-soft)]">Send a few payments and your top contacts will show up here.</p>
        )}
      </div>
    </div>
  )
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60">{label}</p>
      <p className="font-display font-bold text-lg mt-1">{value}</p>
    </div>
  )
}