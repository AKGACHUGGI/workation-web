import { Link, useLocation } from 'react-router-dom'
import { rankingCaption } from '@/features/report/copy'
import type { ReportPreset, ReportRankingItem } from '@/features/report/types'
import { carryQuery } from '@/hooks/carryQuery'

type Props = {
  items: ReportRankingItem[]
  currentId: string
  preset: ReportPreset
}

/** 대상 지역 대비 위치 순위표. 현재 시군구 행은 selected 배경 + brand 막대 */
export default function RankingTable({ items, currentId, preset }: Props) {
  const { search } = useLocation()
  const current = new URLSearchParams(search)
  return (
    <section className="border-border-default bg-bg-surface rounded-xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">대상 지역 대비 위치</h2>
        <span className="text-caption-xs text-text-tertiary">{rankingCaption(preset)}</span>
      </div>
      <table className="mt-4 w-full border-collapse">
        <tbody>
          {items.map((item, i) => {
            const isCurrent = item.id === currentId
            const rowTone = isCurrent
              ? 'bg-selected-bg text-selected-fg'
              : 'text-text-primary hover:bg-bg-subtle'
            const barTone = isCurrent ? 'bg-brand-primary' : 'bg-chart-bar-muted'
            return (
              <tr
                key={item.id}
                aria-current={isCurrent || undefined}
                className={`rounded-lg ${rowTone}`}
              >
                <td className="text-body-sm w-8 py-2 pl-3 font-medium">{i + 1}</td>
                <td className="text-body-sm w-24 py-2">
                  <Link to={carryQuery(`/reports/${item.id}`, current)} className="hover:underline">
                    {item.name}
                  </Link>
                </td>
                <td className="py-2 pr-3">
                  <div className="bg-bg-surface-strong h-2 w-full overflow-hidden rounded-full">
                    <div
                      data-testid={`bar-${item.id}`}
                      className={`h-full rounded-full ${barTone}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </td>
                <td className="text-body-sm w-10 py-2 pr-3 text-right font-medium">{item.score}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
