import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Share2 } from 'lucide-react'

// Placeholder deep-link scheme until real payment-link routing exists.
function payLinkFor(handle: string) {
  return `https://mink.app/pay/${handle}`
}

export default function QRPaymentCard({ handle }: { handle: string }) {
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
    <div className="rounded-2xl bg-white border border-[var(--color-line)] shadow-sm p-6 flex flex-col items-center text-center">
      <p className="font-display font-bold text-lg">Receive Money</p>
      <p className="text-sm text-[var(--color-ink-soft)] mt-1 max-w-xs">
        Anyone can scan this code or use your handle.
      </p>

      <div className="mt-5 h-[240px] w-[240px] rounded-2xl bg-[var(--color-mink-tint)]/40 flex items-center justify-center overflow-hidden transition-opacity duration-300" style={{ opacity: dataUrl ? 1 : 0.4 }}>
        {dataUrl && <img src={dataUrl} alt={`QR code to pay @${handle} on Mink`} className="w-full h-full" />}
      </div>

      <div className="flex gap-2.5 w-full mt-5">
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
  )
}
