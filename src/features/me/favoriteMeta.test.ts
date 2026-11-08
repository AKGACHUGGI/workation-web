import { describe, expect, it } from 'vitest'
import { favoriteMeta2, weightsFor } from '@/features/me/favoriteMeta'
import { favoriteRegionsMock } from '@/mocks/me/favorites'

describe('favoriteMeta2', () => {
  it('메모가 있으면 메모', () => {
    expect(favoriteMeta2(favoriteRegionsMock[0], '2025-10')).toBe('11월 2주 체류 예정')
  })
  it('메모 없고 방문 예정 월이 있으면 "{월} 방문 예정"', () => {
    expect(favoriteMeta2({ ...favoriteRegionsMock[1], visitMonth: '2025-12' }, '2025-10')).toBe(
      '12월 방문 예정',
    )
  })
  it('둘 다 없으면 시기 여유 등급·혼잡 점수', () => {
    expect(favoriteMeta2(favoriteRegionsMock[1], '2025-10')).toBe('10월 시기 여유 C · 혼잡 10')
  })
})

describe('weightsFor', () => {
  it('프리셋 → PRESET_WEIGHTS, custom → 선택 1', () => {
    expect(weightsFor('quiet', null).quiet).toBe(3)
    expect(weightsFor('custom', ['quiet', 'vibe'])).toEqual({
      quiet: 1,
      crowd: 0,
      peer: 0,
      overnight: 0,
      vibe: 1,
    })
  })
})
