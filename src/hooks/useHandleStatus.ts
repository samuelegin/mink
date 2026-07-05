import { useCallback, useEffect, useState } from 'react'
import { getReadContract } from '../lib/contracts'
import { USE_MOCK_HANDLE_CLAIM } from '../lib/mockConfig'
import { mockGetHandle } from '../lib/mockHandleRegistry'

export function useHandleStatus(address: string | undefined) {
  const [handle, setHandle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!address) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      if (USE_MOCK_HANDLE_CLAIM) {
        setHandle(await mockGetHandle(address))
        return
      }
      const contract = getReadContract()
      const result: string = await contract.handleOf(address)
      setHandle(result && result.length > 0 ? result : null)
    } catch (err) {
      console.error('Failed to read handle', err)
      setHandle(null)
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { handle, loading, refresh }
}
