import { describe, expect, it } from 'vitest'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { composite, metricGrade, toGrades } from '@/features/metric/score'
import type { MetricScores } from '@/features/metric/types'

const goseong: MetricScores = { quiet: 60, crowd: 40, peer: 30, overnight: 90, vibe: 20 }

describe('composite', () => {
  it('조용한 곳 프리셋 가중 평균', () => {
    // (60*3 + 40*3 + 30*1 + 90*1 + 20*0) / 8 = 420/8 = 52.5
    expect(composite(goseong, PRESET_WEIGHTS.quiet)).toBeCloseTo(52.5)
  })
  it('활기 프리셋 가중 평균', () => {
    // (60*0 + 40*1 + 30*3 + 90*2 + 20*3) / 9 = 370/9
    expect(composite(goseong, PRESET_WEIGHTS.lively)).toBeCloseTo(370 / 9)
  })
  it('가중치 합이 0 이면 NaN 대신 0', () => {
    expect(composite(goseong, { quiet: 0, crowd: 0, peer: 0, overnight: 0, vibe: 0 })).toBe(0)
  })
})

describe('toGrades', () => {
  it('8개: 상위 25% S, 50% A, 75% B, 나머지 C (입력 순서 유지)', () => {
    expect(toGrades([10, 80, 30, 70, 50, 60, 20, 40])).toEqual([
      'C',
      'S',
      'B',
      'S',
      'A',
      'A',
      'C',
      'B',
    ])
  })
  it('12개 사분위 경계: 3개씩', () => {
    const values = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    expect(toGrades(values)).toEqual(['S', 'S', 'S', 'A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C'])
  })
  it('동점은 같은 등급 (더 높은 쪽)', () => {
    // 4개: 1등 S, 2등 A, 3등 B, 4등 C 인데 2·3등이 동점이면 둘 다 A
    expect(toGrades([100, 50, 50, 10])).toEqual(['S', 'A', 'A', 'C'])
  })
  it('4개 미만이면 순위 비율로 같은 규칙', () => {
    expect(toGrades([3, 2, 1])).toEqual(['S', 'A', 'B'])
    expect(toGrades([1])).toEqual(['S'])
    expect(toGrades([])).toEqual([])
  })
})

describe('metricGrade', () => {
  it('경계값 25/50/75', () => {
    expect(metricGrade(75)).toBe('S')
    expect(metricGrade(74.9)).toBe('A')
    expect(metricGrade(50)).toBe('A')
    expect(metricGrade(49)).toBe('B')
    expect(metricGrade(25)).toBe('B')
    expect(metricGrade(24)).toBe('C')
    expect(metricGrade(0)).toBe('C')
    expect(metricGrade(100)).toBe('S')
  })
})
