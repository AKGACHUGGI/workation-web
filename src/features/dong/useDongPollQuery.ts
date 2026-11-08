import { useQuery } from '@tanstack/react-query'
import { fetchDongPoll } from '@/features/dong/api'
import { dongKeys } from '@/features/dong/queryKeys'
import type { MonthParam } from '@/features/metric/month'

/** annual 이면 최신 달(2025-12) 기준으로 조회한다 (W-03 §4 와 동일) */
export function useDongPollQuery(id: string, month: MonthParam) {
  const effective: MonthParam = month === 'annual' ? '2025-12' : month
  return useQuery({
    queryKey: dongKeys.poll(id, effective),
    queryFn: () => fetchDongPoll(id, effective),
  })
}
