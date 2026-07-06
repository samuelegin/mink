import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const CHAINS = ['Arbitrum', 'Base', 'Ethereum', 'Polygon']

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function UniversalAccountCard({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  function copyAddress() {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mt-6 rounded-2xl bg-white border border-[var(--color-line)] shadow-sm p-5">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-base">Universal Account</p>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-moss)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-moss)]" />
          Active
        </span>
      </div>

      <p className="text-sm text-[var(--color-ink-soft)] mt-1.5">
        One address across every supported chain.
      </p>

      <div className="flex flex-wrap gap-1.5 mt-3.5">
        {CHAINS.map((chain) => (
          <span
            key={chain}
            className="text-xs font-medium rounded-full bg-[var(--color-mink-tint)] text-[var(--color-mink-deep)] px-2.5 py-1"
          >
            {chain}
          </span>
        ))}
      </div>

      <button
        onClick={copyAddress}
        className="w-full flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] font-medium text-sm py-2.5 mt-4 hover:bg-[var(--color-mink-tint)] transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : `View Address · ${truncateAddress(address)}`}
      </button>
    </div>
  )
}
