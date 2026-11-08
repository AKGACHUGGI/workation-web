import { Link } from 'react-router-dom'
import { HEAT_BG } from '@/features/heatmap/colorScale'
import type { HeatEntry } from '@/features/heatmap/useHeatEntries'

type Props = {
  entries: HeatEntry[]
  hoverId: string | null
  onHover: (id: string | null) => void
  /** 있으면 링크 대신 버튼: 행정동 범위에서 시군구를 고르는 단계 (RegionHeatmap pickMode 와 같은 흐름) */
  onPick?: (id: string) => void
}

/** 지도 키가 없을 때: 단위별 색칠 칩 목록 */
export default function HeatmapPlaceholderList({ entries, hoverId, onHover, onPick }: Props) {
  return (
    <ul className="flex flex-wrap gap-2">
      {entries.map((e) => {
        const className = `text-caption-segment inline-flex h-7 items-center rounded-full px-3 ${
          onPick || e.dimmed
            ? 'bg-bg-surface-strong text-text-tertiary'
            : `${HEAT_BG[e.step]} text-text-primary`
        } ${hoverId === e.id ? 'ring-text-primary ring-2' : ''}`
        const hover = { onMouseEnter: () => onHover(e.id), onMouseLeave: () => onHover(null) }
        return (
          <li key={e.id}>
            {onPick ? (
              <button
                type="button"
                onClick={() => onPick(e.id)}
                {...hover}
                className={`cursor-pointer ${className}`}
              >
                {e.name} {e.score}
              </button>
            ) : (
              <Link
                to={e.href}
                title={`${e.name} · ${e.score}점 · ${e.grade}`}
                {...hover}
                className={className}
              >
                {e.name} {e.score}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
