import type { Me } from '@/features/auth/types'

let current: Me | null = null

/** mock 모드의 세션. 페이지를 새로고침하면 사라진다(쿠키 대신 메모리). */
export const mockSession = {
  get: (): Me | null => current,
  set: (me: Me | null): void => {
    current = me
  },
}
