import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/toast/useToast'
import { useAuth } from '@/features/auth/useAuth'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { relativeTime } from '@/features/region/relativeTime'
import { REPLY_MAX_LEN } from '@/features/region/types'
import { useReplies, useReplyMutations } from '@/features/region/useNoteActions'

/** 노트 카드 아래 답글: 목록(오래된 순) · 내 답글 삭제 · 답글 쓰기(로그인 필요) */
export default function ReplyThread({ tipId }: { tipId: string }) {
  const { isLoggedIn } = useAuth()
  const requireLogin = useRequireLogin()
  const { show } = useToast()
  const { data, status, refetch } = useReplies(tipId, true)
  const { create, remove } = useReplyMutations(tipId)
  const [body, setBody] = useState('')
  const trimmed = body.trim()
  const canSubmit = trimmed.length > 0 && !create.isPending

  const submit = () => {
    if (!canSubmit) return
    create.mutate(trimmed, {
      onSuccess: () => setBody(''),
      onError: () => show('답글을 올리지 못했어요. 잠시 후 다시 시도해 주세요'),
    })
  }

  return (
    <div className="border-border-default flex flex-col gap-3 border-t pt-3">
      {status === 'pending' && <div className="bg-bg-subtle h-8 animate-pulse rounded-lg" />}
      {status === 'error' && (
        <p className="text-caption-xs text-text-secondary">
          답글을 불러오지 못했습니다{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            다시 시도
          </button>
        </p>
      )}
      {data?.items.map((r) => (
        <div key={r.id} className="flex gap-2">
          <Avatar initial={r.author.initial} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-caption-xs text-text-tertiary">
              <b className="text-text-primary">{r.author.nickname}</b> · {relativeTime(r.createdAt)}
            </span>
            <p className="text-body-sm text-text-primary break-words whitespace-pre-wrap">
              {r.body}
            </p>
          </div>
          {r.mine && (
            <button
              type="button"
              onClick={() => remove.mutate(r.id, { onError: () => show('답글을 지우지 못했어요') })}
              className="text-caption-xs text-text-tertiary hover:text-signal-avoid self-start"
            >
              삭제
            </button>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={body}
          readOnly={!isLoggedIn}
          onFocus={() => {
            if (!isLoggedIn) requireLogin(() => {})
          }}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit()
          }}
          maxLength={REPLY_MAX_LEN}
          placeholder="답글을 남겨보세요"
          aria-label="답글"
          className="bg-bg-subtle text-body-sm text-text-primary placeholder:text-text-tertiary min-w-0 flex-1 rounded-lg px-3 py-2 outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="bg-brand-primary text-body-sm text-text-on-brand shrink-0 rounded-lg px-3 py-2 font-medium disabled:opacity-40"
        >
          답글 등록
        </button>
      </div>
    </div>
  )
}
