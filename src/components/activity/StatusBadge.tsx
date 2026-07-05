import type { ActivityStatus } from './types'

const STYLES: Record<ActivityStatus, string> = {
  completed: 'bg-[var(--color-moss)]/12 text-[var(--color-moss)]',
  pending: 'bg-[var(--color-mink)]/12 text-[var(--color-mink-deep)]',
  failed: 'bg-red-500/10 text-red-500',
  cancelled: 'bg-[var(--color-ink-soft)]/10 text-[var(--color-ink-soft)]',
}

const LABELS: Record<ActivityStatus, string> = {
  completed: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export default function StatusBadge({ status }: { status: ActivityStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}