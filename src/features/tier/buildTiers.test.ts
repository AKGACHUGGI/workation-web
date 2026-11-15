import { describe, expect, it } from 'vitest'
import { NO_BOOST } from '@/features/interest'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { buildTiers, customWeights, filterTiers } from '@/features/tier/buildTiers'
import type { TierItem } from '@/features/tier/types'
import { SIGUNGU_ITEMS_2025_10 } from '@/mocks/tier/sigungu-2025-10'

const names = (groups: ReturnType<typeof buildTiers>, i: number) =>
  groups[i].entries.map((e) => e.item.name)

function item(id: string, name: string, quiet: number, sgg = '51820'): TierItem {
  return {
    id,
    name,
    province: '강원특별자치도',
    sigungu: { id: sgg, name: sgg },
    photoUrl: '',
    terrain: ['coast'],
    scores: { quiet, crowd: 0, peer: 0, overnight: 0, vibe: 0 },
    inherited: ['overnight'],
  }
}

describe('customWeights', () => {
  it('선택 1, 나머지 0', () => {
    expect(customWeights(['quiet', 'overnight'])).toEqual({
      quiet: 1,
      crowd: 0,
      peer: 0,
      overnight: 1,
      vibe: 0,
    })
  })
})

describe('buildTiers', () => {
  it('항상 S·A·B·C 4개 그룹', () => {
    const groups = buildTiers([], { tab: 'metric', metric: 'quiet' })
    expect(groups.map((g) => g.grade)).toEqual(['S', 'A', 'B', 'C'])
  })

  it('조용한 곳 10월: S = 양양·전주·고성, C = 정읍·동해·고흥', () => {
    const groups = buildTiers(SIGUNGU_ITEMS_2025_10, {
      tab: 'value',
      weights: PRESET_WEIGHTS.quiet,
    })
    expect(names(groups, 0)).toEqual(['양양군', '전주시', '고성군'])
    expect(names(groups, 3)).toEqual(['정읍시', '동해시', '고흥군'])
    expect(Math.round(groups[0].entries[0].score)).toBe(54)
  })

  it('활기 프리셋 1위 전주', () => {
    const groups = buildTiers(SIGUNGU_ITEMS_2025_10, {
      tab: 'value',
      weights: PRESET_WEIGHTS.lively,
    })
    expect(groups[0].entries[0].item.name).toBe('전주시')
    expect(Math.round(groups[0].entries[0].score)).toBe(70)
  })

  it('직접 설정(조용·시기·숙박) 1위 양양 67', () => {
    const groups = buildTiers(SIGUNGU_ITEMS_2025_10, {
      tab: 'value',
      weights: customWeights(['quiet', 'crowd', 'overnight']),
      selected: ['quiet', 'crowd', 'overnight'],
    })
    expect(groups[0].entries[0].item.name).toBe('양양군')
    expect(Math.round(groups[0].entries[0].score)).toBe(67)
  })

  it('개별 지표 탭: 점수 = scores[metric]', () => {
    const groups = buildTiers(SIGUNGU_ITEMS_2025_10, { tab: 'metric', metric: 'quiet' })
    const first = groups[0].entries[0]
    expect(first.item.name).toBe('서귀포시')
    expect(first.score).toBe(76)
  })

  it('동점은 같은 등급, 이름 가나다순', () => {
    const groups = buildTiers(
      [item('1', '하동', 90), item('2', '가동', 50), item('3', '나동', 50), item('4', '다동', 10)],
      { tab: 'metric', metric: 'quiet' },
    )
    expect(names(groups, 0)).toEqual(['하동'])
    expect(names(groups, 1)).toEqual(['가동', '나동'])
    expect(names(groups, 3)).toEqual(['다동'])
  })
})

describe('filterTiers', () => {
  it('필터 후에도 각 항목의 등급은 필터 전과 같다', () => {
    const items = [
      item('a', '가동', 90, '51820'),
      item('b', '나동', 70, '51210'),
      item('c', '다동', 50, '51820'),
      item('d', '라동', 10, '51210'),
    ]
    const groups = buildTiers(items, { tab: 'metric', metric: 'quiet' })
    const filtered = filterTiers(groups, '51820')
    expect(filtered.map((g) => g.grade)).toEqual(['S', 'A', 'B', 'C'])
    expect(filtered[0].entries.map((e) => e.item.id)).toEqual(['a'])
    expect(filtered[1].entries).toEqual([])
    expect(filtered[2].entries.map((e) => e.item.id)).toEqual(['c'])
    expect(filterTiers(groups, 'all')).toBe(groups)
  })
})

describe('buildTiers 관심 가산점', () => {
  const VALUE_MODE = { tab: 'value', weights: PRESET_WEIGHTS.quiet } as const
  it('value tab applies boost and may lift one grade', () => {
    const lowest = '46770' // 고흥군: 조용한 곳 10월 C (같은 파일 기존 단언)
    const groups = buildTiers(SIGUNGU_ITEMS_2025_10, VALUE_MODE, (u) => (u.id === lowest ? 100 : 0))
    const grade = groups.find((g) => g.entries.some((e) => e.item.id === lowest))!.grade
    expect(grade).toBe('B')
  })
  it('metric tab ignores boost', () => {
    expect(buildTiers(SIGUNGU_ITEMS_2025_10, { tab: 'metric', metric: 'quiet' }, () => 50)).toEqual(
      buildTiers(SIGUNGU_ITEMS_2025_10, { tab: 'metric', metric: 'quiet' }),
    )
  })
  it('no boost equals previous result', () => {
    expect(buildTiers(SIGUNGU_ITEMS_2025_10, VALUE_MODE, NO_BOOST)).toEqual(
      buildTiers(SIGUNGU_ITEMS_2025_10, VALUE_MODE),
    )
  })
  it('entry score is the personal score', () => {
    const groups = buildTiers(SIGUNGU_ITEMS_2025_10, VALUE_MODE, (u) => (u.id === '46770' ? 7 : 0))
    const base = buildTiers(SIGUNGU_ITEMS_2025_10, VALUE_MODE)
    const scoreOf = (gs: typeof groups) =>
      gs.flatMap((g) => g.entries).find((e) => e.item.id === '46770')!.score
    expect(scoreOf(groups)).toBeCloseTo(scoreOf(base) + 7)
  })
  it('passes sigunguId and terrain to boost', () => {
    const seen: unknown[] = []
    buildTiers([item('d1', '동', 50, '51820')], VALUE_MODE, (u) => {
      seen.push(u)
      return 0
    })
    expect(seen).toEqual([
      expect.objectContaining({ id: 'd1', sigunguId: '51820', terrain: expect.any(Array) }),
    ])
  })
})
