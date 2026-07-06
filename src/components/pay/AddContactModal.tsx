import { useState } from 'react'
import { X, UserPlus, Wallet2, Smartphone, Check } from 'lucide-react'
import { addLocalContact, isValidHandle, isValidAddress } from '../../lib/localContacts'
import { useToast } from '../../context/ToastContext'
import type { PayContact } from './types'

type Tab = 'handle' | 'address' | 'import'

// Contact Picker API: Chrome on Android only, requires HTTPS, not available on
// desktop or iOS. Feature-detected below rather than assumed.
const hasContactPicker =
  typeof navigator !== 'undefined' && 'contacts' in navigator && 'select' in (navigator as any).contacts

export default function AddContactModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: (contact: PayContact) => void
}) {
  const [tab, setTab] = useState<Tab>('handle')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  function submitHandle() {
    const clean = value.trim().replace(/^@/, '')
    if (!isValidHandle(clean)) {
      setError('Enter a valid handle (letters, numbers, underscore).')
      return
    }
    save({ handle: clean })
  }

  function submitAddress() {
    const clean = value.trim()
    if (!isValidAddress(clean)) {
      setError('Enter a valid wallet address (0x...).')
      return
    }
    save({ handle: clean, name: `${clean.slice(0, 6)}…${clean.slice(-4)}` })
  }

  function save(contact: PayContact) {
    const result = addLocalContact(contact)
    if (!result.ok) {
      setError(result.reason ?? 'Could not save that contact.')
      return
    }
    showToast('Contact added')
    onAdded(contact)
    onClose()
  }

  async function importFromPhone() {
    try {
      const props = ['name', 'tel']
      const contacts = await (navigator as any).contacts.select(props, { multiple: false })
      if (!contacts?.length) return
      const picked = contacts[0]
      const name = picked.name?.[0] ?? 'Contact'
      // No phone-number-to-handle resolution backend exists, so this saves a
      // placeholder entry the person can complete with a real handle later.
      save({ handle: name.toLowerCase().replace(/\s+/g, '_'), name })
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
          <TabButton active={tab === 'handle'} onClick={() => { setTab('handle'); setError(null); setValue('') }} icon={UserPlus} label="Handle" />
          <TabButton active={tab === 'address'} onClick={() => { setTab('address'); setError(null); setValue('') }} icon={Wallet2} label="Address" />
          <TabButton active={tab === 'import'} onClick={() => { setTab('import'); setError(null) }} icon={Smartphone} label="Import" />
        </div>

        {tab === 'handle' && (
          <div className="mt-5">
            <p className="text-xs text-[var(--color-ink-soft)] mb-2">
              We don't have a public user directory yet, so enter their exact handle.
            </p>
            <div className="flex items-center rounded-full border border-[var(--color-line)] px-4 py-3">
              <span className="text-[var(--color-ink-soft)]/50 mr-0.5">@</span>
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\s/g, ''))}
                placeholder="handle"
                className="flex-1 outline-none bg-transparent text-sm"
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <button
              onClick={submitHandle}
              disabled={!value}
              className="w-full rounded-full bg-[var(--color-ink)] text-white font-semibold py-3 mt-4 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-40"
            >
              Add contact
            </button>
          </div>
        )}

        {tab === 'address' && (
          <div className="mt-5">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value.trim())}
              placeholder="0x..."
              className="w-full rounded-full border border-[var(--color-line)] px-4 py-3 text-sm outline-none focus:border-[var(--color-mink)] transition-colors"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <button
              onClick={submitAddress}
              disabled={!value}
              className="w-full rounded-full bg-[var(--color-ink)] text-white font-semibold py-3 mt-4 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-40"
            >
              Add contact
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
