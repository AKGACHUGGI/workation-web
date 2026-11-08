import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast/useToast'
import { AuthContext } from '@/features/auth/authContext'
import type { AuthContextValue, LoginOptions } from '@/features/auth/authContext'
import LoginModal from '@/features/auth/components/LoginModal'
import LoginReturnWatcher from '@/features/auth/components/LoginReturnWatcher'
import OnboardingModal from '@/features/auth/components/OnboardingModal'
import { authKeys } from '@/features/auth/queryKeys'
import { useAuth } from '@/features/auth/useAuth'
import { UnauthorizedError } from '@/lib/errors'

/**
 * 로그인 모달 열림 상태와 보류 동작(pendingAction)을 관리한다. RootLayout(ToastProvider 안쪽)에서 한 번 감싼다.
 * - 로그인 완료(me 있고 온보딩 불필요) → 모달 닫기, 보류 동작 실행 (onDismiss 는 버림)
 * - 사용자가 닫음(closeLogin) → 보류 동작 버림, onDismiss 호출
 * - me.needsOnboarding → OnboardingModal
 * - 조회·뮤테이션이 401 → 세션 만료로 보고 me 를 null 로, 모달 열기 (['auth','me'] 조회는 fetchMe 가 401 을 null 로 바꾸므로 제외)
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { show } = useToast()
  const { me } = useAuth()
  const [isOpen, setOpen] = useState(false)
  const [returned, setReturned] = useState(false)
  const pendingRef = useRef<(() => void) | null>(null)
  const dismissRef = useRef<(() => void) | null>(null)

  const openLogin = useCallback((pending?: () => void, opts?: LoginOptions) => {
    pendingRef.current = pending ?? null
    dismissRef.current = opts?.onDismiss ?? null
    setOpen(true)
  }, [])
  const closeLogin = useCallback(() => {
    const onDismiss = dismissRef.current
    pendingRef.current = null
    dismissRef.current = null
    setOpen(false)
    onDismiss?.()
  }, [])
  const markReturned = useCallback(() => setReturned(true), [])

  const isOnboardingOpen = !!me?.needsOnboarding

  // 로그인 완료 → 모달 닫기, 복귀 토스트, 보류 동작 재개
  useEffect(() => {
    if (!me || me.needsOnboarding) return
    setOpen(false)
    dismissRef.current = null
    if (returned) {
      show('로그인했습니다')
      setReturned(false)
    }
    const pending = pendingRef.current
    pendingRef.current = null
    pending?.()
  }, [me, returned, show])

  // 세션 만료: 조회·쓰기 요청 401 → me=null + 모달
  useEffect(() => {
    const expire = () => {
      queryClient.setQueryData(authKeys.me, null)
      pendingRef.current = null
      dismissRef.current = null
      setOpen(true)
    }
    const unsubQueries = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.action.type === 'error' &&
        event.action.error instanceof UnauthorizedError &&
        event.query.queryKey[0] !== authKeys.me[0]
      ) {
        expire()
      }
    })
    const unsubMutations = queryClient.getMutationCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.action.type === 'error' &&
        event.action.error instanceof UnauthorizedError
      ) {
        expire()
      }
    })
    return () => {
      unsubQueries()
      unsubMutations()
    }
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({ isOpen, openLogin, closeLogin, isOnboardingOpen, markReturned }),
    [isOpen, openLogin, closeLogin, isOnboardingOpen, markReturned],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginReturnWatcher />
      <LoginModal open={isOpen && !me} onClose={closeLogin} />
      {me?.needsOnboarding && <OnboardingModal me={me} />}
    </AuthContext.Provider>
  )
}
