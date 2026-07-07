import { apiRequest, refreshTokenStore, setAccessToken, setRefreshFn, ApiError } from './client'

// UNVERIFIED SHAPE: the spec doesn't declare a response body for POST /auth/login,
// /auth/refresh, or /auth/logout. Common FastAPI/JWT convention is access_token +
// refresh_token (+ token_type), so that's the assumption below — but this is the
// single place to fix if the real backend uses different field names (e.g.
// `session_token`, `token`, `accessToken`). Log the raw response once during manual
// testing and adjust `extractTokens` if it doesn't match.
type RawLoginResponse = Record<string, unknown>

function extractTokens(raw: RawLoginResponse): { accessToken: string; refreshToken: string } {
  const accessToken =
    (raw.access_token as string | undefined) ??
    (raw.accessToken as string | undefined) ??
    (raw.token as string | undefined) ??
    (raw.session_token as string | undefined)

  const refreshToken =
    (raw.refresh_token as string | undefined) ?? (raw.refreshToken as string | undefined)

  if (!accessToken || !refreshToken) {
    console.error('Unexpected /auth/login response shape:', raw)
    throw new Error(
      'Login succeeded but the response shape did not match what apiClient/auth.ts expects. ' +
        'Check the console for the raw payload and update extractTokens().',
    )
  }

  return { accessToken, refreshToken }
}

/**
 * Exchange a Magic-issued DID token for a mink session.
 * Per the ticket: send the raw DID token (magic.user.getIdToken()) as the
 * `authorization` header value — it is NOT prefixed with "Bearer ".
 *
 * This bypasses the shared apiRequest() helper because it needs a bespoke
 * `authorization` header rather than the client's managed Bearer header.
 */
export async function login(didToken: string) {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://mink-ten.vercel.app'
  const response = await fetch(new URL('/api/v1/auth/login', base), {
    method: 'POST',
    headers: { authorization: didToken },
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new ApiError(response.status, data, 'Login failed')
  }
  const { accessToken, refreshToken } = extractTokens(data)
  setAccessToken(accessToken)
  refreshTokenStore.set(refreshToken)
  return { accessToken, refreshToken }
}

export async function refresh(): Promise<boolean> {
  const refreshToken = refreshTokenStore.get()
  if (!refreshToken) return false
  try {
    const raw = await apiRequest<RawLoginResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      auth: false,
      body: { refresh_token: refreshToken },
    })
    const tokens = extractTokens(raw)
    setAccessToken(tokens.accessToken)
    refreshTokenStore.set(tokens.refreshToken)
    return true
  } catch (err) {
    console.error('Session refresh failed', err)
    setAccessToken(null)
    refreshTokenStore.clear()
    return false
  }
}

export async function logout() {
  const refreshToken = refreshTokenStore.get()
  try {
    if (refreshToken) {
      await apiRequest('/api/v1/auth/logout', {
        method: 'POST',
        auth: false,
        body: { refresh_token: refreshToken },
      })
    }
  } catch (err) {
    // Best-effort — still clear local state even if the backend call fails.
    console.warn('Backend logout call failed', err)
  } finally {
    setAccessToken(null)
    refreshTokenStore.clear()
  }
}

// Wire the shared client's silent-refresh hook to this module's refresh().
setRefreshFn(refresh)
