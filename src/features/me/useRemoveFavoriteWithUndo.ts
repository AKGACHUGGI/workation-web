import { useCallback } from 'react'
import { useToast } from '@/components/ui/toast/useToast'
import { ME_COPY } from '@/features/me/copy'
import { useFavorites } from '@/features/me/useFavorites'
import type { FavoriteKind } from '@/features/me/types'

/** 마이페이지 목록에서 해제: 낙관적 제거 + "즐겨찾기에서 뺐어요 · 되돌리기" 토스트 5초 */
export function useRemoveFavoriteWithUndo() {
  const { toggle } = useFavorites()
  const { show } = useToast()
  return useCallback(
    (kind: FavoriteKind, id: string, label: string) => {
      toggle(kind, id) // 캐시에 있음 → DELETE(낙관적 제거)
      show(`${ME_COPY.removed} · ${label}`, {
        durationMs: 5000,
        // toggle 은 호출 시점 캐시를 읽으므로 이 클로저가 옛 렌더 것이어도 제거된 상태를 보고 PUT
        action: { label: ME_COPY.undo, onClick: () => toggle(kind, id) },
      })
    },
    [toggle, show],
  )
}
