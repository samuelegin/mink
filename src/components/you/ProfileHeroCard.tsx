import { Share2, QrCode } from 'lucide-react'

export default function ProfileHeroCard({
  name,
  handle,
  onShare,
  onShowQR,
}: {
  name: string
  handle: string
  onShare: () => void
  onShowQR: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="h-20 w-20 rounded-full bg-[var(--color-mink)] text-white flex items-center justify-center font-display font-bold text-2xl shadow-md">
        {name.charAt(0).toUpperCase()}
      </div>

      <p className="font-display font-bold text-[34px] leading-tight mt-3">{name}</p>
      <p className="text-base text-[var(--color-ink-soft)] mt-0.5">@{handle}</p>

      <p className="flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] mt-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-moss)]" />
        Universal Account · Active
      </p>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 h-11 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold text-sm px-5 hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share Handle
        </button>
        <button
          onClick={onShowQR}
          className="flex items-center justify-center gap-1.5 h-11 rounded-full border border-[var(--color-line)] font-semibold text-sm px-5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          <QrCode className="h-4 w-4" />
          QR Code
        </button>
      </div>
    </div>
  )
}
