import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '@/components/ui/Modal'

function renderModal(open = true, onClose = vi.fn()) {
  render(
    <Modal open={open} onClose={onClose} titleId="t">
      <h2 id="t">제목</h2>
      <button>확인</button>
    </Modal>,
  )
  return onClose
}

describe('Modal', () => {
  it('open=false 면 렌더하지 않는다', () => {
    renderModal(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('dialog 역할과 aria-labelledby, 첫 버튼 포커스', () => {
    renderModal()
    const dialog = screen.getByRole('dialog', { name: '제목' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('확인')).toHaveFocus()
  })
  it('Esc 로 닫힌다', async () => {
    const onClose = renderModal()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('스크림 클릭으로 닫히고, 내용 클릭은 안 닫힌다', async () => {
    const onClose = renderModal()
    await userEvent.click(screen.getByText('제목'))
    expect(onClose).not.toHaveBeenCalled()
    await userEvent.click(screen.getByTestId('modal-scrim'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('열려 있는 동안 body 스크롤을 잠근다', () => {
    const { unmount } = render(
      <Modal open onClose={() => {}} titleId="t2">
        <h2 id="t2">x</h2>
      </Modal>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
