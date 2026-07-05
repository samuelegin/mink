import type { ActivityEntry } from './types'

export type RecentFriend = {
  handle: string
  name?: string
  avatarUrl?: string
  lastKind: ActivityEntry['kind']
  lastStatus: ActivityEntry['status']
  lastTimestamp: string
  netBalance: number
}

export function recentFriends(entries: ActivityEntry[], limit = 5): RecentFriend[] {
  const byHandle = new Map<string, ActivityEntry[]>()
  for (const entry of entries) {
    if (!byHandle.has(entry.counterpartyHandle)) byHandle.set(entry.counterpartyHandle, [])
    byHandle.get(entry.counterpartyHandle)!.push(entry)
  }

  const friends: RecentFriend[] = Array.from(byHandle.entries()).map(([handle, group]) => {
    const sorted = [...group].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const latest = sorted[0]
    const netBalance = group.reduce((sum, e) => sum + (e.kind === 'received' ? e.amount : -e.amount), 0)
    return {
      handle,
      name: latest.counterpartyName,
      avatarUrl: latest.avatarUrl,
      lastKind: latest.kind,
      lastStatus: latest.status,
      lastTimestamp: latest.timestamp,
      netBalance,
    }
  })

  return friends
    .sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime())
    .slice(0, limit)
}

export function tinyRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffHours = Math.floor(diffMs / 3600000)
  if (diffHours < 1) return 'Now'
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return new Date(iso).toLocaleDateString(undefined, { weekday: 'short' })
  return `${diffDays}d`
}

export function groupLabel(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const today = startOfDay(now)
  const entryDay = startOfDay(date)
  const diffDays = Math.round((today.getTime() - entryDay.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 7) return 'This Week'
  return date.toLocaleDateString(undefined, { month: 'long', year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric' })
}

export function relativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function groupByPeriod(entries: ActivityEntry[]): { label: string; entries: ActivityEntry[] }[] {
  const groups = new Map<string, ActivityEntry[]>()
  for (const entry of entries) {
    const label = groupLabel(entry.timestamp)
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(entry)
  }
  return Array.from(groups.entries()).map(([label, groupEntries]) => ({ label, entries: groupEntries }))
}
