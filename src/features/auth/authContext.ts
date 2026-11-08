import { createContext, useContext } from 'react'

export type LoginOptions = {
  /** 로그인하지 않고 닫혔을 때(Esc·스크림·×·둘러보기) 1회 호출. 로그인 성공으로 닫히면 부르지 않는다 (W-08 /me → 홈) */
  onDismiss?: () => void
}

export type AuthContextValue = {
  /** 로그인 모달 열림 */
  isOpen: boolean
  /** 모달을 열고, 로그인 완료 후 실행할 동작을 기억한다 */
  openLogin: (pending?: () => void, opts?: LoginOptions) => void
  /** 사용자가 닫음. 보류 동작은 버리고 onDismiss 를 부른다 */
  closeLogin: () => void
  isOnboardingOpen: boolean
  /** login=1 로 복귀했음을 알린다 → me 확인 후 토스트 */
  markReturned: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthContext(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuthContext 는 AuthProvider 안에서만 쓸 수 있습니다')
  return value
}
