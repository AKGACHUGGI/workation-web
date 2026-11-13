import type { ReactNode } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DayGroup, DongDetail } from '@/features/explore/types'

type Props = {
  hourly: DongDetail['hourly']
  day: DayGroup
  lead?: ReactNode
  /** 제목 줄 오른쪽 (DetailSlot 의 평일·주말 토글) */
  action?: ReactNode
}

const LABEL_HOURS = new Set([0, 6, 12, 18, 23])
const TONE_CLASS = {
  quiet: 'bg-brand-primary',
  peak: 'bg-text-secondary',
  base: 'bg-chart-bar-muted',
  empty: 'bg-bg-surface-strong h-full',
} as const

/** 상세 칸 · 24시간 차량 막대 (Figma 436:10556). 높이는 그 요일 최대값 기준 */
export default function HourBars({ hourly, day, lead, action }: Props) {
  const { driv, peakHour, quietHour } = hourly[day]
  const max = Math.max(1, ...driv.map((v) => v ?? 0))
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-caption-xs text-text-primary font-bold">
          {lead}
          {EXPLORE_COPY.hourBarsTitle}
        </span>
        {action}
      </div>
      {/* 평일·주말을 바꾸면 막대만 다시 그려 150ms 페이드 (토글은 그대로 둬 포커스 유지) */}
      <div key={day} className="animate-explore-fade flex h-16 gap-0.75">
        {driv.map((v, h) => {
          const tone =
            v === null ? 'empty' : h === quietHour ? 'quiet' : h === peakHour ? 'peak' : 'base'
          const showLabel = LABEL_HOURS.has(h) || h === quietHour
          return (
            <div key={h} className="flex flex-1 flex-col items-center gap-0.75">
              <div className="flex h-12.5 w-full items-end">
                <div
                  data-hour={h}
                  data-tone={tone}
                  title={
                    v === null ? EXPLORE_COPY.noValue : `${h}시 ${v.toLocaleString('ko-KR')}명`
                  }
                  className={`w-full rounded-t-sm ${TONE_CLASS[tone]}`}
                  style={v === null ? undefined : { height: `${Math.max(2, (v / max) * 100)}%` }}
                />
              </div>
              <span
                className={`text-explore-3xs h-2.75 whitespace-nowrap ${h === quietHour ? 'text-text-primary font-bold' : 'text-text-tertiary'}`}
              >
                {showLabel ? EXPLORE_COPY.hourUnit(h) : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
