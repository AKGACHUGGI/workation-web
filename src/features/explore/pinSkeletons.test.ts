import { describe, expect, it } from 'vitest'
import type { GeoFeatureCollection } from '@/components/map/geo'
import { pinSkeletons } from '@/features/explore/pinSkeletons'

const square = (lng: number, lat: number): [number, number][] => [
  [lng, lat],
  [lng + 1, lat],
  [lng + 1, lat + 1],
  [lng, lat + 1],
]

const geo: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: '5115025000', name: '주문진읍', labelLat: 37.88818, labelLng: 128.75354 },
      geometry: { type: 'Polygon', coordinates: [square(128.6, 37.8)] },
    },
    {
      type: 'Feature',
      properties: { id: '5115037000', name: '연곡면' },
      geometry: { type: 'Polygon', coordinates: [square(128, 37)] },
    },
    {
      type: 'Feature',
      properties: { id: '5115036000', name: '사천면', labelLat: 37.79713, labelLng: 128.80942 },
      geometry: { type: 'MultiPolygon', coordinates: [[square(128.7, 37.7)]] },
    },
  ],
}

describe('pinSkeletons', () => {
  it('경계 파일 동 수만큼, labelLat/labelLng 를 쓴다', () => {
    const list = pinSkeletons(geo)
    expect(list).toHaveLength(3)
    expect(list[0]).toEqual({ id: '5115025000', position: { lat: 37.88818, lng: 128.75354 } })
    expect(list[2].position).toEqual({ lat: 37.79713, lng: 128.80942 })
  })
  it('라벨 점이 없으면 중심(centroid)', () => {
    expect(pinSkeletons(geo)[1]).toEqual({ id: '5115037000', position: { lat: 37.5, lng: 128.5 } })
  })
  it('빈 경계 파일 → 빈 목록', () => {
    expect(pinSkeletons({ type: 'FeatureCollection', features: [] })).toEqual([])
  })
})
