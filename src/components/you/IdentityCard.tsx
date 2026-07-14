import { useState } from 'react'
import { Share2, QrCode, Copy, Check, ShieldCheck } from 'lucide-react'
import { CHAIN_ID, UNIVERSAL_ACCOUNT_VERSION_V2_SUPPORTED_CHAIN_IDS } from '@particle-network/universal-account-sdk'

// Ticker + brand color per chain, keyed by the SDK's own CHAIN_ID enum so this
// can't silently drift from what the Universal Account actually supports.
const CHAIN_META: Record<number, { name: string; ticker: string; color: string }> = {
  [CHAIN_ID.ETHEREUM_MAINNET]: { name: 'Ethereum', ticker: 'ETH', color: '#627EEA' },
  [CHAIN_ID.ARBITRUM_MAINNET_ONE]: { name: 'Arbitrum', ticker: 'ARB', color: '#28A0F0' },
  [CHAIN_ID.BASE_MAINNET]: { name: 'Base', ticker: 'BASE', color: '#0052FF' },
  [CHAIN_ID.BSC_MAINNET]: { name: 'BNB Chain', ticker: 'BNB', color: '#F0B90B' },
  [CHAIN_ID.SOLANA_MAINNET]: { name: 'Solana', ticker: 'SOL', color: '#14B896' },
  [CHAIN_ID.XLAYER_MAINNET]: { name: 'X Layer', ticker: 'XL', color: '#A8A29E' },
}

const CHAINS = (UNIVERSAL_ACCOUNT_VERSION_V2_SUPPORTED_CHAIN_IDS as number[])
  .map((id) => CHAIN_META[id])
  .filter((chain): chain is { name: string; ticker: string; color: string } => Boolean(chain))

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function ChainChip({ chain }: { chain: { name: string; ticker: string; color: string } }) {
  return (
    <span
      title={chain.name}
      className="group inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/12 pl-2 pr-3 py-1.5 text-[12px] font-semibold text-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white/14 hover:border-white/25 hover:-translate-y-0.5 cursor-default"
    >
      <span
        className="h-2 w-2 rounded-full transition-transform duration-200 group-hover:scale-125"
        style={{ backgroundColor: chain.color, boxShadow: `0 0 8px 0 ${chain.color}66` }}
      />
      {chain.ticker}
    </span>
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
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="animate-card-settle relative rounded-[28px] bg-white shadow-[0_1px_2px_rgba(22,20,15,0.04),0_16px_40px_-16px_rgba(22,20,15,0.14)] px-6 py-10 sm:px-10 sm:py-12 max-w-[760px] w-full mx-auto">
      {/* ---------- Hero: identity ---------- */}
      <div className="relative flex flex-col items-center text-center">
        <div
          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, var(--color-mink-light) 0%, transparent 72%)' }}
        />

        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-[var(--color-mink)] to-[var(--color-mink-deep)] text-white flex items-center justify-center font-display font-bold text-3xl shadow-[0_8px_24px_-6px_rgba(107,65,40,0.55)] ring-4 ring-white">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="relative mt-6 flex items-center gap-1.5">
          <h2 className="font-display font-bold text-[34px] sm:text-[42px] leading-none tracking-tight">
            @{handle}
          </h2>
          <ShieldCheck
            className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--color-mink)] shrink-0"
            aria-label="Verified handle"
          />
        </div>
        <p className="relative text-sm text-[var(--color-ink-soft)]/80 mt-1">{name}</p>

        <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mink-tint)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--color-mink-deep)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-moss)]" />
          Universal crypto identity
        </span>
      </div>

      {/* ---------- Universal Account card ---------- */}
      <div className="relative mt-9 rounded-[24px] p-[1px] bg-gradient-to-br from-[var(--color-mink)]/70 via-[var(--color-mink-deep)] to-[var(--color-ink)] shadow-[0_20px_45px_-20px_rgba(22,20,15,0.55)]">
        <div className="relative overflow-hidden rounded-[23px] bg-gradient-to-br from-[#3A2A1D] via-[var(--color-ink)] to-[#0E0D0A] px-6 py-7 sm:px-8 sm:py-8">
          {/* inner highlight sheen, top edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[var(--color-mink)]/25 blur-3xl" />

          <div className="relative flex items-baseline justify-between gap-3">
            <h3 className="font-display font-semibold text-white text-lg">Universal Account</h3>
            <span className="text-[11px] font-medium text-white/50 whitespace-nowrap">
              {CHAINS.length} chains
            </span>
          </div>
          <p className="relative text-[13px] text-white/55 mt-1">One address. Multiple chains.</p>

          <button
            onClick={copyAddress}
            aria-label={copied ? 'Address copied' : 'Copy wallet address'}
            className="relative w-full mt-5 flex items-center justify-between gap-3 rounded-2xl bg-white/8 border border-white/12 backdrop-blur-sm px-5 py-3.5 transition-all duration-200 hover:bg-white/12 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.99]"
          >
            <span className="font-mono text-[15px] text-white tracking-wide">{truncateAddress(address)}</span>
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-white/70">
              {copied ? (
                <>
                  <Check key="check" className="h-4 w-4 text-[#7CD9A8] animate-pop-check" />
                  <span className="text-[#7CD9A8]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </span>
          </button>

          <div className="relative flex flex-wrap items-center gap-2 mt-5">
            {CHAINS.map((chain) => (
              <ChainChip key={chain.ticker} chain={chain} />
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="relative flex flex-col gap-3 mt-8">
        <button
          onClick={onShare}
          className="group w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-gradient-to-b from-[#2A2620] to-[var(--color-ink)] text-white font-semibold text-[15px] shadow-[0_10px_24px_-8px_rgba(22,20,15,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_rgba(22,20,15,0.55)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mink)]"
        >
          <Share2 className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          Share Profile
        </button>
        <button
          onClick={onShowQR}
          className="w-full flex items-center justify-center gap-1.5 h-11 rounded-2xl text-sm font-medium text-[var(--color-ink-soft)] transition-colors duration-200 hover:bg-[var(--color-mink-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mink)]/40"
        >
          <QrCode className="h-4 w-4" />
          Show QR
        </button>
      </div>
    </div>
  )
}
