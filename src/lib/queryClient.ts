import { QueryClient } from '@tanstack/react-query'

/** 월 단위 정적 데이터라 staleTime 을 길게 둔다 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
