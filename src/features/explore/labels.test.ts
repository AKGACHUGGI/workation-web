import { describe, expect, it } from 'vitest'
import {
  GRADE_LABEL,
  diffLabel,
  gradeChipLabel,
  hourChipLabel,
  monthChipLabel,
} from '@/features/explore/labels'
import { JUMUNJIN_DETAIL } from '@/mocks/explore/dong'

describe('칩 문구', () => {
  it('시간대 칩: 평일·주말', () => {
    expect(hourChipLabel(JUMUNJIN_DETAIL.hourly, 'weekday')).toBe('도로 한산 · 평일 9시')
    expect(hourChipLabel(JUMUNJIN_DETAIL.hourly, 'weekend')).toBe('도로 한산 · 주말 3시')
  })
  it('시간대 칩: 한산 시각이 없으면 null', () => {
    const hourly = {
      ...JUMUNJIN_DETAIL.hourly,
      weekday: { ...JUMUNJIN_DETAIL.hourly.weekday, quietHour: null },
    }
    expect(hourChipLabel(hourly, 'weekday')).toBeNull()
  })
  it('한산한 달 칩', () => {
    expect(monthChipLabel(JUMUNJIN_DETAIL.months)).toBe('한산한 달 · 2·4·9월')
    expect(monthChipLabel({ ...JUMUNJIN_DETAIL.months, quiet: [] })).toBeNull()
  })
  it('등급 칩: 등급 + 점수만', () => {
    expect(gradeChipLabel('evening', { grade: 'A', score: 62 })).toBe('저녁 활기 A / 62점')
    expect(gradeChipLabel('peer', { grade: 'B', score: 39 })).toBe('또래 밀도 B / 39점')
    expect(GRADE_LABEL.quiet).toBe('조용함')
  })
})

describe('diffLabel', () => {
  it('부호: +, −(U+2212), 0 은 ±0', () => {
    expect(diffLabel({ quiet: 8, peer: 13, evening: -15 })).toBe('조용함 +8 · 또래 +13 · 저녁 −15')
    expect(diffLabel({ quiet: 0, peer: -1, evening: 5 })).toBe('조용함 ±0 · 또래 −1 · 저녁 +5')
  })
  it('null 지표는 뺀다', () => {
    expect(diffLabel({ quiet: null, peer: 3, evening: null })).toBe('또래 +3')
    expect(diffLabel({ quiet: null, peer: null, evening: null })).toBe('')
  })
})
