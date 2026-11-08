import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { MonthParam } from '@/features/metric/month'
import { fetchRegion } from '@/features/region/api'
import { regionKeys } from '@/features/region/queryKeys'
import { NotFoundError } from '@/lib/errors'

export function useRegionQuery(id: string, month: MonthParam) {
  return useQuery({
    queryKey: regionKeys.detail(id, { month }),
    queryFn: () => fetchRegion(id, month),
    placeholderData: keepPreviousData,
    retry: (count, error) => !(error instanceof NotFoundError) && count < 1,
  })
}
