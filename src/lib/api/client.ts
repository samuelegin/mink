// Thin compatibility wrapper around the real apiClient (src/lib/apiClient.ts),
// which is the single source of truth for tokens and the login/refresh/logout
// flow (see AuthContext). This module used to keep its own separate in-memory
// access token, but nothing ever fed it a token (login only ran through
// apiClient), so every request made through here was silently unauthenticated.
import { apiClient, ApiError } from '../apiClient'

export { ApiError }

type RequestOptions = {
  method?: string
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
  auth?: boolean // defaults to true — set false for the unauthenticated endpoints
}

function appendQuery(path: string, query?: RequestOptions['query']) {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${path}${path.includes('?') ? '&' : '?'}${qs}` : path
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method, body, query, auth } = options
  return apiClient.request<T>(appendQuery(path, query), { method, body, auth })
}
