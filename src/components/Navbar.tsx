import logo from '../assets/logo.png'

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-paper)]/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo} alt="mink" className="h-8 w-8 object-contain" />
          <span className="font-display font-bold text-lg tracking-tight">mink</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-ink-soft)]">
          <a href="#how" className="hover:text-[var(--color-ink)] transition-colors">How it works</a>
          <a href="#balance" className="hover:text-[var(--color-ink)] transition-colors">Universal balance</a>
          <a href="#community" className="hover:text-[var(--color-ink)] transition-colors">Community</a>
        </nav>

        <a
          href="#get-started"
          className="rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-semibold px-5 py-2.5 hover:bg-[var(--color-mink-deep)] transition-colors"
        >
          Get started
        </a>
      </div>
    </header>
  )
}