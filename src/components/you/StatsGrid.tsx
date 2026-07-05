export default function StatsGrid({
  received,
  sent,
  friendsPaid,
  requestsCompleted,
}: {
  received: number
  sent: number
  friendsPaid: number
  requestsCompleted: number
}) {
  const stats = [
    { label: 'Received', value: `+$${received.toFixed(0)}`, color: 'text-[var(--color-moss)]' },
    { label: 'Sent', value: `-$${sent.toFixed(0)}`, color: '' },
    { label: 'Friends Paid', value: String(friendsPaid), color: '' },
    { label: 'Requests Completed', value: String(requestsCompleted), color: '' },
  ]

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mb-2.5">This Month</p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white border border-[var(--color-line)] shadow-sm p-4">
            <p className="text-xs text-[var(--color-ink-soft)]">{stat.label}</p>
            <p className={`font-display font-bold text-xl mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
