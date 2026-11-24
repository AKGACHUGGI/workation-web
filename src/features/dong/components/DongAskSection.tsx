import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ChatThread from '@/features/chat/components/ChatThread'
import { CHAT_COPY } from '@/features/chat/copy'
import type { MonthParam } from '@/features/metric/month'
import DetailSection from '@/features/region/components/DetailSection'

type Props = { dongId: string; month: MonthParam }

export const ASK_ID = 'ask'

/**
 * 동 상세 채팅 (시군구 채팅 스펙 §8). 브리핑 없이 대화 · 예시 · 입력. 달은 페이지 달을 보낸다
 * (보행 기준 시간대 답이 아래 24시간 곡선과 같은 달 값이 되게). 지도 패널 링크(#ask)로 오면
 * 그려진 뒤 이 섹션으로 내린다 — 페이지는 데이터가 온 뒤에 이 섹션을 그린다
 */
export default function DongAskSection({ dongId, month }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === `#${ASK_ID}`) ref.current?.scrollIntoView?.({ block: 'start' })
  }, [hash])
  return (
    <div id={ASK_ID} ref={ref} className="scroll-mt-24">
      <DetailSection title={CHAT_COPY.dongTitle} titleId="ask-title">
        <ChatThread
          target={{ surface: 'dong', dongId, month }}
          label={CHAT_COPY.chatLabel}
          placeholder={CHAT_COPY.chatPlaceholder}
        />
      </DetailSection>
    </div>
  )
}
