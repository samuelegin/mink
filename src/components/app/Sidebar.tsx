import { Home, QrCode, Activity, User, LogOut } from 'lucide-react'
import type { Tab } from './BottomNav'
import { useAuth } from '../../context/AuthContext'

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'pay', label: 'Pay', icon: QrCode },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'you', label: 'You', icon: User },
]

export default function Sidebar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const { logout } = useAuth()

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[220px] flex-col border-r border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-6">
      <div className="flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-lg bg-[var(--color-ink)] flex items-center justify-center shrink-0">
          <span className="text-[var(--color-paper)] font-display font-bold text-sm">m</span>
        </div>
        <span className="font-display font-bold text-lg">mink</span>
      </div>

      <nav className="flex flex-col gap-1 mt-10">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-mink-tint)] text-[var(--color-mink-deep)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-mink-tint)]/50'
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex flex-col gap-1">
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-mink-tint)]/50 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  )
}
