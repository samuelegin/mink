import { Search } from 'lucide-react'

export default function PaySearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-white border border-[var(--color-line)] h-14 px-5 shadow-sm">
      <Search className="h-5 w-5 text-[var(--color-ink-soft)]/50 shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search @handle, name or phone"
        className="flex-1 outline-none bg-transparent text-base placeholder:text-[var(--color-ink-soft)]/50"
      />
    </div>
  )
}
