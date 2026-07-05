import { useState } from 'react'
import ProfileHeroCard from '../you/ProfileHeroCard'
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

export default function YouScreen({ handle }: { handle: string }) {
  const { user, logout } = useAuth()
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
    <div className="mx-auto max-w-[760px] px-5 lg:px-8 pt-6 pb-28 lg:pb-16">
      <h1 className="font-display font-bold text-3xl mb-6">You</h1>

      <ProfileHeroCard
        name={displayName(user?.email ?? null)}
        handle={handle}
        onShare={shareHandle}
        onShowQR={() => setShowQR(true)}
      />

      <SettingsSection title="Account">
        <SettingsRow label="Email" value={user?.email ?? '—'} />
        <SettingsRow label="Wallet" value={user ? truncateAddress(user.address) : '—'} />
        <SettingsRow label="Handle" value={`@${handle}`} />
        <SettingsRow label="Connected login" value="Email or Google" />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsRow label="Notifications" trailing={<Toggle checked={notifications} onChange={setNotifications} />} />
        <SettingsRow label="Currency" value="USD" onClick={() => {}} />
        <SettingsRow label="Dark Mode" trailing={<Toggle checked={darkMode} onChange={setDarkMode} />} />
        <SettingsRow label="Privacy" trailing={<Toggle checked={privacy} onChange={setPrivacy} />} />
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingsRow label="Backup Wallet" onClick={() => {}} />
        <SettingsRow label="Connected sessions" value="Coming soon" />
        <SettingsRow label="Log Out" onClick={logout} danger />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsRow label="Help Center" onClick={() => {}} />
        <SettingsRow label="Contact Support" onClick={() => {}} />
        <SettingsRow label="Terms" onClick={() => {}} />
        <SettingsRow label="Privacy Policy" onClick={() => {}} />
      </SettingsSection>

      {showQR && <QRModal handle={handle} onClose={() => setShowQR(false)} />}
    </div>
  )
}
