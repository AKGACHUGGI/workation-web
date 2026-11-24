import { useEffect, useRef } from 'react'
import { CHAT_COPY } from '@/features/chat/copy'
import type { ChatTarget } from '@/features/chat/types'
import { useChatThread } from '@/features/chat/useChatThread'
import ChatBubble from '@/features/chat/components/ChatBubble'
import ChatInput from '@/features/chat/components/ChatInput'

type Props = {
  target: ChatTarget
  /** 입력 칸 이름 (스크린리더). 동: '이 동네에 물어보기', 시군구: '{시군구}에 물어보기' */
  label: string
  placeholder: string
  /** 답에 나온 동 "자세히 →" 링크 주소 (시군구 상세만. 시군구 안에서 받은 동 답에도 붙는다) */
  dongHref?: (dongId: string) => string
}

const CHIP =
  'border-border-default bg-bg-surface text-caption-xs text-text-primary hover:border-text-primary rounded-full border px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'

/**
 * 상세 페이지 채팅 (시군구 채팅 스펙 §8). 대화 · 예시 질문 · 입력. 브리핑은 그리지 않는다(지도 패널에만).
 * 예시 질문은 늘 보이고 답이 오면 응답 examples 로 바뀐다. 대화 목록은 높이 288px 까지만 늘고
 * 그 안에서 스크롤된다. 새 차례가 붙거나 답이 오면 그 말풍선이 보이게 내린다(동작 줄이기면 즉시).
 * 돌아온 기록에서는 내리지 않는다. 읽기 폭은 640px 까지
 */
export default function ChatThread({ target, label, placeholder, dongHref }: Props) {
  const { thread, pending, ask, retry } = useChatThread(target)
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
    <div className="bg-bg-subtle flex max-w-160 flex-col gap-2.5 rounded-xl px-3.5 py-3">
      <div
        role="log"
        aria-live="polite"
        aria-label={CHAT_COPY.chatLog}
        tabIndex={0}
        className="flex max-h-72 flex-col gap-2 overflow-y-auto overscroll-contain empty:hidden"
      >
        {thread.turns.map((turn) => (
          <ChatBubble
            key={turn.id}
            ref={turn === last ? lastRef : undefined}
            turn={turn}
            onRetry={retry}
            dongHref={dongHref}
          />
        ))}
      </div>
      <div role="group" aria-label={CHAT_COPY.chatExamplesLabel} className="flex flex-wrap gap-1.5">
        {thread.examples.map((q) => (
          <button key={q} type="button" disabled={pending} onClick={() => ask(q)} className={CHIP}>
            {q}
          </button>
        ))}
      </div>
      <ChatInput disabled={pending} onSend={ask} label={label} placeholder={placeholder} />
    </div>
  )
}
