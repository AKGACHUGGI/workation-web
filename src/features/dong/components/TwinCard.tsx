import { Link } from 'react-router-dom'
import GradeBadge from '@/components/ui/GradeBadge'
import PhotoThumb from '@/components/ui/PhotoThumb'
import type { QuieterTwin } from '@/features/dong/types'
import { METRIC_LABEL } from '@/features/metric/constants'
import type { Grade } from '@/features/metric/types'
import { useCarryLink } from '@/hooks/useCarryLink'

type Props = {
  twin: QuieterTwin
  currentId: string
  /** tier dong 응답에서 대상 동의 quiet 등급. 없으면 배지 생략 */
  quietGrade: Grade | null
}

export default function TwinCard({ twin, currentId, quietGrade }: Props) {
  const to = useCarryLink(`/compare?dongs=${currentId},${twin.id}`)
  return (
    <Link
      to={to}
      className="bg-bg-surface shadow-float hover:shadow-float flex flex-col gap-3 rounded-xl p-3 transition hover:-translate-y-0.5"
    >
      <PhotoThumb photoUrl={twin.photoUrl} alt={`${twin.name} 사진`} />
      <div className="flex flex-col gap-1">
        <span className="text-title-md text-text-primary">{twin.name}</span>
        <span className="text-caption-xs text-text-tertiary">{twin.sigunguName}</span>
        <span className="text-body-sm text-text-secondary">
          유사도 {twin.similarity.toFixed(2)} · 방문객 {twin.visitorRatio.toFixed(2)}배
        </span>
        {quietGrade && (
          <span className="text-body-sm text-text-secondary flex items-center gap-1">
            {METRIC_LABEL.quiet} <GradeBadge grade={quietGrade} size="sm" />
          </span>
        )}
      </div>
    </Link>
  )
}
