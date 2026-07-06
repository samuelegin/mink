import { useState } from 'react'
import BottomNav, { type Tab } from './BottomNav'
import Sidebar from './Sidebar'
import HomeScreen from './HomeScreen'
import PayScreen from './PayScreen'
import ActivityScreen from './ActivityScreen'
import YouScreen from './YouScreen'

export default function AppShell({ handle }: { handle: string }) {
  const [tab, setTab] = useState<Tab>('home')

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <Sidebar active={tab} onChange={setTab} />

      <div className="lg:pl-[220px]">
        {tab === 'home' && <HomeScreen handle={handle} onSend={() => setTab('pay')} onOpenProfile={() => setTab('you')} />}
        {tab === 'pay' && <PayScreen />}
        {tab === 'activity' && <ActivityScreen onSend={() => setTab('pay')} />}
        {tab === 'you' && <YouScreen handle={handle} />}
      </div>

      <BottomNav active={tab} onChange={setTab} onSend={() => setTab('pay')} />
    </div>
  )
}
