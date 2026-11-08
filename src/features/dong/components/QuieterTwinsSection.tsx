import TwinCard from '@/features/dong/components/TwinCard'
import { DONG_COPY } from '@/features/dong/copy'
import type { QuieterTwin } from '@/features/dong/types'
import type { Grade } from '@/features/metric/types'

type Props = {
  twins: QuieterTwin[]
  currentId: string
  /** 대상 동 id → quiet 등급 (tier dong 응답에서) */
  gradeOf: (id: string) => Grade | null
}

/** 비슷한데 더 조용한 동네 3곳. 0개면 섹션 숨김 */
export default function QuieterTwinsSection({ twins, currentId, gradeOf }: Props) {
  if (twins.length === 0) return null
  return (
    <section aria-labelledby="twins-title" className="flex flex-col gap-4">
      <div>
        <h2 id="twins-title" className="text-heading-lg text-text-primary">
          {DONG_COPY.twinsTitle}
        </h2>
        <p className="text-caption-xs text-text-tertiary">{DONG_COPY.twinsCaption}</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {twins.map((t) => (
          <TwinCard key={t.id} twin={t} currentId={currentId} quietGrade={gradeOf(t.id)} />
        ))}
      </div>
    </section>
  )
}
