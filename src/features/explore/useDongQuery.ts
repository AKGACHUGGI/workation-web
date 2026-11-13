import { useQuery } from '@tanstack/react-query'
import { fetchDong } from '@/features/explore/api'
import { exploreKeys } from '@/features/explore/queryKeys'
import { NotFoundError } from '@/lib/errors'

/** 동별 1회, staleTime Infinity. null 이면 꺼짐, 404 는 재시도 안 함 (패널 404 화면) */
export function useDongQuery(dongId: string | null) {
  return useQuery({
    queryKey: exploreKeys.dong(dongId ?? ''),
    queryFn: () => fetchDong(dongId!),
    enabled: dongId !== null,
    staleTime: Infinity,
    retry: (count, error) => !(error instanceof NotFoundError) && count < 1,
  })
}
