import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${
        checked ? 'bg-[var(--color-moss)]' : 'bg-[var(--color-line)]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function PreferencesCard() {
  const [notifications, setNotifications] = useState(true)
  const [privacy, setPrivacy] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="rounded-2xl bg-white border border-[var(--color-line)] shadow-sm divide-y divide-[var(--color-line)]">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-medium">Receive notifications</span>
        <Toggle checked={notifications} onChange={setNotifications} />
      </div>
      <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-mink-tint)]/40 transition-colors">
        <span className="text-sm font-medium">Default currency</span>
        <span className="flex items-center gap-1 text-sm text-[var(--color-ink-soft)]">
          USD <ChevronRight className="h-4 w-4" />
        </span>
      </button>
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-medium">Private profile</span>
        <Toggle checked={privacy} onChange={setPrivacy} />
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-medium">Dark mode</span>
        <Toggle checked={darkMode} onChange={setDarkMode} />
      </div>
    </div>
  )
}
