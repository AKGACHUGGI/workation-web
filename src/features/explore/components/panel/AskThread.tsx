import { useEffect, useRef } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DongDetail } from '@/features/explore/types'
import { useAskThread } from '@/features/explore/useAskThread'
import AskBubble from '@/features/explore/components/panel/AskBubble'
import AskInput from '@/features/explore/components/panel/AskInput'
import Briefing from '@/features/explore/components/panel/Briefing'

type Props = { dong: DongDetail }

const CHIP =
  'border-border-default bg-bg-surface text-caption-xs text-text-primary hover:border-text-primary rounded-lg border px-2.5 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'

/**
 * ② 동네에 물어보기 (물어보기 스펙 §3, Figma 444:9872~9966). 브리핑 칸 안에 대화 · 예시 칩 · 입력을 붙인다.
 * 대화 목록은 높이 288px 까지만 늘고 그 안에서 스크롤된다(칩·입력은 아래에 고정, 2026-11-13 사용자 결정).
 * 새 차례가 붙거나 답이 오면 그 말풍선이 보이게 내린다(동작 줄이기면 즉시). 돌아온 동의 기록에서는 내리지 않는다
 */
export default function AskThread({ dong }: Props) {
  const { thread, pending, ask, retry } = useAskThread(dong.id)
  const last = thread.turns.at(-1)
  const lastRef = useRef<HTMLDivElement>(null)
  const seen = useRef(last)
  useEffect(() => {
    if (!last || last === seen.current) return
    seen.current = last
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    lastRef.current?.scrollIntoView?.({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  }, [last])

  return (
    <Briefing sentences={dong.briefing}>
      <div
        role="log"
        aria-live="polite"
        aria-label={EXPLORE_COPY.askLog}
        tabIndex={0}
        className="flex max-h-72 flex-col gap-2 overflow-y-auto overscroll-contain empty:hidden"
      >
        {thread.turns.map((turn) => (
          <AskBubble
            key={turn.id}
            ref={turn === last ? lastRef : undefined}
            turn={turn}
            onRetry={retry}
          />
        ))}
      </div>
      <div
        role="group"
        aria-label={EXPLORE_COPY.askExamplesLabel}
        className="flex flex-wrap gap-1.5"
      >
        {thread.examples.map((q) => (
          <button key={q} type="button" disabled={pending} onClick={() => ask(q)} className={CHIP}>
            {q}
          </button>
        ))}
      </div>
      <AskInput disabled={pending} onSend={ask} />
    </Briefing>
  )
}
