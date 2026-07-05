import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { magic, getWalletAddress } from '../lib/magic'

type AuthUser = {
  email: string | null
  address: string
}

type AuthStatus = 'idle' | 'checking' | 'sending' | 'authenticated'

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  loginWithEmail: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [error, setError] = useState<string | null>(null)

  async function loadUser() {
    const info = await magic.user.getInfo()
    const address = getWalletAddress(info)
    if (!address) throw new Error('No wallet address returned from Magic')
    setUser({ email: info.email ?? null, address })
    setStatus('authenticated')
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
    setUser(null)
    setStatus('idle')
  }

  return (
    <AuthContext.Provider value={{ user, status, error, loginWithEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
