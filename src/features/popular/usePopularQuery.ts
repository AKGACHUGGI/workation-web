import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { MonthParam } from '@/features/metric/month'
import { fetchPopular } from '@/features/popular/api'
import { popularKeys } from '@/features/popular/queryKeys'

export function usePopularQuery(month: MonthParam) {
  return useQuery({
    queryKey: popularKeys.list({ month }),
    queryFn: () => fetchPopular(month),
    staleTime: 5 * 60 * 1000, // 스펙 §5 (queryClient 기본값과 같지만 명시)
    placeholderData: keepPreviousData,
  })
}
