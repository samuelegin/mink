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
    <div className="flex flex-col items-center text-center lg:max-h-[260px]">
      <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-full bg-[var(--color-mink)] text-white flex items-center justify-center font-display font-bold text-2xl lg:text-3xl border border-black/10 shadow-md">
        {name.charAt(0).toUpperCase()}
      </div>

      <p className="font-display font-bold text-xl mt-3 lg:mt-2.5">{name}</p>
      <p className="text-[var(--color-ink-soft)]">@{handle}</p>
      <p className="text-sm text-[var(--color-ink-soft)] mt-2 lg:mt-1.5">Friends pay you using your handle.</p>

      <div className="flex gap-2.5 mt-5 lg:mt-4 w-full max-w-xs lg:max-w-none lg:w-auto lg:justify-center">
        <button
          onClick={onShare}
          className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold text-sm py-2.5 lg:py-0 lg:h-11 lg:px-5 hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share Handle
        </button>
        <button
          onClick={onShowQR}
          className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] font-semibold text-sm py-2.5 lg:py-0 lg:h-11 lg:px-5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          <QrCode className="h-4 w-4" />
          QR Code
        </button>
      </div>
    </div>
  )
}
