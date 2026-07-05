export type ActivityFilter = 'all' | 'sent' | 'received' | 'pending' | 'week' | 'month'

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'sent', label: 'Sent' },
  { id: 'received', label: 'Received' },
  { id: 'pending', label: 'Pending' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
]

export default function FilterChips({
  active,
  onChange,
}: {
  active: ActivityFilter
  onChange: (filter: ActivityFilter) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const isActive = active === filter.id
        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                : 'bg-white border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:bg-[var(--color-mink-tint)]'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}