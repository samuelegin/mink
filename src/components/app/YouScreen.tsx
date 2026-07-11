import { useState } from 'react'
import IdentityCard from '../you/IdentityCard'
import QRModal from '../you/QRModal'
import { SettingsSection, SettingsRow } from '../you/SettingsSection'
import Toggle from '../you/Toggle'
import { useAuth } from '../../context/AuthContext'

function displayName(email: string | null) {
  if (!email) return 'You'
  const local = email.split('@')[0]
  return local.charAt(0).toUpperCase() + local.slice(1)
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function loginMethodLabel(provider: string | null | undefined, email: string | null) {
  // The backend always records login_provider as "magic_link" for every Magic-based
  // login (see api/v1/services/user.py's get_or_create_by_magic_issuer), regardless
  // of whether the person actually used email or Google — it doesn't distinguish
  // them server-side. So this can only honestly say "via Magic", not name the
  // specific method, unless that gets tracked client-side separately later.
  if (!provider) return 'Email or Google'
  return email ? `Magic (${email})` : 'Magic'
}

export default function YouScreen({ handle }: { handle: string }) {
  const { user, profile, logout } = useAuth()
  const [showQR, setShowQR] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [privacy, setPrivacy] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  function shareHandle() {
    const url = `https://mink.app/pay/${handle}`
    if (navigator.share) {
      navigator.share({ title: 'Pay me on Mink', text: `Pay @${handle} on Mink`, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="mx-auto max-w-[920px] px-5 lg:px-8 pt-6 pb-28 lg:pb-16">
      <h1 className="font-display font-bold text-3xl mb-6">You</h1>

      {user && (
        <IdentityCard
          name={profile?.display_name ?? displayName(user.email ?? null)}
          handle={handle}
          address={user.address}
          onShare={shareHandle}
          onShowQR={() => setShowQR(true)}
        />
      )}

      <SettingsSection title="Account">
        <SettingsRow label="Email" value={user?.email ?? '—'} />
        <SettingsRow
          label="Wallet"
          value={user ? truncateAddress(user.address) : '—'}
          copyValue={user?.address}
        />
        <SettingsRow label="Handle" value={`@${handle}`} copyValue={`@${handle}`} />
        <SettingsRow label="Connected login" value={loginMethodLabel(profile?.login_provider, user?.email ?? null)} />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsRow label="Notifications" trailing={<Toggle checked={notifications} onChange={setNotifications} />} />
        <SettingsRow label="Currency" value="USD" onClick={() => {}} />
        <SettingsRow label="Dark Mode" trailing={<Toggle checked={darkMode} onChange={setDarkMode} />} />
        <SettingsRow label="Privacy" trailing={<Toggle checked={privacy} onChange={setPrivacy} />} />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsRow label="Help Center" onClick={() => {}} />
        <SettingsRow label="Contact Support" onClick={() => {}} />
        <SettingsRow label="Terms" onClick={() => {}} />
        <SettingsRow label="Privacy Policy" onClick={() => {}} />
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingsRow label="Backup Wallet" onClick={() => {}} />
        <SettingsRow label="Connected sessions" value="Coming soon" />
      </SettingsSection>

      <button
        onClick={logout}
        className="w-full min-h-[57px] flex items-center px-5 mt-4 rounded-2xl text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
      >
        Log Out
      </button>

      {showQR && <QRModal handle={handle} onClose={() => setShowQR(false)} />}
    </div>
  )
}
