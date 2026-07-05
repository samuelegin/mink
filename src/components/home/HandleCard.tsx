import { Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function HandleCard({
  handle,
  onClaim,
}: {
  handle?: string
  onClaim: () => void
}) {
  const [copied, setCopied] = useState(false)

  function copyHandle() {
    if (!handle) return
    navigator.clipboard.writeText(`@${handle}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!handle) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-mink-tint)] p-5 text-center">
        <p className="font-display font-bold text-base">Claim your handle</p>
        <p className="text-xs text-[var(--color-ink-soft)] mt-1">
          A permanent @handle anyone can pay you at.
        </p>
        <button
          onClick={onClaim}
          className="mt-4 w-full rounded-full bg-[var(--color-mink)] text-white font-semibold text-sm py-2.5 hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          Claim handle
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <p className="text-xs text-[var(--color-ink-soft)]">Your handle</p>
      <p className="font-display font-bold text-xl mt-0.5">@{handle}</p>
      <div className="flex gap-2 mt-4">
        <button className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] text-sm font-medium py-2.5 hover:bg-[var(--color-mink-tint)] transition-colors">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
        <button
          onClick={copyHandle}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] text-sm font-medium py-2.5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
