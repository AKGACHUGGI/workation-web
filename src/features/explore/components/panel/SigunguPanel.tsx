import { useMemo } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { radialLayout } from '@/features/explore/radialLayout'
import { buildSigunguGraph } from '@/features/explore/sigunguGraph'
import type { PinDong } from '@/features/explore/types'
import SelectionCard from '@/features/explore/components/panel/SelectionCard'
import SigunguGraph from '@/features/explore/components/panel/SigunguGraph'
import type { GraphPick } from '@/features/explore/components/panel/SigunguGraph'
import SourceLine from '@/features/explore/components/panel/SourceLine'
import { GRAPH_H, GRAPH_W, SIGUNGU_HEADER_H } from '@/features/explore/components/panel/panelLayout'

type Props = {
  name: string
  province: string
  pins: PinDong[]
  pick: GraphPick | null
  onPick: (pick: GraphPick | null) => void
  hoveredDong: string | null
  onHoverDong: (dongId: string | null) => void
  onOpenDong: (dongId: string) => void
}

/** ① 패널 (Figma 432:9976, 스펙 2026-11-14 §3). 헤더 · 방사형 그래프 · 카드 · 출처 */
export default function SigunguPanel({
  name,
  province,
  pins,
  pick,
  onPick,
  hoveredDong,
  onHoverDong,
  onOpenDong,
}: Props) {
  const graph = useMemo(() => buildSigunguGraph(name, pins), [name, pins])
  const layout = useMemo(() => radialLayout(pins, { w: GRAPH_W, h: GRAPH_H }), [pins])
  return (
    <div className="flex flex-1 flex-col gap-3.5 pt-5">
      <header className={`flex shrink-0 flex-col gap-1 ${SIGUNGU_HEADER_H}`}>
        <h2 className="text-heading-xl text-text-primary leading-6">{name}</h2>
        <p className="text-caption-xs text-text-secondary">
          {EXPLORE_COPY.sigunguSub(province, pins.length)}
        </p>
      </header>
      <SigunguGraph
        name={name}
        graph={graph}
        layout={layout}
        pick={pick}
        onPick={onPick}
        hoveredDong={hoveredDong}
        onHoverDong={onHoverDong}
      />
      {pick && <SelectionCard pins={pins} pick={pick} onOpenDong={onOpenDong} />}
      <SourceLine>{EXPLORE_COPY.sigunguSource}</SourceLine>
    </div>
  )
}
