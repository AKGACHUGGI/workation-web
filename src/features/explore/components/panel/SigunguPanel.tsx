import { useMemo } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { buildSigunguGraph } from '@/features/explore/sigunguGraph'
import type { RelationKey } from '@/features/explore/sigunguGraph'
import type { PinDong } from '@/features/explore/types'
import RelationChips from '@/features/explore/components/panel/RelationChips'
import SelectionCard from '@/features/explore/components/panel/SelectionCard'
import SigunguGraph from '@/features/explore/components/panel/SigunguGraph'
import type { GraphPick } from '@/features/explore/components/panel/SigunguGraph'
import SourceLine from '@/features/explore/components/panel/SourceLine'
import { SIGUNGU_HEADER_H } from '@/features/explore/components/panel/panelLayout'

type Props = {
  name: string
  province: string
  pins: PinDong[]
  relsOn: ReadonlySet<RelationKey>
  onToggleRel: (key: RelationKey) => void
  pick: GraphPick | null
  onPick: (pick: GraphPick | null) => void
  hoveredDong: string | null
  onHoverDong: (dongId: string | null) => void
  onOpenDong: (dongId: string) => void
}

/** ① 패널 (Figma 432:9976). 시군구 노드는 그리지 않는다 (스펙 §3-2) */
export default function SigunguPanel({
  name,
  province,
  pins,
  relsOn,
  onToggleRel,
  pick,
  onPick,
  hoveredDong,
  onHoverDong,
  onOpenDong,
}: Props) {
  const graph = useMemo(() => buildSigunguGraph(pins, relsOn), [pins, relsOn])
  return (
    <div className="flex flex-1 flex-col gap-3.5 pt-5">
      <header className={`flex shrink-0 flex-col gap-1 ${SIGUNGU_HEADER_H}`}>
        <h2 className="text-heading-xl text-text-primary leading-6">{name}</h2>
        <p className="text-caption-xs text-text-secondary">
          {EXPLORE_COPY.sigunguSub(province, pins.length)}
        </p>
      </header>
      <RelationChips on={relsOn} onToggle={onToggleRel} />
      <SigunguGraph
        name={name}
        graph={graph}
        pick={pick}
        onPick={onPick}
        hoveredDong={hoveredDong}
        onHoverDong={onHoverDong}
      />
      {pick && <SelectionCard graph={graph} pins={pins} pick={pick} onOpenDong={onOpenDong} />}
      <SourceLine>{EXPLORE_COPY.sigunguSource}</SourceLine>
    </div>
  )
}
