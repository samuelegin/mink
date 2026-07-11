import { apiClient, ApiError } from './apiClient'

// Confirmed against the real backend source (api/v1/schemas/user.py,
// api/v1/schemas/auth.py). No longer guessing these shapes.

export type Wallet = {
  chain: string
  address: string
  is_primary?: boolean
}

export type UserProfile = {
  id: string
  handle: string | null
  display_name: string
  avatar_url: string | null
  email: string | null
  login_provider: string | null
  wallets: Wallet[]
  preferences: Record<string, unknown>
  notification_settings: Record<string, unknown>
}

export type FriendSummary = {
  id: string
  handle: string
  display_name: string | null
  avatar_url: string | null
}

export type ActivityEntryDto = {
  id: string
  direction: 'incoming' | 'outgoing'
  counterparty: FriendSummary
  amount: number
  currency: string
  note: string | null
  status: string
  created_at: string
}

export function friendlyClaimError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return 'That handle was just taken — try another.'
    if (err.status === 422) return 'Handles must be lowercase letters, numbers, or underscores.'
    if (err.status === 401) return 'Your session expired — please sign in again.'
    return err.message || 'Something went wrong claiming that handle. Try again.'
  }
  return err instanceof Error ? err.message : 'Something went wrong claiming that handle. Try again.'
}

export const api = {
  handles: {
    checkAvailability: (handle: string) =>
      apiClient.request<{ available: boolean }>(`/api/v1/handles/${encodeURIComponent(handle)}/availability`, {
        auth: false,
      }),
  },

  users: {
    me: () => apiClient.request<UserProfile>('/api/v1/users/me'),

    updateMe: (patch: {
      display_name?: string
      avatar_url?: string
      handle?: string
      wallets?: Wallet[]
      preferences?: Record<string, unknown>
      notification_settings?: Record<string, unknown>
    }) => apiClient.request<UserProfile>('/api/v1/users/me', { method: 'PATCH', body: patch }),

    search: async (q: string, limit = 20) => {
      // Confirmed from api/v1/routes/user.py: data is { results: UserResponse[] },
      // not a bare array — unwrapped here so callers just get the array.
      const { results } = await apiClient.request<{ results: FriendSummary[] }>(
        `/api/v1/users/search?q=${encodeURIComponent(q)}&limit=${limit}`,
        { auth: false }
      )
      return results
    },

    byHandle: (handle: string) =>
      apiClient.request<FriendSummary>(`/api/v1/users/${encodeURIComponent(handle)}`, { auth: false }),
  },

  friends: {
    list: () => apiClient.request<FriendSummary[]>('/api/v1/friends'),

    send: (addresseeId: string) =>
      apiClient.request('/api/v1/friends', { method: 'POST', body: { addressee_id: addresseeId } }),

    acceptRequest: (friendshipId: string) =>
      apiClient.request(`/api/v1/friends/requests/${friendshipId}/accept`, { method: 'POST' }),

    declineRequest: (friendshipId: string) =>
      apiClient.request(`/api/v1/friends/requests/${friendshipId}/decline`, { method: 'POST' }),

    incomingRequests: () => apiClient.request('/api/v1/friends/requests/incoming'),

    suggested: (limit = 10) => apiClient.request<FriendSummary[]>(`/api/v1/friends/suggested?limit=${limit}`),

    recentContacts: (limit = 10) =>
      apiClient.request<FriendSummary[]>(`/api/v1/friends/contacts/recent?limit=${limit}`),

    frequentContacts: (limit = 10) =>
      apiClient.request<FriendSummary[]>(`/api/v1/friends/contacts/frequent?limit=${limit}`),

    remove: (friendId: string) => apiClient.request(`/api/v1/friends/${friendId}`, { method: 'DELETE' }),
  },

  paymentRequests: {
    create: (params: { payer_id: string; amount: number; currency: string; note?: string; expires_at?: string }) =>
      apiClient.request('/api/v1/payment-requests', { method: 'POST', body: params }),

    incoming: () => apiClient.request('/api/v1/payment-requests/incoming'),
    outgoing: () => apiClient.request('/api/v1/payment-requests/outgoing'),
    accept: (id: string) => apiClient.request(`/api/v1/payment-requests/${id}/accept`, { method: 'POST' }),
    reject: (id: string) => apiClient.request(`/api/v1/payment-requests/${id}/reject`, { method: 'POST' }),
    cancel: (id: string) => apiClient.request(`/api/v1/payment-requests/${id}/cancel`, { method: 'POST' }),
    remind: (id: string) => apiClient.request(`/api/v1/payment-requests/${id}/remind`, { method: 'POST' }),
  },

  activity: {
    list: (params: {
      direction?: 'incoming' | 'outgoing'
      start_date?: string
      end_date?: string
      search?: string
      limit?: number
      skip?: number
    } = {}) => {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value))
      })
      const qs = query.toString()
      return apiClient.request<ActivityEntryDto[]>(`/api/v1/activity${qs ? `?${qs}` : ''}`)
    },

    summary: () => apiClient.request('/api/v1/activity/summary'),
  },

  notifications: {
    list: (unreadOnly = false, limit = 50) =>
      apiClient.request(`/api/v1/notifications?unread_only=${unreadOnly}&limit=${limit}`),

    markRead: (id: string) => apiClient.request(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),
  },
}
