import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type Toast = { id: number; message: string }

const ToastContext = createContext<{ showToast: (message: string) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 2600)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 lg:bottom-8 inset-x-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-medium rounded-full px-5 py-3 shadow-lg animate-toast-in"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
