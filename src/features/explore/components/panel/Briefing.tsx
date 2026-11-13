import type { ReactNode } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'

type Props = { sentences: string[]; children?: ReactNode }

/**
 * ② 이 동네에서 일하는 하루 (Figma 436:10587). 백엔드 3문장을 그대로 한 문단으로. 근거 칩·F 번호 없음 (스펙 §11).
 * children = 물어보기 대화·칩·입력 (AskThread). 칸은 최소 높이에서 내용만큼 늘어난다. 간격 10 (Figma AskCard 444:9920)
 */
export default function Briefing({ sentences, children }: Props) {
  return (
    <section
      aria-labelledby="explore-briefing"
      data-section="briefing"
      className={`bg-bg-subtle flex shrink-0 flex-col gap-2.5 rounded-xl px-3.5 py-3 ${DONG_SECTION_H.briefing}`}
    >
      <h3 id="explore-briefing" className="text-explore-sm text-text-primary font-bold">
        {EXPLORE_COPY.briefingTitle}
      </h3>
      {sentences.length > 0 ? (
        <p className="text-caption-xs text-text-primary leading-normal">{sentences.join(' ')}</p>
      ) : (
        <p className="text-caption-xs text-text-secondary">{EXPLORE_COPY.briefingEmpty}</p>
      )}
      {children}
    </section>
  )
}
