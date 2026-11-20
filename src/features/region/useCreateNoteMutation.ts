import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meKeys } from '@/features/me/queryKeys'
import { createNote } from '@/features/region/api'
import type { CreateNoteRequest, NoteTarget, NotesResponse } from '@/features/region/types'

/**
 * 노트 쓰기. 성공하면 서버가 돌려준 Note 를 목록 캐시 맨 앞에 넣는다.
 * 목록을 다시 받지 않는 이유: 도움순이라 새 팁(도움 0)이 '더 보기' 뒤로 밀려 방금 쓴 글이 안 보인다
 */
export function useCreateNoteMutation(target: NoteTarget) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateNoteRequest) => createNote(target, req),
    onSuccess: (note) => {
      // regionKeys.notes · dongKeys.notes 의 앞부분 — 정렬 상관없이 모두 갱신
      const prefix = [target.kind === 'regions' ? 'region' : 'dong', target.id, 'notes']
      queryClient.setQueriesData<NotesResponse>({ queryKey: prefix }, (old) =>
        old ? { ...old, total: old.total + 1, items: [note, ...old.items] } : old,
      )
      queryClient.invalidateQueries({ queryKey: meKeys.tips })
      queryClient.invalidateQueries({ queryKey: meKeys.summary })
      if (note.photos?.length) queryClient.invalidateQueries({ queryKey: meKeys.photos })
    },
  })
}
