const LINK_REGEX = /mink\.app\/pay\/([a-z0-9_]+)/i
const HANDLE_REGEX = /^@?([a-z0-9_]{1,32})$/i
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export type ParsedClipboard =
  | { kind: 'handle'; value: string }
  | { kind: 'address'; value: string }
  | null

export function parseClipboardForRecipient(raw: string): ParsedClipboard {
  const text = raw.trim()
  if (!text) return null

  const linkMatch = text.match(LINK_REGEX)
  if (linkMatch) return { kind: 'handle', value: linkMatch[1] }

  if (ADDRESS_REGEX.test(text)) return { kind: 'address', value: text }

  const handleMatch = text.match(HANDLE_REGEX)
  if (handleMatch) return { kind: 'handle', value: handleMatch[1] }

  return null
}
