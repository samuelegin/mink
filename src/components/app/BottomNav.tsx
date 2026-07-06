import { Home, QrCode, Activity, User } from 'lucide-react'

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
              aria-label="Send money"
              className="h-14 w-14 -translate-y-2 cursor-pointer active:scale-95 hover:scale-105 transition-transform duration-200"
            >
              <div
                className="fab-mascot h-full w-full rounded-full overflow-hidden border-2 border-white"
                style={{ boxShadow: '0 10px 25px rgba(0,0,0,.18)' }}
              >
                <img
                  src="/nav/fab-mascot.webp"
                  alt="Mink AI Assistant"
                  className="h-full w-full object-cover"
                />
              </div>
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