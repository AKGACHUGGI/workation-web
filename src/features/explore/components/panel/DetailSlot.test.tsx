import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DetailSlot from '@/features/explore/components/panel/DetailSlot'
import HourBars from '@/features/explore/components/panel/HourBars'
import MonthBars from '@/features/explore/components/panel/MonthBars'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'
import { JUMUNJIN } from '@/test/fixtures/explore'

const tone = (c: HTMLElement, sel: string) => c.querySelector(sel)?.getAttribute('data-tone')

describe('HourBars', () => {
  it('평일: 9시 한산 강조, 12시 붐빔 표시, 제목에 요일 없음', () => {
    const { container } = render(<HourBars hourly={JUMUNJIN.hourly} day="weekday" />)
    expect(container.querySelectorAll('[data-hour]')).toHaveLength(24)
    expect(tone(container, '[data-hour="9"]')).toBe('quiet')
    expect(tone(container, '[data-hour="12"]')).toBe('peak')
    expect(tone(container, '[data-hour="0"]')).toBe('base')
    expect(screen.getByText('시간대별 차량 이동')).toBeInTheDocument()
  })
  it('주말: 3시 한산, 14시 붐빔', () => {
    const { container } = render(<HourBars hourly={JUMUNJIN.hourly} day="weekend" />)
    expect(tone(container, '[data-hour="3"]')).toBe('quiet')
    expect(tone(container, '[data-hour="14"]')).toBe('peak')
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
    const { rerender } = render(
      <DetailSlot detail="hour" day="weekday" onDay={vi.fn()} dong={JUMUNJIN} />,
    )
    const slot = screen.getByTestId('detail-slot')
    expect(slot).toHaveClass(DONG_SECTION_H.detail)
    expect(screen.getByText('시간대별 차량 이동')).toBeInTheDocument()
    rerender(<DetailSlot detail="month" day="weekday" onDay={vi.fn()} dong={JUMUNJIN} />)
    expect(screen.getByTestId('detail-slot')).toBe(slot)
    expect(slot).toHaveClass(DONG_SECTION_H.detail)
    expect(screen.getByText('강릉시 기준')).toBeInTheDocument()
    expect(screen.queryByText('시간대별 차량 이동')).not.toBeInTheDocument()
  })
})

describe('DetailSlot 연결 표시', () => {
  it('제목 앞에 지금 고른 칩 이름을 붙인다', () => {
    const { rerender } = render(
      <DetailSlot detail="hour" day="weekday" onDay={vi.fn()} dong={JUMUNJIN} />,
    )
    expect(screen.getByTestId('detail-from')).toHaveTextContent('도로 한산')
    rerender(<DetailSlot detail="month" day="weekday" onDay={vi.fn()} dong={JUMUNJIN} />)
    expect(screen.getByTestId('detail-from')).toHaveTextContent('한산한 달')
  })
})

describe('DetailSlot 평일·주말 토글', () => {
  it('시간대 막대일 때만 토글이 있고, 누르면 onDay', async () => {
    const onDay = vi.fn()
    const { rerender } = render(
      <DetailSlot detail="hour" day="weekday" onDay={onDay} dong={JUMUNJIN} />,
    )
    const slot = screen.getByTestId('detail-slot')
    expect(screen.getByRole('tab', { name: '평일' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('tab', { name: '주말' }))
    expect(onDay).toHaveBeenCalledWith('weekend')
    expect(slot).toContainElement(screen.getByRole('tablist'))
    rerender(<DetailSlot detail="month" day="weekday" onDay={onDay} dong={JUMUNJIN} />)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })
})
