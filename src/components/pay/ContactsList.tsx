import { ChevronRight, BadgeCheck } from 'lucide-react'
import EmptyStateIllustration from '../home/EmptyStateIllustration'
import type { PayContact } from './types'

export default function ContactsList({
  contacts,
  onSelect,
  onInvite,
  onScan,
}: {
  contacts: PayContact[]
  onSelect: (person: PayContact) => void
  onInvite: () => void
  onScan: () => void
}) {
  if (contacts.length === 0) {
    return (
      <div className="pt-2">
        <EmptyStateIllustration
          image="/home/no-friends.webp"
          alt="Mascot looking around for friends to add"
          title="No contacts yet"
          subtitle="Invite friends and start sending money instantly."
        />
        <div className="flex flex-col gap-2.5 max-w-xs mx-auto mt-6">
          <button
            onClick={onInvite}
            className="w-full rounded-full bg-[var(--color-mink)] text-white font-semibold py-3 hover:bg-[var(--color-mink-deep)] transition-colors"
          >
            Invite Friends
          </button>
          <button
            onClick={onScan}
            className="w-full rounded-full border border-[var(--color-line)] font-semibold py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
          >
            Scan QR
          </button>
        </div>
      </div>
    )
  }

  const sorted = [...contacts].sort((a, b) => (a.name ?? a.handle).localeCompare(b.name ?? b.handle))

  return (
    <div>
      <h3 className="font-display font-bold text-base mb-2">Contacts</h3>
      <div className="flex flex-col divide-y divide-[var(--color-line)]">
        {sorted.map((person) => (
          <button
            key={person.handle}
            onClick={() => onSelect(person)}
            className="flex items-center gap-3 py-3.5 text-left w-full hover:bg-[var(--color-mink-tint)]/40 -mx-2 px-2 rounded-xl transition-colors"
          >
            <div className="h-11 w-11 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden shrink-0">
              {person.avatarUrl ? (
                <img src={person.avatarUrl} alt={person.name ?? person.handle} className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-[var(--color-mink-deep)]">
                  {(person.name ?? person.handle).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{person.name ?? `@${person.handle}`}</p>
              <div className="flex items-center gap-1">
                <p className="text-xs text-[var(--color-ink-soft)] truncate">@{person.handle}</p>
                {person.verified && <BadgeCheck className="h-3.5 w-3.5 text-[var(--color-moss)] shrink-0" />}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--color-ink-soft)]/40 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
