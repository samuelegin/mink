import { useEffect, useRef, useState } from 'react'
import { Copy, Share2, Pencil, Check, X, Loader2 } from 'lucide-react'
import { getReadContract } from '../../lib/contracts'

const HANDLE_REGEX = /^[a-z0-9_]{1,32}$/

function sanitize(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9_]/g, '')
}

export default function HandleCard({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false)
  const [changing, setChanging] = useState(false)
  const [value, setValue] = useState('')
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value) {
      setAvailability('idle')
      return
    }
    if (!HANDLE_REGEX.test(value)) {
      setAvailability('invalid')
      return
    }
    setAvailability('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const ok: boolean = await getReadContract().isAvailable(value)
        setAvailability(ok ? 'available' : 'taken')
      } catch (err) {
        console.error('Availability check failed', err)
        setAvailability('idle')
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  function copyHandle() {
    navigator.clipboard.writeText(`@${handle}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function submitChange() {
    if (availability !== 'available') return
    // Wire to HandleRegistry.setAddress (or a rename flow) once ready.
    console.log('change handle to', value)
    setChanging(false)
    setValue('')
  }

  return (
    <div className="rounded-2xl bg-white border border-[var(--color-line)] shadow-sm p-5">
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]/60">Your Handle</p>
      <p className="font-display font-bold text-2xl mt-1">@{handle}</p>
      <p className="text-sm text-[var(--color-ink-soft)] mt-1">People can send money to this handle.</p>

      <div className="flex gap-2 mt-4">
        <button
          onClick={copyHandle}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] text-sm font-medium py-2.5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] text-sm font-medium py-2.5 hover:bg-[var(--color-mink-tint)] transition-colors">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
        <button
          onClick={() => setChanging((v) => !v)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] text-sm font-medium py-2.5 hover:bg-[var(--color-mink-tint)] transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Change
        </button>
      </div>

      {changing && (
        <div className="mt-4 pt-4 border-t border-[var(--color-line)]">
          <div
            className={`flex items-center rounded-full border-2 px-4 py-2.5 transition-colors ${
              availability === 'available'
                ? 'border-[var(--color-moss)]'
                : availability === 'taken' || availability === 'invalid'
                  ? 'border-red-400'
                  : 'border-[var(--color-line)] focus-within:border-[var(--color-mink)]'
            }`}
          >
            <span className="text-[var(--color-ink-soft)]/50 mr-0.5">@</span>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(sanitize(e.target.value))}
              placeholder="newhandle"
              maxLength={32}
              className="flex-1 outline-none bg-transparent text-sm"
            />
            {availability === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-ink-soft)]" />}
            {availability === 'available' && <Check className="h-4 w-4 text-[var(--color-moss)]" />}
            {(availability === 'taken' || availability === 'invalid') && <X className="h-4 w-4 text-red-400" />}
          </div>
          <div className="mt-1.5 min-h-[18px] text-xs">
            {availability === 'available' && <span className="text-[var(--color-moss)]">✓ Available</span>}
            {availability === 'taken' && <span className="text-red-500">Already taken</span>}
            {availability === 'invalid' && (
              <span className="text-red-500">Lowercase letters, numbers, underscore only</span>
            )}
          </div>
          <button
            onClick={submitChange}
            disabled={availability !== 'available'}
            className="mt-2 w-full rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-semibold py-2.5 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-40"
          >
            Save new handle
          </button>
        </div>
      )}
    </div>
  )
}
