import { useState } from 'react'
import type { MouseEvent } from 'react'
import { ChevronRight, Copy, Check } from 'lucide-react'
import type { ReactNode } from 'react'

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-7">
      <p className="text-[12px] uppercase tracking-[0.08em] font-medium text-[var(--color-ink-soft)]/55 mb-2.5">
        {title}
      </p>
      <div className="rounded-2xl bg-white border border-[var(--color-line)] shadow-sm divide-y divide-[var(--color-line)]">
        {children}
      </div>
    </div>
  )
}

export function SettingsRow({
  label,
  value,
  onClick,
  danger = false,
  trailing,
  copyValue,
}: {
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
  trailing?: ReactNode
  copyValue?: string
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: MouseEvent) {
    e.stopPropagation()
    if (!copyValue) return
    navigator.clipboard.writeText(copyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const content = (
    <>
      <span className={`text-sm font-medium ${danger ? 'text-red-500' : ''}`}>{label}</span>
      <span className="flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
        {value}
        {copyValue && (
          <button
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
            className="p-1 -m-1 rounded-full hover:bg-[var(--color-mink-tint)] transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[var(--color-moss)]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
        {trailing ?? (onClick && <ChevronRight className="h-4 w-4" />)}
      </span>
    </>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full min-h-[57px] flex items-center justify-between px-5 hover:bg-[var(--color-mink-tint)]/40 transition-colors"
      >
        {content}
      </button>
    )
  }

  return <div className="min-h-[57px] flex items-center justify-between px-5">{content}</div>
}
