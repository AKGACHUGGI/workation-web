import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NicknameEditor from '@/features/me/components/NicknameEditor'

describe('NicknameEditor', () => {
  it('2~12자 밖이면 저장 비활성 + 안내', async () => {
    render(<NicknameEditor initial="두이" onSave={async () => {}} onCancel={() => {}} />)
    const input = screen.getByRole('textbox', { name: '닉네임' })
    await userEvent.clear(input)
    await userEvent.type(input, '두')
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
    expect(screen.getByText('2~12자로 입력해 주세요')).toBeInTheDocument()
  })
  it('유효하면 onSave(값)', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<NicknameEditor initial="두이" onSave={onSave} onCancel={() => {}} />)
    const input = screen.getByRole('textbox', { name: '닉네임' })
    await userEvent.clear(input)
    await userEvent.type(input, '두이두이')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(onSave).toHaveBeenCalledWith('두이두이')
  })
})
