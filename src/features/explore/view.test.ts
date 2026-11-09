import { afterEach, describe, expect, it, vi } from 'vitest'
import { indexGraph } from '@/features/explore/indexGraph'
import {
  DEFAULT_BOUNDS,
  areaBounds,
  bboxIntersects,
  breadcrumbAt,
  debounce,
  inBounds,
  unionBounds,
  visibleSigunguIds,
  zoomStage,
} from '@/features/explore/view'
import { exploreGraphMock } from '@/mocks/explore/graph'

const index = indexGraph(exploreGraphMock)

describe('범위 계산', () => {
  it('inBounds · bboxIntersects · unionBounds', () => {
    const b = { west: 128, south: 37, east: 129, north: 38 }
    expect(inBounds({ lat: 37.5, lng: 128.5 }, b)).toBe(true)
    expect(inBounds({ lat: 38.5, lng: 128.5 }, b)).toBe(false)
    expect(bboxIntersects([128.9, 37.9, 129.5, 38.5], b)).toBe(true)
    expect(bboxIntersects([129.1, 37.9, 129.5, 38.5], b)).toBe(false)
    expect(
      unionBounds([
        [128, 37, 128.5, 37.5],
        [128.4, 37.2, 129, 38],
      ]),
    ).toEqual({
      west: 128,
      south: 37,
      east: 129,
      north: 38,
    })
  })
  it('기본 범위에는 강원 동해안 5개 시군구만 걸린다', () => {
    expect(visibleSigunguIds(index, DEFAULT_BOUNDS)).toEqual([
      '51150',
      '51170',
      '51210',
      '51820',
      '51830',
    ])
  })
  it('areaBounds: 도·시군구는 소속 동 bbox 합', () => {
    const sgg = areaBounds(index, 'sigungu', '51150')!
    const jumunjin = index.dongById.get('5115025000')!
    expect(sgg.north).toBeGreaterThanOrEqual(jumunjin.bbox[3])
    expect(areaBounds(index, 'province', '00')).toBeNull()
  })
})

describe('zoomStage', () => {
  it.each([
    [7, 'province'],
    [8, 'province'],
    [9, 'sigungu'],
    [10.5, 'sigungu'],
    [11, 'dong'],
    [13, 'dong'],
    [14, 'place'],
  ])('줌 %s → %s', (zoom, stage) => {
    expect(zoomStage(zoom)).toBe(stage)
  })
})

describe('breadcrumbAt', () => {
  const jumunjin = index.dongById.get('5115025000')!
  it('줌 11 이상이면 도 › 시군구 › 행정동', () => {
    const c = breadcrumbAt(index, jumunjin.center!, 12)
    expect([c.province?.name, c.sigungu?.name, c.dong?.name]).toEqual([
      '강원특별자치도',
      '강릉시',
      '주문진읍',
    ])
  })
  it('줌 9~10 은 시군구까지, 8 이하는 도만', () => {
    expect(breadcrumbAt(index, jumunjin.center!, 9).dong).toBeUndefined()
    expect(breadcrumbAt(index, jumunjin.center!, 9).sigungu?.name).toBe('강릉시')
    expect(breadcrumbAt(index, jumunjin.center!, 7).sigungu).toBeUndefined()
  })
})

describe('debounce', () => {
  afterEach(() => vi.useRealTimers())
  it('마지막 호출만 ms 뒤에 실행, cancel 로 취소', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const d = debounce(fn, 200)
    d(1)
    d(2)
    vi.advanceTimersByTime(199)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledWith(2)
    d(3)
    d.cancel()
    vi.advanceTimersByTime(500)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
