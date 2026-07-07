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

  let data: unknown = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const message =
      (data as { message?: string; detail?: string })?.message ||
      (typeof (data as { detail?: unknown })?.detail === 'string' ? (data as { detail: string }).detail : null) ||
      `Request failed with status ${res.status}`
    throw new ApiError(res.status, message, data)
  }

  return data as T
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false
  try {
    // Response shape for /auth/refresh isn't documented in the OpenAPI spec
    // (empty schema) — assuming it mirrors /auth/login's { access_token, refresh_token }.
    // Verify against a real response and adjust if the backend returns something else.
    const result = await request<{ access_token?: string; refresh_token?: string }>('/api/v1/auth/refresh', {
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
    // The /auth/login response schema is undocumented (empty {} in the OpenAPI
    // spec). Assuming a standard { access_token, refresh_token } pair here —
    // confirm against the real response and adjust setTokens/this type if the
    // backend uses different field names (e.g. accessToken/refreshToken).
    const result = await request<{ access_token?: string; refresh_token?: string }>('/api/v1/auth/login', {
      method: 'POST',
      headers: { authorization: `Bearer ${magicDidToken}` },
      auth: false,
    })
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
