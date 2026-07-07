import { useEffect, useMemo, useState } from 'react'
import { QrCode, UserPlus, Wallet2 } from 'lucide-react'
import PaySearchBar from '../pay/PaySearchBar'
import QuickActionCards from '../pay/QuickActionCards'
import RecentPeoplePay from '../pay/RecentPeoplePay'
import ContactsList from '../pay/ContactsList'
import PaymentSheet from '../pay/PaymentSheet'
import RequestMoneySheet from '../pay/RequestMoneySheet'
import QRScanModal from '../pay/QRScanModal'
import InviteModal from '../pay/InviteModal'
import AddContactModal from '../pay/AddContactModal'
import type { PayContact } from '../pay/types'
import { listFriends, recentContacts } from '../../lib/api/friends'
import { parseClipboardForRecipient } from '../../lib/clipboardParse'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'

const HANDLE_REGEX = /^[a-z0-9_]{1,32}$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

type Modal = 'scan' | 'invite' | 'addContact' | null

export default function PayScreen({ intent = 'send' }: { intent?: 'send' | 'request' }) {
  const { backendReady } = useAuth()
  const [query, setQuery] = useState('')
  const [activePerson, setActivePerson] = useState<PayContact | null>(null)
  const [contacts, setContacts] = useState<PayContact[]>([])
  const [recentPeople, setRecentPeople] = useState<PayContact[]>([])
  const [modal, setModal] = useState<Modal>(null)
  const { showToast } = useToast()

  async function loadContacts() {
    try {
      const [friends, recent] = await Promise.all([listFriends(), recentContacts()])
      setContacts(friends)
      setRecentPeople(recent)
    } catch (err) {
      console.error('Failed to load contacts', err)
      showToast("Couldn't load your contacts. Pull to refresh once you're back online.")
    }
  }

  useEffect(() => {
    if (backendReady) loadContacts()
  }, [backendReady])

  const normalizedQuery = query.trim().toLowerCase().replace(/^@/, '')

  const filteredContacts = useMemo(() => {
    if (!normalizedQuery) return contacts
    return contacts.filter(
      (c) =>
        c.handle.toLowerCase().includes(normalizedQuery) ||
        (c.name ?? '').toLowerCase().includes(normalizedQuery)
    )
  }, [contacts, normalizedQuery])

  const filteredRecent = useMemo(() => {
    if (!normalizedQuery) return recentPeople
    return recentPeople.filter(
      (c) =>
        c.handle.toLowerCase().includes(normalizedQuery) ||
        (c.name ?? '').toLowerCase().includes(normalizedQuery)
    )
  }, [recentPeople, normalizedQuery])

  const isSearching = normalizedQuery.length > 0
  const hasAnyMatch = filteredContacts.length > 0 || filteredRecent.length > 0
  const trimmedQuery = query.trim()
  const canPayTypedHandle = isSearching && HANDLE_REGEX.test(normalizedQuery) && !hasAnyMatch
  const canPayTypedAddress = isSearching && ADDRESS_REGEX.test(trimmedQuery) && !hasAnyMatch

  async function handlePaymentSettled() {
    // Refresh balances/activity here once those read from real chain/backend data.
  }

  function handleQRResolved(recipient: { handle?: string; address?: string }) {
    setModal(null)
    if (recipient.handle) {
      setActivePerson({ handle: recipient.handle })
    } else if (recipient.address) {
      setActivePerson({ handle: recipient.address, name: `${recipient.address.slice(0, 6)}…${recipient.address.slice(-4)}` })
    }
  }

  async function handlePasteHandle() {
    try {
      const text = await navigator.clipboard.readText()
      const parsed = parseClipboardForRecipient(text)
      if (!parsed) {
        showToast('No valid Mink handle found in your clipboard.')
        return
      }
      setQuery(parsed.value)
    } catch (err) {
      console.error('Clipboard read failed', err)
      showToast("We couldn't read your clipboard. Check your browser permissions.")
    }
  }

  function handleEnterSearch() {
    if (canPayTypedHandle) {
      setActivePerson({ handle: normalizedQuery })
    } else if (canPayTypedAddress) {
      setActivePerson({ handle: trimmedQuery, name: `${trimmedQuery.slice(0, 6)}…${trimmedQuery.slice(-4)}` })
    } else if (filteredContacts.length === 1) {
      setActivePerson(filteredContacts[0])
    }
  }

  function handleContactAdded(contact: PayContact) {
    // Sending a friend request doesn't make them a friend yet (pending acceptance),
    // so we don't add them to `contacts` optimistically — just let the person pay
    // them right away, and re-sync the real list in case anything changed.
    loadContacts()
    setActivePerson(contact)
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 lg:px-8 pt-6 pb-28 lg:pb-16">
      <h1 className="font-display font-bold text-3xl lg:text-4xl">{intent === 'request' ? 'Request' : 'Pay'}</h1>
      <p className="text-[var(--color-ink-soft)] mt-1">
        {intent === 'request'
          ? 'Ask a friend to send you money using their @handle.'
          : 'Send money to friends using their @handle.'}
      </p>

      <div className="mt-6">
        <PaySearchBar value={query} onChange={setQuery} onEnter={handleEnterSearch} />
      </div>

      {isSearching ? (
        <div className="mt-6 flex flex-col gap-1">
          {filteredRecent.map((person) => (
            <SearchResultRow key={`recent-${person.handle}`} person={person} tag="Recently paid" onSelect={setActivePerson} />
          ))}
          {filteredContacts.map((person) => (
            <SearchResultRow key={`contact-${person.handle}`} person={person} tag="Contact" onSelect={setActivePerson} />
          ))}
          {canPayTypedHandle && (
            <button
              onClick={() => setActivePerson({ handle: normalizedQuery })}
              className="flex items-center gap-3 py-3.5 text-left w-full hover:bg-[var(--color-mink-tint)]/40 rounded-xl transition-colors"
            >
              <div className="h-11 w-11 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center shrink-0">
                <UserPlus className="h-5 w-5 text-[var(--color-mink-deep)]" />
              </div>
              <p className="text-sm font-medium">
                Pay <span className="text-[var(--color-mink-deep)]">@{normalizedQuery}</span>
              </p>
            </button>
          )}
          {canPayTypedAddress && (
            <button
              onClick={() => setActivePerson({ handle: trimmedQuery, name: `${trimmedQuery.slice(0, 6)}…${trimmedQuery.slice(-4)}` })}
              className="flex items-center gap-3 py-3.5 text-left w-full hover:bg-[var(--color-mink-tint)]/40 rounded-xl transition-colors"
            >
              <div className="h-11 w-11 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center shrink-0">
                <Wallet2 className="h-5 w-5 text-[var(--color-mink-deep)]" />
              </div>
              <p className="text-sm font-medium">
                Pay <span className="text-[var(--color-mink-deep)]">{trimmedQuery.slice(0, 10)}…{trimmedQuery.slice(-6)}</span>
              </p>
            </button>
          )}
          {!hasAnyMatch && !canPayTypedHandle && !canPayTypedAddress && (
            <p className="text-sm text-[var(--color-ink-soft)] py-6 text-center">
              No matches. Try a different name or @handle.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-9 mt-8">
          <QuickActionCards
            onScan={() => setModal('scan')}
            onPasteHandle={handlePasteHandle}
            onInvite={() => setModal('invite')}
            onNewContact={() => setModal('addContact')}
          />
          <RecentPeoplePay people={recentPeople} onSelect={setActivePerson} />
          <ContactsList
            contacts={contacts}
            onSelect={setActivePerson}
            onInvite={() => setModal('invite')}
            onScan={() => setModal('scan')}
          />
        </div>
      )}

      <button
        onClick={() => setModal('scan')}
        aria-label="Scan QR"
        className="lg:hidden fixed bottom-24 right-5 h-14 w-14 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] shadow-lg flex items-center justify-center hover:bg-[var(--color-mink-deep)] active:scale-95 transition-all duration-150 z-30"
      >
        <QrCode className="h-6 w-6" />
      </button>

      {activePerson && intent === 'request' && (
        <RequestMoneySheet person={activePerson} onClose={() => setActivePerson(null)} />
      )}

      {activePerson && intent !== 'request' && (
        <PaymentSheet person={activePerson} onClose={() => setActivePerson(null)} onSettled={handlePaymentSettled} />
      )}

      {modal === 'scan' && <QRScanModal onClose={() => setModal(null)} onResolved={handleQRResolved} />}
      {modal === 'invite' && <InviteModal onClose={() => setModal(null)} />}
      {modal === 'addContact' && <AddContactModal onClose={() => setModal(null)} onAdded={handleContactAdded} />}
    </div>
  )
}

function SearchResultRow({
  person,
  tag,
  onSelect,
}: {
  person: PayContact
  tag: string
  onSelect: (person: PayContact) => void
}) {
  return (
    <button
      onClick={() => onSelect(person)}
      className="flex items-center gap-3 py-3.5 text-left w-full hover:bg-[var(--color-mink-tint)]/40 rounded-xl transition-colors"
    >
      <div className="h-11 w-11 rounded-full bg-[var(--color-mink-tint)] flex items-center justify-center shrink-0">
        <span className="font-semibold text-[var(--color-mink-deep)]">
          {(person.name ?? person.handle).charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{person.name ?? `@${person.handle}`}</p>
        <p className="text-xs text-[var(--color-ink-soft)] truncate">@{person.handle}</p>
      </div>
      <span className="text-xs text-[var(--color-ink-soft)]/60 shrink-0">{tag}</span>
    </button>
  )
}
