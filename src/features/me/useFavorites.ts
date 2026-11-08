import { useCallback } from 'react'
import { useRequireLogin } from '@/features/auth/useRequireLogin'

export type FavoriteKind = 'regions' | 'dongs'

export type UseFavorites = {
  isFavorite: (kind: FavoriteKind, id: string) => boolean
  toggle: (kind: FavoriteKind, id: string) => void
  isPending: boolean
}

/**
 * 즐겨찾기 훅 — W-01 단계의 스텁.
 * 즐겨찾기는 로그인 필수(W-08 결정)라 비로그인에서는 toggle 이 로그인 요구만 한다.
 * W-08 플랜이 ['me','favorites','ids'] 쿼리 + 낙관적 PUT/DELETE 로 내부를 교체한다. 시그니처는 유지.
 */
export function useFavorites(): UseFavorites {
  const requireLogin = useRequireLogin()
  const isFavorite = useCallback((_kind: FavoriteKind, _id: string) => false, [])
  const toggle = useCallback(
    (_kind: FavoriteKind, _id: string) => {
      requireLogin(() => {
        /* W-08 에서 서버 토글로 교체 */
      })
    },
    [requireLogin],
  )
  return { isFavorite, toggle, isPending: false }
}
