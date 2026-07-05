import { useState } from 'react'
import { Pencil, Share2, Copy, Check } from 'lucide-react'

export default function ProfileActions({
  handle,
  onEdit,
  onShare,
}: {
  handle: string
  onEdit: () => void
  onShare: () => void
}) {
  const [copied, setCopied] = useState(false)

  function copyHandle() {
    navigator.clipboard.writeText(`@${handle}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
      <button
        onClick={onEdit}
        className="flex-1 flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] font-semibold py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
      >
        <Pencil className="h-4 w-4" />
        Edit Profile
      </button>
      <button
        onClick={onShare}
        className="flex-1 flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] font-semibold py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share Profile
      </button>
      <button
        onClick={copyHandle}
        className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold py-3 hover:bg-[var(--color-mink-deep)] transition-colors"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied' : 'Copy Handle'}
      </button>
    </div>
  )
}
