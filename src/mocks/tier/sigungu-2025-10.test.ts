import { describe, expect, it } from 'vitest'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { composite, metricGrade } from '@/features/metric/score'
import { METRIC_KEYS } from '@/features/metric/types'
import type { Weights } from '@/features/metric/types'
import { SIGUNGU_ITEMS_2025_10 } from '@/mocks/tier/sigungu-2025-10'

const CUSTOM: Weights = { quiet: 1, crowd: 1, peer: 0, overnight: 1, vibe: 0 }

/** [조용한 곳, 활기, 직접 설정(조용·시기·숙박)] 반올림 점수. 전주 직접 설정은 35(스펙 34는 수학적으로 불가, 플랜 "Mock 수치 설계" 참고) */
const EXPECTED: Record<string, [number, number, number]> = {
  양양군: [54, 43, 67],
  전주시: [52, 70, 35],
  고성군: [50, 47, 56],
  서귀포시: [47, 62, 38],
  순천시: [44, 55, 30],
  제주시: [43, 64, 32],
  속초시: [40, 57, 51],
  강릉시: [29, 55, 36],
  부안군: [28, 41, 39],
  정읍시: [23, 35, 21],
  동해시: [21, 45, 35],
  고흥군: [17, 17, 28],
}

const byName = (name: string) => SIGUNGU_ITEMS_2025_10.find((i) => i.name === name)!
const order = (w: Weights) =>
  [...SIGUNGU_ITEMS_2025_10]
    .sort(
      (a, b) =>
        composite(b.scores, w) - composite(a.scores, w) || a.name.localeCompare(b.name, 'ko'),
    )
    .map((i) => i.name)

describe('10월 시군구 픽스처', () => {
  it('12개, 점수는 0~100 정수, inherited 없음', () => {
    expect(SIGUNGU_ITEMS_2025_10).toHaveLength(12)
    for (const item of SIGUNGU_ITEMS_2025_10) {
      expect(item.inherited).toEqual([])
      for (const k of METRIC_KEYS) {
        expect(Number.isInteger(item.scores[k])).toBe(true)
        expect(item.scores[k]).toBeGreaterThanOrEqual(0)
        expect(item.scores[k]).toBeLessThanOrEqual(100)
      }
    }
  })

  it.each(Object.entries(EXPECTED))('%s 반올림 점수', (name, [q, l, c]) => {
    const { scores } = byName(name)
    expect(Math.round(composite(scores, PRESET_WEIGHTS.quiet))).toBe(q)
    expect(Math.round(composite(scores, PRESET_WEIGHTS.lively))).toBe(l)
    expect(Math.round(composite(scores, CUSTOM))).toBe(c)
  })

  it('세 모드의 순위가 스펙 §9 순서와 같다', () => {
    expect(order(PRESET_WEIGHTS.quiet)).toEqual([
      '양양군',
      '전주시',
      '고성군',
      '서귀포시',
      '순천시',
      '제주시',
      '속초시',
      '강릉시',
      '부안군',
      '정읍시',
      '동해시',
      '고흥군',
    ])
    expect(order(PRESET_WEIGHTS.lively)).toEqual([
      '전주시',
      '제주시',
      '서귀포시',
      '속초시',
      '강릉시',
      '순천시',
      '고성군',
      '동해시',
      '양양군',
      '부안군',
      '정읍시',
      '고흥군',
    ])
    expect(order(CUSTOM)).toEqual([
      '양양군',
      '고성군',
      '속초시',
      '부안군',
      '서귀포시',
      '강릉시',
      '동해시',
      '전주시',
      '제주시',
      '순천시',
      '고흥군',
      '정읍시',
    ])
  })

  it('고성군 세부 등급 A/B/B/S/B, 서귀포 S/C/S/B/S', () => {
    expect(METRIC_KEYS.map((k) => metricGrade(byName('고성군').scores[k]))).toEqual([
      'A',
      'B',
      'B',
      'S',
      'B',
    ])
    expect(METRIC_KEYS.map((k) => metricGrade(byName('서귀포시').scores[k]))).toEqual([
      'S',
      'C',
      'S',
      'B',
      'S',
    ])
  })
})
