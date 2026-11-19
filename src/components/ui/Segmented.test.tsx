import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Segmented from '@/components/ui/Segmented'

const options = [
  { value: 'sigungu', label: '시군구' },
  { value: 'dong', label: '행정동' },
] as const

describe('Segmented', () => {
  it('tablist/tab 역할과 aria-selected', () => {
    render(
      <Segmented options={[...options]} value="sigungu" onChange={() => {}} ariaLabel="범위" />,
    )
    expect(screen.getByRole('tablist', { name: '범위' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '시군구' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '행정동' })).toHaveAttribute('aria-selected', 'false')
  })
  it('클릭하면 onChange(value)', async () => {
    const onChange = vi.fn()
    render(<Segmented options={[...options]} value="sigungu" onChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: '행정동' }))
    expect(onChange).toHaveBeenCalledWith('dong')
  })
  it('value 가 null 이면 아무것도 선택되지 않는다', () => {
    render(<Segmented options={[...options]} value={null} onChange={() => {}} />)
    expect(screen.queryAllByRole('tab', { selected: true })).toHaveLength(0)
  })
  it('disabled 옵션은 aria-disabled 이고 onChange 가 안 불린다', async () => {
    const onChange = vi.fn()
    render(
      <Segmented
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B', disabled: true, title: '불가' },
        ]}
        value="a"
        onChange={onChange}
      />,
    )
    const b = screen.getByRole('tab', { name: 'B' })
    expect(b).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(b)
    expect(onChange).not.toHaveBeenCalled()
  })
  it('variant=surface 는 움직이는 칸이 흰 바탕(잉크 바탕 아님), 선택 글자는 잉크', () => {
    const { container } = render(
      <Segmented options={[...options]} value="sigungu" onChange={() => {}} variant="surface" />,
    )
    const thumb = container.querySelector('[data-slot="sliding-thumb"]')
    expect(thumb).toHaveClass('bg-bg-surface', 'shadow-xs')
    expect(thumb).not.toHaveClass('bg-selected-bg')
    expect(screen.getByRole('tab', { name: '시군구' })).toHaveClass('text-text-primary')
  })
  it('variant=ink 는 칸이 잉크 바탕, 선택 글자는 selected-fg', () => {
    const { container } = render(
      <Segmented options={[...options]} value="sigungu" onChange={() => {}} />,
    )
    expect(container.querySelector('[data-slot="sliding-thumb"]')).toHaveClass('bg-selected-bg')
    expect(screen.getByRole('tab', { name: '시군구' })).toHaveClass('text-selected-fg')
  })
  it('선택 여부로 글자 굵기가 바뀌지 않는다', () => {
    render(<Segmented options={[...options]} value="sigungu" onChange={() => {}} size="sm" />)
    const [a, b] = screen.getAllByRole('tab')
    expect(a.className.match(/font-\w+/g)).toEqual(b.className.match(/font-\w+/g))
  })
})
