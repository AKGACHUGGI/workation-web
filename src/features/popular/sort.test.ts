import { describe, expect, it } from 'vitest'
import { NO_BOOST } from '@/features/interest'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { personalPopular, rankBadge, sortPopular, terrainMatch } from '@/features/popular/sort'
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

describe('sortPopular 관심 가산점', () => {
  // 기존 items: a(조용한 곳 종합 35, 기본 B) · b(65, S) · c(50, A)
  it('score sort follows boosted score', () => {
    expect(
      sortPopular(items, 'score', PRESET_WEIGHTS.quiet, (u) => (u.id === 'c' ? 50 : 0)).map(
        (i) => i.id,
      ),
    ).toEqual(['c', 'b', 'a'])
  })
  it('score sort keeps grade order when boost is clamped', () => {
    // a 는 개인 점수 135 지만 등급은 B 에서 한 단계 위 A 까지라 S 인 b 뒤에 온다
    expect(
      sortPopular(items, 'score', PRESET_WEIGHTS.quiet, (u) => (u.id === 'a' ? 100 : 0)).map(
        (i) => i.id,
      ),
    ).toEqual(['b', 'a', 'c'])
  })
  it('favorites tie breaks by personal grade and score', () => {
    // 즐겨찾기·기본 점수가 같은 두 곳: 가산점 받은 y 가 앞으로
    const tied = [mk('x', 100, 0, 50), mk('y', 100, 0, 50)]
    expect(sortPopular(tied, 'favorites', PRESET_WEIGHTS.quiet).map((i) => i.id)).toEqual([
      'x',
      'y',
    ])
    expect(
      sortPopular(tied, 'favorites', PRESET_WEIGHTS.quiet, (u) => (u.id === 'y' ? 5 : 0)).map(
        (i) => i.id,
      ),
    ).toEqual(['y', 'x'])
  })
  it('personalPopular gives personal score and clamped grade per id', () => {
    const m = personalPopular(items, PRESET_WEIGHTS.quiet, (u) => (u.id === 'a' ? 100 : 0))
    // 개인 점수 135 는 위 등급(S) 최저점 b(65) 이하로 눌려 "S 65" 아래 "A 135" 역전이 없다
    expect(m.get('a')).toEqual({ score: 65, grade: 'A' })
    expect(m.get('b')?.grade).toBe('S')
  })
})

describe('sortPopular 조회순 동점', () => {
  it('views tie keeps input order without records', () => {
    // 조회수·즐겨찾기 수가 같으면 점수와 상관없이 입력 순서 그대로 (기록 없으면 기존과 같다)
    const tied = [mk('low', 100, 500, 10), mk('high', 100, 500, 90)]
    expect(sortPopular(tied, 'views', PRESET_WEIGHTS.quiet, NO_BOOST).map((i) => i.id)).toEqual([
      'low',
      'high',
    ])
  })
})
