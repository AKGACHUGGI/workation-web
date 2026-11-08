import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '@/components/ui/toast/useToast'
import { useAuthContext } from '@/features/auth/authContext'
import { authKeys } from '@/features/auth/queryKeys'

/**
 * 백엔드 콜백이 `?login=1` 또는 `?login=error&reason=…` 로 돌려보낸 것을 처리한다.
 * - login=1: 세션 재검증 → AuthProvider 가 온보딩 또는 "로그인했습니다" 토스트
 * - login=error: 실패 토스트 + 모달 다시 열기
 * 두 경우 모두 쿼리를 replace 로 지운다(뒤로가기 기록 없음).
 */
export function useLoginReturn(): void {
  const [params, setParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { show } = useToast()
  const { markReturned, openLogin } = useAuthContext()
  const login = params.get('login')

  useEffect(() => {
    if (!login) return
    if (login === '1') {
      void queryClient.invalidateQueries({ queryKey: authKeys.me })
      markReturned()
    } else if (login === 'error') {
      show('로그인에 실패했습니다. 다시 시도해 주세요')
      openLogin()
    }
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('login')
        next.delete('reason')
        return next
      },
      { replace: true },
    )
  }, [login, queryClient, markReturned, openLogin, show, setParams])
}
