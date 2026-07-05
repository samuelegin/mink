import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'

type OnboardingIllustrationProps = {
  src?: string
  alt: string
  className?: string
  delayMs?: number
  eager?: boolean
}

export default function OnboardingIllustration({
  src,
  alt,
  className = '',
  delayMs = 0,
  eager = false,
}: OnboardingIllustrationProps) {
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setVisible(false)
  }, [src])

  useEffect(() => {
    if (!loaded) return
    const timeout = setTimeout(() => setVisible(true), delayMs)
    return () => clearTimeout(timeout)
  }, [loaded, delayMs])

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      {src ? (
        <>
          <div
            className="absolute inset-0 rounded-3xl bg-[var(--color-mink-tint)]/30 animate-pulse"
            style={{ opacity: loaded ? 0 : 1, transition: 'opacity 0.3s ease-out' }}
          />
          <img
            src={src}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            onLoad={() => setLoaded(true)}
            className="max-w-full max-h-full w-auto h-auto object-contain relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
            }}
          />
        </>
      ) : (
        <div className="w-full h-full max-w-xs rounded-3xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-mink-tint)]/40 flex flex-col items-center justify-center gap-2 text-[var(--color-ink-soft)]/50">
          <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
          <span className="text-xs font-medium">Illustration coming soon</span>
        </div>
      )}
    </div>
  )
}
