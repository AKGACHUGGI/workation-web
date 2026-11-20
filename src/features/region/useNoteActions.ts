import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast/useToast'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { deleteMyTip } from '@/features/me/api'
import { meKeys } from '@/features/me/queryKeys'
import {
  createReply,
  deleteReply,
  fetchReplies,
  setHelpful,
  updateNote,
} from '@/features/region/api'
import { patchNote, removeNote, tipKeys } from '@/features/region/noteCache'
import type { Note, RepliesResponse } from '@/features/region/types'

const FAILED = '저장하지 못했어요. 잠시 후 다시 시도해 주세요'

/** 도움돼요 토글. 낙관적으로 바꾸고 응답 수로 확정, 실패하면 되돌린다. 비로그인은 로그인 모달 */
export function useHelpful(note: Note) {
  const qc = useQueryClient()
  const requireLogin = useRequireLogin()
  const { show } = useToast()
  const mutation = useMutation({
    mutationFn: (on: boolean) => setHelpful(note.id, on),
    scope: { id: `helpful-${note.id}` },
    onMutate: (on) => {
      const prev = { helpful: note.helpful, myHelpful: note.myHelpful }
      patchNote(qc, note.id, (n) => ({
        ...n,
        helpful: n.helpful + (on ? 1 : -1),
        ...(on ? { myHelpful: true as const } : { myHelpful: undefined }),
      }))
      return prev
    },
    onError: (_e, _on, prev) => {
      if (prev) patchNote(qc, note.id, (n) => ({ ...n, ...prev }))
      show(FAILED)
    },
    onSuccess: (res) => {
      patchNote(qc, note.id, (n) => ({
        ...n,
        helpful: res.helpful,
        ...(res.myHelpful ? { myHelpful: true as const } : { myHelpful: undefined }),
      }))
      qc.invalidateQueries({ queryKey: meKeys.summary })
    },
  })
  return () => requireLogin(() => mutation.mutate(!note.myHelpful))
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => updateNote(id, body),
    // 서버가 돌려준 노트로 바꾸되 목록마다 다른 필드(내 팁의 target)는 남긴다
    onSuccess: (note) => patchNote(qc, note.id, (n) => ({ ...n, ...note })),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteMyTip,
    onSuccess: (_r, id) => {
      removeNote(qc, id)
      qc.invalidateQueries({ queryKey: meKeys.summary })
      qc.invalidateQueries({ queryKey: meKeys.photos })
    },
  })
}

export function useReplies(tipId: string, enabled: boolean) {
  return useQuery({
    queryKey: tipKeys.replies(tipId),
    queryFn: () => fetchReplies(tipId),
    enabled,
  })
}

/** 답글 쓰기 · 지우기. 성공하면 답글 목록과 노트의 답글 수를 함께 고친다 */
export function useReplyMutations(tipId: string) {
  const qc = useQueryClient()
  const key = tipKeys.replies(tipId)
  const create = useMutation({
    mutationFn: (body: string) => createReply(tipId, body),
    onSuccess: (reply) => {
      qc.setQueryData<RepliesResponse>(key, (old) => ({ items: [...(old?.items ?? []), reply] }))
      patchNote(qc, tipId, (n) => ({ ...n, replies: n.replies + 1 }))
    },
  })
  const remove = useMutation({
    mutationFn: deleteReply,
    onSuccess: (_r, id) => {
      qc.setQueryData<RepliesResponse>(key, (old) =>
        old ? { items: old.items.filter((r) => r.id !== id) } : old,
      )
      patchNote(qc, tipId, (n) => ({ ...n, replies: Math.max(0, n.replies - 1) }))
    },
  })
  return { create, remove }
}
