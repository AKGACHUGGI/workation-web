import { ArrowLeft } from 'lucide-react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DongDetail } from '@/features/explore/types'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'

type Props = { dong: DongDetail; onBack: () => void }

/** ② 헤더 (Figma 436:10454). 바닷가 칩은 coastKm ≤ 1 일 때만 (스펙 §3-3) */
export default function PanelHeader({ dong, onBack }: Props) {
  const coastal = dong.coastKm !== null && dong.coastKm <= 1
  return (
    <header
      data-section="header"
      className={`flex shrink-0 flex-col items-start gap-1 ${DONG_SECTION_H.header}`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={EXPLORE_COPY.backToGraph(dong.sigungu.name)}
          title={EXPLORE_COPY.backToGraph(dong.sigungu.name)}
          className="text-text-brand hover:bg-bg-subtle -ml-2 inline-flex size-8 shrink-0 items-center justify-center rounded-full"
        >
          <ArrowLeft size={18} aria-hidden />
        </button>
        <h2 className="text-heading-xl text-text-primary leading-6">{dong.name}</h2>
        {coastal && (
          <span className="bg-explore-coast-bg text-explore-fact-coast text-explore-xs rounded-full px-2 py-0.5 font-medium">
            {EXPLORE_COPY.coastChip(dong.coastKm!)}
          </span>
        )}
      </div>
      <p className="text-caption-xs text-text-secondary">
        {EXPLORE_COPY.dongSub(dong.sido, dong.sigungu.name)}
      </p>
    </header>
  )
}
