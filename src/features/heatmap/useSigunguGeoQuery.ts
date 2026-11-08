import { useQuery } from '@tanstack/react-query'
import type { GeoFeatureCollection } from '@/components/map/geo'
import { loadStaticJson } from '@/lib/staticJson'

/** public/geo/sigungu.json (12개 시군구 폴리곤). 정적 파일이라 staleTime Infinity */
export function useSigunguGeoQuery() {
  return useQuery({
    queryKey: ['geo', 'sigungu'] as const,
    queryFn: () => loadStaticJson<GeoFeatureCollection>('/geo/sigungu.json'),
    staleTime: Infinity,
  })
}
