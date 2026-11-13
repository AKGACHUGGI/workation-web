import { EXPLORE_COPY } from '@/features/explore/copy'
import { TYPE_DOT_BG } from '@/features/explore/components/panel/relationColor'

/** ① 범례 한 줄 (스펙 §3, v6 관계 칩 줄 자리): ● 워케이션 유형 · 🌊 바닷가 · ┊ 뚜렷한 유형 없음 */
export default function GraphLegend() {
  return (
    <div
      role="group"
      aria-label={EXPLORE_COPY.graphLegendLabel}
      className="text-caption-xs text-text-secondary flex shrink-0 flex-wrap items-center gap-3"
    >
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className={`size-2 rounded-full ${TYPE_DOT_BG}`} />
        {EXPLORE_COPY.legendType}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden>🌊</span>
        {EXPLORE_COPY.legendCoast}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="border-border-strong w-4 border-t border-dashed" />
        {EXPLORE_COPY.legendNoType}
      </span>
    </div>
  )
}
