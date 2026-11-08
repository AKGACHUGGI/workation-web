import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TextField from '@/components/ui/TextField'

describe('TextField', () => {
  it('label 로 찾을 수 있고 입력하면 onChange', async () => {
    const onChange = vi.fn()
    render(<TextField id="nick" label="닉네임" value="" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('닉네임'), '두')
    expect(onChange).toHaveBeenCalledWith('두')
  })
  it('error 가 있으면 aria-invalid + 메시지 연결', () => {
    render(
      <TextField
        id="nick"
        label="닉네임"
        value="a"
        onChange={() => {}}
        error="2~12자로 입력해 주세요"
      />,
    )
    const input = screen.getByLabelText('닉네임')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('2~12자로 입력해 주세요')
  })
})
