import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'

type OnboardingIllustrationProps = {
  src?: string
  alt: string
  className?: string
  delayMs?: number
}

export default function OnboardingIllustration({ src, alt, className = '', delayMs = 0 }: OnboardingIllustrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const timeout = setTimeout(() => setVisible(true), delayMs)
    return () => clearTimeout(timeout)
  }, [src, delayMs])

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="max-w-full max-h-full w-auto h-auto object-contain"
        />
      ) : (
        <div className="w-full h-full max-w-xs rounded-3xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-mink-tint)]/40 flex flex-col items-center justify-center gap-2 text-[var(--color-ink-soft)]/50">
          <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
          <span className="text-xs font-medium">Illustration coming soon</span>
        </div>
      )}
    </div>
  )
}
