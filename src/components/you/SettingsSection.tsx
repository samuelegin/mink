import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-7">
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mb-2.5">{title}</p>
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
}: {
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
  trailing?: ReactNode
}) {
  const content = (
    <>
      <span className={`text-sm font-medium ${danger ? 'text-red-500' : ''}`}>{label}</span>
      <span className="flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
        {value}
        {trailing ?? (onClick && <ChevronRight className="h-4 w-4" />)}
      </span>
    </>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-mink-tint)]/40 transition-colors"
      >
        {content}
      </button>
    )
  }

  return <div className="flex items-center justify-between px-5 py-4">{content}</div>
}
