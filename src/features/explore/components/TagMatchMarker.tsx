import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { GROUP_META } from '@/features/explore/copy'
import type { GraphIndex } from '@/features/explore/indexGraph'
import { markerTooltip } from '@/features/explore/match'
import type { DongMatch } from '@/features/explore/match'
import type { ExploreDong } from '@/features/explore/types'

type Props = {
  index: GraphIndex
  dong: ExploreDong
  match: DongMatch
  onOpenDong: (dongId: string) => void
}

/** ① 해당 동 표시 (Figma Explore/TagMatchMarker). 모두 가짐 = 검정, 일부 = 흰색. hover 툴팁 */
export default function TagMatchMarker({ index, dong, match, onOpenDong }: Props) {
  if (!dong.center) return null
  const tip = markerTooltip(index, dong, match.matched)
  return (
    <AdvancedMarker
      position={dong.center}
      onClick={() => onOpenDong(dong.id)}
      zIndex={match.all ? 2 : 1}
    >
      <span
        data-match={match.all ? 'all' : 'partial'}
        className={`group shadow-float relative inline-flex cursor-pointer items-center gap-1 rounded-full py-1 pr-2.5 pl-1.5 ${match.all ? 'bg-selected-bg text-selected-fg' : 'bg-bg-surface text-text-primary'}`}
      >
        <span className="flex -space-x-1">
          {match.matched.map((id) => {
            const tag = index.tagById.get(id)
            if (!tag) return null
            return (
              <span
                key={id}
                data-dot
                aria-hidden
                className="border-bg-surface size-3 rounded-full border"
                style={{ background: GROUP_META[tag.group].color }}
              />
            )
          })}
        </span>
        <span className="text-caption-xs font-bold">{dong.name}</span>
        <span
          role="tooltip"
          className="bg-bg-inverse text-text-inverse text-caption-xs pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-max -translate-x-1/2 flex-col rounded-md px-3 py-2 group-hover:flex"
        >
          <span className="font-bold">{tip.title}</span>
          <span className="opacity-dim">{tip.hint}</span>
        </span>
      </span>
    </AdvancedMarker>
  )
}
