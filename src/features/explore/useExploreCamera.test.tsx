import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { GeoFeatureCollection } from '@/components/map/geo'
import type { PinDong } from '@/features/explore/types'
import { useExploreCamera } from '@/features/explore/useExploreCamera'
import {
  DEFAULT_BOUNDS,
  DONG_FLY_MS,
  DONG_ZOOM,
  SIGUNGU_FLY_MS,
  SIGUNGU_PADDING,
} from '@/features/explore/view'

function geoOf(west: number, south: number, id = 'a'): GeoFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { id, name: id },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [west, south],
              [west + 1, south + 1],
            ],
          ],
        },
      },
    ],
  }
}
const geo = geoOf(128, 37)
const otherGeo = geoOf(127, 36)
/** 12개 시군구 폴리곤 (51150 = geo 와 같은 범위, 51130 = otherGeo 와 같은 범위) */
const sigunguGeo: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [...geoOf(128, 37, '51150').features, ...geoOf(127, 36, '51130').features],
}
const sigungu = { bounds: { west: 128, south: 37, east: 129, north: 38 }, padding: SIGUNGU_PADDING }

const pin = (id: string, lat: number | null): PinDong =>
  ({ id, name: id, center: lat === null ? null : { lat, lng: 128.5 } }) as PinDong
const pins = [pin('d1', 37.5), pin('d2', 37.8), pin('nocoord', null)]

type P = {
  sgg: string | null
  dong: string | null
  sigunguGeo?: GeoFeatureCollection
  geo: GeoFeatureCollection | undefined
  pins: PinDong[] | undefined
}
const setup = (initialProps: P) =>
  renderHook(
    ({ sgg, dong, sigunguGeo, geo, pins }: P) => useExploreCamera(sgg, dong, sigunguGeo, geo, pins),
    { initialProps },
  )

describe('useExploreCamera', () => {
  it('⓪ 기본 범위 → 시군구 경계가 오면 그 범위로, 뒤로 오면 다시 기본', () => {
    const { result, rerender } = setup({ sgg: null, dong: null, geo: undefined, pins: undefined })
    expect(result.current).toMatchObject({
      kind: 'bounds',
      bounds: DEFAULT_BOUNDS,
      padding: 0,
      duration: SIGUNGU_FLY_MS,
      hop: null,
      sigungu: null,
    })
    const first = result.current!.seq

    rerender({ sgg: '51150', dong: null, geo: undefined, pins: undefined })
    expect(result.current!.seq).toBe(first) // 경계 오기 전에는 그대로

    rerender({ sgg: '51150', dong: null, geo, pins: undefined })
    expect(result.current).toMatchObject({
      kind: 'bounds',
      ...sigungu,
      duration: SIGUNGU_FLY_MS,
      sigungu,
    })
    expect(result.current!.seq).toBeGreaterThan(first)

    rerender({ sgg: null, dong: null, geo: undefined, pins: undefined })
    expect(result.current).toMatchObject({ bounds: DEFAULT_BOUNDS, sigungu: null })
  })

  it('① → ② 동 중심으로 천천히 확대, ② → 다른 동은 hop, ② → ① 은 시군구 범위', () => {
    const { result, rerender } = setup({ sgg: '51150', dong: null, geo, pins })
    rerender({ sgg: '51150', dong: 'd1', geo, pins })
    expect(result.current).toMatchObject({
      kind: 'view',
      center: { lat: 37.5, lng: 128.5 },
      zoom: DONG_ZOOM,
      hop: null,
      duration: DONG_FLY_MS,
      sigungu,
    })

    rerender({ sgg: '51150', dong: 'd2', geo, pins })
    expect(result.current).toMatchObject({
      kind: 'view',
      center: { lat: 37.8 },
      hop: 'always',
    })

    rerender({ sgg: '51150', dong: null, geo, pins })
    expect(result.current).toMatchObject({ kind: 'bounds', ...sigungu, duration: SIGUNGU_FLY_MS })

    // ① 을 거친 뒤 다시 동 → hop 아님
    rerender({ sgg: '51150', dong: 'd2', geo, pins })
    expect(result.current).toMatchObject({ kind: 'view', hop: null })
  })

  it('비슷한 동(다른 시군구): 경계·핀이 다 올 때까지 기다렸다가 시군구 범위 없이 바로 동으로 hop', () => {
    const { result, rerender } = setup({ sgg: '51150', dong: 'd1', geo, pins })
    const before = result.current!.seq
    const other = [pin('x1', 36.5)]

    rerender({ sgg: '51130', dong: 'x1', geo: undefined, pins: undefined })
    rerender({ sgg: '51130', dong: 'x1', geo: otherGeo, pins: undefined })
    expect(result.current!.seq).toBe(before)

    rerender({ sgg: '51130', dong: 'x1', geo: otherGeo, pins: other })
    expect(result.current).toMatchObject({
      kind: 'view',
      center: { lat: 36.5 },
      hop: 'always',
      sigungu: { bounds: { west: 127, south: 36, east: 128, north: 37 } },
    })
    expect(result.current!.seq).toBe(before + 1)
  })

  it('좌표 없는 동 → ① 범위에 머문다', () => {
    const { result } = setup({ sgg: '51150', dong: 'nocoord', geo, pins })
    expect(result.current).toMatchObject({ kind: 'bounds', ...sigungu })
  })

  it('시군구 폴리곤이 있으면 행정동 경계를 기다리지 않고 바로, 경계가 늦게 와도 다시 안 움직인다', () => {
    const { result, rerender } = setup({ sgg: null, dong: null, sigunguGeo, geo: undefined, pins })
    rerender({ sgg: '51150', dong: null, sigunguGeo, geo: undefined, pins: undefined })
    expect(result.current).toMatchObject({ kind: 'bounds', ...sigungu, hop: null })
    const seq = result.current!.seq
    rerender({ sgg: '51150', dong: null, sigunguGeo, geo, pins: undefined })
    expect(result.current!.seq).toBe(seq)
  })

  it('① → 다른 시군구는 far hop, ⓪ → ① 은 hop 없음', () => {
    const { result, rerender } = setup({ sgg: '51150', dong: null, sigunguGeo, geo, pins })
    expect(result.current).toMatchObject({ hop: null })
    rerender({ sgg: '51130', dong: null, sigunguGeo, geo: undefined, pins: undefined })
    expect(result.current).toMatchObject({
      kind: 'bounds',
      bounds: { west: 127, south: 36, east: 128, north: 37 },
      hop: 'far',
      duration: SIGUNGU_FLY_MS,
    })
  })
})
