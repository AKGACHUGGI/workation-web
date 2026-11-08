import { useCallback } from 'react'
import { useToast } from '@/components/ui/toast/useToast'

/** 현재 URL 복사 + 토스트 */
export function useShareUrl(): () => void {
  const { show } = useToast()
  return useCallback(() => {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => show('링크를 복사했습니다'))
      .catch(() => show('링크를 복사하지 못했습니다'))
  }, [show])
}
