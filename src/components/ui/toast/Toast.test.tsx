import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToastProvider from '@/components/ui/toast/ToastProvider'
import { useToast } from '@/components/ui/toast/useToast'

function Trigger({ onUndo }: { onUndo?: () => void }) {
  const { show } = useToast()
  return (
    <>
      <button onClick={() => show('링크를 복사했습니다')}>copy</button>
      <button
        onClick={() =>
          show('즐겨찾기에서 뺐어요', {
            action: { label: '되돌리기', onClick: onUndo ?? (() => {}) },
          })
        }
      >
        remove
      </button>
    </>
  )
}

describe('Toast', () => {
  it('show 하면 role=status 로 메시지가 보이고 기본 3초 뒤 사라진다', async () => {
    // shouldAdvanceTime: RTL asyncWrapper 의 setTimeout(0) 이 vitest 가짜 타이머에서 멈추지 않게 한다
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    await user.click(screen.getByText('copy'))
    expect(screen.getByRole('status')).toHaveTextContent('링크를 복사했습니다')
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('action 버튼을 누르면 onClick 이 불리고 토스트가 닫힌다', async () => {
    const onUndo = vi.fn()
    render(
      <ToastProvider>
        <Trigger onUndo={onUndo} />
      </ToastProvider>,
    )
    await userEvent.click(screen.getByText('remove'))
    await userEvent.click(screen.getByRole('button', { name: '되돌리기' }))
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
