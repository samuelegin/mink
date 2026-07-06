import { useState } from 'react'
import { Share2, QrCode, Copy, Check, Globe } from 'lucide-react'

const CHAINS = ['Arbitrum', 'Base', 'Ethereum', 'Polygon']

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function IdentityCard({
  name,
  handle,
  address,
  onShare,
  onShowQR,
}: {
  name: string
  handle: string
  address: string
  onShare: () => void
  onShowQR: () => void
}) {
  const [copied, setCopied] = useState(false)

  function copyAddress() {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-3xl bg-white border border-[var(--color-line)] shadow-sm px-7 py-7 flex flex-col items-center text-center">
      <div className="h-20 w-20 rounded-full bg-[var(--color-mink)] text-white flex items-center justify-center font-display font-bold text-2xl shadow-md">
        {name.charAt(0).toUpperCase()}
      </div>

      <p className="font-display font-bold text-[28px] leading-tight mt-3">{name}</p>
      <p className="text-base text-[var(--color-ink-soft)] mt-0.5">@{handle}</p>

      <div className="w-full h-px bg-[var(--color-line)] mt-5" />

      <div className="w-full mt-5">
        <p className="flex items-center justify-center gap-1.5 font-semibold text-sm">
          <Globe className="h-4 w-4 text-[var(--color-mink-deep)]" />
          Universal Account
        </p>
        <p className="flex items-center justify-center gap-1.5 text-sm text-[var(--color-ink-soft)] mt-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-moss)]" />
          Active on {CHAINS.length} chains
        </p>

        <button
          onClick={copyAddress}
          className="w-full flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] font-medium text-sm py-2.5 mt-4 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : truncateAddress(address)}
        </button>

        <p className="text-xs text-[var(--color-ink-soft)]/70 mt-3">{CHAINS.join(' · ')}</p>
      </div>

      <div className="w-full h-px bg-[var(--color-line)] mt-5" />

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 h-11 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold text-sm px-5 hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share Profile
        </button>
        <button
          onClick={onShowQR}
          className="flex items-center justify-center gap-1.5 h-11 rounded-full border border-[var(--color-line)] font-semibold text-sm px-5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          <QrCode className="h-4 w-4" />
          Show QR
        </button>
      </div>
    </div>
  )
}
