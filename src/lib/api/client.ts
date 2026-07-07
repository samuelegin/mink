// Thin wrapper around fetch for the real mink backend.
//
// Token handling:
// - The access token lives in memory only (cleared on full page reload) since it's
//   short-lived and attaching it to every request is all it's for.
// - The refresh token is persisted in localStorage so a page reload doesn't force a
//   fresh Magic + backend login round trip. If you'd rather not persist it at all,
//   swap `refreshTokenStore` for an in-memory-only version — every call site here
//   only touches it through get/set/clear, so that's a one-file change.
//
// UNVERIFIED SHAPE WARNING: the OpenAPI spec for this backend does not declare
// response_model on any route, so every response body below is a best-guess typed
// as `unknown` until proven otherwise. Each api/*.ts file has a single small
// "adapter" function per endpoint that reaches into the raw JSON — if the real
// field names differ from the guess, that's the only place that needs to change.

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://mink-ten.vercel.app'

const REFRESH_TOKEN_KEY = 'mink_refresh_token'

let accessToken: string | null = null

export const refreshTokenStore = {
  get(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  set(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },
  clear() {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API request failed with status ${status}`)
    this.status = status
    this.body = body
  }
}

// Set by auth.ts after module init to avoid a circular import between client.ts and auth.ts.
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

// Set by auth.ts as well — used to attempt a silent refresh before giving up on a 401.
let refreshInFlight: Promise<boolean> | null = null
export function setRefreshFn(fn: () => Promise<boolean>) {
  attemptRefresh = fn
}
let attemptRefresh: (() => Promise<boolean>) | null = null

type RequestOptions = {
  method?: string
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
  auth?: boolean // defaults to true — set false for the unauthenticated endpoints
  _retried?: boolean
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(path, API_BASE_URL)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true, _retried = false } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && auth && !_retried && attemptRefresh) {
    if (!refreshInFlight) {
      refreshInFlight = attemptRefresh().finally(() => {
        refreshInFlight = null
      })
    }
    const refreshed = await refreshInFlight
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _retried: true })
    }
    onUnauthorized?.()
  }

  const text = await response.text()
  const data = text ? safeJsonParse(text) : null

  if (!response.ok) {
    throw new ApiError(response.status, data)
  }

  return data as T
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
