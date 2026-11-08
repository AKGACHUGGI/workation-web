import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast/useToast'
import { useAuth } from '@/features/auth/useAuth'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { FavoriteLimitError, deleteFavorite, getFavoriteIds, putFavorite } from '@/features/me/api'
import { ME_COPY } from '@/features/me/copy'
import { meKeys } from '@/features/me/queryKeys'
import type { FavoriteIds, FavoriteKind } from '@/features/me/types'

export type { FavoriteKind } from '@/features/me/types'

export type UseFavorites = {
  isFavorite: (kind: FavoriteKind, id: string) => boolean
  toggle: (kind: FavoriteKind, id: string) => void
  isPending: boolean
}

const EMPTY: FavoriteIds = { regions: [], dongs: [] }

type Vars = { kind: FavoriteKind; id: string; next: boolean }

/**
 * 즐겨찾기 상태·토글. 서버가 진실(['me','favorites','ids']).
 * 비로그인이면 toggle 은 로그인 모달만 연다. 로그인 상태면 낙관적 갱신 → PUT/DELETE → 실패 시 롤백.
 */
export function useFavorites(): UseFavorites {
  const { isLoggedIn } = useAuth()
  const requireLogin = useRequireLogin()
  const queryClient = useQueryClient()
  const { show } = useToast()

  const { data } = useQuery({
    queryKey: meKeys.favoriteIds,
    queryFn: getFavoriteIds,
    enabled: isLoggedIn,
  })
  const ids = data ?? EMPTY

  const mutation = useMutation({
    mutationFn: ({ kind, id, next }: Vars) =>
      next ? putFavorite(kind, id) : deleteFavorite(kind, id),
    onMutate: async ({ kind, id, next }) => {
      await queryClient.cancelQueries({ queryKey: meKeys.favoriteIds })
      const prev = queryClient.getQueryData<FavoriteIds>(meKeys.favoriteIds) ?? EMPTY
      const list = next ? [...prev[kind], id] : prev[kind].filter((x) => x !== id)
      queryClient.setQueryData<FavoriteIds>(meKeys.favoriteIds, { ...prev, [kind]: list })
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(meKeys.favoriteIds, ctx.prev)
      if (err instanceof FavoriteLimitError) show(ME_COPY.limit)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.favoriteIds })
      queryClient.invalidateQueries({ queryKey: ['me', 'favorites'] })
      queryClient.invalidateQueries({ queryKey: meKeys.summary })
    },
  })

  const isFavorite = useCallback((kind: FavoriteKind, id: string) => ids[kind].includes(id), [ids])

  // 렌더 시점 ids 가 아니라 호출 시점 캐시를 읽는다 — 토스트 "되돌리기"처럼 예전 렌더의 toggle 을
  // 붙잡은 클로저도 낙관적 갱신 이후 상태를 보고 PUT/DELETE 를 고른다.
  const toggle = useCallback(
    (kind: FavoriteKind, id: string) => {
      requireLogin(() => {
        const current = queryClient.getQueryData<FavoriteIds>(meKeys.favoriteIds) ?? EMPTY
        mutation.mutate({ kind, id, next: !current[kind].includes(id) })
      })
    },
    [requireLogin, mutation, queryClient],
  )

  return { isFavorite, toggle, isPending: mutation.isPending }
}
