import type { ReactNode } from 'react'
import GradeBadge from '@/components/ui/GradeBadge'
import { concentrationCopy, overnightSubtitle, positionCopy } from '@/features/report/copy'
import type { ReportResponse } from '@/features/report/types'

type Props = { report: ReportResponse }

type CardProps = { title: string; badge?: ReactNode; value: number; unit: string; note: string }

/** Figma W-06 v2 251:4408. 라벨 14 Medium + (배지) / 숫자 36 Bold 잉크 + 단위 16 tertiary / 근거 12 tertiary */
function SummaryCard({ title, badge, value, unit, note }: CardProps) {
  return (
    <section className="border-border-default bg-bg-surface flex min-w-0 flex-1 flex-col gap-2 rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-body-sm text-text-secondary font-medium">{title}</h2>
        {badge}
      </div>
      {/* textContent 는 "35 %" 처럼 숫자와 단위 사이 공백 하나 (테스트·스크린리더 기준) */}
      <p className="flex items-end gap-1">
        <span className="text-number-4xl text-text-primary">{value}</span>{' '}
        <span className="text-body-base text-text-tertiary">{unit}</span>
      </p>
      <p className="text-caption-xs text-text-tertiary">{note}</p>
    </section>
  )
}

/** 성수기 집중도 · 숙박 성향 · 대상 지역 대비 위치 */
export default function SummaryCards({ report }: Props) {
  const { peakConcentration: pc, overnight, ranking, metricRanks, preset } = report
  return (
    <div className="flex items-start gap-4">
      <SummaryCard title="성수기 집중도" value={pc.value} unit="%" note={concentrationCopy(pc)} />
      <SummaryCard
        title="숙박 성향"
        badge={<GradeBadge grade={overnight.grade} />}
        value={overnight.score}
        unit="점"
        note={overnightSubtitle(overnight.coef)}
      />
      <SummaryCard
        title="대상 지역 대비 위치"
        value={ranking.rank}
        unit={`위 / ${ranking.total}`}
        note={positionCopy(preset, metricRanks)}
      />
    </div>
  )
}
