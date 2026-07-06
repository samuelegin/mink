import Logo from '../Logo'
import { useAuth } from '../../context/AuthContext'
import HeroBalanceCard from '../home/HeroBalanceCard'
import QuickActions from '../home/QuickActions'
import ActivityFeed from '../home/ActivityFeed'
import RecentPeople from '../home/RecentPeople'
import ProfileChecklist from '../home/ProfileChecklist'

export default function HomeScreen({
  handle,
  onSend,
  onOpenProfile,
}: {
  handle: string
  onSend: () => void
  onOpenProfile?: () => void
}) {
  const { user } = useAuth()
  const initial = (user?.email ?? user?.address ?? '?').charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-[900px] px-5 lg:px-8 pt-6 pb-28 lg:pb-20">
      <div className="flex items-center justify-between mb-6">
        <Logo />

        <button
          onClick={onOpenProfile}
          className="group hidden sm:flex items-center gap-2 rounded-full bg-white pl-3.5 pr-1.5 py-1.5 border border-[var(--color-line)] transition-all duration-200 hover:shadow-md hover:bg-[var(--color-mink-tint)]/40"
        >
          <span className="text-[15px] font-medium truncate max-w-[140px]">@{handle}</span>
          <div className="h-9 w-9 rounded-full bg-[var(--color-mink)] text-white flex items-center justify-center font-semibold text-sm shrink-0 transition-transform duration-200 group-hover:scale-[1.03]">
            {initial}
          </div>
        </button>

        <button
          onClick={onOpenProfile}
          className="group sm:hidden h-9 w-9 rounded-full bg-[var(--color-mink)] text-white flex items-center justify-center font-semibold text-sm transition-transform duration-200 group-active:scale-95"
        >
          {initial}
        </button>
      </div>

      <HeroBalanceCard onSend={onSend} onRequest={() => {}} onAddMoney={() => {}} />

      <div className="mt-8">
        <QuickActions onSend={onSend} onRequest={() => {}} onSplit={() => {}} onScan={() => {}} />
      </div>

      <div className="mt-10">
        <RecentPeople onInvite={() => {}} />
      </div>

      <div className="mt-10">
        <ActivityFeed onSendMoney={onSend} />
      </div>

      <div className="mt-10">
        <ProfileChecklist onAddAvatar={() => {}} onInvite={() => {}} />
      </div>
    </div>
  )
}