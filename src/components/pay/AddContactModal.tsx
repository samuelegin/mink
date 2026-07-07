import { useEffect, useState } from 'react'
import { X, UserPlus, Wallet2, Smartphone, Check, Loader2, Search } from 'lucide-react'
import { isValidAddress } from '../../lib/localContacts'
import { searchUsers } from '../../lib/api/users'
import { sendFriendRequest } from '../../lib/api/friends'
import { useToast } from '../../context/ToastContext'
import type { PayContact } from './types'
import type { MinkProfile } from '../../lib/api/users'

type Tab = 'handle' | 'address' | 'import'

// Contact Picker API: Chrome on Android only, requires HTTPS, not available on
// desktop or iOS. Feature-detected below rather than assumed.
const hasContactPicker =
  typeof navigator !== 'undefined' && 'contacts' in navigator && 'select' in (navigator as any).contacts

function toPayContact(profile: MinkProfile): PayContact {
  return {
    handle: profile.handle,
    name: profile.displayName ?? undefined,
    avatarUrl: profile.avatarUrl ?? undefined,
    verified: true,
  }
}

export default function AddContactModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: (contact: PayContact) => void
}) {
  const [tab, setTab] = useState<Tab>('handle')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MinkProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [sendingTo, setSendingTo] = useState<string | null>(null)
  const [addressValue, setAddressValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  // Search-as-you-type against the real user directory (debounced).
  useEffect(() => {
    const clean = query.trim().replace(/^@/, '')
    if (!clean) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const timeout = setTimeout(async () => {
      try {
        const found = await searchUsers(clean, 10)
        setResults(found)
      } catch (err) {
        console.error('User search failed', err)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  async function requestFriend(profile: MinkProfile) {
    setSendingTo(profile.id)
    setError(null)
    try {
      await sendFriendRequest(profile.id)
      showToast(`Friend request sent to @${profile.handle}`)
      onAdded(toPayContact(profile))
      onClose()
    } catch (err) {
      console.error('Sending friend request failed', err)
      setError("Couldn't send that friend request. Try again.")
    } finally {
      setSendingTo(null)
    }
  }

  function submitAddress() {
    const clean = addressValue.trim()
    if (!isValidAddress(clean)) {
      setError('Enter a valid wallet address (0x...).')
      return
    }
    // No friend-request concept for a raw address (no user id to target), so this
    // just opens the payment sheet directly rather than saving a "contact".
    onAdded({ handle: clean, name: `${clean.slice(0, 6)}…${clean.slice(-4)}` })
    onClose()
  }

  async function importFromPhone() {
    try {
      const props = ['name', 'tel']
      const contacts = await (navigator as any).contacts.select(props, { multiple: false })
      if (!contacts?.length) return
      const picked = contacts[0]
      const name = picked.name?.[0] ?? 'Contact'
      // No phone-number-to-handle resolution exists on the backend, so fall back
      // to a handle search using their name as a starting point.
      setTab('handle')
      setQuery(name)
    } catch (err) {
      console.error('Contact picker failed or was cancelled', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-[var(--color-paper)] rounded-t-3xl sm:rounded-3xl px-7 pt-5 pb-8 sm:pb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-bold text-lg">Add contact</p>
          <button onClick={onClose} aria-label="Close" className="p-1">
            <X className="h-5 w-5 text-[var(--color-ink-soft)]" />
          </button>
        </div>

        <div className="flex gap-2">
          <TabButton active={tab === 'handle'} onClick={() => { setTab('handle'); setError(null) }} icon={UserPlus} label="Handle" />
          <TabButton active={tab === 'address'} onClick={() => { setTab('address'); setError(null) }} icon={Wallet2} label="Address" />
          <TabButton active={tab === 'import'} onClick={() => { setTab('import'); setError(null) }} icon={Smartphone} label="Import" />
        </div>

        {tab === 'handle' && (
          <div className="mt-5">
            <div className="flex items-center rounded-full border border-[var(--color-line)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--color-ink-soft)]/60 mr-2 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or @handle"
                className="flex-1 outline-none bg-transparent text-sm"
              />
              {searching && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-ink-soft)]" />}
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            <div className="flex flex-col divide-y divide-[var(--color-line)] mt-3 max-h-64 overflow-y-auto">
              {results.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => requestFriend(profile)}
                  disabled={sendingTo === profile.id}
                  className="flex items-center gap-3 py-3 text-left w-full hover:bg-[var(--color-mink-tint)]/40 transition-colors disabled:opacity-60"
                >
                  <div className="h-10 w-10 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center overflow-hidden shrink-0">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.handle} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-semibold text-[var(--color-mink-deep)]">
                        {(profile.displayName ?? profile.handle).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{profile.displayName ?? `@${profile.handle}`}</p>
                    <p className="text-xs text-[var(--color-ink-soft)] truncate">@{profile.handle}</p>
                  </div>
                  {sendingTo === profile.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--color-ink-soft)]" />
                  ) : (
                    <span className="text-xs font-medium text-[var(--color-mink-deep)]">Add</span>
                  )}
                </button>
              ))}

              {!searching && query.trim() && results.length === 0 && (
                <p className="text-sm text-[var(--color-ink-soft)] py-6 text-center">
                  No one found for "{query.trim()}".
                </p>
              )}
            </div>
          </div>
        )}

        {tab === 'address' && (
          <div className="mt-5">
            <input
              autoFocus
              value={addressValue}
              onChange={(e) => setAddressValue(e.target.value.trim())}
              placeholder="0x..."
              className="w-full rounded-full border border-[var(--color-line)] px-4 py-3 text-sm outline-none focus:border-[var(--color-mink)] transition-colors"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <button
              onClick={submitAddress}
              disabled={!addressValue}
              className="w-full rounded-full bg-[var(--color-ink)] text-white font-semibold py-3 mt-4 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-40"
            >
              Pay this address
            </button>
          </div>
        )}

        {tab === 'import' && (
          <div className="mt-5 text-center">
            {hasContactPicker ? (
              <button
                onClick={importFromPhone}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-white font-semibold py-3 hover:bg-[var(--color-mink-deep)] transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                Choose from contacts
              </button>
            ) : (
              <p className="text-sm text-[var(--color-ink-soft)] py-4">
                Contact import isn't supported on this browser or device yet — it currently only works
                on Chrome for Android. Use Handle or Address instead.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof UserPlus
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-colors ${
        active
          ? 'bg-[var(--color-ink)] text-white'
          : 'bg-[var(--color-mink-tint)] text-[var(--color-ink-soft)] hover:bg-[var(--color-mink-light)]'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      {active && <Check className="h-3 w-3" />}
    </button>
  )
}
