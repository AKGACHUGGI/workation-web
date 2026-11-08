import { describe, expect, it } from 'vitest'
import { bboxToBounds, centroid, toLatLngPaths } from '@/components/map/geo'
import type { GeoFeature, PolygonGeometry } from '@/components/map/geo'

const square: GeoFeature = {
  type: 'Feature',
  properties: { id: 'a', name: 'A' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [128.4, 38.4],
        [128.5, 38.4],
        [128.5, 38.5],
        [128.4, 38.5],
        [128.4, 38.4],
      ],
    ],
  },
}

describe('toLatLngPaths', () => {
  it('Polygon → 외곽 링 1개 (lng,lat → {lat,lng})', () => {
    expect(toLatLngPaths(square.geometry)).toEqual([
      [
        { lat: 38.4, lng: 128.4 },
        { lat: 38.4, lng: 128.5 },
        { lat: 38.5, lng: 128.5 },
        { lat: 38.5, lng: 128.4 },
        { lat: 38.4, lng: 128.4 },
      ],
    ])
  })
  it('MultiPolygon → 폴리곤마다 외곽 링', () => {
    const multi = {
      type: 'MultiPolygon' as const,
      // square.geometry 는 Polygon|MultiPolygon 유니온이라 tsc 를 위해 Polygon 으로 좁힌다
      coordinates: [
        (square.geometry as PolygonGeometry).coordinates,
        (square.geometry as PolygonGeometry).coordinates,
      ],
    }
    expect(toLatLngPaths(multi)).toHaveLength(2)
  })
})

describe('centroid / bboxToBounds', () => {
  it('외곽 링 꼭짓점 평균', () => {
    expect(centroid(square.geometry)).toEqual({ lat: 38.44, lng: 128.44 })
  })
  it('[minLng,minLat,maxLng,maxLat] → google LatLngBoundsLiteral', () => {
    expect(bboxToBounds([128.42, 38.41, 128.5, 38.49])).toEqual({
      west: 128.42,
      south: 38.41,
      east: 128.5,
      north: 38.49,
    })
  })
})
