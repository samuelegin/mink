import { apiRequest } from './client'
import { extractList } from './listHelpers'

export type MinkNotification = {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

// UNVERIFIED SHAPE — assumed { id, title/body or message, read/is_read, created_at }.
function adaptNotification(raw: Record<string, unknown>): MinkNotification {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    body: String(raw.body ?? raw.message ?? ''),
    read: Boolean(raw.read ?? raw.is_read ?? false),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
  }
}

export async function listNotifications(unreadOnly = false, limit = 50): Promise<MinkNotification[]> {
  const raw = await apiRequest<unknown>('/api/v1/notifications', {
    query: { unread_only: unreadOnly, limit },
  })
  return extractList(raw).map(adaptNotification)
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiRequest(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PATCH' })
}
