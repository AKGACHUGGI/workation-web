import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chip from '@/components/ui/Chip'

describe('Chip', () => {
  it('선택 상태를 aria-pressed 로 드러낸다', () => {
    render(<Chip selected>10월</Chip>)
    expect(screen.getByRole('button', { name: '10월', pressed: true })).toBeInTheDocument()
  })
  it('클릭 시 onClick', async () => {
    const onClick = vi.fn()
    render(<Chip onClick={onClick}>연간</Chip>)
    await userEvent.click(screen.getByRole('button', { name: '연간' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
  it('disabled 면 aria-disabled 이고 클릭해도 onClick 이 안 불린다', async () => {
    const onClick = vi.fn()
    render(
      <Chip disabled onClick={onClick} title="최소 1개 지표가 필요합니다">
        동네 조용함
      </Chip>,
    )
    const btn = screen.getByRole('button', { name: '동네 조용함' })
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })
  it('size: 기본 sm(32), md 는 42', () => {
    render(
      <>
        <Chip>작은</Chip>
        <Chip size="md">큰</Chip>
      </>,
    )
    expect(screen.getByRole('button', { name: '작은' })).toHaveClass('h-8')
    expect(screen.getByRole('button', { name: '큰' })).toHaveClass('h-10.5')
  })
})
