import { useRef } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { FACT_R, useForceLayout } from '@/features/explore/forceLayout'
import type { GraphNode, RelationKey, SigunguGraphData } from '@/features/explore/sigunguGraph'
import { GRAPH_H, GRAPH_W } from '@/features/explore/components/panel/panelLayout'
import { RELATION_FILL } from '@/features/explore/components/panel/relationColor'

export type GraphPick = { kind: 'dong' | 'fact'; id: string }

type Props = {
  name: string
  graph: SigunguGraphData
  pick: GraphPick | null
  onPick: (pick: GraphPick | null) => void
  hoveredDong: string | null
  onHoverDong: (dongId: string | null) => void
}

/** 강조 대상 노드 id (그 노드 + 선으로 이어진 이웃). focus 가 없으면 null = 모두 진하게 */
function litIds(graph: SigunguGraphData, focusId: string | null): Set<string> | null {
  if (!focusId) return null
  const ids = new Set([focusId])
  for (const l of graph.links) {
    if (l.source === focusId) ids.add(l.target)
    if (l.target === focusId) ids.add(l.source)
  }
  return ids
}

const DIM = 0.18
const DRAG_PX = 3

/**
 * ① 시군구 지식그래프 (Figma 434:9744, 스펙 §3-2). 동 + 켜진 관계의 사실 노드, d3-force 배치, 끌어서 옮기기.
 * 클릭은 그래프 안 강조만 한다(서버 요청 없음). 지도 핀 hover 는 hoveredDong 으로 받아 미리 강조
 */
export default function SigunguGraph({
  name,
  graph,
  pick,
  onPick,
  hoveredDong,
  onHoverDong,
}: Props) {
  const { layout, drag } = useForceLayout(graph, GRAPH_W, GRAPH_H)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef<{ id: string; x0: number; y0: number; moved: boolean } | null>(null)

  const focusId = hoveredDong ?? pick?.id ?? null
  const lit = litIds(graph, focusId)

  const toSvg = (e: PointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * GRAPH_W,
      y: ((e.clientY - rect.top) / rect.height) * GRAPH_H,
    }
  }
  const onPointerDown = (id: string) => (e: PointerEvent<SVGGElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    dragging.current = { id, x0: e.clientX, y0: e.clientY, moved: false }
  }
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = dragging.current
    if (!d) return
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < DRAG_PX) return
      d.moved = true
      drag.start(d.id)
    }
    const p = toSvg(e)
    drag.move(d.id, p.x, p.y)
  }
  const onPointerUp = () => {
    const d = dragging.current
    if (d?.moved) drag.end(d.id)
  }
  const pickOf = (n: GraphNode): GraphPick => ({
    kind: n.kind === 'dong' ? 'dong' : 'fact',
    id: n.id,
  })
  const onNodeClick = (n: GraphNode) => (e: MouseEvent) => {
    e.stopPropagation()
    const d = dragging.current
    dragging.current = null
    if (d?.moved) return
    onPick(pickOf(n))
  }
  const onNodeKey = (n: GraphNode) => (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    onPick(pickOf(n))
  }

  return (
    <svg
      ref={svgRef}
      role="group"
      aria-label={EXPLORE_COPY.graphLabel(name)}
      viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
      className="h-100 w-full shrink-0 touch-none select-none"
      onPointerMove={onPointerMove}
      onClick={() => onPick(null)}
    >
      <g>
        {graph.links.map((l) => {
          const a = layout.byId.get(l.source)
          const b = layout.byId.get(l.target)
          if (!a || !b) return null
          const on = focusId === null || l.source === focusId || l.target === focusId
          const strong = focusId !== null && on
          return (
            <line
              key={`${l.source}|${l.target}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={strong ? 'stroke-text-primary' : 'stroke-border-strong'}
              strokeWidth={strong ? 1.5 : 1}
              opacity={on ? 1 : DIM}
            />
          )
        })}
      </g>
      {graph.nodes.map((n) => {
        const p = layout.byId.get(n.id)
        if (!p) return null
        const isDong = n.kind === 'dong'
        const on = lit === null || lit.has(n.id)
        const selected = focusId === n.id
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-label={isDong ? n.label : EXPLORE_COPY.factNode(n.label)}
            aria-pressed={pick?.id === n.id}
            data-kind={isDong ? 'dong' : 'fact'}
            data-dim={on ? undefined : 'true'}
            opacity={on ? 1 : DIM}
            transform={`translate(${p.x} ${p.y})`}
            className="cursor-pointer outline-none"
            onPointerDown={onPointerDown(n.id)}
            onPointerUp={onPointerUp}
            onClick={onNodeClick(n)}
            onKeyDown={onNodeKey(n)}
            onPointerEnter={isDong ? () => onHoverDong(n.id) : undefined}
            onPointerLeave={isDong ? () => onHoverDong(null) : undefined}
          >
            {isDong ? (
              <>
                <circle
                  r={p.r}
                  className="fill-bg-surface stroke-brand-primary"
                  strokeWidth={selected ? 3.5 : 2.5}
                />
                <text
                  y={p.r + 10}
                  textAnchor="middle"
                  className={`text-explore-3xs ${selected ? 'fill-text-primary font-bold' : 'fill-text-tertiary'}`}
                >
                  {n.label}
                </text>
              </>
            ) : (
              <>
                <circle r={FACT_R} fill={RELATION_FILL[n.kind as RelationKey]} />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-text-inverse text-explore-2xs font-bold"
                >
                  {n.label}
                </text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
