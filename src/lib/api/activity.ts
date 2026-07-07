import { apiRequest } from './client'
import { extractList } from './listHelpers'
import type { ActivityEntry } from '../../components/activity/types'

export type ActivityFilters = {
  direction?: 'incoming' | 'outgoing'
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
  skip?: number
}

export type ActivitySummary = {
  totalSent: number
  totalReceived: number
  currency: string
}

// UNVERIFIED SHAPE — GET /activity doesn't declare a response_model. Assumed each
// entry roughly matches the existing ActivityEntry shape the UI already expects
// (src/components/activity/types.ts), since that type was purpose-built for a
// "social feed" backend like this one. `kind` is derived from `direction` if the
// API returns that instead of an explicit kind/type field.
function adaptActivityEntry(raw: Record<string, unknown>): ActivityEntry {
  const rawKind = (raw.kind as string | undefined) ?? (raw.type as string | undefined)
  const direction = (raw.direction as string | undefined) ?? rawKind
  const kind: ActivityEntry['kind'] = direction === 'outgoing' || direction === 'sent' ? 'sent' : 'received'

  return {
    id: String(raw.id ?? ''),
    kind,
    status: (raw.status as ActivityEntry['status']) ?? 'completed',
    counterpartyHandle: String(raw.counterparty_handle ?? raw.handle ?? ''),
    counterpartyName: (raw.counterparty_display_name as string | undefined) ?? (raw.display_name as string | undefined),
    avatarUrl: (raw.avatar_url as string | undefined) ?? (raw.avatarUrl as string | undefined),
    amount: Number(raw.amount ?? 0),
    message: (raw.note as string | undefined) ?? (raw.message as string | undefined),
    timestamp: String(raw.created_at ?? raw.timestamp ?? ''),
  }
}

export async function listActivity(filters: ActivityFilters = {}): Promise<ActivityEntry[]> {
  const raw = await apiRequest<unknown>('/api/v1/activity', {
    query: {
      direction: filters.direction,
      start_date: filters.startDate,
      end_date: filters.endDate,
      search: filters.search,
      limit: filters.limit ?? 50,
      skip: filters.skip ?? 0,
    },
  })
  return extractList(raw).map(adaptActivityEntry)
}

// UNVERIFIED SHAPE — assumed { total_sent, total_received, currency }.
export async function getActivitySummary(): Promise<ActivitySummary> {
  const raw = await apiRequest<Record<string, unknown>>('/api/v1/activity/summary')
  return {
    totalSent: Number(raw.total_sent ?? raw.totalSent ?? 0),
    totalReceived: Number(raw.total_received ?? raw.totalReceived ?? 0),
    currency: String(raw.currency ?? 'USD'),
  }
}
