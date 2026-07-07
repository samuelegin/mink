import { useEffect, useState } from 'react'
import Logo from '../Logo'
import { useAuth } from '../../context/AuthContext'
import HeroBalanceCard from '../home/HeroBalanceCard'
import QuickActions from '../home/QuickActions'
import ActivityFeed, { type ActivityItem } from '../home/ActivityFeed'
import RecentPeople, { type Person } from '../home/RecentPeople'
import ProfileChecklist from '../home/ProfileChecklist'
import NotificationsBell from '../notifications/NotificationsBell'
import { recentContacts } from '../../lib/api/friends'
import { listActivity } from '../../lib/api/activity'

export default function HomeScreen({
  handle,
  onSend,
  onRequest,
  onOpenProfile,
}: {
  handle: string
  onSend: () => void
  onRequest?: () => void
  onOpenProfile?: () => void
}) {
  const { user, backendReady } = useAuth()
  const initial = (user?.email ?? user?.address ?? '?').charAt(0).toUpperCase()
  const [recentPeople, setRecentPeople] = useState<Person[]>([])
  const [activityPreview, setActivityPreview] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (!backendReady) return
    recentContacts(8)
      .then((contacts) =>
        setRecentPeople(
          contacts.map((c) => ({
            handle: c.handle,
            name: c.name ?? c.handle,
            status: c.lastPayment ?? 'Recent',
            avatarUrl: c.avatarUrl,
          })),
        ),
      )
      .catch((err) => console.error('Failed to load recent people', err))

    listActivity({ limit: 5 })
      .then((entries) =>
        setActivityPreview(
          entries.map((e) => ({
            id: e.id,
            kind: e.kind === 'sent' ? 'sent' : 'received',
            counterparty: e.counterpartyName ?? `@${e.counterpartyHandle}`,
            amount: e.amount,
            note: e.message,
            timestamp: e.timestamp,
          })),
        ),
      )
      .catch((err) => console.error('Failed to load activity preview', err))
  }, [backendReady])

  return (
    <div className="mx-auto max-w-[900px] px-5 lg:px-8 pt-6 pb-28 lg:pb-20">
      <div className="flex items-center justify-between mb-6">
        <Logo />

        <div className="flex items-center gap-2">
          <NotificationsBell />

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
      </div>

      <HeroBalanceCard onSend={onSend} onRequest={onRequest ?? (() => {})} onAddMoney={() => {}} />

      <div className="mt-8">
        <QuickActions onSend={onSend} onRequest={onRequest ?? (() => {})} onSplit={() => {}} onScan={() => {}} />
      </div>

      <div className="mt-10">
        <RecentPeople people={recentPeople} onInvite={() => {}} />
      </div>

      <div className="mt-10">
        <ActivityFeed items={activityPreview} onSendMoney={onSend} />
      </div>

      <div className="mt-10">
        <ProfileChecklist onAddAvatar={() => {}} onInvite={() => {}} />
      </div>
    </div>
  )
}