const TAKEN_HANDLES = new Set(['sam', 'admin', 'mink', 'test', 'support', 'help'])

function key(address: string) {
  return `mink_mock_handle_${address.toLowerCase()}`
}

function allClaimedHandles(): Set<string> {
  const claimed = new Set<string>(TAKEN_HANDLES)
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith('mink_mock_handle_')) {
      const v = localStorage.getItem(k)
      if (v) claimed.add(v)
    }
  }
  return claimed
}

export async function mockGetHandle(address: string): Promise<string | null> {
  return localStorage.getItem(key(address))
}

export async function mockIsAvailable(handle: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 250))
  return !allClaimedHandles().has(handle)
}

export async function mockClaimHandle(address: string, handle: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 500))
  if (allClaimedHandles().has(handle)) {
    throw new Error('HandleTaken')
  }
  localStorage.setItem(key(address), handle)
}
