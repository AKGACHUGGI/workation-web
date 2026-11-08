import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MonthChips from '@/components/ui/MonthChips'

describe('MonthChips', () => {
  it('연간 + 12개월 칩, 선택 칩은 aria-pressed', () => {
    render(<MonthChips value="2025-10" onChange={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(13)
    expect(screen.getByRole('button', { name: '연간' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10월', pressed: true })).toBeInTheDocument()
  })
  it('클릭 시 onChange(MonthParam)', async () => {
    const onChange = vi.fn()
    render(<MonthChips value="2025-10" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '3월' }))
    expect(onChange).toHaveBeenCalledWith('2025-03')
    await userEvent.click(screen.getByRole('button', { name: '연간' }))
    expect(onChange).toHaveBeenCalledWith('annual')
  })
  it('마운트 시 선택 칩을 가운데로 스크롤한다', () => {
    const spy = vi.fn()
    Element.prototype.scrollIntoView = spy
    render(<MonthChips value="2025-10" onChange={() => {}} />)
    expect(spy).toHaveBeenCalledWith({ inline: 'center', block: 'nearest' })
  })
})
