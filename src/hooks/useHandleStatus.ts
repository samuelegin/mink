import { useCallback, useEffect, useState } from 'react'
import { getReadContract } from '../lib/contracts'

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
