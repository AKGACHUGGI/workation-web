import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MonthPicker from '@/components/ui/MonthPicker'

describe('MonthPicker', () => {
  it('버튼에 현재 달을 보이고, 누르면 기간 선택 모달의 휠에 연간·1~12월이 뜬다', async () => {
    render(<MonthPicker value="2025-10" onChange={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: '월 선택: 10월' }))
    const dialog = screen.getByRole('dialog', { name: '기간 선택' })
    const options = within(dialog).getAllByRole('option')
    expect(options).toHaveLength(13)
    expect(within(dialog).getByRole('option', { name: '10월' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('휠에서 고르고 선택 완료를 눌러야 반영된다', async () => {
    const onChange = vi.fn()
    render(<MonthPicker value="2025-10" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '월 선택: 10월' }))
    await userEvent.click(screen.getByRole('option', { name: '3월' }))
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: '선택 완료' }))
    expect(onChange).toHaveBeenCalledWith('2025-03')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('방향키로 한 칸씩 움직이고, 닫기는 반영하지 않는다', async () => {
    const onChange = vi.fn()
    render(<MonthPicker value="annual" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '월 선택: 연간' }))
    screen.getByRole('listbox', { name: '월' }).focus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('option', { name: '2월' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
