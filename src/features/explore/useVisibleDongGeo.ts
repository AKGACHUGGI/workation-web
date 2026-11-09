import { useQueries } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { EMPTY_GEO } from '@/components/map/geo'
import type { GeoFeatureCollection } from '@/components/map/geo'
import { geoKeys } from '@/features/dong/queryKeys'
import { NotFoundError } from '@/lib/errors'
import { loadStaticJson } from '@/lib/staticJson'

async function loadSggGeo(sggId: string): Promise<GeoFeatureCollection> {
  try {
    return await loadStaticJson<GeoFeatureCollection>(`/geo/${sggId}.json`)
  } catch (e) {
    if (e instanceof NotFoundError) return EMPTY_GEO
    throw e
  }
}

/** 모듈 수준 함수라 참조가 고정 → TanStack 이 combine 결과를 재사용한다 */
function combine(results: UseQueryResult<GeoFeatureCollection>[]): GeoFeatureCollection {
  return { type: 'FeatureCollection', features: results.flatMap((r) => r.data?.features ?? []) }
}

/** 줌 11+ 화면에 걸친 시군구들의 행정동 경계를 하나로 (W-04 와 같은 캐시 키 ['geo', sggId]) */
export function useVisibleDongGeo(sggIds: string[]): GeoFeatureCollection {
  return useQueries({
    queries: sggIds.map((id) => ({
      queryKey: geoKeys.sgg(id),
      queryFn: () => loadSggGeo(id),
      staleTime: Infinity,
      gcTime: Infinity,
    })),
    combine,
  })
}
