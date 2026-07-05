import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function displayName(email: string | null) {
  if (!email) return 'there'
  const local = email.split('@')[0]
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export default function HeroBalanceCard({
  onSend,
  onRequest,
  onAddMoney,
  backgroundImage,
}: {
  onSend: () => void
  onRequest: () => void
  onAddMoney: () => void
  backgroundImage?: string
}) {
  const { user } = useAuth()

  return (
    <div
      className="relative rounded-[32px] overflow-hidden text-white min-h-[420px] lg:min-h-[460px] flex flex-col justify-between p-8 lg:p-12"
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(180deg, rgba(10,10,10,0.25), rgba(10,10,10,0.7)), url(${backgroundImage})`
          : `radial-gradient(circle at 15% 0%, rgba(139,90,60,0.65), transparent 55%), radial-gradient(circle at 95% 25%, rgba(61,92,70,0.55), transparent 50%), radial-gradient(circle at 30% 100%, rgba(139,90,60,0.4), transparent 60%), linear-gradient(160deg, #0D0B08 0%, #241D14 50%, #16140F 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="pointer-events-none absolute -top-28 -right-20 h-72 w-72 rounded-full bg-[var(--color-mink)]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-14 h-64 w-64 rounded-full bg-[var(--color-moss)]/30 blur-3xl" />

      <div className="relative">
        <p className="text-sm text-white/55">{greeting()}</p>
        <p className="font-display font-bold text-2xl mt-1">{displayName(user?.email ?? null)} 👋</p>
      </div>

      <div className="relative flex-1 flex flex-col justify-center py-6">
        <p className="text-[11px] uppercase tracking-wider text-white/45">Universal Balance</p>
        <p className="font-display font-bold text-6xl lg:text-7xl mt-2 tracking-tight">$0.00</p>
        <p className="text-sm text-white/45 mt-2">One balance across every chain.</p>
      </div>

      <div className="relative flex flex-col gap-2.5">
        <button
          onClick={onSend}
          className="w-full flex items-center justify-center gap-1.5 rounded-full bg-white text-[var(--color-ink)] font-semibold text-sm py-4 hover:bg-white/90 transition-colors"
        >
          <ArrowUpRight className="h-4 w-4" />
          Send
        </button>
        <button
          onClick={onRequest}
          className="w-full flex items-center justify-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm py-4 hover:bg-white/16 transition-colors"
        >
          <ArrowDownLeft className="h-4 w-4" />
          Request
        </button>
        <button
          onClick={onAddMoney}
          className="text-xs text-white/55 hover:text-white/85 transition-colors mt-1 self-center"
        >
          + Add money
        </button>
      </div>
    </div>
  )
}
