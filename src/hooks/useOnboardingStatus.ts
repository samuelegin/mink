import { useEffect, useState } from 'react'

function storageKey(address: string) {
  return `mink_onboarded_${address.toLowerCase()}`
}

export function useOnboardingStatus(address: string | undefined) {
  const [onboarded, setOnboarded] = useState(false)

  useEffect(() => {
    if (!address) return
    setOnboarded(localStorage.getItem(storageKey(address)) === 'true')
  }, [address])

  function markOnboarded() {
    if (!address) return
    localStorage.setItem(storageKey(address), 'true')
    setOnboarded(true)
  }

  return { onboarded, markOnboarded }
}
