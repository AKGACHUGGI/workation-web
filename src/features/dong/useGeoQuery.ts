import { useQuery } from '@tanstack/react-query'
import { EMPTY_GEO } from '@/components/map/geo'
import type { GeoFeatureCollection } from '@/components/map/geo'
import { geoKeys } from '@/features/dong/queryKeys'
import { NotFoundError } from '@/lib/errors'
import { loadStaticJson } from '@/lib/staticJson'

/** public/geo/{sggId}.json. 파일이 없으면 빈 컬렉션 (지도는 마커만) */
export function useGeoQuery(sggId: string | undefined) {
  return useQuery({
    queryKey: geoKeys.sgg(sggId ?? ''),
    queryFn: async () => {
      try {
        return await loadStaticJson<GeoFeatureCollection>(`/geo/${sggId}.json`)
      } catch (e) {
        if (e instanceof NotFoundError) return EMPTY_GEO
        throw e
      }
    },
    enabled: Boolean(sggId),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
