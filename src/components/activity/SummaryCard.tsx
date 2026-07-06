import { useCountUp } from '../../hooks/useCountUp'

function Metric({
  label,
  value,
  colorClass,
  sign,
  showBorder,
}: {
  label: string
  value: number
  colorClass: string
  sign: string
  showBorder: boolean
}) {
  const animated = useCountUp(value)

  return (
    <div className={`flex-1 flex flex-col items-center text-center px-2 ${showBorder ? 'sm:border-l sm:border-[var(--color-line)]' : ''}`}>
      <p className="text-sm font-medium text-[var(--color-ink-soft)]">{label}</p>
      <p className={`font-display font-bold text-2xl sm:text-3xl mt-1 ${colorClass}`}>
        {sign}${animated.toFixed(2)}
      </p>
    </div>
  )
}

export default function SummaryCard({
  received,
  sent,
}: {
  received: number
  sent: number
}) {
  const net = received - sent
  const netSign = net > 0 ? '+' : net < 0 ? '-' : ''
  const netColor =
    net > 0 ? 'text-[var(--color-moss)]' : net < 0 ? 'text-red-500' : 'text-[var(--color-ink)]'

  return (
    <div className="rounded-[20px] bg-white border border-[var(--color-line)] shadow-sm p-6">
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 text-center sm:text-left">
        This Month
      </p>
      <div className="flex items-center justify-between mt-3">
        <Metric label="Received" value={received} colorClass="text-[var(--color-moss)]" sign="+" showBorder={false} />
        <Metric label="Sent" value={sent} colorClass="text-[var(--color-ink)]" sign="-" showBorder />
        <Metric label="Net" value={Math.abs(net)} colorClass={netColor} sign={netSign} showBorder />
      </div>
    </div>
  )
}
