const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mink-ten.vercel.app'

const ACCESS_TOKEN_KEY = 'mink_access_token'
const REFRESH_TOKEN_KEY = 'mink_refresh_token'

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY)
let refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_KEY)

function setTokens(tokens: { access_token?: string; refresh_token?: string } | null) {
  accessToken = tokens?.access_token ?? null
  refreshToken = tokens?.refresh_token ?? refreshToken

  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  else localStorage.removeItem(ACCESS_TOKEN_KEY)

  if (tokens?.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  else if (tokens === null) localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function hasStoredSession(): boolean {
  return !!refreshToken
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

  if (res.status === 401 && auth && retry && refreshToken) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return request<T>(path, { ...options, retry: false })
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

async function tryRefresh(): Promise<boolean> {
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
    return false
  }
}

export const apiClient = {
  request,

  async login(magicDidToken: string) {
    // Per the ticket: send the raw Magic DID token as the `authorization`
    // header value — it is NOT prefixed with "Bearer ". Sending it with a
    // Bearer prefix causes the backend's magic_client parser to reject it,
    // returning a 401 "Invalid or expired login token" even for a valid,
    // unexpired token. Response shape (TokenResponse): { access_token,
    // refresh_token, token_type, expires_in, user }.
    const result = await request<{ access_token: string; refresh_token: string; user: unknown }>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { authorization: magicDidToken },
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
