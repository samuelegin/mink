export default function Logo({
  size = 'md',
  showWordmark = true,
}: {
  size?: 'sm' | 'md'
  showWordmark?: boolean
}) {
  const badgeSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
  const iconSize = size === 'sm' ? 'h-5 w-5' : 'h-5.5 w-5.5'
  const wordmarkSize = size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <div className="flex items-center gap-2">
      <div className={`${badgeSize} rounded-lg bg-[var(--color-mink-tint)] border border-[var(--color-line)] flex items-center justify-center shrink-0`}>
        <img src="/logo-mark.webp" alt="" className={`${iconSize} w-auto object-contain`} />
      </div>
      {showWordmark && <span className={`font-display font-bold ${wordmarkSize}`}>mink</span>}
    </div>
  )
}
