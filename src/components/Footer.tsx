import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="mink" className="h-6 w-6 object-contain" />
          <span className="font-display font-semibold text-sm">mink</span>
        </div>

        <p className="text-xs text-[var(--color-ink-soft)] font-mono">
          Built for the UXmaxx Hackathon · Particle Network · Arbitrum · Magic
        </p>

        <div className="flex items-center gap-5 text-sm text-[var(--color-ink-soft)]">
          <a href="#how" className="hover:text-[var(--color-ink)] transition-colors">How it works</a>
          <a href="#community" className="hover:text-[var(--color-ink)] transition-colors">Community</a>
        </div>
      </div>
    </footer>
  )
}