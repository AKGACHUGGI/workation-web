import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'
import { fetchRegionPoll } from '@/features/region/api'
import { regionKeys } from '@/features/region/queryKeys'

export function useRegionPollQuery(id: string, month: MonthParam, preset: PresetKey) {
  return useQuery({
    queryKey: regionKeys.poll(id, { month, preset }),
    queryFn: () => fetchRegionPoll(id, month, preset),
    placeholderData: keepPreviousData,
  })
}
