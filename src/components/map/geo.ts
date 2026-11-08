/** 좌표는 GeoJSON 규약대로 [lng, lat] */
export type Ring = [number, number][]
export type PolygonGeometry = { type: 'Polygon'; coordinates: Ring[] }
export type MultiPolygonGeometry = { type: 'MultiPolygon'; coordinates: Ring[][] }
export type GeoGeometry = PolygonGeometry | MultiPolygonGeometry

export type GeoFeature = {
  type: 'Feature'
  properties: { id: string; name: string }
  geometry: GeoGeometry
}

export type GeoFeatureCollection = { type: 'FeatureCollection'; features: GeoFeature[] }

export const EMPTY_GEO: GeoFeatureCollection = { type: 'FeatureCollection', features: [] }

export type LatLng = { lat: number; lng: number }

export type PolygonStyle = {
  fill: string // CSS 색 문자열 (토큰: 'var(--color-brand-primary)' 는 Maps 가 못 읽으므로 getComputedStyle 로 해석한 값)
  stroke: string
  strokeWidth: number
  fillOpacity: number
}

/** 폴리곤마다 외곽 링(구멍 제외)만 {lat,lng}[] 로 */
export function toLatLngPaths(geometry: GeoGeometry): LatLng[][] {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  return polygons.map((rings) => rings[0].map(([lng, lat]) => ({ lat, lng })))
}

/** 첫 폴리곤 외곽 링 꼭짓점 평균 (마커 위치용, 소수 2자리) */
export function centroid(geometry: GeoGeometry): LatLng {
  const ring = toLatLngPaths(geometry)[0]
  const n = ring.length
  const lat = ring.reduce((s, p) => s + p.lat, 0) / n
  const lng = ring.reduce((s, p) => s + p.lng, 0) / n
  return { lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 }
}

export function bboxToBounds([west, south, east, north]: [number, number, number, number]) {
  return { west, south, east, north }
}

/**
 * Maps JS 는 'var(--color-x)' 를 색으로 못 읽는다.
 * document 에서 토큰 값을 읽어 실제 색 문자열로 바꾼다 (SSR 없음).
 */
export function resolveToken(cssVar: string): string {
  const name = cssVar.replace(/^var\((--[^)]+)\)$/, '$1')
  if (!name.startsWith('--')) return cssVar
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || cssVar
}
