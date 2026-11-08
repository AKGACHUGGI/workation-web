import { describe, expect, it } from 'vitest'
import {
  buildDongSummary,
  formatHour,
  localLifeGrade,
  localLifeLabel,
  pollQuestion,
} from '@/features/dong/summary'

describe('buildDongSummary', () => {
  it('주말 관광형 + 저녁 활기 B → 거진읍 문장', () => {
    expect(
      buildDongSummary({
        dominant: 'weekendTourist',
        weekdayPeakHour: 11,
        vibeGrade: 'B',
        kind: 'living',
      }),
    ).toBe('주말에 사람이 몰리고 평일 낮 11시가 피크인 생활권 동네, 저녁엔 일찍 조용해집니다')
  })
  it('주말 관광형 + 저녁 활기 S → 저녁까지 활기', () => {
    expect(
      buildDongSummary({
        dominant: 'weekendTourist',
        weekdayPeakHour: 13,
        vibeGrade: 'S',
        kind: 'tourist',
      }),
    ).toBe('주말에 사람이 몰리고 평일 낮 13시가 피크인 관광지 동네, 저녁까지 활기가 이어집니다')
  })
  it('저녁 상권형', () => {
    expect(
      buildDongSummary({
        dominant: 'eveningDowntown',
        weekdayPeakHour: 19,
        vibeGrade: 'A',
        kind: 'living',
      }),
    ).toBe('저녁 19시에 가장 붐비는 상권형 동네, 낮엔 상대적으로 조용합니다')
  })
  it('평일 업무형', () => {
    expect(
      buildDongSummary({
        dominant: 'weekdayWork',
        weekdayPeakHour: 14,
        vibeGrade: 'C',
        kind: 'living',
      }),
    ).toBe('평일 낮 14시에 붐비고 주말엔 한산한 업무형 동네')
  })
  it('새벽 주거형', () => {
    expect(
      buildDongSummary({
        dominant: 'dawnResidential',
        weekdayPeakHour: 8,
        vibeGrade: 'C',
        kind: 'living',
      }),
    ).toBe('아침·밤에 사람이 있고 낮엔 비는 주거형 동네, 일하기엔 가장 조용합니다')
  })
})

describe('localLifeLabel / localLifeGrade', () => {
  it('경계 70/50', () => {
    expect(localLifeLabel(75)).toBe('생활권')
    expect(localLifeLabel(70)).toBe('생활권')
    expect(localLifeLabel(69)).toBe('혼합')
    expect(localLifeLabel(50)).toBe('혼합')
    expect(localLifeLabel(49)).toBe('방문지')
    expect(localLifeGrade(75)).toBe('A')
    expect(localLifeGrade(55)).toBe('B')
    expect(localLifeGrade(10)).toBe('C')
  })
  it('localLifeGrade 경계 70/50 — 금호동 mock 66 은 B (스펙 §3-5 고정 경계 우선)', () => {
    expect(localLifeGrade(70)).toBe('A')
    expect(localLifeGrade(69)).toBe('B')
    expect(localLifeGrade(66)).toBe('B')
    expect(localLifeGrade(50)).toBe('B')
    expect(localLifeGrade(49)).toBe('C')
  })
})

describe('pollQuestion', () => {
  it('저녁 활기 S·A 면 활기 질문, 그 외 조용 질문', () => {
    expect(pollQuestion('거진읍', 'B')).toBe('거진읍 저녁, 정말 조용한가요?')
    expect(pollQuestion('연동', 'S')).toBe('연동 저녁, 정말 활기찬가요?')
  })
})

describe('formatHour', () => {
  it('11 → 11시', () => {
    expect(formatHour(11)).toBe('11시')
    expect(formatHour(0)).toBe('0시')
  })
})
