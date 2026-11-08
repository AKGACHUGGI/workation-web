import { useCallback } from 'react'
import { useToast } from '@/components/ui/toast/useToast'
import { ME_COPY } from '@/features/me/copy'
import { useFavorites } from '@/features/me/useFavorites'
import type { FavoriteKind } from '@/features/me/types'

/** 마이페이지 목록에서 해제: 낙관적 제거 + "즐겨찾기에서 뺐어요 · 되돌리기" 토스트 5초 */
export function useRemoveFavoriteWithUndo() {
  const { setFavorite } = useFavorites()
  const { show } = useToast()
  return useCallback(
    (kind: FavoriteKind, id: string, label: string) => {
      // toggle 이 아니라 명시적 상태 지정: ids 캐시가 아직 비어 있어도 해제는 DELETE, 되돌리기는 PUT
      setFavorite(kind, id, false)
      show(`${ME_COPY.removed} · ${label}`, {
        durationMs: 5000,
        action: { label: ME_COPY.undo, onClick: () => setFavorite(kind, id, true) },
      })
    },
    [setFavorite, show],
  )
}
