import { useContext } from 'react'
import { ToastContext } from '@/components/ui/toast/toastContext'
import type { ToastApi } from '@/components/ui/toast/toastContext'

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used within ToastProvider')
  return api
}
