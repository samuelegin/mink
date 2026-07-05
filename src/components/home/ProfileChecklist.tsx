import { Check, ChevronRight, UserRound, UserPlus } from 'lucide-react'

type ChecklistItem = {
  key: string
  label: string
  done: boolean
  icon: typeof AtSign
  onClick: () => void
}

export default function ProfileChecklist({
  onAddAvatar,
  onInvite,
}: {
  onAddAvatar: () => void
  onInvite: () => void
}) {
  const items: ChecklistItem[] = [
    { key: 'avatar', label: 'Add avatar', done: false, icon: UserRound, onClick: onAddAvatar },
    { key: 'invite', label: 'Invite friends', done: false, icon: UserPlus, onClick: onInvite },
  ]

  return (
    <div>
      <h3 className="font-display font-bold text-base">Complete your profile</h3>
      <div className="mt-3 flex flex-col divide-y divide-[var(--color-line)]">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={item.onClick}
            className="flex items-center gap-3 py-3 text-left w-full group"
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                item.done ? 'bg-[var(--color-moss)] text-white' : 'bg-[var(--color-mink-tint)] text-[var(--color-mink-deep)]'
              }`}
            >
              {item.done ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
            </div>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-[var(--color-ink-soft)]/40 group-hover:text-[var(--color-ink-soft)] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}
