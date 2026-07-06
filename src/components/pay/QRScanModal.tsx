import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import jsQR from 'jsqr'
import { X, Upload, Camera, RotateCcw } from 'lucide-react'
import { parseClipboardForRecipient } from '../../lib/clipboardParse'

type ScanState = 'requesting' | 'scanning' | 'denied' | 'unsupported' | 'found'

export default function QRScanModal({
  onClose,
  onResolved,
}: {
  onClose: () => void
  onResolved: (recipient: { handle?: string; address?: string }) => void
}) {
  const [state, setState] = useState<ScanState>('requesting')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported')
      return
    }

    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        setState('scanning')
        tick()
      })
      .catch((err) => {
        console.error('Camera access failed', err)
        setState('denied')
      })

    function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code?.data) {
            handleDecoded(code.data)
            return
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleDecoded(text: string) {
    const parsed = parseClipboardForRecipient(text)
    if (!parsed) return
    setState('found')
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setTimeout(() => {
      onResolved(parsed.kind === 'handle' ? { handle: parsed.value } : { address: parsed.value })
    }, 400)
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code?.data) {
        handleDecoded(code.data)
      } else {
        setState('denied') // reuse the friendly-message slot for "couldn't read that image"
      }
    }
    img.src = URL.createObjectURL(file)
  }

  function retryPermission() {
    setState('requesting')
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        setState('scanning')
      })
      .catch(() => setState('denied'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <button onClick={onClose} aria-label="Close" className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/10">
        <X className="h-5 w-5 text-white" />
      </button>

      {state === 'scanning' && (
        <>
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
          <div className="relative h-64 w-64 rounded-3xl border-2 border-white/70" />
          <p className="absolute bottom-24 text-white/80 text-sm">Point your camera at a Mink QR code</p>
        </>
      )}

      {state === 'found' && (
        <div className="text-center text-white">
          <div className="h-16 w-16 rounded-full bg-[var(--color-moss)] flex items-center justify-center mx-auto">
            <Camera className="h-7 w-7" />
          </div>
          <p className="font-display font-bold text-lg mt-4">Handle found</p>
        </div>
      )}

      {state === 'requesting' && (
        <p className="text-white/70 text-sm">Requesting camera access…</p>
      )}

      {(state === 'denied' || state === 'unsupported') && (
        <div className="w-full max-w-sm px-6 text-center">
          <div className="bg-white rounded-3xl p-7">
            <p className="font-display font-bold text-lg">
              {state === 'unsupported' ? 'Camera not available' : "Couldn't access your camera"}
            </p>
            <p className="text-sm text-[var(--color-ink-soft)] mt-2">
              {state === 'unsupported'
                ? 'Your browser or device does not support camera scanning. Try uploading a QR image instead.'
                : "We couldn't get permission to use your camera. You can allow it in your browser settings, or upload a QR image instead."}
            </p>

            <div className="flex flex-col gap-2.5 mt-5">
              {state === 'denied' && (
                <button
                  onClick={retryPermission}
                  className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-ink)] text-white font-semibold py-3 hover:bg-[var(--color-mink-deep)] transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] font-semibold py-3 hover:bg-[var(--color-mink-tint)] transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload QR image
              </button>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
    </div>
  )
}
