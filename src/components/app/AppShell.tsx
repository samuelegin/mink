import { useState } from 'react'
import BottomNav, { type Tab } from './BottomNav'
import Sidebar from './Sidebar'
import HomeScreen from './HomeScreen'
import PayScreen from './PayScreen'
import ActivityScreen from './ActivityScreen'
import YouScreen from './YouScreen'

export default function AppShell({ handle }: { handle: string }) {
  const [tab, setTab] = useState<Tab>('home')
  const [payIntent, setPayIntent] = useState<'send' | 'request'>('send')

  function goToPay(intent: 'send' | 'request' = 'send') {
    setPayIntent(intent)
    setTab('pay')
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <Sidebar active={tab} onChange={setTab} />

      <div className="lg:pl-[220px]">
        {tab === 'home' && (
          <HomeScreen
            handle={handle}
            onSend={() => goToPay('send')}
            onRequest={() => goToPay('request')}
            onOpenProfile={() => setTab('you')}
          />
        )}
        {tab === 'pay' && <PayScreen intent={payIntent} />}
        {tab === 'activity' && <ActivityScreen onSend={() => goToPay('send')} />}
        {tab === 'you' && <YouScreen handle={handle} />}
      </div>

      <BottomNav active={tab} onChange={setTab} onSend={() => goToPay('send')} />
    </div>
  )
}
