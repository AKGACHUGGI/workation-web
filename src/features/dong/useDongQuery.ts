import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchDong } from '@/features/dong/api'
import { dongKeys } from '@/features/dong/queryKeys'
import type { MonthParam } from '@/features/metric/month'
import { NotFoundError } from '@/lib/errors'

export function useDongQuery(id: string, month: MonthParam, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: dongKeys.detail(id, month),
    queryFn: () => fetchDong(id, month),
    placeholderData: keepPreviousData,
    enabled: opts.enabled ?? true,
    retry: (count, error) => !(error instanceof NotFoundError) && count < 1,
  })
}
