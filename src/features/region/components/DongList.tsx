import DetailSection from '@/features/region/components/DetailSection'
import DongRow from '@/features/region/components/DongRow'
import { monthLabel, monthNumber } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import { metricGrade } from '@/features/metric/score'
import type { RegionDetailResponse, RegionDong } from '@/features/region/types'

type Props = {
  dongs: RegionDong[]
  excludedDongs: RegionDetailResponse['excludedDongs']
  month: MonthParam
  hrefFor: (dongId: string) => string
}

/** 행정동 N곳, 동네 조용함순 */
export default function DongList({ dongs, excludedDongs, month, hrefFor }: Props) {
  const sorted = [...dongs].sort((a, b) => b.quietScore - a.quietScore)
  const n = monthNumber(month)
  const label = monthLabel(month)
  const excludedNote = excludedDongs.length
    ? ` · ${excludedDongs.map((d) => d.name).join('·')}은 특수시설 패턴으로 제외`
    : ''
  return (
    <DetailSection title={`행정동 ${dongs.length}곳`} caption={`동네 조용함순${excludedNote}`}>
      <ul>
        {sorted.map((d) => {
          const peak =
            n !== null && d.peakMonth === n
              ? `${label}이 자체 피크`
              : `${d.peakMonth}월 피크 · ${label}은 피크의 ${d.crowdOfPeak}%`
          return (
            <DongRow
              key={d.id}
              name={d.name}
              kind={d.kind}
              subtitle={`${d.landmark} · ${peak}`}
              gradeLabel="동네 조용함"
              grade={metricGrade(d.quietScore)}
              href={hrefFor(d.id)}
            />
          )
        })}
      </ul>
    </DetailSection>
  )
}
