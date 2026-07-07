import { apiRequest } from './client'
import { extractList } from './listHelpers'
import type { PayContact } from '../../components/pay/types'

export type FriendRequest = {
  friendshipId: string
  fromUserId: string
  fromHandle: string
  fromDisplayName: string | null
  fromAvatarUrl: string | null
}

// UNVERIFIED SHAPE — none of the /friends* routes declare a response_model.
// Assumed a friend/contact object roughly mirrors the profile shape
// (handle, display_name, avatar_url) plus a friendship id and maybe a
// last-interaction timestamp. This is the single place to fix field names.
function adaptContact(raw: Record<string, unknown>): PayContact {
  return {
    handle: String(raw.handle ?? raw.user_handle ?? ''),
    name: (raw.display_name as string | undefined) ?? (raw.name as string | undefined),
    avatarUrl: (raw.avatar_url as string | undefined) ?? (raw.avatarUrl as string | undefined),
    lastPayment: (raw.last_payment_at as string | undefined) ?? (raw.last_interaction_at as string | undefined),
    verified: true,
  }
}

function adaptFriendRequest(raw: Record<string, unknown>): FriendRequest {
  return {
    friendshipId: String(raw.id ?? raw.friendship_id ?? ''),
    fromUserId: String(raw.requester_id ?? raw.from_user_id ?? ''),
    fromHandle: String(raw.handle ?? raw.requester_handle ?? ''),
    fromDisplayName: (raw.display_name as string | undefined) ?? null,
    fromAvatarUrl: (raw.avatar_url as string | undefined) ?? null,
  }
}

export async function listFriends(): Promise<PayContact[]> {
  const raw = await apiRequest<unknown>('/api/v1/friends')
  return extractList(raw).map(adaptContact)
}

export async function recentContacts(limit = 10): Promise<PayContact[]> {
  const raw = await apiRequest<unknown>('/api/v1/friends/contacts/recent', { query: { limit } })
  return extractList(raw).map(adaptContact)
}

export async function frequentContacts(limit = 10): Promise<PayContact[]> {
  const raw = await apiRequest<unknown>('/api/v1/friends/contacts/frequent', { query: { limit } })
  return extractList(raw).map(adaptContact)
}

export async function suggestedFriends(limit = 10): Promise<PayContact[]> {
  const raw = await apiRequest<unknown>('/api/v1/friends/suggested', { query: { limit } })
  return extractList(raw).map(adaptContact)
}

export async function incomingFriendRequests(): Promise<FriendRequest[]> {
  const raw = await apiRequest<unknown>('/api/v1/friends/requests/incoming')
  return extractList(raw).map(adaptFriendRequest)
}

export async function sendFriendRequest(addresseeId: string): Promise<void> {
  await apiRequest('/api/v1/friends', { method: 'POST', body: { addressee_id: addresseeId } })
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  await apiRequest(`/api/v1/friends/requests/${encodeURIComponent(friendshipId)}/accept`, { method: 'POST' })
}

export async function declineFriendRequest(friendshipId: string): Promise<void> {
  await apiRequest(`/api/v1/friends/requests/${encodeURIComponent(friendshipId)}/decline`, { method: 'POST' })
}

export async function removeFriend(friendId: string): Promise<void> {
  await apiRequest(`/api/v1/friends/${encodeURIComponent(friendId)}`, { method: 'DELETE' })
}
