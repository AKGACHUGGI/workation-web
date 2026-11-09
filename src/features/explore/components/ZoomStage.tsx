import { EXPLORE_COPY } from '@/features/explore/copy'
import { ZOOM_STAGES } from '@/features/explore/view'
import type { ZoomStageKey } from '@/features/explore/view'

type Props = { stage: ZoomStageKey; onPick: (stage: ZoomStageKey) => void }

/** 확대 단계 [도 ~8 | 시군구 9~10 | 행정동 11~13 | 장소 14+] */
export default function ZoomStage({ stage, onPick }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-caption-xs text-text-secondary">{EXPLORE_COPY.zoomStageLabel}</span>
      <div className="bg-bg-subtle inline-flex gap-1 rounded-full p-1">
        {ZOOM_STAGES.map((s) => {
          const on = s.key === stage
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(s.key)}
              className={`text-caption-segment inline-flex items-center gap-1 rounded-full px-3 py-1 ${on ? 'bg-selected-bg text-selected-fg' : 'text-text-secondary'}`}
            >
              {s.label} <span className="opacity-dim">{s.range}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
