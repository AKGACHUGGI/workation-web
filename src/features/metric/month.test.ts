import { describe, expect, it } from 'vitest'
import {
  LATEST_MONTH,
  MONTHS,
  defaultMonth,
  monthLabel,
  monthNumber,
  parseMonth,
} from '@/features/metric/month'

describe('MONTHS', () => {
  it('연간 + 12개월 = 13개, 첫 항목은 annual', () => {
    expect(MONTHS).toHaveLength(13)
    expect(MONTHS[0]).toBe('annual')
    expect(MONTHS[12]).toBe('2025-12')
  })
  it('마지막 달은 12월', () => {
    expect(LATEST_MONTH).toBe('2025-12')
  })
})

describe('defaultMonth', () => {
  it('오늘 날짜의 달을 데이터 연도의 같은 달로 옮긴다', () => {
    expect(defaultMonth(new Date(2026, 10, 26))).toBe('2025-11')
    expect(defaultMonth(new Date(2026, 0, 1))).toBe('2025-01')
    expect(defaultMonth(new Date(2027, 11, 31))).toBe('2025-12')
  })
  it('날짜를 주지 않으면 오늘 (테스트에서는 2025-12-15 로 고정)', () => {
    expect(defaultMonth()).toBe('2025-12')
  })
})

describe('parseMonth', () => {
  it('유효한 값은 그대로', () => {
    expect(parseMonth('2025-10')).toBe('2025-10')
    expect(parseMonth('annual')).toBe('annual')
  })
  it('범위 밖·형식 오류·null 은 null', () => {
    expect(parseMonth('2099-01')).toBeNull()
    expect(parseMonth('2025-13')).toBeNull()
    expect(parseMonth('2025-1')).toBeNull()
    expect(parseMonth('')).toBeNull()
    expect(parseMonth(null)).toBeNull()
  })
})

describe('monthLabel / monthNumber', () => {
  it('월 라벨', () => {
    expect(monthLabel('2025-10')).toBe('10월')
    expect(monthLabel('2025-01')).toBe('1월')
    expect(monthLabel('annual')).toBe('연간')
  })
  it('월 숫자', () => {
    expect(monthNumber('2025-03')).toBe(3)
    expect(monthNumber('annual')).toBeNull()
  })
})
