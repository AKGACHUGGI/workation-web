import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmModal from '@/components/ui/ConfirmModal'

describe('ConfirmModal', () => {
  it('제목·설명·버튼 2개, 확인/취소 콜백', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmModal
        open
        title="계정 삭제"
        description="되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={onConfirm}
        onCancel={onCancel}
        danger
      />,
    )
    expect(screen.getByRole('dialog', { name: '계정 삭제' })).toBeInTheDocument()
    expect(screen.getByText('되돌릴 수 없습니다.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '삭제' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
  it('pending 이면 두 버튼 모두 비활성', () => {
    render(
      <ConfirmModal
        open
        title="t"
        description="d"
        confirmLabel="삭제"
        onConfirm={() => {}}
        onCancel={() => {}}
        pending
      />,
    )
    expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
  })
  it('open=false 면 렌더하지 않는다', () => {
    render(
      <ConfirmModal
        open={false}
        title="t"
        description="d"
        confirmLabel="삭제"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
