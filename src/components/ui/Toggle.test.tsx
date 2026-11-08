import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toggle from '@/components/ui/Toggle'

describe('Toggle', () => {
  it('switch 역할과 aria-checked, 클릭 시 반대값으로 onChange', async () => {
    const onChange = vi.fn()
    render(<Toggle id="t1" label="가기 좋은 달 알림" checked onChange={onChange} />)
    const sw = screen.getByRole('switch', { name: '가기 좋은 달 알림' })
    expect(sw).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(sw)
    expect(onChange).toHaveBeenCalledWith(false)
  })
  it('disabled 면 onChange 가 안 불린다', async () => {
    const onChange = vi.fn()
    render(<Toggle id="t2" label="x" checked={false} onChange={onChange} disabled />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
