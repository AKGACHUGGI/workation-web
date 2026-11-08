import { describe, expect, it } from 'vitest'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { rankIn } from '@/features/region/rank'
import type { TierItem } from '@/features/tier/types'
import { SIGUNGU_ITEMS_2025_10 } from '@/mocks/tier/sigungu-2025-10'

function item(
  id: string,
  name: string,
  quiet: number,
  crowd = 50,
  peer = 50,
  overnight = 50,
  vibe = 50,
): TierItem {
  return {
    id,
    name,
    province: '강원특별자치도',
    photoUrl: `/mock-photos/${id}.jpg`,
    scores: { quiet, crowd, peer, overnight, vibe },
    inherited: [],
    terrain: [],
  }
}

// quiet 프리셋 가중치 3,3,1,1,0 → 다른 지표가 모두 50 이면 종합 = (3q + 150 + 50 + 50) / 8
const items: TierItem[] = [
  item('a', '가군', 100), // 68.75
  item('b', '나군', 80), // 61.25
  item('c', '다군', 80), // 61.25 (동점)
  item('d', '라군', 40), // 46.25
  item('e', '마군', 0), // 31.25
  item('f', '바군', 20), // 38.75
  item('g', '사군', 60), // 53.75
  item('h', '아군', 10), // 35
]
const quiet = { tab: 'value', weights: PRESET_WEIGHTS.quiet } as const

describe('rankIn', () => {
  it('점수·순위·총수·등급을 돌려준다', () => {
    const r = rankIn(items, 'g', quiet)
    expect(r).not.toBeNull()
    expect(r!.score).toBeCloseTo(53.75)
    expect(r!.rank).toBe(4)
    expect(r!.total).toBe(8)
    expect(r!.grade).toBe('A')
    expect(r!.item.name).toBe('사군')
  })
  it('1위는 S', () => {
    expect(rankIn(items, 'a', quiet)).toMatchObject({ rank: 1, grade: 'S' })
  })
  it('동점은 같은 순위', () => {
    expect(rankIn(items, 'b', quiet)!.rank).toBe(2)
    expect(rankIn(items, 'c', quiet)!.rank).toBe(2)
  })
  it('개별 지표 모드는 그 지표 점수', () => {
    const r = rankIn(items, 'e', { tab: 'metric', metric: 'quiet' })
    expect(r!.score).toBe(0)
    expect(r!.rank).toBe(8)
    expect(r!.grade).toBe('C')
  })
  it('목록에 없는 id 는 null', () => {
    expect(rankIn(items, 'zzz', quiet)).toBeNull()
  })
})

// 스펙 §10: W-02 10월 시군구 픽스처(12곳)로 고성군(51820) 실데이터 검증
describe('rankIn — 고성군 10월 실데이터', () => {
  it('조용한 곳 → 50 · 3/12 · S', () => {
    const r = rankIn(SIGUNGU_ITEMS_2025_10, '51820', quiet)
    expect(Math.round(r!.score)).toBe(50)
    expect(r).toMatchObject({ rank: 3, total: 12, grade: 'S' })
  })
  it('활기 있는 한 달 → 47 · 7위', () => {
    const r = rankIn(SIGUNGU_ITEMS_2025_10, '51820', {
      tab: 'value',
      weights: PRESET_WEIGHTS.lively,
    })
    expect(Math.round(r!.score)).toBe(47)
    expect(r).toMatchObject({ rank: 7, total: 12, grade: 'B' })
  })
})
