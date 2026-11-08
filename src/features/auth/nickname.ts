export const NICKNAME_MIN = 2
export const NICKNAME_MAX = 12

/** 공백을 다듬은 길이가 2~12자면 null, 아니면 에러 문구 */
export function validateNickname(value: string): string | null {
  const len = value.trim().length
  if (len < NICKNAME_MIN || len > NICKNAME_MAX)
    return `닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자로 입력해 주세요`
  return null
}
