import type { PayContact } from './types'

export default function RecentPeoplePay({
  people,
  onSelect,
}: {
  people: PayContact[]
  onSelect: (person: PayContact) => void
}) {
  if (people.length === 0) return null

  return (
    <div>
      <h3 className="font-display font-bold text-base mb-3">Recent people</h3>
      <div className="flex gap-3 overflow-x-auto lg:flex-wrap pb-1">
        {people.map((person) => (
          <button
            key={person.handle}
            onClick={() => onSelect(person)}
            className="flex flex-col items-center gap-2 shrink-0 w-24 rounded-2xl bg-white border border-[var(--color-line)] py-4 px-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            <div className="h-14 w-14 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden shrink-0">
              {person.avatarUrl ? (
                <img src={person.avatarUrl} alt={person.name ?? person.handle} className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-lg text-[var(--color-mink-deep)]">
                  {(person.name ?? person.handle).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium truncate w-20">{person.name ?? `@${person.handle}`}</p>
              {person.lastPayment && (
                <p className="text-[11px] text-[var(--color-ink-soft)] truncate w-20">{person.lastPayment}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
