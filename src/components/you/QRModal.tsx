import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { X, Download, Share2 } from 'lucide-react'

function payLinkFor(handle: string) {
  return `https://mink.app/pay/${handle}`
}

export default function QRModal({ handle, onClose }: { handle: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(payLinkFor(handle), {
      width: 240,
      margin: 1,
      color: { dark: '#16140F', light: '#00000000' },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch((err) => console.error('QR generation failed', err))
    return () => {
      cancelled = true
    }
  }, [handle])

  function saveQR() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `mink-${handle}-qr.png`
    a.click()
  }

  async function shareQR() {
    if (!dataUrl) return
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `mink-${handle}-qr.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Pay me on Mink', text: `Pay @${handle} on Mink` })
        return
      }
    } catch (err) {
      console.error('Share failed, falling back to link copy', err)
    }
    navigator.clipboard.writeText(payLinkFor(handle))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-[var(--color-paper)] rounded-3xl p-6 flex flex-col items-center text-center">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1">
          <X className="h-5 w-5 text-[var(--color-ink-soft)]" />
        </button>

        <p className="font-display font-bold text-lg mt-2">Receive Money</p>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">
          Anyone can scan this to pay @{handle}.
        </p>

        <div
          className="mt-5 h-[220px] w-[220px] rounded-2xl bg-[var(--color-mink-tint)]/40 flex items-center justify-center overflow-hidden transition-opacity duration-300"
          style={{ opacity: dataUrl ? 1 : 0.4 }}
        >
          {dataUrl && <img src={dataUrl} alt={`QR code to pay @${handle} on Mink`} className="w-full h-full" />}
        </div>

        <div className="flex gap-2.5 w-full mt-6">
          <button
            onClick={saveQR}
            disabled={!dataUrl}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] font-semibold text-sm py-2.5 hover:bg-[var(--color-mink-tint)] transition-colors disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Save QR
          </button>
          <button
            onClick={shareQR}
            disabled={!dataUrl}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold text-sm py-2.5 hover:bg-[var(--color-mink-deep)] transition-colors disabled:opacity-40"
          >
            <Share2 className="h-4 w-4" />
            Share QR
          </button>
        </div>
      </div>
    </div>
  )
}
