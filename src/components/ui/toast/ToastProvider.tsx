import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Toast from '@/components/ui/toast/Toast'
import { ToastContext } from '@/components/ui/toast/toastContext'
import type { ToastApi, ToastOptions, ToastState } from '@/components/ui/toast/toastContext'

/** 한 번에 1개. 새 show 는 이전 토스트를 대체한다. RootLayout 이 감싼다. */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seq = useRef(0)

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setToast(null)
  }, [])

  const show = useCallback((message: string, opts?: ToastOptions) => {
    if (timer.current) clearTimeout(timer.current)
    const id = ++seq.current
    setToast({ id, message, action: opts?.action })
    const ms = opts?.durationMs ?? (opts?.action ? 5000 : 3000)
    timer.current = setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur))
      timer.current = null
    }, ms)
  }, [])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <Toast key={toast.id} message={toast.message} action={toast.action} onDismiss={dismiss} />
      )}
    </ToastContext.Provider>
  )
}
