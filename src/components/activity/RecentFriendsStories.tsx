import { tinyRelativeTime, type RecentFriend } from './activityUtils'

const RING_COLOR: Record<RecentFriend['lastKind'], string> = {
  received: 'ring-[var(--color-moss)]',
  sent: 'ring-[var(--color-mink)]',
}

function isRecent(iso: string) {
  return Date.now() - new Date(iso).getTime() < 24 * 3600000
}

function firstName(friend: RecentFriend) {
  return (friend.name ?? friend.handle).split(' ')[0]
}

export default function RecentFriendsStories({
  friends,
  onSelect,
}: {
  friends: RecentFriend[]
  onSelect: (friend: RecentFriend) => void
}) {
  if (friends.length === 0) {
    return (
      <div className="flex justify-start gap-5 overflow-x-auto scrollbar-none snap-x">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-16 snap-start">
            <div className="h-16 w-16 rounded-full bg-[var(--color-mink-tint)] animate-pulse" />
            <div className="h-2.5 w-10 rounded-full bg-[var(--color-mink-tint)] animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-start gap-5 overflow-x-auto scrollbar-none snap-x px-1">
      {friends.map((friend, i) => {
        const active = i === 0
        const recent = isRecent(friend.lastTimestamp)
        const ringColor = recent ? RING_COLOR[friend.lastKind] : 'ring-[var(--color-line)]'
        const size = active ? 'h-[68px] w-[68px]' : 'h-14 w-14'

        return (
          <button
            key={friend.handle}
            onClick={() => onSelect(friend)}
            className="flex flex-col items-center gap-1.5 shrink-0 w-16 sm:w-[72px] snap-start transition-transform hover:scale-105"
          >
            <div className={`${size} rounded-full ring-2 ${ringColor} p-[2px] transition-all ${active ? 'scale-105' : ''}`}>
              <div className="h-full w-full rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden">
                {friend.avatarUrl ? (
                  <img src={friend.avatarUrl} alt={firstName(friend)} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-semibold text-[var(--color-mink-deep)]">
                    {firstName(friend).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs font-medium truncate w-full text-center">{firstName(friend)}</p>
            <p className="text-[10px] text-[var(--color-ink-soft)]/70">{tinyRelativeTime(friend.lastTimestamp)}</p>
          </button>
        )
      })}
    </div>
  )
}
