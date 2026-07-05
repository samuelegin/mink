import EmptyStateIllustration from '../home/EmptyStateIllustration'

export default function WelcomeCard({
  onShare,
  onInvite,
}: {
  onShare: () => void
  onInvite: () => void
}) {
  return (
    <div className="rounded-3xl bg-white border border-[var(--color-line)] shadow-sm py-8 px-6">
      <EmptyStateIllustration
        image="/home/no-friends.png"
        alt="Mascot waving hello"
        title="Welcome to Mink"
        subtitle="Claim your handle, add friends, and start sending money like a message."
      />
      <div className="flex flex-col sm:flex-row gap-2.5 max-w-sm mx-auto mt-6">
        <button
          onClick={onShare}
          className="flex-1 rounded-full bg-[var(--color-mink)] text-white font-semibold py-3 hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          Share Your Handle
        </button>
        <button
          onClick={onInvite}
          className="flex-1 rounded-full border border-[var(--color-line)] font-semibold py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          Invite Friends
        </button>
      </div>
    </div>
  )
}
