import { describe, expect, it } from 'vitest'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { rankBadge, sortPopular, terrainMatch } from '@/features/popular/sort'
import type { PopularRegion } from '@/features/popular/types'

const mk = (
  id: string,
  favoriteCount: number,
  viewCount: number,
  quiet: number,
  terrain: PopularRegion['terrain'] = ['coast'],
): PopularRegion => ({
  id,
  name: id,
  province: '',
  photoUrl: '',
  tags: [],
  terrain,
  scores: { quiet, crowd: 50, peer: 50, overnight: 50, vibe: 50 },
  favoriteCount,
  viewCount,
})

const items = [mk('a', 100, 900, 10), mk('b', 300, 500, 90), mk('c', 200, 700, 50, ['city'])]

describe('sortPopular', () => {
  it('favorites: 즐겨찾기 내림차순', () => {
    expect(sortPopular(items, 'favorites', PRESET_WEIGHTS.quiet).map((i) => i.id)).toEqual([
      'b',
      'c',
      'a',
    ])
  })
  it('views: 조회 내림차순', () => {
    expect(sortPopular(items, 'views', PRESET_WEIGHTS.quiet).map((i) => i.id)).toEqual([
      'a',
      'c',
      'b',
    ])
  })
  it('score: composite 내림차순', () => {
    expect(sortPopular(items, 'score', PRESET_WEIGHTS.quiet).map((i) => i.id)).toEqual([
      'b',
      'c',
      'a',
    ])
  })
  it('score 동점은 favoriteCount', () => {
    const tie = [mk('x', 10, 0, 50), mk('y', 20, 0, 50)]
    expect(sortPopular(tie, 'score', PRESET_WEIGHTS.quiet).map((i) => i.id)).toEqual(['y', 'x'])
  })
  it('원본을 바꾸지 않는다', () => {
    const copy = [...items]
    sortPopular(items, 'favorites', PRESET_WEIGHTS.quiet)
    expect(items).toEqual(copy)
  })
})

describe('terrainMatch', () => {
  it('빈 필터는 모두 통과', () => {
    expect(terrainMatch({ terrain: ['coast'] }, [])).toBe(true)
  })
  it('하나라도 겹치면 통과', () => {
    expect(terrainMatch({ terrain: ['coast', 'mountain'] }, ['mountain'])).toBe(true)
    expect(terrainMatch({ terrain: ['coast'] }, ['city'])).toBe(false)
  })
})

describe('rankBadge', () => {
  it('상위 3개만 배지', () => {
    expect(rankBadge('favorites', 0)).toBe('즐겨찾기 1위')
    expect(rankBadge('views', 2)).toBe('조회 3위')
    expect(rankBadge('score', 1)).toBe('종합 2위')
    expect(rankBadge('favorites', 3)).toBeUndefined()
  })
})
