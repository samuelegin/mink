import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'

type EmptyStateIllustrationProps = {
  image?: string
  alt: string
  title: string
  subtitle?: string
  tag?: string
  compact?: boolean
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyStateIllustration({
  image,
  alt,
  title,
  subtitle,
  tag,
  compact = false,
  actionLabel,
  onAction,
}: EmptyStateIllustrationProps) {
  const [visible, setVisible] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [image])

  useEffect(() => {
    setImageLoaded(false)
  }, [image])

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      {tag && (
        <span className="mb-3 inline-flex items-center rounded-full bg-[var(--color-mink-tint)] px-3 py-1 text-xs font-medium text-[var(--color-mink-deep)]">
          {tag}
        </span>
      )}

      <div className={`relative ${compact ? 'h-24 w-24' : 'h-44 w-44 sm:h-52 sm:w-52'}`}>
        {image ? (
          <>
            <div
              className="absolute inset-0 rounded-2xl bg-[var(--color-mink-tint)]/30 animate-pulse"
              style={{ opacity: imageLoaded ? 0 : 1, transition: 'opacity 0.3s ease-out' }}
            />
            <img
              src={image}
              alt={alt}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className="w-full h-full object-contain relative"
              style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.4s ease-out' }}
            />
          </>
        ) : (
          <div className="w-full h-full rounded-3xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-mink-tint)]/40 flex items-center justify-center text-[var(--color-ink-soft)]/50">
            <ImageIcon className="h-7 w-7" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <p className={`font-display font-bold ${compact ? 'text-sm mt-2' : 'text-lg mt-3'}`}>{title}</p>
      {subtitle && <p className="text-xs text-[var(--color-ink-soft)] mt-1 max-w-[220px]">{subtitle}</p>}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 rounded-full bg-[var(--color-mink)] text-white text-xs font-semibold px-4 py-2 hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
