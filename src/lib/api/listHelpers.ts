// UNVERIFIED SHAPE — list endpoints might return a bare array or a wrapped
// object like { results: [...] }, { items: [...] }, or { data: [...] }. This
// helper tries all of them so individual adapters don't have to guess.
export function extractList(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[]
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.results)) return obj.results as Record<string, unknown>[]
    if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[]
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[]
  }
  console.warn('Unexpected list response shape:', raw)
  return []
}
