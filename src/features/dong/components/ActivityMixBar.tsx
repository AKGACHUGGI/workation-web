import { ACTIVITY_BG_CLASS, ACTIVITY_LABEL, sortedActivities } from '@/features/dong/activity'
import type { ActivityKey } from '@/features/dong/types'

type Props = {
  mix: Record<ActivityKey, number>
  /** W-05 열용: 막대 + 상위 2개 라벨만 */
  compact?: boolean
}

/** 활동 유형 4종 누적 막대 + 범례 (큰 순) */
export default function ActivityMixBar({ mix, compact = false }: Props) {
  const entries = sortedActivities(mix)
  const legend = compact ? entries.slice(0, 2) : entries
  return (
    <div className="flex flex-col gap-3">
      <div
        role="img"
        aria-label={entries.map((e) => `${ACTIVITY_LABEL[e.key]} ${e.value}%`).join(', ')}
        className="bg-bg-subtle flex h-3 w-full overflow-hidden rounded-full"
      >
        {entries.map((e) => (
          <div
            key={e.key}
            className={`${ACTIVITY_BG_CLASS[e.key]} h-full`}
            style={{ width: `${e.value}%` }}
          />
        ))}
      </div>
      <ul className={compact ? 'flex gap-4' : 'grid grid-cols-2 gap-x-6 gap-y-1'}>
        {legend.map((e) => (
          <li key={e.key} className="text-body-sm text-text-secondary flex items-center gap-2">
            <span
              className={`${ACTIVITY_BG_CLASS[e.key]} inline-block h-2 w-2 rounded-full`}
              aria-hidden
            />
            <span>{ACTIVITY_LABEL[e.key]}</span>
            <span className="text-text-primary font-medium">{e.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
