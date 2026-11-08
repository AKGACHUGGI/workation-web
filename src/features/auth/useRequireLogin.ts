import { useCallback } from 'react'
import { useToast } from '@/components/ui/toast/useToast'

/**
 * 쓰기 동작(즐겨찾기·팁·투표·사진) 앞에 건다.
 * 공통 기반 스텁: 항상 비로그인으로 보고 토스트만 띄운다. W-07 이 내부를 로그인 모달로 교체한다(시그니처 유지).
 */
export function useRequireLogin(): (action: () => void) => void {
  const { show } = useToast()
  return useCallback(
    (_action: () => void) => {
      show('로그인이 필요합니다')
    },
    [show],
  )
}
