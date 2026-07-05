import EmptyStateIllustration from './EmptyStateIllustration'

export type Person = {
  handle: string
  name: string
  status: string
  avatarUrl?: string
}

export default function RecentPeople({
  people = [],
  onInvite,
}: {
  people?: Person[]
  onInvite?: () => void
}) {
  return (
    <div>
      <h3 className="font-display font-bold text-base">Recent people</h3>

      {people.length === 0 ? (
        <div className="mt-2">
          <EmptyStateIllustration
            image="/home/no-friends.png"
            alt="Mascot waving toward empty avatar circles waiting for new friends"
            title="No friends yet"
            subtitle="Invite friends to start sending money."
            compact
            actionLabel={onInvite ? 'Invite friends' : undefined}
            onAction={onInvite}
          />
        </div>
      ) : (
        <div className="mt-3 flex gap-4 overflow-x-auto lg:flex-wrap pb-1">
          {people.map((person) => (
            <button
              key={person.handle}
              className="flex flex-col items-center gap-1.5 shrink-0 lg:shrink w-16 lg:w-auto hover:opacity-80 transition-opacity"
            >
              <div className="h-12 w-12 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden">
                {person.avatarUrl ? (
                  <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-semibold text-[var(--color-mink-deep)]">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate w-full text-center">{person.name}</span>
              <span className="text-[10px] text-[var(--color-ink-soft)] truncate w-full text-center">
                {person.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
