import { describe, expect, it } from 'vitest'
import { geoBounds } from '@/features/explore/view'

describe('geoBounds', () => {
  it('모든 폴리곤 외곽 링을 감싸는 범위', () => {
    expect(
      geoBounds({
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
                  [129, 37],
                  [129, 38],
                ],
              ],
            },
          },
          {
            type: 'Feature',
            properties: { id: 'b', name: 'b' },
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [127.5, 36.5],
                    [128, 37],
                  ],
                ],
              ],
            },
          },
        ],
      }),
    ).toEqual({ west: 127.5, south: 36.5, east: 129, north: 38 })
  })
  it('빈 경계 → null', () => {
    expect(geoBounds({ type: 'FeatureCollection', features: [] })).toBeNull()
  })
})
