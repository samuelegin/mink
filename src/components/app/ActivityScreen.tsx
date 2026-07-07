import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import RecentFriendsStories from '../activity/RecentFriendsStories'
import FriendHistoryDrawer from '../activity/FriendHistoryDrawer'
import SummaryCard from '../activity/SummaryCard'
import FilterChips, { type ActivityFilter } from '../activity/FilterChips'
import TransactionCard from '../activity/TransactionCard'
import TransactionDetailSheet from '../activity/TransactionDetailSheet'
import EmptyStateIllustration from '../home/EmptyStateIllustration'
import { groupByPeriod, recentFriends, type RecentFriend } from '../activity/activityUtils'
import type { ActivityEntry } from '../activity/types'
import { listActivity, getActivitySummary } from '../../lib/api/activity'
import { useAuth } from '../../context/AuthContext'

export default function ActivityScreen({ onSend }: { onSend: () => void }) {
  const { backendReady } = useAuth()
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [query, setQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<ActivityEntry | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<RecentFriend | null>(null)
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [summary, setSummary] = useState<{ totalSent: number; totalReceived: number } | null>(null)

  useEffect(() => {
    if (!backendReady) return
    // The API supports server-side direction + date-range + search filtering, but
    // "week"/"month"/"pending" filters are client-side concepts in this UI, so we
    // fetch a broad recent window here and keep the existing client-side filtering
    // below rather than round-tripping on every filter chip click.
    listActivity({ limit: 100 })
      .then(setEntries)
      .catch((err) => console.error('Failed to load activity feed', err))
    getActivitySummary()
      .then((s) => setSummary({ totalSent: s.totalSent, totalReceived: s.totalReceived }))
      .catch((err) => console.error('Failed to load activity summary', err))
  }, [backendReady])

  const friends = useMemo(() => recentFriends(entries), [entries])

  const received = summary?.totalReceived ?? entries.filter((e) => e.kind === 'received').reduce((sum, e) => sum + e.amount, 0)
  const sent = summary?.totalSent ?? entries.filter((e) => e.kind === 'sent').reduce((sum, e) => sum + e.amount, 0)

  const filtered = useMemo(() => {
    const now = Date.now()
    return entries.filter((e) => {
      if (filter === 'sent' && e.kind !== 'sent') return false
      if (filter === 'received' && e.kind !== 'received') return false
      if (filter === 'pending' && e.status !== 'pending') return false
      if (filter === 'week' && now - new Date(e.timestamp).getTime() > 7 * 86400000) return false
      if (filter === 'month' && now - new Date(e.timestamp).getTime() > 30 * 86400000) return false

      if (query) {
        const q = query.toLowerCase()
        const matchesPerson =
          e.counterpartyHandle.toLowerCase().includes(q) || (e.counterpartyName ?? '').toLowerCase().includes(q)
        const matchesMessage = (e.message ?? '').toLowerCase().includes(q)
        if (!matchesPerson && !matchesMessage) return false
      }

      return true
    })
  }, [entries, filter, query])

  const groups = groupByPeriod(filtered)

  const friendEntries = selectedFriend
    ? entries
        .filter((e) => e.counterpartyHandle === selectedFriend.handle)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : []

  return (
    <div className="mx-auto max-w-[760px] px-5 lg:px-8 pt-6 pb-28 lg:pb-16">
      <h1 className="font-display font-bold text-3xl">Activity</h1>
      <p className="text-[var(--color-ink-soft)] mt-1">See your recent payments with friends.</p>

      <div className="mt-6">
        <h2 className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mb-3">Recent Friends</h2>
        <RecentFriendsStories friends={friends} onSelect={setSelectedFriend} />
      </div>

      <div className="mt-6 rounded-2xl bg-white border border-[var(--color-line)] shadow-sm p-4">
        <div className="flex items-center gap-3 rounded-full bg-[var(--color-mink-tint)]/50 h-11 px-4">
          <Search className="h-4 w-4 text-[var(--color-ink-soft)]/50 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or payments..."
            className="flex-1 outline-none bg-transparent text-sm placeholder:text-[var(--color-ink-soft)]/50"
          />
        </div>

        <div className="mt-3">
          <FilterChips active={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="mt-5">
        <SummaryCard received={received} sent={sent} />
      </div>

      <div className="mt-7">
        <h2 className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mb-3">Recent Payments</h2>

        {groups.length === 0 ? (
          <div className="py-4">
            <EmptyStateIllustration
              image="/home/empty-activity.webp"
              alt="Mascot waiting beside an empty timeline"
              title="No payments yet"
              subtitle="Send money to your first friend."
            />
            <div className="flex justify-center mt-6">
              <button
                onClick={onSend}
                className="rounded-full bg-[var(--color-mink)] text-white font-semibold px-6 py-3 hover:bg-[var(--color-mink-deep)] transition-colors"
              >
                Send Money
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60 mb-2.5">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {group.entries.map((entry) => (
                    <TransactionCard key={entry.id} entry={entry} onSelect={setSelectedEntry} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEntry && (
        <TransactionDetailSheet entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}

      {selectedFriend && (
        <FriendHistoryDrawer
          friend={selectedFriend}
          entries={friendEntries}
          onClose={() => setSelectedFriend(null)}
          onSend={onSend}
          onRequest={() => {}}
        />
      )}
    </div>
  )
}
