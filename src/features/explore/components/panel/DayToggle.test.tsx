import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DayToggle from '@/features/explore/components/panel/DayToggle'

describe('DayToggle', () => {
  it('평일·주말 탭, 누르면 onDay', async () => {
    const onDay = vi.fn()
    render(<DayToggle day="weekday" onDay={onDay} />)
    expect(screen.getByRole('tab', { name: '평일' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('tab', { name: '주말' }))
    expect(onDay).toHaveBeenCalledWith('weekend')
  })
  it('선택 바탕은 움직이는 칸이 그리고, 두 탭 굵기는 같다', () => {
    const { container } = render(<DayToggle day="weekend" onDay={() => {}} />)
    const thumb = container.querySelector('[data-slot="sliding-thumb"]')
    expect(thumb).toHaveClass('bg-bg-inverse')
    expect(thumb).not.toHaveAttribute('hidden')
    const [a, b] = screen.getAllByRole('tab')
    expect(a).not.toHaveClass('bg-bg-inverse')
    expect(a.className.match(/font-\w+/g)).toEqual(b.className.match(/font-\w+/g))
  })
})
