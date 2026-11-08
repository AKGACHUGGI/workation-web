import GradeBadge from '@/components/ui/GradeBadge'
import { GRADE_FG } from '@/components/ui/gradeClass'
import { concentrationCopy, overnightSubtitle, positionCopy } from '@/features/report/copy'
import type { ReportResponse } from '@/features/report/types'

type Props = { report: ReportResponse }

/** 성수기 집중도 · 숙박 성향 · 대상 지역 대비 위치 */
export default function SummaryCards({ report }: Props) {
  const { peakConcentration: pc, overnight, ranking, metricRanks, preset } = report
  const cardClass = 'border-border-default bg-bg-surface flex flex-col gap-3 rounded-xl border p-6'
  return (
    <div className="grid grid-cols-3 gap-6">
      <section className={cardClass}>
        <h2 className="text-body-sm text-text-secondary font-medium">성수기 집중도</h2>
        <p className="text-number-4xl text-text-primary">{pc.value} %</p>
        <p className="text-caption-xs text-text-tertiary">{concentrationCopy(pc)}</p>
      </section>
      <section className={cardClass}>
        <h2 className="text-body-sm text-text-secondary font-medium">숙박 성향</h2>
        <div className="flex items-center gap-2">
          <p className={`text-number-4xl ${GRADE_FG[overnight.grade]}`}>{overnight.score} 점</p>
          <GradeBadge grade={overnight.grade} />
        </div>
        <p className="text-caption-xs text-text-tertiary">{overnightSubtitle(overnight.coef)}</p>
      </section>
      <section className={cardClass}>
        <h2 className="text-body-sm text-text-secondary font-medium">대상 지역 대비 위치</h2>
        <p className="text-number-4xl text-text-primary">
          {ranking.rank} 위 / {ranking.total}
        </p>
        <p className="text-caption-xs text-text-tertiary">{positionCopy(preset, metricRanks)}</p>
      </section>
    </div>
  )
}
