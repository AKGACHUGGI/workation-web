import type { ReactNode } from 'react'
import { Flag, MessageCircle, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import Tag from '@/components/ui/Tag'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { monthLabel } from '@/features/metric/month'
import { relativeTime } from '@/features/region/relativeTime'
import type { Note } from '@/features/region/types'

type Props = {
  note: Note
  /** W-08 내 팁: 대상 지역 링크 */
  targetHref?: string
  targetLabel?: string
  /** 우측 추가 버튼 (W-08 삭제) */
  trailing?: ReactNode
}

/** 워케이션 노트 카드. 도움돼요·답글·신고는 로그인 필요 */
export default function TipCard({ note, targetHref, targetLabel, trailing }: Props) {
  const requireLogin = useRequireLogin()
  const meta = [relativeTime(note.createdAt), note.dongName, note.stayLabel]
    .filter(Boolean)
    .join(' · ')
  return (
    <article className="border-border-default flex flex-col gap-3 rounded-2xl border p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-bg-inverse text-text-inverse text-caption-badge flex h-8 w-8 items-center justify-center rounded-full">
            {note.author.initial}
          </span>
          <div className="flex flex-col">
            <span className="text-body-sm text-text-primary font-medium">
              {note.author.nickname}
            </span>
            <span className="text-caption-xs text-text-tertiary">{meta}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {note.visitMonth && <Tag>{monthLabel(note.visitMonth)} 방문</Tag>}
          {targetHref && targetLabel && (
            <Link to={targetHref} className="text-caption-xs text-text-secondary underline">
              {targetLabel}
            </Link>
          )}
          {trailing}
        </div>
      </header>
      <p className="text-body-sm text-text-primary">{note.body}</p>
      <footer className="text-caption-xs text-text-secondary flex items-center gap-4">
        <button
          type="button"
          onClick={() => requireLogin(() => {})}
          className="flex items-center gap-1"
        >
          <ThumbsUp size={14} /> 도움돼요 {note.helpful}
        </button>
        <button
          type="button"
          onClick={() => requireLogin(() => {})}
          className="flex items-center gap-1"
        >
          <MessageCircle size={14} /> 답글 {note.replies}
        </button>
        <button
          type="button"
          onClick={() => requireLogin(() => {})}
          className="ml-auto flex items-center gap-1"
        >
          <Flag size={14} /> 신고
        </button>
      </footer>
    </article>
  )
}
