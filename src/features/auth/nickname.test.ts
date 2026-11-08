import { describe, expect, it } from 'vitest'
import { validateNickname } from '@/features/auth/nickname'

describe('validateNickname', () => {
  it('2~12자는 통과', () => {
    expect(validateNickname('두이')).toBeNull()
    expect(validateNickname('열두글자닉네임입니다요오')).toBeNull()
  })
  it('공백 제거 후 1자·13자·빈 값은 에러', () => {
    expect(validateNickname('두')).toBe('닉네임은 2~12자로 입력해 주세요')
    expect(validateNickname('열세글자닉네임입니다요오오')).toBe('닉네임은 2~12자로 입력해 주세요')
    expect(validateNickname('  ')).toBe('닉네임은 2~12자로 입력해 주세요')
  })
})
