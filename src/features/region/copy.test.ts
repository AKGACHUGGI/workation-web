import { describe, expect, it } from 'vitest'
import { overnightCopy, rankCopy, weekendCopy, weekendSentence } from '@/features/region/copy'

describe('overnightCopy', () => {
  it('경계 0.7 / 0.9', () => {
    expect(overnightCopy(0.98)).toBe('방문객 대부분 숙박')
    expect(overnightCopy(0.9)).toBe('방문객 대부분 숙박')
    expect(overnightCopy(0.89)).toBe('숙박·당일 혼합')
    expect(overnightCopy(0.7)).toBe('숙박·당일 혼합')
    expect(overnightCopy(0.69)).toBe('당일 방문 위주')
  })
})

describe('rankCopy', () => {
  it('경계 25 / 50 / 75', () => {
    expect(rankCopy(75)).toBe('상위권')
    expect(rankCopy(74)).toBe('중상위')
    expect(rankCopy(50)).toBe('중상위')
    expect(rankCopy(49)).toBe('중하위')
    expect(rankCopy(25)).toBe('중하위')
    expect(rankCopy(24)).toBe('하위권')
  })
})

describe('weekendCopy', () => {
  it('경계 0.9 / 1.15', () => {
    expect(weekendCopy(0.89)).toBe('주중형')
    expect(weekendCopy(0.9)).toBe('균형형')
    expect(weekendCopy(1.05)).toBe('균형형')
    expect(weekendCopy(1.14)).toBe('균형형')
    expect(weekendCopy(1.15)).toBe('주말형')
  })
})

describe('weekendSentence', () => {
  it('균형형 (+5%)', () => {
    expect(weekendSentence(1.05)).toBe(
      '주말에 낮 체류인구가 +5% 늘어나는 수준으로 주중·주말 차이가 작습니다. 요일과 상관없이 비슷한 밀도를 기대할 수 있습니다.',
    )
  })
  it('균형형 (-4%)', () => {
    expect(weekendSentence(0.96)).toBe(
      '주말에 낮 체류인구가 -4% 줄어드는 수준으로 주중·주말 차이가 작습니다. 요일과 상관없이 비슷한 밀도를 기대할 수 있습니다.',
    )
  })
  it('주말형', () => {
    expect(weekendSentence(1.3)).toBe(
      '주말에 낮 체류인구가 30% 늘어납니다. 조용한 체류가 목적이면 주중 도착·주말 외곽 동네 이동을 권합니다.',
    )
  })
  it('주중형', () => {
    expect(weekendSentence(0.8)).toBe(
      '주말에 낮 체류인구가 20% 줄어듭니다. 주말이 오히려 한산한 지역입니다.',
    )
  })
})
