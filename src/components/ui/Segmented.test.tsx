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
})
