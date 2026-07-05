export default function SummaryCard({
  received,
  sent,
}: {
  received: number
  sent: number
}) {
  const net = received - sent
  const netSign = net >= 0 ? '+' : '-'

  return (
    <div className="rounded-2xl bg-white border border-[var(--color-line)] shadow-sm px-5 py-4 flex items-center justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-ink-soft)]/60">This Month</p>
        <div className="flex items-center gap-5 mt-1.5">
          <span className="text-sm">
            <span className="text-[var(--color-ink-soft)]">Received </span>
            <span className="font-semibold text-[var(--color-moss)]">+${received.toFixed(0)}</span>
          </span>
          <span className="text-sm">
            <span className="text-[var(--color-ink-soft)]">Sent </span>
            <span className="font-semibold">-${sent.toFixed(0)}</span>
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-ink-soft)]/60">Net</p>
        <p className="font-display font-bold text-xl mt-0.5">
          {netSign}${Math.abs(net).toFixed(0)}
        </p>
      </div>
    </div>
  )
}