import { useState } from 'react'
import { Share2, QrCode, Copy, Check, ShieldCheck } from 'lucide-react'
import { CHAIN_ID, UNIVERSAL_ACCOUNT_VERSION_V2_SUPPORTED_CHAIN_IDS } from '@particle-network/universal-account-sdk'
import { CHAIN_ICON_SVG } from './chainIcons'

// Name + official brand icon per chain, keyed by the SDK's own CHAIN_ID enum
// so this can't silently drift from what the Universal Account actually
// supports.
const CHAIN_META: Record<number, { name: string; icon: string }> = {
  [CHAIN_ID.ETHEREUM_MAINNET]: { name: 'Ethereum', icon: 'ethereum' },
  [CHAIN_ID.ARBITRUM_MAINNET_ONE]: { name: 'Arbitrum', icon: 'arbitrum' },
  [CHAIN_ID.BASE_MAINNET]: { name: 'Base', icon: 'base' },
  [CHAIN_ID.BSC_MAINNET]: { name: 'BNB Chain', icon: 'bnb' },
  [CHAIN_ID.SOLANA_MAINNET]: { name: 'Solana', icon: 'solana' },
  [CHAIN_ID.XLAYER_MAINNET]: { name: 'X Layer', icon: 'xlayer' },
}

const CHAINS = (UNIVERSAL_ACCOUNT_VERSION_V2_SUPPORTED_CHAIN_IDS as number[])
  .map((id) => CHAIN_META[id])
  .filter((chain): chain is { name: string; icon: string } => Boolean(chain))

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function ChainBadge({ chain }: { chain: { name: string; icon: string } }) {
  return (
    <div
      title={chain.name}
      className="group relative h-[22px] w-[22px] rounded-full bg-white ring-1 ring-black/5 flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:ring-white/50 cursor-default"
    >
      <span
        className="h-3.5 w-3.5 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: CHAIN_ICON_SVG[chain.icon] }}
      />
    </div>
  )
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
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-card-settle relative rounded-[28px] bg-white shadow-[0_1px_2px_rgba(22,20,15,0.04),0_16px_40px_-16px_rgba(22,20,15,0.14)] px-6 py-8 sm:px-10 sm:py-9 max-w-[760px] w-full mx-auto">
      {/* ---------- Hero: identity ---------- */}
      <div className="relative flex flex-col items-center text-center">
        <div
          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, var(--color-mink-light) 0%, transparent 72%)' }}
        />

        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[var(--color-mink)] to-[var(--color-mink-deep)] text-white flex items-center justify-center font-display font-bold text-2xl shadow-[0_8px_24px_-6px_rgba(107,65,40,0.55)] ring-4 ring-white">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="relative mt-4 flex items-center gap-1.5">
          <h2 className="font-display font-bold text-[30px] sm:text-[36px] leading-none tracking-tight">
            @{handle}
          </h2>
          <ShieldCheck
            className="h-5 w-5 text-[var(--color-mink)] shrink-0"
            aria-label="Verified handle"
          />
        </div>
        <p className="relative text-sm text-[var(--color-ink-soft)]/80 mt-1">{name}</p>

        <span className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mink-tint)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--color-mink-deep)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-moss)]" />
          Universal crypto identity
        </span>
      </div>

      {/* ---------- Universal Account card ---------- */}
      <div className="relative mt-6 rounded-[24px] p-[1px] bg-gradient-to-br from-[var(--color-mink)]/70 via-[var(--color-mink-deep)] to-[var(--color-ink)] shadow-[0_20px_45px_-20px_rgba(22,20,15,0.55)]">
        <div className="relative overflow-hidden rounded-[23px] bg-gradient-to-br from-[#3A2A1D] via-[var(--color-ink)] to-[#0E0D0A] px-6 py-4 sm:px-8 sm:py-5">
          {/* inner highlight sheen, top edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[var(--color-mink)]/25 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">
            <h3 className="font-display font-semibold text-white text-[13px]">Universal Account</h3>
            <span className="text-[11px] font-medium text-white/50 whitespace-nowrap">
              {CHAINS.length} Networks
            </span>
          </div>

          <div className="relative flex items-center justify-between gap-4 mt-2.5">
            <span className="font-mono text-[19px] sm:text-[21px] text-white tracking-wide truncate">
              {truncateAddress(address)}
            </span>
            <button
              onClick={copyAddress}
              aria-label={copied ? 'Address copied' : 'Copy wallet address'}
              className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white/50 transition-all duration-200 hover:text-white hover:bg-white/10 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[#7CD9A8] animate-pop-check" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="relative flex items-center gap-2.5 mt-3">
            {CHAINS.map((chain) => (
              <ChainBadge key={chain.name} chain={chain} />
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="relative flex items-center justify-center gap-2.5 mt-6">
        <button
          onClick={onShare}
          className="group flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-gradient-to-b from-[#2A2620] to-[var(--color-ink)] text-white font-semibold text-[13.5px] shadow-[0_10px_24px_-8px_rgba(22,20,15,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_rgba(22,20,15,0.55)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mink)]"
        >
          <Share2 className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          Share Profile
        </button>
        <button
          onClick={onShowQR}
          className="flex items-center justify-center gap-1.5 h-11 px-5 rounded-full text-[13.5px] font-medium text-[var(--color-ink-soft)] border border-[var(--color-line)] transition-colors duration-200 hover:bg-[var(--color-mink-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mink)]/40"
        >
          <QrCode className="h-3.5 w-3.5" />
          QR Code
        </button>
      </div>
    </div>
  )
}
