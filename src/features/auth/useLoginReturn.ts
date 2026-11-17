import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '@/components/ui/toast/useToast'
import { useAuthContext } from '@/features/auth/authContext'
import { authKeys } from '@/features/auth/queryKeys'
import { getAccessToken } from '@/lib/supabase'

/** 복귀 처리 후 주소에서 지우는 쿼리. code·error* 는 Supabase 가 붙인다 */
const RETURN_PARAMS = ['login', 'reason', 'code', 'error', 'error_code', 'error_description']

/**
 * Supabase OAuth 가 `?login=1`(redirectTo) 또는 `?error=…` 로 돌려보낸 것을 처리한다.
 * supabase-js 가 ?code= 를 세션으로 바꾼 뒤(getAccessToken 대기) 처리해야 /api/me 에 토큰이 붙는다.
 * - login=1: 세션 재검증 → AuthProvider 가 온보딩 또는 "로그인했습니다" 토스트
 * - error 또는 login=error: 실패 토스트 + 모달 다시 열기
 * 두 경우 모두 쿼리를 replace 로 지운다(뒤로가기 기록 없음).
 */
export function useLoginReturn(): void {
  const [params, setParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { show } = useToast()
  const { markReturned, openLogin } = useAuthContext()
  const login = params.get('login')
  const failed = login === 'error' || params.has('error')

  useEffect(() => {
    if (!login && !failed) return
    let cancelled = false
    void getAccessToken().then(() => {
      if (cancelled) return
      if (failed) {
        show('로그인에 실패했습니다. 다시 시도해 주세요')
        openLogin()
      } else if (login === '1') {
        void queryClient.invalidateQueries({ queryKey: authKeys.me })
        markReturned()
      }
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const key of RETURN_PARAMS) next.delete(key)
          return next
        },
        { replace: true },
      )
    })
    return () => {
      cancelled = true
    }
  }, [login, failed, queryClient, markReturned, openLogin, show, setParams])
}
