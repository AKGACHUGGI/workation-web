import type { Ref } from 'react'
import { Link } from 'react-router-dom'
import { CHAT_COPY } from '@/features/chat/copy'
import type { ChatErrorKind, ChatTurn } from '@/features/chat/types'

type Props = {
  turn: ChatTurn
  onRetry: (id: string) => void
  /** 시군구 답의 찾은 동 링크 주소. 없으면 링크를 그리지 않는다 */
  dongHref?: (dongId: string) => string
  ref?: Ref<HTMLDivElement>
}

const ERROR_TEXT: Record<ChatErrorKind, string> = {
  retry: CHAT_COPY.chatError,
  limit: CHAT_COPY.chatLimit,
  invalid: CHAT_COPY.chatInvalid,
}

/**
 * ② 채팅 한 차례: 질문 말풍선(오른쪽, Figma Explore/Chat/QuestionBubble 466:9905, 연분홍) + 답 자리(왼쪽).
 * 답은 브리핑처럼 문장을 이어 한 문단으로(백엔드가 이어지게 쓴다). 안내(guide)는 회색으로 문장 위에(동 4개 이상이면 둘 다 온다).
 * 대기는 점 3개 (Typing 466:9913), 다시 시도는 RetryButton 466:9917. 근거(evidence)는 보이지 않는다
 */
export default function ChatBubble({ turn, onRetry, dongHref, ref }: Props) {
  return (
    <div ref={ref} data-turn={turn.status} className="flex flex-col gap-2">
      <p className="bg-brand-soft border-brand-soft-border text-caption-xs text-text-primary max-w-4/5 self-end rounded-xl rounded-br-sm border px-3 py-1.75 leading-normal">
        {turn.question}
      </p>
      {turn.status === 'pending' && (
        <div className="bg-bg-surface flex items-center gap-1 self-start rounded-xl rounded-bl-sm px-3 py-2.5">
          <span className="sr-only">{CHAT_COPY.chatWaiting}</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden
              className="bg-explore-skeleton-base animate-skeleton-pulse size-1.5 rounded-full"
            />
          ))}
        </div>
      )}
      {turn.status === 'done' && (
        <div className="flex flex-col gap-1">
          {turn.guide && (
            <p className="text-caption-xs text-text-secondary leading-normal">{turn.guide}</p>
          )}
          {turn.sentences.length > 0 && (
            <p className="text-caption-xs text-text-primary leading-normal">
              {turn.sentences.map((s) => s.text).join(' ')}
            </p>
          )}
          {dongHref && turn.scope === 'region' && turn.dongs.length > 0 && (
            <ul aria-label={CHAT_COPY.dongLinks} className="flex flex-wrap gap-x-3 gap-y-1">
              {turn.dongs.map((d) => (
                <li key={d.id}>
                  <Link
                    to={dongHref(d.id)}
                    className="text-caption-xs text-text-primary font-medium underline underline-offset-2"
                  >
                    {CHAT_COPY.dongMore(d.name)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {turn.status === 'error' && (
        <p className="text-caption-xs text-text-secondary flex flex-wrap items-center gap-2 leading-normal">
          {ERROR_TEXT[turn.kind]}
          {turn.kind === 'retry' && (
            <button
              type="button"
              onClick={() => onRetry(turn.id)}
              className="border-border-strong bg-bg-surface text-caption-xs text-text-primary hover:border-text-primary rounded-full border px-2.5 py-1 font-medium"
            >
              {CHAT_COPY.chatRetry}
            </button>
          )}
        </p>
      )}
    </div>
  )
}
