import { HEAT_BG, HEAT_STEPS } from '@/features/heatmap/colorScale'

export default function HeatLegend() {
  return (
    <div className="flex items-center gap-2" aria-label="히트맵 범례">
      <span className="text-caption-xs text-text-tertiary">낮음</span>
      <div className="flex h-3 overflow-hidden rounded-sm">
        {HEAT_STEPS.map((s) => (
          <span key={s} className={`w-6 ${HEAT_BG[s]}`} />
        ))}
      </div>
      <span className="text-caption-xs text-text-tertiary">높음</span>
    </div>
  )
}
