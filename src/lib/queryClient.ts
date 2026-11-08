import { QueryClient } from '@tanstack/react-query'
import { UnauthorizedError } from '@/lib/errors'

/** 월 단위 정적 데이터라 staleTime 을 길게 둔다. 401 은 재시도하지 않는다 (세션 만료 → 로그인 모달) */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (count, error) => !(error instanceof UnauthorizedError) && count < 1,
      refetchOnWindowFocus: false,
    },
  },
})
