import type { PayContact } from '../components/pay/types'

const STORAGE_KEY = 'mink_local_contacts'

function readAll(): PayContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(contacts: PayContact[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
}

export function listLocalContacts(): PayContact[] {
  return readAll()
}

export function addLocalContact(contact: PayContact): { ok: boolean; reason?: string } {
  const contacts = readAll()
  if (contacts.some((c) => c.handle.toLowerCase() === contact.handle.toLowerCase())) {
    return { ok: false, reason: 'This contact is already saved.' }
  }
  writeAll([...contacts, contact])
  return { ok: true }
}

const HANDLE_REGEX = /^[a-z0-9_]{1,32}$/i
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export function isValidHandle(value: string): boolean {
  return HANDLE_REGEX.test(value)
}

export function isValidAddress(value: string): boolean {
  return ADDRESS_REGEX.test(value)
}
