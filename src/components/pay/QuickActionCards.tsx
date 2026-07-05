import { QrCode, ClipboardPaste, UserPlus, Contact } from 'lucide-react'

export default function QuickActionCards({
  onScan,
  onPasteHandle,
  onInvite,
  onNewContact,
}: {
  onScan: () => void
  onPasteHandle: () => void
  onInvite: () => void
  onNewContact: () => void
}) {
  const actions = [
    { icon: QrCode, label: 'Scan QR', onClick: onScan },
    { icon: ClipboardPaste, label: 'Paste Handle', onClick: onPasteHandle },
    { icon: UserPlus, label: 'Invite Friend', onClick: onInvite },
    { icon: Contact, label: 'New Contact', onClick: onNewContact },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-white border border-[var(--color-line)] py-6 px-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:shadow-none"
        >
          <div className="h-11 w-11 rounded-xl bg-[var(--color-mink-tint)] flex items-center justify-center">
            <action.icon className="h-5 w-5 text-[var(--color-mink-deep)]" strokeWidth={2} />
          </div>
          <span className="text-sm font-medium text-center">{action.label}</span>
        </button>
      ))}
    </div>
  )
}
