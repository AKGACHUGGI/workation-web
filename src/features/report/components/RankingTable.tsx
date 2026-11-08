import { Link, useLocation } from 'react-router-dom'
import { rankingCaption } from '@/features/report/copy'
import type { ReportPreset, ReportRankingItem } from '@/features/report/types'
import { carryQuery } from '@/hooks/carryQuery'

type Props = {
  items: ReportRankingItem[]
  currentId: string
  preset: ReportPreset
}

/**
 * 대상 지역 대비 위치 순위표 (Figma W-06 v2 251:4504).
 * 행: 순위 12 tertiary · 이름 14 Medium · 막대(bg-subtle 트랙) · 점수 12 secondary.
 * 현재 시군구 행은 brand-soft 배경 + brand 이름·막대. 행 간격을 flex 로 주려고 table 대신 ARIA table 역할을 쓴다.
 */
export default function RankingTable({ items, currentId, preset }: Props) {
  const { search } = useLocation()
  const current = new URLSearchParams(search)
  return (
    <section className="border-border-default bg-bg-surface flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">대상 지역 대비 위치</h2>
        <span className="text-caption-xs text-text-tertiary">{rankingCaption(preset)}</span>
      </div>
      <div role="table" aria-label="대상 지역 대비 위치" className="flex flex-col gap-2">
        {items.map((item, i) => {
          const isCurrent = item.id === currentId
          return (
            <div
              key={item.id}
              role="row"
              aria-current={isCurrent || undefined}
              className={`flex items-center gap-2.5 ${isCurrent ? 'bg-brand-soft rounded-md px-2 py-1' : ''}`}
            >
              <span
                role="cell"
                className={`text-caption-segment w-5 shrink-0 text-right ${isCurrent ? 'text-text-primary' : 'text-text-tertiary'}`}
              >
                {i + 1}
              </span>
              <span role="cell" className="w-26 shrink-0">
                <Link
                  to={carryQuery(`/reports/${item.id}`, current)}
                  className={`text-body-sm font-medium hover:underline ${isCurrent ? 'text-text-brand' : 'text-text-primary'}`}
                >
                  {item.name}
                </Link>
              </span>
              <span role="cell" className="min-w-0 flex-1">
                <span className="bg-bg-subtle block h-2.5 w-full overflow-hidden rounded-sm">
                  <span
                    data-testid={`bar-${item.id}`}
                    className={`block h-full rounded-sm ${isCurrent ? 'bg-brand-primary' : 'bg-chart-bar-muted'}`}
                    style={{ width: `${item.score}%` }}
                  />
                </span>
              </span>
              <span
                role="cell"
                className={`text-caption-segment w-7 shrink-0 text-right ${isCurrent ? 'text-text-primary' : 'text-text-secondary'}`}
              >
                {item.score}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
