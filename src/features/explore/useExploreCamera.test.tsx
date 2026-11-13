import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { GeoFeatureCollection } from '@/components/map/geo'
import { useExploreCamera } from '@/features/explore/useExploreCamera'
import { DEFAULT_BOUNDS, SIGUNGU_PADDING } from '@/features/explore/view'

const geo: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'a', name: 'a' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [128, 37],
            [129, 38],
          ],
        ],
      },
    },
  ],
}

type P = { sgg: string | null; geo: GeoFeatureCollection | undefined }

describe('useExploreCamera', () => {
  it('⓪ 기본 범위 → 시군구 경계가 오면 그 범위로, 뒤로 오면 다시 기본', () => {
    const { result, rerender } = renderHook(({ sgg, geo }: P) => useExploreCamera(sgg, geo), {
      initialProps: { sgg: null, geo: undefined } as P,
    })
    expect(result.current).toMatchObject({ kind: 'bounds', bounds: DEFAULT_BOUNDS, padding: 0 })
    const first = result.current!.seq

    rerender({ sgg: '51150', geo: undefined })
    expect(result.current!.seq).toBe(first) // 경계 오기 전에는 그대로

    rerender({ sgg: '51150', geo })
    expect(result.current).toMatchObject({
      kind: 'bounds',
      bounds: { west: 128, south: 37, east: 129, north: 38 },
      padding: SIGUNGU_PADDING,
    })
    expect(result.current!.seq).toBeGreaterThan(first)

    rerender({ sgg: null, geo: undefined })
    expect(result.current).toMatchObject({ bounds: DEFAULT_BOUNDS })
  })
})
