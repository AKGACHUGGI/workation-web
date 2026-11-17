import { describe, expect, it } from 'vitest'
import { easeInOutCubic, fitView, flyPath, interpolateView } from '@/features/explore/cameraMath'

const size = { width: 1024, height: 768 }

describe('fitView', () => {
  it('경도 1도 범위 → 가로가 꽉 차는 줌, 가운데 중심', () => {
    // 적도 근처 1도×1도: 세계 1/360 → 1024px 이면 2^z = 1024·360/256
    const v = fitView({ west: 0, south: -0.5, east: 1, north: 0.5 }, 0, size)!
    expect(v.center.lng).toBeCloseTo(0.5)
    expect(v.center.lat).toBeCloseTo(0)
    expect(v.zoom).toBeCloseTo(Math.log2((768 * 360) / 256), 2) // 세로가 더 좁다
  })
  it('패딩만큼 줌이 낮아지고, div 가 패딩보다 작으면 null', () => {
    const b = { west: 128, south: 37, east: 129, north: 38 }
    expect(fitView(b, 40, size)!.zoom).toBeLessThan(fitView(b, 0, size)!.zoom)
    expect(fitView(b, 40, { width: 60, height: 60 })).toBeNull()
  })
})

describe('interpolateView', () => {
  const from = { center: { lat: 37.9, lng: 128.7 }, zoom: 9 }
  const to = { center: { lat: 37.75, lng: 128.9 }, zoom: 11 }
  it('양 끝은 from·to', () => {
    const start = interpolateView(from, to, 0)
    expect(start.zoom).toBe(9)
    expect(start.center.lat).toBeCloseTo(37.9)
    expect(start.center.lng).toBeCloseTo(128.7)
    const end = interpolateView(from, to, 1)
    expect(end.zoom).toBeCloseTo(11)
    expect(end.center.lat).toBeCloseTo(37.75)
    expect(end.center.lng).toBeCloseTo(128.9)
  })
  it('줌은 선형, 확대 중 중심은 목표 쪽으로 단조 이동', () => {
    expect(interpolateView(from, to, 0.5).zoom).toBe(10)
    const lngs = [0.25, 0.5, 0.75].map((e) => interpolateView(from, to, e).center.lng)
    expect(lngs[0]).toBeLessThan(lngs[1])
    expect(lngs[1]).toBeLessThan(lngs[2])
  })
})

describe('flyPath', () => {
  it('양 끝은 from·to, 가운데는 둘보다 축소', () => {
    const from = { center: { lat: 37.75, lng: 128.9 }, zoom: 13 }
    const to = { center: { lat: 38.2, lng: 128.55 }, zoom: 13 }
    const path = flyPath(from, to, 1024)
    expect(path(0).zoom).toBeCloseTo(13)
    expect(path(0).center.lat).toBeCloseTo(37.75)
    const end = path(1)
    expect(end.zoom).toBeCloseTo(13)
    expect(end.center.lat).toBeCloseTo(38.2)
    expect(end.center.lng).toBeCloseTo(128.55)
    expect(path(0.5).zoom).toBeLessThan(11.5) // 약 60km 떨어진 두 동이 함께 보이는 정도
  })
  it('같은 자리면 줌만 바뀐다', () => {
    const c = { lat: 37.75, lng: 128.9 }
    const path = flyPath({ center: c, zoom: 10 }, { center: c, zoom: 13 }, 1024)
    expect(path(1).zoom).toBeCloseTo(13)
    expect(path(0.5).center.lat).toBeCloseTo(37.75)
  })
})

describe('easeInOutCubic', () => {
  it('0 → 0, 0.5 → 0.5, 1 → 1', () => {
    expect([0, 0.5, 1].map(easeInOutCubic)).toEqual([0, 0.5, 1])
  })
})
