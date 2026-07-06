import { useState } from 'react'
import { Share2, QrCode, Copy, Check } from 'lucide-react'

const CHAINS = [
  { name: 'Arbitrum', ticker: 'ARB' },
  { name: 'Base', ticker: 'BASE' },
  { name: 'Ethereum', ticker: 'ETH' },
  { name: 'Polygon', ticker: 'POL' },
]

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
    <div className="relative rounded-3xl bg-white border border-[var(--color-line)] shadow-sm px-7 py-8 flex flex-col items-center text-center overflow-hidden">
      {/* faint radial glow behind the avatar */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full"
        style={{ background: 'radial-gradient(circle, #F8F4EE 0%, transparent 70%)' }}
      />

      <div className="relative h-20 w-20 rounded-full bg-[var(--color-mink)] text-white flex items-center justify-center font-display font-bold text-2xl shadow-md">
        {name.charAt(0).toUpperCase()}
      </div>

      <p className="relative font-display font-bold text-[32px] leading-tight mt-4">@{handle}</p>
      <p className="relative text-sm text-[var(--color-ink-soft)] mt-0.5">{name}</p>

      <div className="relative w-full rounded-2xl bg-[var(--color-mink-tint)]/60 border border-[var(--color-mink)]/15 px-5 py-4 mt-6">
        <p className="font-semibold text-sm">Universal Account</p>

        <div className="flex items-center justify-center divide-x divide-[var(--color-mink)]/15 mt-3">
          <Metric value={String(CHAINS.length)} label="Chains" />
          <Metric value="1" label="Address" />
          <Metric value={truncateAddress(address)} label="Wallet" small />
        </div>

        <button
          onClick={copyAddress}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-white border border-[var(--color-line)] font-medium text-sm py-3 mt-4 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-[var(--color-moss)]" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Copied' : truncateAddress(address)}</span>
          {!copied && <span className="text-[var(--color-ink-soft)]">Copy</span>}
        </button>

        <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3">
          {CHAINS.map((chain) => (
            <span
              key={chain.ticker}
              className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full bg-white border border-[var(--color-line)] px-2.5 py-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-mink-deep)]" />
              {chain.ticker}
            </span>
          ))}
        </div>
      </div>

      <div className="relative w-full flex flex-col gap-2.5 mt-6">
        <button
          onClick={onShare}
          className="w-full flex items-center justify-center gap-1.5 h-12 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share Profile
        </button>
        <button
          onClick={onShowQR}
          className="flex items-center justify-center gap-1.5 h-9 rounded-full text-sm font-medium text-[var(--color-ink-soft)] px-4 mx-auto hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          <QrCode className="h-3.5 w-3.5" />
          Show QR
        </button>
      </div>
    </div>
  )
}

function Metric({ value, label, small = false }: { value: string; label: string; small?: boolean }) {
  return (
    <div className="flex-1 px-2">
      <p className={`font-display font-bold ${small ? 'text-sm' : 'text-lg'}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-ink-soft)]/60 mt-0.5">{label}</p>
    </div>
  )
}
