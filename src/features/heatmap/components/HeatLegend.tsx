import { HEAT_BG, HEAT_STEPS } from '@/features/heatmap/colorScale'

/** Figma HeatLegend(7:356): heat 7단계 막대(28 × 10, 간격 2) + 낮음 0 · 점수 · 100 높음 */
export default function HeatLegend() {
  return (
    <div className="flex flex-col gap-1.5" aria-label="히트맵 범례">
      <div className="flex gap-0.5">
        {HEAT_STEPS.map((s) => (
          <span key={s} className={`h-2.5 w-7 ${HEAT_BG[s]}`} />
        ))}
      </div>
      <div className="text-caption-xs flex w-52 justify-between">
        <span className="text-text-tertiary">낮음 0</span>
        <span className="text-text-secondary font-medium">점수</span>
        <span className="text-text-tertiary">100 높음</span>
      </div>
    </div>
  )
}
