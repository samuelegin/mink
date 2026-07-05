import { ArrowUp, ArrowDown, Users, QrCode } from 'lucide-react'

type Action = { icon: typeof ArrowUp; label: string; onClick: () => void }

export default function QuickActions({
  onSend,
  onRequest,
  onSplit,
  onScan,
}: {
  onSend: () => void
  onRequest: () => void
  onSplit: () => void
  onScan: () => void
}) {
  const actions: Action[] = [
    { icon: ArrowUp, label: 'Send', onClick: onSend },
    { icon: ArrowDown, label: 'Request', onClick: onRequest },
    { icon: Users, label: 'Split', onClick: onSplit },
    { icon: QrCode, label: 'QR', onClick: onScan },
  ]

  return (
    <div className="flex items-start justify-center gap-9 lg:justify-evenly lg:gap-0 lg:max-w-[600px] lg:mx-auto">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="group flex flex-col items-center gap-2"
        >
          <div className="h-14 w-14 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center transition-all duration-200 group-hover:bg-[var(--color-mink-light)] group-hover:-translate-y-0.5 group-active:scale-90">
            <action.icon className="h-5 w-5 text-[var(--color-mink-deep)]" strokeWidth={2} />
          </div>
          <span className="text-xs font-medium text-[var(--color-ink-soft)]">{action.label}</span>
        </button>
      ))}
    </div>
  )
}
