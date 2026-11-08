import { createContext } from 'react'

export type ToastOptions = {
  action?: { label: string; onClick: () => void }
  /** 기본 3000. action 이 있으면 5000 */
  durationMs?: number
}

export type ToastApi = {
  show: (message: string, opts?: ToastOptions) => void
  dismiss: () => void
}

export type ToastState = { id: number; message: string; action?: ToastOptions['action'] }

export const ToastContext = createContext<ToastApi | null>(null)
