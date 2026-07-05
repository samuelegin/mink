type Achievement = { emoji: string; label: string; earned: boolean }

export default function AchievementsRow({ achievements }: { achievements: Achievement[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mb-2.5">Achievements</p>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none">
        {achievements.map((a) => (
          <div
            key={a.label}
            className={`shrink-0 flex items-center gap-2 rounded-full border px-3.5 py-2 transition-opacity ${
              a.earned
                ? 'border-[var(--color-line)] bg-white opacity-100'
                : 'border-[var(--color-line)] bg-[var(--color-mink-tint)]/30 opacity-45'
            }`}
          >
            <span className="text-base">{a.emoji}</span>
            <span className="text-xs font-medium whitespace-nowrap">{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { emoji: '🎉', label: 'First Payment', earned: false },
  { emoji: '💸', label: 'Paid 10 Friends', earned: false },
  { emoji: '🤝', label: 'First Split Bill', earned: false },
  { emoji: '🏆', label: '100 Payments', earned: false },
]
