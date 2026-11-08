import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { fetchTier } from '@/features/tier/api'
import { tierKeys } from '@/features/tier/queryKeys'
import type { MonthParam, TierResponse, TierScope } from '@/features/tier/types'

/** 월·범위가 바뀌는 동안 이전 데이터를 유지한다 (isPlaceholderData 로 흐리게) */
export function useTierQuery(month: MonthParam, scope: TierScope): UseQueryResult<TierResponse> {
  return useQuery({
    queryKey: tierKeys.list({ month, scope }),
    queryFn: () => fetchTier(month, scope),
    placeholderData: keepPreviousData,
  })
}
