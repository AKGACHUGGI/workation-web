import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFocusTrap } from '@/hooks/useFocusTrap'

function Harness({ onEscape }: { onEscape?: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onEscape)
  return (
    <div>
      <button onClick={() => setOpen(true)}>열기</button>
      {open && (
        <div ref={ref} tabIndex={-1}>
          <button onClick={() => setOpen(false)}>첫째</button>
          <button>둘째</button>
        </div>
      )}
    </div>
  )
}

describe('useFocusTrap', () => {
  it('활성화되면 첫 포커스 가능 요소로 포커스가 간다', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByText('열기'))
    expect(screen.getByText('첫째')).toHaveFocus()
  })

  it('Tab 은 안에서 순환한다', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByText('열기'))
    await userEvent.tab()
    expect(screen.getByText('둘째')).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByText('첫째')).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(screen.getByText('둘째')).toHaveFocus()
  })

  it('Esc 는 onEscape 를 부른다', async () => {
    const onEscape = vi.fn()
    render(<Harness onEscape={onEscape} />)
    await userEvent.click(screen.getByText('열기'))
    await userEvent.keyboard('{Escape}')
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('비활성화되면 열었던 요소로 포커스가 돌아간다', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByText('열기'))
    await userEvent.click(screen.getByText('첫째')) // 닫기
    expect(screen.getByText('열기')).toHaveFocus()
  })
})
