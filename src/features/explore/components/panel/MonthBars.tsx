import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DongDetail } from '@/features/explore/types'

type Props = { months: DongDetail['months'] }

const TONE_CLASS = {
  quiet: 'bg-brand-primary',
  base: 'bg-chart-bar-muted',
  empty: 'border-border-default h-full border border-dashed',
} as const

/** 상세 칸 · 12개월 막대 (months.raw = 시군구 ease 원값 0~100). 한산한 3개월 강조, null 달은 빈 막대 (스펙 §3-3) */
export default function MonthBars({ months }: Props) {
  const quiet = new Set(months.quiet)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start justify-between">
        <span className="text-caption-xs text-text-primary font-bold">
          {EXPLORE_COPY.monthBarsTitle}
        </span>
        <span className="text-explore-2xs text-text-secondary">
          {EXPLORE_COPY.monthBasis(months.basis)}
        </span>
      </div>
      <div className="flex h-16 gap-1.5">
        {months.raw.map((v, i) => {
          const m = i + 1
          const tone = v === null ? 'empty' : quiet.has(m) ? 'quiet' : 'base'
          return (
            <div key={m} className="flex flex-1 flex-col items-center gap-0.75">
              <div className="flex h-12.5 w-full items-end">
                <div
                  data-month={m}
                  data-tone={tone}
                  title={v === null ? EXPLORE_COPY.noValue : `${m}월 ${Math.round(v)}`}
                  className={`w-full rounded-t-sm ${TONE_CLASS[tone]}`}
                  style={v === null ? undefined : { height: `${Math.max(2, v)}%` }}
                />
              </div>
              <span
                className={`text-explore-3xs h-2.75 whitespace-nowrap ${quiet.has(m) ? 'text-text-primary font-bold' : 'text-text-tertiary'}`}
              >
                {EXPLORE_COPY.monthUnit(m)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
