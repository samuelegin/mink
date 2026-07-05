import { Home, QrCode, ArrowUp, Activity, User } from 'lucide-react'

export type Tab = 'home' | 'pay' | 'activity' | 'you'

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'pay', label: 'Pay', icon: QrCode },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'you', label: 'You', icon: User },
]

export default function BottomNav({
  active,
  onChange,
  onSend,
}: {
  active: Tab
  onChange: (tab: Tab) => void
  onSend: () => void
}) {
  const left = TABS.slice(0, 2)
  const right = TABS.slice(2)

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur">
      <div className="mx-auto max-w-md px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 items-center h-16">
          {left.map((tab) => (
            <TabButton key={tab.id} tab={tab} active={active === tab.id} onClick={() => onChange(tab.id)} />
          ))}

          <div className="flex justify-center">
            <button
              onClick={onSend}
              aria-label="Send"
              className="h-12 w-12 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center -translate-y-2 shadow-lg hover:bg-[var(--color-mink-deep)] transition-colors"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          {right.map((tab) => (
            <TabButton key={tab.id} tab={tab} active={active === tab.id} onClick={() => onChange(tab.id)} />
          ))}
        </div>
      </div>
    </nav>
  )
}

function TabButton({
  tab,
  active,
  onClick,
}: {
  tab: { id: Tab; label: string; icon: typeof Home }
  active: boolean
  onClick: () => void
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 h-full transition-colors ${
        active ? 'text-[var(--color-mink-deep)]' : 'text-[var(--color-ink-soft)]/60'
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
      <span className={`text-[11px] ${active ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
    </button>
  )
}