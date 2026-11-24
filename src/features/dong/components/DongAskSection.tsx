import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ChatThread from '@/features/chat/components/ChatThread'
import { CHAT_COPY } from '@/features/chat/copy'
import type { MonthParam } from '@/features/metric/month'

type Props = { dongId: string; month: MonthParam }

export const ASK_ID = 'ask'

/**
 * 동 상세 채팅 (시군구 채팅 스펙 §8). 브리핑 없이 대화 · 예시 · 입력. 달은 페이지 달을 보낸다
 * (보행 기준 시간대 답이 본문 24시간 곡선과 같은 달 값이 되게). 사이드바 계획 카드 아래 카드로,
 * 스크롤하면 헤더 아래에 붙고 화면 높이를 넘지 않는다(넘치면 대화 목록이 줄어 그 안에서 스크롤).
 * 지도 패널 링크(#ask)로 오면 그려진 뒤 이 카드로 내린다 — 페이지는 데이터가 온 뒤에 이 카드를 그린다
 */
export default function DongAskSection({ dongId, month }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === `#${ASK_ID}`) ref.current?.scrollIntoView?.({ block: 'start' })
  }, [hash])
  return (
    <section
      id={ASK_ID}
      ref={ref}
      aria-labelledby="ask-title"
      className="border-border-default bg-bg-surface shadow-float sticky top-24 flex max-h-[calc(100dvh-8rem)] scroll-mt-24 flex-col gap-4 rounded-xl border p-6"
    >
      <h2 id="ask-title" className="text-heading-lg text-text-primary">
        {CHAT_COPY.dongTitle}
      </h2>
      <ChatThread
        target={{ surface: 'dong', dongId, month }}
        label={CHAT_COPY.chatLabel}
        placeholder={CHAT_COPY.chatPlaceholder}
      />
    </section>
  )
}
