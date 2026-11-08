import TwinCard from '@/features/dong/components/TwinCard'
import { DONG_COPY } from '@/features/dong/copy'
import type { QuieterTwin } from '@/features/dong/types'
import type { Grade } from '@/features/metric/types'
import DetailSection from '@/features/region/components/DetailSection'

type Props = {
  twins: QuieterTwin[]
  currentId: string
  /** 대상 동 id → quiet 등급 (tier dong 응답에서) */
  gradeOf: (id: string) => Grade | null
}

/**
 * 비슷한데 더 조용한 동네 3곳. 0개면 섹션 숨김.
 * Figma v2(251:3681)에는 아직 없는 섹션(스펙 §3-7) — 다른 섹션과 같은 머리·간격으로 맞춘다.
 */
export default function QuieterTwinsSection({ twins, currentId, gradeOf }: Props) {
  if (twins.length === 0) return null
  return (
    <DetailSection
      title={DONG_COPY.twinsTitle}
      titleId="twins-title"
      caption={DONG_COPY.twinsCaption}
    >
      <div className="grid grid-cols-3 gap-4">
        {twins.map((t) => (
          <TwinCard key={t.id} twin={t} currentId={currentId} quietGrade={gradeOf(t.id)} />
        ))}
      </div>
    </DetailSection>
  )
}
