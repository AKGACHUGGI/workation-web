import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '@/features/auth/api'
import { authKeys } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'

export type AuthState = {
  /** undefined: 첫 조회 중, null: 비로그인 */
  me: Me | null | undefined
  isPending: boolean
  isLoggedIn: boolean
}

/** 세션 상태. 401 은 fetchMe 가 null 로 바꾸고, 네트워크 에러는 1회 재시도 후 비로그인으로 취급 */
export function useAuth(): AuthState {
  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
  const me = query.isError ? null : query.data
  return { me, isPending: query.isPending, isLoggedIn: !!me }
}
