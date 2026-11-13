import type { Ref } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { AskErrorKind, AskTurn } from '@/features/explore/types'

type Props = { turn: AskTurn; onRetry: (id: string) => void; ref?: Ref<HTMLDivElement> }

const ERROR_TEXT: Record<AskErrorKind, string> = {
  retry: EXPLORE_COPY.askError,
  limit: EXPLORE_COPY.askLimit,
  invalid: EXPLORE_COPY.askInvalid,
}

/**
 * ② 물어보기 한 차례: 질문 말풍선(오른쪽, Figma QuestionBubble 444:9857) + 답 자리(왼쪽).
 * 답은 브리핑과 같은 글자, 안내(guide)·오류는 text-secondary. 대기는 점 3개 (Figma Typing 444:9865),
 * 다시 시도는 Figma RetryButton 444:9869
 */
export default function AskBubble({ turn, onRetry, ref }: Props) {
  return (
    <div ref={ref} data-turn={turn.status} className="flex flex-col gap-2">
      <p className="bg-bg-inverse text-caption-xs text-text-inverse max-w-4/5 self-end rounded-xl rounded-br-sm px-3 py-1.75 leading-normal">
        {turn.question}
      </p>
      {turn.status === 'pending' && (
        <div className="bg-bg-surface flex items-center gap-1 self-start rounded-xl rounded-bl-sm px-3 py-2.5">
          <span className="sr-only">{EXPLORE_COPY.askWaiting}</span>
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
        <p
          className={`text-caption-xs leading-normal ${turn.source === 'guide' ? 'text-text-secondary' : 'text-text-primary'}`}
        >
          {turn.answer.join(' ')}
        </p>
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
              {EXPLORE_COPY.askRetry}
            </button>
          )}
        </p>
      )}
    </div>
  )
}
