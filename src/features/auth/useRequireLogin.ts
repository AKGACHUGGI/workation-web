import { useCallback } from 'react'
import { useAuthContext } from '@/features/auth/authContext'
import { useAuth } from '@/features/auth/useAuth'

/**
 * 쓰기 동작 앞에 건다. 로그인 상태면 즉시 실행, 아니면 로그인 모달을 열고 동작을 보류한다.
 * 보류 동작은 같은 페이지에서 로그인이 끝나면(mock·온보딩) 재개되고, OAuth 리다이렉트로
 * 페이지가 다시 로드되면 사라진다(사용자가 다시 클릭).
 */
export function useRequireLogin(): (action: () => void) => void {
  const { isLoggedIn } = useAuth()
  const { openLogin } = useAuthContext()
  return useCallback(
    (action: () => void) => {
      if (isLoggedIn) action()
      else openLogin(action)
    },
    [isLoggedIn, openLogin],
  )
}
