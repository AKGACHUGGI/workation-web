import { useQuery } from '@tanstack/react-query'
import { fetchExploreGraph } from '@/features/explore/api'
import { exploreKeys } from '@/features/explore/queryKeys'

/** 그래프 전체를 한 번 받는다. 이후 클릭은 서버 요청 없이 계산만 한다 */
export function useExploreGraphQuery() {
  return useQuery({
    queryKey: exploreKeys.graph,
    queryFn: fetchExploreGraph,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
