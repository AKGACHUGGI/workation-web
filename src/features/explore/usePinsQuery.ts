import { useQuery } from '@tanstack/react-query'
import { fetchPins } from '@/features/explore/api'
import { exploreKeys } from '@/features/explore/queryKeys'
import { NotFoundError } from '@/lib/errors'

/** 시군구별 1회, 월 배치로만 바뀌어 staleTime Infinity. null 이면 꺼짐, 404 는 재시도 안 함 */
export function usePinsQuery(sigunguId: string | null) {
  return useQuery({
    queryKey: exploreKeys.pins(sigunguId ?? ''),
    queryFn: () => fetchPins(sigunguId!),
    enabled: sigunguId !== null,
    staleTime: Infinity,
    retry: (count, error) => !(error instanceof NotFoundError) && count < 1,
  })
}
