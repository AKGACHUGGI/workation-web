export type LatLng = { lat: number; lng: number }
/** google.maps.LatLngBoundsLiteral 과 같은 모양 */
export type Bounds = { west: number; south: number; east: number; north: number }
/** [west, south, east, north] */
export type BBox = [number, number, number, number]
/** mocks/explore/base.generated.ts (scripts/gen-explore-base.py) 가 쓴다 */
export type ExploreSigungu = { id: string; name: string; provinceId: string; center: LatLng | null }
