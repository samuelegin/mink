import { useAuth } from '../../context/AuthContext'
import HeroBalanceCard from '../home/HeroBalanceCard'
import QuickActions from '../home/QuickActions'
import ActivityFeed from '../home/ActivityFeed'
import RecentPeople from '../home/RecentPeople'
import ProfileChecklist from '../home/ProfileChecklist'

export default function HomeScreen({ handle, onSend }: { handle: string; onSend: () => void }) {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-[900px] px-5 lg:px-8 pt-6 pb-28 lg:pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-ink)] flex items-center justify-center">
            <span className="text-[var(--color-paper)] font-display font-bold text-sm">m</span>
          </div>
          <span className="font-display font-bold text-lg">mink</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-ink-soft)] hidden sm:inline">@{handle}</span>
          <div className="h-9 w-9 rounded-full bg-[var(--color-mink)] text-white flex items-center justify-center font-semibold text-sm">
            {(user?.email ?? user?.address ?? '?').charAt(0).toUpperCase()}
          </div>
        </div>
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