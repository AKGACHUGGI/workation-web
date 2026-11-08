import { describe, expect, it } from 'vitest'
import { buildReason } from '@/features/region/reason'
import type { ReasonInput } from '@/features/region/reason'

const goseong: ReasonInput = {
  monthLabel: '10월',
  presetLabel: '조용한 곳',
  composite: 50,
  rank: 3,
  total: 12,
  grade: 'S',
  overnightCoef: 0.98,
  dayInflow: 0.76,
  crowdIndex: 68,
  crowdGrade: 'B',
  bestMonths: [2, 3],
  peerOffpeakMonths: [12, 2],
}

describe('buildReason', () => {
  it('고성군 10월: 문장 4개', () => {
    const s = buildReason(goseong)
    expect(s).toHaveLength(4)
    expect(s[0]).toBe('10월 조용한 곳 프리셋 종합 50점으로 12곳 중 3위(S)입니다.')
    expect(s[1]).toBe('숙박 계수 0.98로 방문객 대부분이 밤에도 머무는 숙박형 지역이고,')
    expect(s[2]).toBe('낮 유입 지수 0.76로 근무 시간에 사람이 몰리지 않습니다.')
    expect(s[3]).toBe(
      '다만 10월 혼잡은 연중 최대의 68%로 시기 여유는 B입니다. 더 한산한 때를 원하면 2 · 3월, 또래가 많으면서 덜 붐비는 때는 12 · 2월입니다.',
    )
  })
  it('숙박 계수 구간 3가지', () => {
    expect(buildReason({ ...goseong, overnightCoef: 0.75 })[1]).toBe(
      '숙박 계수 0.75로 숙박과 당일 방문이 섞여 있고,',
    )
    expect(buildReason({ ...goseong, overnightCoef: 0.5 })[1]).toBe(
      '숙박 계수 0.50로 당일 방문 비중이 큰 지역이고,',
    )
  })
  it('낮 유입 구간', () => {
    expect(buildReason({ ...goseong, dayInflow: 0.95 })[2]).toBe(
      '낮 유입 지수 0.95로 낮 인구 변화가 크지 않습니다.',
    )
    expect(buildReason({ ...goseong, dayInflow: 1.2 })[2]).toBe(
      '낮 유입 지수 1.20로 낮에 사람이 몰리는 편입니다.',
    )
  })
  it('시기 여유 S·A 면 한산 문장', () => {
    expect(buildReason({ ...goseong, crowdGrade: 'A', crowdIndex: 41, monthLabel: '2월' })[3]).toBe(
      '2월은 연중 최대의 41%로 한산한 편입니다.',
    )
  })
})
