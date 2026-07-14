const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mink-ten.vercel.app'

const ACCESS_TOKEN_KEY = 'mink_access_token'
const REFRESH_TOKEN_KEY = 'mink_refresh_token'

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY)
let refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_KEY)

function setTokens(tokens: { access_token?: string; refresh_token?: string } | null) {
  if (tokens === null) {
    // Clear both in-memory tokens, not just access_token — previously refreshToken
    // was left stale here (`tokens?.refresh_token ?? refreshToken` is a no-op when
    // tokens is null), so a failed refresh never actually gave up: every later
    // request kept seeing a "valid" refreshToken and retried the same dead token
    // forever instead of surfacing a session-expired state.
    accessToken = null
    refreshToken = null
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    return
  }

  accessToken = tokens.access_token ?? null
  if (tokens.refresh_token) refreshToken = tokens.refresh_token

  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  else localStorage.removeItem(ACCESS_TOKEN_KEY)

  if (tokens.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
}

export function hasStoredSession(): boolean {
  return !!refreshToken
}

// Fired when the session is definitively gone — refresh failed or there was no
// refresh token to try — so the UI can drop back to a logged-out state instead
// of silently sitting on cleared tokens while still showing "authenticated".
type SessionExpiredHandler = () => void
let onSessionExpired: SessionExpiredHandler | null = null
export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  onSessionExpired = handler
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

// Every mink API response is wrapped: { success, status_code, message, data }.
// Confirmed against the real backend source (api/response.py's success_response
// helper) — this is not a guess.
type Envelope<T> = {
  success: boolean
  status_code: number
  message: string
  data: T
}

async function request<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
    auth?: boolean
    retry?: boolean
  } = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true, retry = true } = options

  const finalHeaders: Record<string, string> = { ...headers }
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json'
  if (auth && accessToken) finalHeaders['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth) {
    if (retry && refreshToken) {
      const refreshed = await tryRefresh()
      if (refreshed) {
        return request<T>(path, { ...options, retry: false })
      }
    } else if (!refreshToken) {
      // No refresh token to even try (or the retry above already exhausted one
      // and cleared it) — the session is gone, not just this one request.
      onSessionExpired?.()
    }
  }

  let parsed: unknown = null
  const text = await res.text()
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
  }

  if (!res.ok) {
    const message =
      (parsed as { message?: string })?.message || `Request failed with status ${res.status}`
    throw new ApiError(res.status, message, parsed)
  }

  // Unwrap the { success, status_code, message, data } envelope. Some 200s
  // (e.g. plain "Logged out") have no meaningful data payload — data is null
  // in that case, which is fine for callers that don't use the return value.
  const envelope = parsed as Envelope<T>
  return envelope?.data as T
}

// Concurrent 401s (e.g. several requests firing around the same time) must
// share one refresh call rather than each firing their own — the backend
// rotates the refresh token on use, so a second concurrent call would present
// a token the first call already burned and fail spuriously.
let refreshInFlight: Promise<boolean> | null = null

function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return Promise.resolve(false)
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function doRefresh(): Promise<boolean> {
  if (!refreshToken) return false
  try {
    // Confirmed shape from api/v1/routes/auth.py's refresh() handler:
    // { access_token, refresh_token, token_type, expires_in }
    const result = await request<{ access_token: string; refresh_token: string }>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
      auth: false,
    })
    setTokens(result)
    return !!result?.access_token
  } catch (err) {
    console.error('Token refresh failed', err)
    setTokens(null)
    onSessionExpired?.()
    return false
  }
}

export const apiClient = {
  request,

  async login(magicDidToken: string) {
    // Matches scripts/test-auth.html in the mink backend repo, the reference
    // harness for this flow: the DID token goes in a standard
    // "Authorization: Bearer <token>" header. Response shape (TokenResponse):
    // { access_token, refresh_token, token_type, expires_in, user }.
    const result = await request<{ access_token: string; refresh_token: string; user: unknown }>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${magicDidToken}` },
        auth: false,
      }
    )
    setTokens(result)
    return result
  },

  async logout() {
    if (refreshToken) {
      try {
        await request('/api/v1/auth/logout', {
          method: 'POST',
          body: { refresh_token: refreshToken },
        })
      } catch (err) {
        console.error('Backend logout failed, clearing local session anyway', err)
      }
    }
    setTokens(null)
  },

  clearSession() {
    setTokens(null)
  },
}
