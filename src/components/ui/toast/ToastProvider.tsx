import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Toast from '@/components/ui/toast/Toast'
import { ToastContext } from '@/components/ui/toast/toastContext'
import type { ToastApi, ToastOptions, ToastState } from '@/components/ui/toast/toastContext'

/** 빠지는 애니메이션(220ms)이 끝나지 않는 환경(탭 숨김 · 테스트)에서도 치우는 시간 */
const LEAVE_FALLBACK_MS = 400

/**
 * 한 번에 1개. 새 show 는 이전 토스트를 대체한다(새 토스트가 다시 올라온다). RootLayout 이 감싼다.
 * 닫기 · 시간 끝은 바로 지우지 않고 leaving 으로 두어 아래로 빠진 뒤 치운다
 */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastState & { leaving?: boolean }) | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seq = useRef(0)

  const remove = useCallback((id: number) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    leaveTimer.current = null
    setToast((cur) => (cur?.id === id ? null : cur))
  }, [])

  const leave = useCallback(
    (id: number) => {
      setToast((cur) => (cur?.id === id && !cur.leaving ? { ...cur, leaving: true } : cur))
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
      leaveTimer.current = setTimeout(() => remove(id), LEAVE_FALLBACK_MS)
    },
    [remove],
  )

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    leave(seq.current)
  }, [leave])

  const show = useCallback(
    (message: string, opts?: ToastOptions) => {
      if (timer.current) clearTimeout(timer.current)
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
      leaveTimer.current = null
      const id = ++seq.current
      setToast({ id, message, action: opts?.action })
      const ms = opts?.durationMs ?? (opts?.action ? 5000 : 3000)
      timer.current = setTimeout(() => {
        timer.current = null
        leave(id)
      }, ms)
    },
    [leave],
  )

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    },
    [],
  )

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          action={toast.action}
          onDismiss={dismiss}
          leaving={toast.leaving}
          onLeft={() => remove(toast.id)}
        />
      )}
    </ToastContext.Provider>
  )
}
