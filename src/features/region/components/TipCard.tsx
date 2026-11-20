import { useState, type ReactNode } from 'react'
import { Flag, MessageCircle, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/toast/useToast'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { monthLabel } from '@/features/metric/month'
import ReplyThread from '@/features/region/components/ReplyThread'
import { relativeTime } from '@/features/region/relativeTime'
import { NOTE_MAX_LEN } from '@/features/region/types'
import type { Note } from '@/features/region/types'
import { useDeleteNote, useHelpful, useUpdateNote } from '@/features/region/useNoteActions'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'

type Props = {
  note: Note
  /** W-08 내 팁: 대상 지역 링크 */
  targetHref?: string
  targetLabel?: string
  /** 우측 추가 버튼 (W-08 삭제). 있으면 카드 안의 수정 · 삭제는 그리지 않는다 */
  trailing?: ReactNode
}

const ACTION = 'text-caption-segment text-text-secondary flex items-center gap-1'

/**
 * 워케이션 노트 카드 (Figma TipCard 27:132). 아바타는 brand/soft 원 + 첫 글자.
 * 붙인 사진 · 도움돼요 토글 · 답글 펼치기. 내 팁(mine)은 신고 대신 수정 · 삭제.
 * 도움돼요 · 답글 쓰기 · 신고는 로그인 필요 (답글 읽기는 비로그인도)
 */
export default function TipCard({ note, targetHref, targetLabel, trailing }: Props) {
  const requireLogin = useRequireLogin()
  const { show } = useToast()
  const toggleHelpful = useHelpful(note)
  const update = useUpdateNote()
  const del = useDeleteNote()
  const [repliesOpen, setRepliesOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const meta = [relativeTime(note.createdAt), note.dongName, note.stayLabel]
    .filter(Boolean)
    .join(' · ')
  const ownActions = note.mine && !trailing
  const draft = editing?.trim() ?? ''
  const canSave = draft.length > 0 && draft !== note.body && !update.isPending

  const save = () => {
    if (!canSave) return
    update.mutate(
      { id: note.id, body: draft },
      {
        onSuccess: () => setEditing(null),
        onError: () => show('팁을 고치지 못했어요. 잠시 후 다시 시도해 주세요'),
      },
    )
  }

  return (
    <article className="border-border-default bg-bg-surface flex flex-col gap-2.5 rounded-xl border p-4">
      <header className="flex items-center gap-2.5">
        <Avatar initial={note.author.initial} size="md" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-sm text-text-primary font-bold">{note.author.nickname}</span>
          <span className="text-caption-xs text-text-tertiary">{meta}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {note.visitMonth && <Tag tone="brand">{monthLabel(note.visitMonth)} 방문</Tag>}
          {targetHref && targetLabel && (
            <Link to={targetHref} className="text-caption-xs text-text-secondary underline">
              {targetLabel}
            </Link>
          )}
          {trailing}
        </div>
      </header>
      {editing === null ? (
        <p className="text-body-sm text-text-primary break-words whitespace-pre-wrap">
          {note.body}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={editing}
            onChange={(e) => setEditing(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
            }}
            maxLength={NOTE_MAX_LEN}
            rows={3}
            aria-label="팁 고치기"
            autoFocus
            className="bg-bg-subtle text-body-sm text-text-primary resize-none rounded-lg px-3 py-2 outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="border-border-default text-body-sm text-text-primary rounded-lg border px-3 py-1.5"
            >
              취소
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className="bg-brand-primary text-body-sm text-text-on-brand rounded-lg px-3 py-1.5 font-medium disabled:opacity-40"
            >
              저장
            </button>
          </div>
        </div>
      )}
      {note.photos && note.photos.length > 0 && (
        <ul className="flex gap-2" aria-label="붙인 사진">
          {note.photos.map((p, i) => (
            <li key={p.id}>
              <a href={p.url} target="_blank" rel="noreferrer">
                <img
                  src={p.url}
                  alt={`${note.author.nickname}의 사진 ${i + 1}`}
                  loading="lazy"
                  className="bg-bg-subtle size-24 rounded-lg object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      <footer className="flex items-center gap-4">
        {note.mine ? (
          // 내 팁에는 누를 수 없다 (서버 400 OWN_TIP). 눌러도 반응이 없으면 고장처럼 보여 이유를 알린다
          <button
            type="button"
            aria-disabled
            onClick={() => show('내 팁에는 도움돼요를 누를 수 없어요')}
            className={`${ACTION} cursor-default`}
          >
            <ThumbsUp size={16} aria-hidden /> 도움돼요 {note.helpful}
          </button>
        ) : (
          <button
            type="button"
            aria-pressed={!!note.myHelpful}
            onClick={toggleHelpful}
            className={`${ACTION} ${note.myHelpful ? 'text-text-brand' : ''}`}
          >
            <ThumbsUp size={16} aria-hidden fill={note.myHelpful ? 'currentColor' : 'none'} />
            도움돼요 {note.helpful}
          </button>
        )}
        <button
          type="button"
          aria-expanded={repliesOpen}
          onClick={() => setRepliesOpen((o) => !o)}
          className={ACTION}
        >
          <MessageCircle size={16} aria-hidden /> 답글 {note.replies}
        </button>
        {ownActions && (
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditing(note.body)}
              className="text-caption-xs text-text-tertiary hover:text-text-primary"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-caption-xs text-text-tertiary hover:text-signal-avoid"
            >
              삭제
            </button>
          </div>
        )}
        {!note.mine && (
          <button
            type="button"
            onClick={() => requireLogin(() => {})}
            className="text-caption-xs text-text-tertiary ml-auto flex items-center gap-1"
          >
            <Flag size={14} aria-hidden /> 신고
          </button>
        )}
      </footer>
      {repliesOpen && <ReplyThread tipId={note.id} />}
      {ownActions && (
        <ConfirmModal
          open={confirmDelete}
          title="팁을 삭제할까요?"
          description="붙인 사진과 답글도 함께 지워지고 되돌릴 수 없어요."
          confirmLabel="삭제"
          danger
          pending={del.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            del.mutate(note.id, {
              onSuccess: () => {
                setConfirmDelete(false)
                show('팁을 삭제했어요')
              },
              onError: () => show('팁을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요'),
            })
          }
        />
      )}
    </article>
  )
}
