import { useEffect, useRef, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { listNotifications, markNotificationRead, type MinkNotification } from '../../lib/api/notifications'
import { useAuth } from '../../context/AuthContext'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationsBell({ className }: { className?: string }) {
  const { backendReady } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<MinkNotification[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  async function load() {
    setLoading(true)
    try {
      const items = await listNotifications()
      setNotifications(items)
    } catch (err) {
      console.error('Failed to load notifications', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!backendReady) return
    load()
    // Light polling so the badge count stays reasonably fresh without a websocket.
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [backendReady])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleOpenNotification(notification: MinkNotification) {
    if (!notification.read) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
      try {
        await markNotificationRead(notification.id)
      } catch (err) {
        console.error('Failed to mark notification read', err)
      }
    }
  }

  return (
    <div className={`relative ${className ?? ''}`} ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative h-9 w-9 rounded-full bg-white border border-[var(--color-line)] flex items-center justify-center hover:bg-[var(--color-mink-tint)]/40 transition-colors"
      >
        <Bell className="h-4 w-4 text-[var(--color-ink-soft)]" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-[var(--color-mink)] text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl bg-white border border-[var(--color-line)] shadow-lg z-40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-line)]">
            <p className="font-display font-bold text-sm">Notifications</p>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4 text-[var(--color-ink-soft)]" />
            </button>
          </div>

          {loading && notifications.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)] text-center py-8">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)] text-center py-8">You're all caught up.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--color-line)]">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleOpenNotification(n)}
                  className={`text-left px-4 py-3 hover:bg-[var(--color-mink-tint)]/30 transition-colors ${
                    n.read ? '' : 'bg-[var(--color-mink-tint)]/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-mink)] mt-1.5 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-[var(--color-ink-soft)]/60 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
