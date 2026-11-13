import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DetailSlot from '@/features/explore/components/panel/DetailSlot'
import HourBars from '@/features/explore/components/panel/HourBars'
import MonthBars from '@/features/explore/components/panel/MonthBars'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'
import { JUMUNJIN } from '@/test/fixtures/explore'

const tone = (c: HTMLElement, sel: string) => c.querySelector(sel)?.getAttribute('data-tone')

describe('HourBars', () => {
  it('평일: 9시 한산 강조, 12시 붐빔 표시, 요약 문구', () => {
    const { container } = render(<HourBars hourly={JUMUNJIN.hourly} day="weekday" />)
    expect(container.querySelectorAll('[data-hour]')).toHaveLength(24)
    expect(tone(container, '[data-hour="9"]')).toBe('quiet')
    expect(tone(container, '[data-hour="12"]')).toBe('peak')
    expect(tone(container, '[data-hour="0"]')).toBe('base')
    expect(screen.getByText('평일 시간대별 차량 이동')).toBeInTheDocument()
    expect(screen.getByText('9시 가장 한산 · 12시 가장 많음 (2,064명)')).toBeInTheDocument()
  })
  it('주말: 3시 한산, 14시 붐빔', () => {
    const { container } = render(<HourBars hourly={JUMUNJIN.hourly} day="weekend" />)
    expect(tone(container, '[data-hour="3"]')).toBe('quiet')
    expect(tone(container, '[data-hour="14"]')).toBe('peak')
    expect(screen.getByText('3시 가장 한산 · 14시 가장 많음 (2,833명)')).toBeInTheDocument()
  })
  it('값 없는 시각은 회색 빈 막대', () => {
    const weekday = {
      ...JUMUNJIN.hourly.weekday,
      driv: JUMUNJIN.hourly.weekday.driv.map((v, h) => (h === 2 ? null : v)),
    }
    const { container } = render(
      <HourBars hourly={{ ...JUMUNJIN.hourly, weekday }} day="weekday" />,
    )
    expect(tone(container, '[data-hour="2"]')).toBe('empty')
  })
})

describe('MonthBars', () => {
  it('12개월, 한산한 3개월 강조, "강릉시 기준", null 달은 빈 막대', () => {
    const months = {
      ...JUMUNJIN.months,
      raw: JUMUNJIN.months.raw.map((v, i) => (i === 10 ? null : v)),
    }
    const { container } = render(<MonthBars months={months} />)
    expect(container.querySelectorAll('[data-month]')).toHaveLength(12)
    expect(['2', '4', '9'].map((m) => tone(container, `[data-month="${m}"]`))).toEqual([
      'quiet',
      'quiet',
      'quiet',
    ])
    expect(tone(container, '[data-month="8"]')).toBe('base')
    expect(tone(container, '[data-month="11"]')).toBe('empty')
    expect(screen.getByText('강릉시 기준')).toBeInTheDocument()
  })
})

describe('DetailSlot', () => {
  it('시간대 ↔ 한산한 달로 바꿔도 칸 높이 클래스가 같다', () => {
    const { rerender } = render(<DetailSlot detail="hour" day="weekday" dong={JUMUNJIN} />)
    const slot = screen.getByTestId('detail-slot')
    expect(slot).toHaveClass(DONG_SECTION_H.detail)
    expect(screen.getByText('평일 시간대별 차량 이동')).toBeInTheDocument()
    rerender(<DetailSlot detail="month" day="weekday" dong={JUMUNJIN} />)
    expect(screen.getByTestId('detail-slot')).toBe(slot)
    expect(slot).toHaveClass(DONG_SECTION_H.detail)
    expect(screen.getByText('강릉시 기준')).toBeInTheDocument()
    expect(screen.queryByText('평일 시간대별 차량 이동')).not.toBeInTheDocument()
  })
})

describe('DetailSlot 연결 표시', () => {
  it('제목 앞에 지금 고른 칩 이름을 붙인다', () => {
    const { rerender } = render(<DetailSlot detail="hour" day="weekday" dong={JUMUNJIN} />)
    expect(screen.getByTestId('detail-from')).toHaveTextContent('도로 한산')
    rerender(<DetailSlot detail="month" day="weekday" dong={JUMUNJIN} />)
    expect(screen.getByTestId('detail-from')).toHaveTextContent('한산한 달')
  })
})
