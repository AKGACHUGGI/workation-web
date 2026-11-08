import { Link } from 'react-router-dom'
import { HEAT_BG } from '@/features/heatmap/colorScale'
import type { HeatStep } from '@/features/heatmap/colorScale'
import HeatmapPlaceholderList from '@/features/heatmap/components/HeatmapPlaceholderList'
import { SCHEMATIC_LABELS, SCHEMATIC_POS } from '@/features/heatmap/schematic'
import type { HeatEntry } from '@/features/heatmap/useHeatEntries'

type Props = {
  entries: HeatEntry[]
  hoverId: string | null
  onHover: (id: string | null) => void
  /** 행정동 범위에서 시군구를 고르는 단계면 링크 대신 버튼 */
  onPick?: (id: string) => void
  pending: boolean
}

/** heat 500 이상은 진한 바탕이라 흰 글자 (Figma blob) */
const DARK: HeatStep[] = [500, 600, 700]

/**
 * Figma MapArea(274:4835): 회색 바탕 위에 시군구 blob(이름 Bold + 점수)을 지도 모양으로 배치하고 시도 라벨을 단다.
 * 좌표가 없는 단위(행정동)는 같은 바탕 안에 칩 목록으로 보여준다.
 */
export default function HeatmapSchematic({ entries, hoverId, onHover, onPick, pending }: Props) {
  const placed = entries.every((e) => SCHEMATIC_POS[e.id])
  return (
    <div className="bg-bg-subtle text-caption-xs relative h-140 w-full overflow-hidden rounded-xl">
      {pending ? (
        <p className="text-text-tertiary p-4">불러오는 중…</p>
      ) : !placed ? (
        <div className="p-4">
          <HeatmapPlaceholderList
            entries={entries}
            hoverId={hoverId}
            onHover={onHover}
            onPick={onPick}
          />
        </div>
      ) : (
        <>
          {SCHEMATIC_LABELS.map((l) => (
            <span
              key={l.name}
              className="text-text-tertiary absolute"
              style={{ left: l.x, top: l.y }}
            >
              {l.name}
            </span>
          ))}
          {entries.map((e) => {
            const pos = SCHEMATIC_POS[e.id]
            const dark = !onPick && !e.dimmed && DARK.includes(e.step)
            const tone =
              onPick || e.dimmed
                ? 'bg-bg-surface-strong text-text-tertiary'
                : `${HEAT_BG[e.step]} ${dark ? 'text-text-inverse' : 'text-text-primary'}`
            const className = `absolute inline-flex items-center gap-1 rounded-full px-3 py-1.5 whitespace-nowrap ${tone} ${
              hoverId === e.id ? 'ring-text-primary ring-2' : ''
            }`
            const body = (
              <>
                <span className="font-bold">{e.name}</span>{' '}
                <span className={dark ? '' : 'text-text-secondary'}>{e.score}</span>
              </>
            )
            const common = {
              style: { left: pos.x, top: pos.y },
              onMouseEnter: () => onHover(e.id),
              onMouseLeave: () => onHover(null),
            }
            return onPick ? (
              <button
                key={e.id}
                type="button"
                onClick={() => onPick(e.id)}
                className={`cursor-pointer ${className}`}
                {...common}
              >
                {body}
              </button>
            ) : (
              <Link
                key={e.id}
                to={e.href}
                title={`${e.name} · ${e.score}점 · ${e.grade}`}
                className={className}
                {...common}
              >
                {body}
              </Link>
            )
          })}
        </>
      )}
    </div>
  )
}
