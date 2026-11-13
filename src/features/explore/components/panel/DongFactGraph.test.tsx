import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DongFactGraph from '@/features/explore/components/panel/DongFactGraph'
import { gradeChipLabel, hourChipLabel, monthChipLabel } from '@/features/explore/labels'
import { JUMUNJIN } from '@/test/fixtures/explore'

const setup = (over: Partial<Parameters<typeof DongFactGraph>[0]> = {}) => {
  const props = {
    dong: JUMUNJIN,
    day: 'weekday' as const,
    onDay: vi.fn(),
    detail: 'hour' as const,
    onDetail: vi.fn(),
    ...over,
  }
  const view = render(<DongFactGraph {...props} />)
  return { ...view, props }
}

describe('DongFactGraph', () => {
  it('등급 칩 3개(등급 + 점수), 버튼이 아니고 눌러도 아무 일 없음', async () => {
    const { container, props } = setup()
    const grades = container.querySelectorAll('[data-chip="grade"]')
    expect(grades).toHaveLength(3)
    const evening = screen.getByLabelText(gradeChipLabel('evening', JUMUNJIN.grades.evening!))
    expect(evening.tagName).toBe('DIV')
    await userEvent.click(evening)
    expect(props.onDetail).not.toHaveBeenCalled()
    expect(props.onDay).not.toHaveBeenCalled()
  })

  it('값 없는 등급은 그 칩만 숨긴다', () => {
    const dong = { ...JUMUNJIN, grades: { ...JUMUNJIN.grades, peer: null } }
    const { container } = setup({ dong })
    expect(container.querySelectorAll('[data-chip="grade"]')).toHaveLength(2)
  })

  it('처음엔 시간대 칩 선택, 한산한 달 칩을 누르면 onDetail(month)', async () => {
    const { props } = setup()
    const hour = screen.getByRole('button', { name: hourChipLabel(JUMUNJIN.hourly, 'weekday')! })
    expect(hour).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: monthChipLabel(JUMUNJIN.months)! }))
    expect(props.onDetail).toHaveBeenCalledWith('month')
  })

  it('한산 시각이 없으면 시간대 칩을 숨긴다', () => {
    const weekday = { ...JUMUNJIN.hourly.weekday, quietHour: null }
    setup({ dong: { ...JUMUNJIN, hourly: { ...JUMUNJIN.hourly, weekday } } })
    expect(screen.queryByRole('button', { name: /^도로 한산/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^한산한 달/ })).toBeInTheDocument()
  })

  it('토글 주말 → onDay(weekend). day=weekend 이면 시간대 칩·가운데 글자가 바뀐다', async () => {
    const { props, rerender } = setup()
    await userEvent.click(screen.getByRole('tab', { name: '주말' }))
    expect(props.onDay).toHaveBeenCalledWith('weekend')

    rerender(<DongFactGraph {...props} day="weekend" />)
    expect(screen.getByRole('tab', { name: '주말' })).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('button', { name: hourChipLabel(JUMUNJIN.hourly, 'weekend')! }),
    ).toBeInTheDocument()
    expect(screen.getByText('주말 기준')).toBeInTheDocument()
  })

  it('가운데는 동 이름 원 하나. 24시간 링은 그리지 않는다 (차량은 상세 칸 막대에서만)', () => {
    const { container } = setup()
    expect(container.querySelector('[data-node="dong"]')).toHaveTextContent('주문진읍')
    expect(container.querySelectorAll('[data-hour]')).toHaveLength(0)
    expect(screen.queryByText('이 동 하루 기준')).not.toBeInTheDocument()
  })
})
