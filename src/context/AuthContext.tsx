import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { magic, getWalletAddress } from '../lib/magic'
import { apiClient, setSessionExpiredHandler } from '../lib/apiClient'
import { api, type UserProfile } from '../lib/api'
import { resolveUniversalAccount, getUniversalAccountAssets } from '../lib/universalAccount'

// Step 1 of the Universal Accounts integration: read-only check that the
// Magic EOA resolves to a Universal Account and that the SDK/dashboard
// credentials are wired correctly. No funds are touched here. Logged to
// the console rather than surfaced in the UI — this is a wiring check,
// not a feature yet.
async function checkUniversalAccount(ownerAddress: string) {
  try {
    const options = await resolveUniversalAccount(ownerAddress)
    console.log('[UniversalAccount] resolved smart account options:', options)
    const assets = await getUniversalAccountAssets(ownerAddress)
    console.log('[UniversalAccount] primary assets (should be empty/zero, nothing funded yet):', assets)
  } catch (err) {
    console.error('[UniversalAccount] resolution failed — check VITE_PARTICLE_* env vars', err)
  }
}

type AuthUser = {
  email: string | null
  address: string
}

type AuthStatus = 'idle' | 'checking' | 'sending' | 'authenticated'

// Separate from AuthStatus: Magic auth can succeed while the backend session
// (login/profile fetch) is still in flight or has failed independently.
type BackendStatus = 'idle' | 'loading' | 'ready' | 'error'

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  profile: UserProfile | null
  backendStatus: BackendStatus
  backendReady: boolean
  backendError: string | null
  refreshProfile: () => Promise<void>
  retryBackendSession: () => Promise<void>
  loginWithEmail: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('idle')
  const [backendError, setBackendError] = useState<string | null>(null)

  async function establishBackendSession() {
    setBackendStatus('loading')
    setBackendError(null)
    try {
      const didToken = await magic.user.getIdToken()
      await apiClient.login(didToken)
      const me = await api.users.me()
      setProfile(me)
      setBackendStatus('ready')
    } catch (err) {
      console.error('Backend session failed', err)
      setBackendError(err instanceof Error ? err.message : 'Could not reach the mink backend.')
      setBackendStatus('error')
    }
  }

  async function refreshProfile() {
    try {
      const me = await api.users.me()
      setProfile(me)
    } catch (err) {
      console.error('Profile refresh failed', err)
    }
  }

  async function loadUser() {
    const info = await magic.user.getInfo()
    const address = getWalletAddress(info)
    if (!address) throw new Error('No wallet address returned from Magic')
    setUser({ email: info.email ?? null, address })
    setStatus('authenticated')
    void checkUniversalAccount(address) // fire-and-forget, console-only
    await establishBackendSession()
  }

  useEffect(() => {
    async function resumeSession() {
      try {
        const params = new URLSearchParams(window.location.search)
        const hasAnyParams = params.toString().length > 0

        if (params.has('magic_credential')) {
          await magic.auth.loginWithCredential()
          window.history.replaceState({}, '', window.location.pathname)
          await loadUser()
          return
        }

        if (hasAnyParams) {
          try {
            const result = await magic.oauth2.getRedirectResult()
            if (result) {
              window.history.replaceState({}, '', window.location.pathname)
              await loadUser()
              return
            }
          } catch (redirectErr) {
            console.warn('getRedirectResult did not resolve', redirectErr)
          }
        }

        const isLoggedIn = await magic.user.isLoggedIn()
        if (isLoggedIn) {
          await loadUser()
        } else {
          setStatus('idle')
        }
      } catch (err) {
        console.error('Session resume failed', err)
        setError(err instanceof Error ? err.message : 'Failed to resume session')
        setStatus('idle')
      }
    }

    resumeSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Registered once: when apiClient gives up on refreshing (or has no refresh
  // token to try), drop the UI back to "logged out" instead of leaving it
  // showing a stale "authenticated" state on top of a cleared session.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null)
      setProfile(null)
      setBackendStatus('idle')
      setStatus('idle')
      setError('Your session expired — please sign in again.')
    })
    return () => setSessionExpiredHandler(null)
  }, [])

  async function loginWithEmail(email: string) {
    setError(null)
    setStatus('sending')
    try {
      await magic.auth.loginWithMagicLink({
        email,
        redirectURI: window.location.origin,
      })
      await loadUser()
    } catch (err) {
      console.error('Email login failed', err)
      setError(err instanceof Error ? err.message : 'Email login failed')
      setStatus('idle')
    }
  }

  async function loginWithGoogle() {
    setError(null)
    setStatus('sending')
    try {
      await magic.oauth2.loginWithRedirect({
        provider: 'google',
        redirectURI: window.location.origin,
      })
      // browser navigates away here; nothing runs after this until redirect back
    } catch (err) {
      console.error('Google login failed', err)
      setError(err instanceof Error ? err.message : 'Google login failed')
      setStatus('idle')
    }
  }

  async function logout() {
    await magic.user.logout()
    await apiClient.logout()
    setUser(null)
    setProfile(null)
    setBackendStatus('idle')
    setStatus('idle')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        profile,
        backendStatus,
        backendReady: backendStatus === 'ready',
        backendError,
        refreshProfile,
        retryBackendSession: establishBackendSession,
        loginWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
