import { useMemo, useState } from 'react'
import { QrCode, UserPlus } from 'lucide-react'
import PaySearchBar from '../pay/PaySearchBar'
import QuickActionCards from '../pay/QuickActionCards'
import RecentPeoplePay from '../pay/RecentPeoplePay'
import ContactsList from '../pay/ContactsList'
import PaymentSheet from '../pay/PaymentSheet'
import type { PayContact } from '../pay/types'

const HANDLE_REGEX = /^[a-z0-9_]{1,32}$/

export default function PayScreen() {
  const [query, setQuery] = useState('')
  const [activePerson, setActivePerson] = useState<PayContact | null>(null)
  const recentPeople: PayContact[] = []
 const contacts: PayContact[] = []

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
  const canPayTypedHandle = isSearching && HANDLE_REGEX.test(normalizedQuery) && !hasAnyMatch

  async function handlePaymentSettled() {
    // Refresh balances/activity here once those read from real chain/backend data.
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 lg:px-8 pt-6 pb-28 lg:pb-16">
      <h1 className="font-display font-bold text-3xl lg:text-4xl">Pay</h1>
      <p className="text-[var(--color-ink-soft)] mt-1">Send money to friends using their @handle.</p>

      <div className="mt-6">
        <PaySearchBar value={query} onChange={setQuery} />
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
          {!hasAnyMatch && !canPayTypedHandle && (
            <p className="text-sm text-[var(--color-ink-soft)] py-6 text-center">
              No matches. Try a different name or @handle.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-9 mt-8">
          <QuickActionCards
            onScan={() => {}}
            onPasteHandle={() => {}}
            onInvite={() => {}}
            onNewContact={() => {}}
          />
          <RecentPeoplePay people={recentPeople} onSelect={setActivePerson} />
          <ContactsList
            contacts={contacts}
            onSelect={setActivePerson}
            onInvite={() => {}}
            onScan={() => {}}
          />
        </div>
      )}

      <button
        aria-label="Scan QR"
        className="lg:hidden fixed bottom-24 right-5 h-14 w-14 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] shadow-lg flex items-center justify-center hover:bg-[var(--color-mink-deep)] transition-colors z-30"
      >
        <QrCode className="h-6 w-6" />
      </button>

      {activePerson && (
        <PaymentSheet person={activePerson} onClose={() => setActivePerson(null)} onSettled={handlePaymentSettled} />
      )}
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