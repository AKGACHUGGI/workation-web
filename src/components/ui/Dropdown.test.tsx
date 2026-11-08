import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dropdown from '@/components/ui/Dropdown'

const options = [
  { value: 'favorites', label: '즐겨찾기 많은 순' },
  { value: 'views', label: '조회 많은 순' },
  { value: 'score', label: '종합 점수순' },
] as const

describe('Dropdown', () => {
  it('닫힌 상태에서 현재 라벨을 보여주고 aria-expanded=false', () => {
    render(
      <Dropdown options={[...options]} value="favorites" onChange={() => {}} ariaLabel="정렬" />,
    )
    const btn = screen.getByRole('button', { name: /정렬/ })
    expect(btn).toHaveTextContent('즐겨찾기 많은 순')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('클릭하면 열리고 옵션을 고르면 onChange 후 닫힌다', async () => {
    const onChange = vi.fn()
    render(
      <Dropdown options={[...options]} value="favorites" onChange={onChange} ariaLabel="정렬" />,
    )
    await userEvent.click(screen.getByRole('button', { name: /정렬/ }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '즐겨찾기 많은 순' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await userEvent.click(screen.getByRole('option', { name: '조회 많은 순' }))
    expect(onChange).toHaveBeenCalledWith('views')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('키보드: ArrowDown 으로 이동, Enter 로 선택, Esc 로 닫기', async () => {
    const onChange = vi.fn()
    render(
      <Dropdown options={[...options]} value="favorites" onChange={onChange} ariaLabel="정렬" />,
    )
    const btn = screen.getByRole('button', { name: /정렬/ })
    btn.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('score')
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('바깥 클릭으로 닫힌다', async () => {
    render(
      <div>
        <Dropdown options={[...options]} value="favorites" onChange={() => {}} ariaLabel="정렬" />
        <p>바깥</p>
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: /정렬/ }))
    await userEvent.click(screen.getByText('바깥'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
  it('icon·formatLabel: 트리거에 아이콘과 가공 라벨, 접근 이름은 원래 라벨', () => {
    render(
      <Dropdown
        options={[{ value: 'quiet', label: '조용한 곳' }]}
        value="quiet"
        onChange={() => {}}
        ariaLabel="프리셋"
        variant="strong"
        icon={<svg data-testid="lead-icon" />}
        formatLabel={(l) => `${l} 프리셋`}
      />,
    )
    const trigger = screen.getByRole('button', { name: '프리셋: 조용한 곳' })
    expect(trigger).toHaveTextContent('조용한 곳 프리셋')
    expect(trigger).toHaveClass('border-border-strong', 'h-10')
    expect(screen.getByTestId('lead-icon')).toBeInTheDocument()
  })
})
