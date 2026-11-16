import { useEffect, useRef } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DongDetail } from '@/features/explore/types'
import { useChatThread } from '@/features/explore/useChatThread'
import Briefing from '@/features/explore/components/panel/Briefing'
import ChatBubble from '@/features/explore/components/panel/ChatBubble'
import ChatInput from '@/features/explore/components/panel/ChatInput'

type Props = { dong: DongDetail }

const CHIP =
  'border-border-default bg-bg-surface text-caption-xs text-text-primary hover:border-text-primary rounded-full border px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'

/**
 * ② 동 패널 채팅 (웹 스펙 §3, Figma W-09 v7 466:9900). 브리핑 칸 안에 대화 · 예시 질문 · 입력을 붙인다.
 * 예시 질문은 늘 보이고 답이 오면 응답 examples 로 바뀐다. 대화 목록은 높이 288px 까지만 늘고
 * 그 안에서 스크롤된다(예시·입력은 아래에 고정). 새 차례가 붙거나 답이 오면 그 말풍선이 보이게
 * 내린다(동작 줄이기면 즉시). 돌아온 동의 기록에서는 내리지 않는다
 */
export default function ChatThread({ dong }: Props) {
  const { thread, pending, ask, retry } = useChatThread(dong.id)
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
        aria-label={EXPLORE_COPY.chatLog}
        tabIndex={0}
        className="flex max-h-72 flex-col gap-2 overflow-y-auto overscroll-contain empty:hidden"
      >
        {thread.turns.map((turn) => (
          <ChatBubble
            key={turn.id}
            ref={turn === last ? lastRef : undefined}
            turn={turn}
            onRetry={retry}
          />
        ))}
      </div>
      <div
        role="group"
        aria-label={EXPLORE_COPY.chatExamplesLabel}
        className="flex flex-wrap gap-1.5"
      >
        {thread.examples.map((q) => (
          <button key={q} type="button" disabled={pending} onClick={() => ask(q)} className={CHIP}>
            {q}
          </button>
        ))}
      </div>
      <ChatInput disabled={pending} onSend={ask} />
    </Briefing>
  )
}
