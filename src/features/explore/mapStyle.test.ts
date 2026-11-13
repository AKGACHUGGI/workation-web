import { describe, expect, it } from 'vitest'
import { DONG_BOUNDARY_STYLE, sigunguStyle } from '@/features/explore/mapStyle'

describe('sigunguStyle', () => {
  it('⓪ 홈 히트맵 색, hover 는 진하게 + 브랜드색 테두리 (Figma ⓪ 387:8630)', () => {
    expect(sigunguStyle({ id: '51150', activeSgg: null, hovered: null, step: 500 })).toEqual({
      fill: 'var(--color-heat-500)',
      fillOpacity: 0.65,
      stroke: 'var(--color-explore-map-boundary)',
      strokeWidth: 1,
    })
    expect(
      sigunguStyle({ id: '51150', activeSgg: null, hovered: '51150', step: 500 }),
    ).toMatchObject({
      fillOpacity: 0.85,
      stroke: 'var(--color-brand-primary)',
      strokeWidth: 2,
    })
  })
  it('히트맵 데이터 전에는 회색 (스펙 §9-1)', () => {
    expect(sigunguStyle({ id: '51150', activeSgg: null, hovered: null, step: null }).fill).toBe(
      'var(--color-explore-skeleton-map)',
    )
  })
  it('① 고른 시군구는 브랜드색 테두리만, 나머지는 옅게', () => {
    expect(sigunguStyle({ id: '51150', activeSgg: '51150', hovered: null, step: 500 })).toEqual({
      fill: 'var(--color-white)',
      fillOpacity: 0,
      stroke: 'var(--color-brand-primary)',
      strokeWidth: 2,
    })
    expect(
      sigunguStyle({ id: '51210', activeSgg: '51150', hovered: null, step: 300 }).fillOpacity,
    ).toBe(0.2)
  })
  it('행정동 경계는 채움 없이 회색 1px', () => {
    expect(DONG_BOUNDARY_STYLE).toEqual({
      fill: 'var(--color-white)',
      fillOpacity: 0,
      stroke: 'var(--color-explore-map-boundary)',
      strokeWidth: 1,
    })
  })
})
