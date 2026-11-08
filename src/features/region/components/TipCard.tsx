import type { ReactNode } from 'react'
import { Flag, MessageCircle, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { monthLabel } from '@/features/metric/month'
import BrandTag from '@/features/region/components/BrandTag'
import { relativeTime } from '@/features/region/relativeTime'
import type { Note } from '@/features/region/types'
import Avatar from '@/components/ui/Avatar'

type Props = {
  note: Note
  /** W-08 내 팁: 대상 지역 링크 */
  targetHref?: string
  targetLabel?: string
  /** 우측 추가 버튼 (W-08 삭제) */
  trailing?: ReactNode
}

/**
 * 워케이션 노트 카드 (Figma TipCard 27:132). 아바타는 brand/soft 원 + 첫 글자.
 * 도움돼요·답글·신고는 로그인 필요
 */
export default function TipCard({ note, targetHref, targetLabel, trailing }: Props) {
  const requireLogin = useRequireLogin()
  const meta = [relativeTime(note.createdAt), note.dongName, note.stayLabel]
    .filter(Boolean)
    .join(' · ')
  return (
    <article className="border-border-default bg-bg-surface flex flex-col gap-2.5 rounded-xl border p-4">
      <header className="flex items-center gap-2.5">
        <Avatar initial={note.author.initial} size="md" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-sm text-text-primary font-bold">{note.author.nickname}</span>
          <span className="text-caption-xs text-text-tertiary">{meta}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {note.visitMonth && <BrandTag>{monthLabel(note.visitMonth)} 방문</BrandTag>}
          {targetHref && targetLabel && (
            <Link to={targetHref} className="text-caption-xs text-text-secondary underline">
              {targetLabel}
            </Link>
          )}
          {trailing}
        </div>
      </header>
      <p className="text-body-sm text-text-primary">{note.body}</p>
      <footer className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => requireLogin(() => {})}
          className="text-caption-segment text-text-secondary flex items-center gap-1"
        >
          <ThumbsUp size={16} aria-hidden /> 도움돼요 {note.helpful}
        </button>
        <button
          type="button"
          onClick={() => requireLogin(() => {})}
          className="text-caption-segment text-text-secondary flex items-center gap-1"
        >
          <MessageCircle size={16} aria-hidden /> 답글 {note.replies}
        </button>
        <button
          type="button"
          onClick={() => requireLogin(() => {})}
          className="text-caption-xs text-text-tertiary ml-auto flex items-center gap-1"
        >
          <Flag size={14} aria-hidden /> 신고
        </button>
      </footer>
    </article>
  )
}
