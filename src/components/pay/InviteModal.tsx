import { useState } from 'react'
import { X, Copy, Check, Share2, Mail } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const INVITE_URL = 'https://mink.app/invite'
const INVITE_TEXT = 'Send money like a message. Join me on Mink.'

export default function InviteModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  function copyLink() {
    navigator.clipboard.writeText(INVITE_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function nativeShare() {
    navigator.share({ title: 'Join me on Mink', text: INVITE_TEXT, url: INVITE_URL }).catch(() => {})
  }

  function openDiscord() {
    // Discord has no public URL scheme for pre-filling a shared link into a DM,
    // so the best honest UX is: copy the link, then hand off to Discord to paste it.
    navigator.clipboard.writeText(INVITE_URL)
    showToast('Link copied — paste it in Discord')
    window.open('https://discord.com/app', '_blank')
  }

  const platforms = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${INVITE_TEXT} ${INVITE_URL}`)}`,
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(INVITE_URL)}&text=${encodeURIComponent(INVITE_TEXT)}`,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(INVITE_TEXT)}&url=${encodeURIComponent(INVITE_URL)}`,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-[var(--color-paper)] rounded-t-3xl sm:rounded-3xl px-7 pt-5 pb-8 sm:pb-6">
        <div className="flex items-center justify-end mb-2">
          <button onClick={onClose} aria-label="Close" className="p-1">
            <X className="h-5 w-5 text-[var(--color-ink-soft)]" />
          </button>
        </div>

        <div className="text-center">
          <p className="font-display font-bold text-lg">Invite friends</p>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            Invite friends to Mink and start sending money like a message.
          </p>
        </div>

        <button
          onClick={copyLink}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] font-medium text-sm py-3 mt-5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-[var(--color-moss)]" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy invite link'}
        </button>

        {canNativeShare && (
          <button
            onClick={nativeShare}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-white font-semibold text-sm py-3 mt-2.5 hover:bg-[var(--color-mink-deep)] transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share…
          </button>
        )}

        <div className="grid grid-cols-4 gap-2.5 mt-5">
          {platforms.map((p) => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--color-line)] py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
            >
              <span className="text-xs font-medium">{p.label}</span>
            </a>
          ))}
          <button
            onClick={openDiscord}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--color-line)] py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
          >
            <span className="text-xs font-medium">Discord</span>
          </button>
        </div>

        <a
          href={`mailto:?subject=${encodeURIComponent('Join me on Mink')}&body=${encodeURIComponent(`${INVITE_TEXT} ${INVITE_URL}`)}`}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] font-medium text-sm py-3 mt-2.5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          <Mail className="h-4 w-4" />
          Email
        </a>
      </div>
    </div>
  )
}
