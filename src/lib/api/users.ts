import { apiRequest } from './client'
import { extractList } from './listHelpers'

export type MinkProfile = {
  id: string
  handle: string
  displayName: string | null
  avatarUrl: string | null
  email: string | null
  wallets: { chain: string; address: string; isPrimary: boolean }[]
  preferences: Record<string, unknown>
  notificationSettings: Record<string, unknown>
}

// UNVERIFIED SHAPE — GET /users/me and GET /users/{handle} don't declare a
// response_model. Field names below are the most likely mapping given
// UpdateProfileRequest's documented shape (display_name, avatar_url, handle,
// wallets[{chain,address,is_primary}], preferences, notification_settings) plus
// an assumed `id` and `email`. This is the one place to fix if real field names differ.
function adaptProfile(raw: Record<string, unknown>): MinkProfile {
  const wallets = Array.isArray(raw.wallets)
    ? (raw.wallets as Record<string, unknown>[]).map((w) => ({
        chain: String(w.chain ?? ''),
        address: String(w.address ?? ''),
        isPrimary: Boolean(w.is_primary ?? w.isPrimary ?? false),
      }))
    : []

  return {
    id: String(raw.id ?? raw._id ?? raw.user_id ?? ''),
    handle: String(raw.handle ?? ''),
    displayName: (raw.display_name as string | undefined) ?? (raw.displayName as string | undefined) ?? null,
    avatarUrl: (raw.avatar_url as string | undefined) ?? (raw.avatarUrl as string | undefined) ?? null,
    email: (raw.email as string | undefined) ?? null,
    wallets,
    preferences: (raw.preferences as Record<string, unknown>) ?? {},
    notificationSettings:
      (raw.notification_settings as Record<string, unknown>) ??
      (raw.notificationSettings as Record<string, unknown>) ??
      {},
  }
}

export async function getMyProfile(): Promise<MinkProfile> {
  const raw = await apiRequest<Record<string, unknown>>('/api/v1/users/me')
  return adaptProfile(raw)
}

export async function updateMyProfile(patch: {
  displayName?: string
  avatarUrl?: string
  handle?: string
  wallets?: { chain: string; address: string; isPrimary?: boolean }[]
  preferences?: Record<string, unknown>
  notificationSettings?: Record<string, unknown>
}): Promise<MinkProfile> {
  const body: Record<string, unknown> = {}
  if (patch.displayName !== undefined) body.display_name = patch.displayName
  if (patch.avatarUrl !== undefined) body.avatar_url = patch.avatarUrl
  if (patch.handle !== undefined) body.handle = patch.handle
  if (patch.wallets !== undefined) {
    body.wallets = patch.wallets.map((w) => ({ chain: w.chain, address: w.address, is_primary: w.isPrimary ?? false }))
  }
  if (patch.preferences !== undefined) body.preferences = patch.preferences
  if (patch.notificationSettings !== undefined) body.notification_settings = patch.notificationSettings

  const raw = await apiRequest<Record<string, unknown>>('/api/v1/users/me', { method: 'PATCH', body })
  return adaptProfile(raw)
}

export async function getUserByHandle(handle: string): Promise<MinkProfile> {
  const raw = await apiRequest<Record<string, unknown>>(`/api/v1/users/${encodeURIComponent(handle)}`)
  return adaptProfile(raw)
}

export async function searchUsers(query: string, limit = 20): Promise<MinkProfile[]> {
  // UNVERIFIED SHAPE — assumed the list comes back either as a bare array or
  // wrapped as { results: [...] } / { items: [...] }. Adjust here if neither matches.
  const raw = await apiRequest<unknown>('/api/v1/users/search', { query: { q: query, limit } })
  const list = extractList(raw)
  return list.map(adaptProfile)
}

export async function checkHandleAvailability(handle: string): Promise<boolean> {
  // UNVERIFIED SHAPE — assumed { available: boolean }, falling back to a bare boolean.
  const raw = await apiRequest<unknown>(`/api/v1/handles/${encodeURIComponent(handle)}/availability`, {
    auth: false,
  })
  if (typeof raw === 'boolean') return raw
  if (raw && typeof raw === 'object' && 'available' in raw) return Boolean((raw as { available: unknown }).available)
  console.warn('Unexpected handle availability response shape:', raw)
  return false
}

