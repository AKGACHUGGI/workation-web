import type { KeyboardEvent, MouseEvent } from 'react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { Point } from '@/features/explore/radialLayout'
import type { GraphNode, SigunguGraphData } from '@/features/explore/sigunguGraph'
import { GRAPH_H, GRAPH_W } from '@/features/explore/components/panel/panelLayout'
import { NODE_FILL } from '@/features/explore/components/panel/relationColor'

export type GraphPick = { kind: 'dong' | 'type'; id: string }

type Props = {
  name: string
  graph: SigunguGraphData
  /** radialLayout 결과 (노드 id → 자리) */
  layout: Map<string, Point>
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

/**
 * ① 시군구 지식그래프, 방사형 (스펙 2026-11-14 §3·§5). 가운데 시군구 → 유형 → 동, 유형 없는 동은 점선.
 * 자리는 radialLayout 이 정하고 여기서는 그리기만 한다 (끌기 없음). 클릭은 그래프 안 강조만(서버 요청 없음).
 * 시군구 노드 클릭 = 빈 곳 클릭 = 선택 해제. 지도 핀 hover 는 hoveredDong 으로 받아 미리 강조
 */
export default function SigunguGraph({
  name,
  graph,
  layout,
  pick,
  onPick,
  hoveredDong,
  onHoverDong,
}: Props) {
  const focusId = hoveredDong ?? pick?.id ?? null
  const lit = litIds(graph, focusId)

  const pickOf = (n: GraphNode): GraphPick | null =>
    n.kind === 'sigungu' ? null : { kind: n.kind, id: n.id }
  const onNodeClick = (n: GraphNode) => (e: MouseEvent) => {
    e.stopPropagation()
    onPick(pickOf(n))
  }
  const onNodeKey = (n: GraphNode) => (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    onPick(pickOf(n))
  }

  return (
    <svg
      role="group"
      aria-label={EXPLORE_COPY.graphLabel(name)}
      viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
      className="h-100 w-full shrink-0 select-none"
      onClick={() => onPick(null)}
    >
      <g>
        {graph.links.map((l) => {
          const a = layout.get(l.source)
          const b = layout.get(l.target)
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
              data-dashed={l.dashed || undefined}
              strokeDasharray={l.dashed ? '3 3' : undefined}
              className={strong ? 'stroke-text-primary' : 'stroke-border-strong'}
              strokeWidth={strong ? 1.5 : 1}
              opacity={on ? 1 : DIM}
            />
          )
        })}
      </g>
      {graph.nodes.map((n) => {
        const p = layout.get(n.id)
        if (!p) return null
        const on = lit === null || lit.has(n.id)
        if (n.kind === 'sigungu') {
          return (
            <g
              key={n.id}
              data-kind="sigungu"
              transform={`translate(${p.x} ${p.y})`}
              className="cursor-pointer"
              onClick={onNodeClick(n)}
            >
              <circle r={p.r} fill={NODE_FILL.sigungu} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-text-inverse text-explore-xs font-bold"
              >
                {n.label}
              </text>
            </g>
          )
        }
        const selected = focusId === n.id
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-label={n.label}
            aria-pressed={pick?.id === n.id}
            data-kind={n.kind}
            data-dim={on ? undefined : 'true'}
            opacity={on ? 1 : DIM}
            transform={`translate(${p.x} ${p.y})`}
            className="cursor-pointer outline-none"
            onClick={onNodeClick(n)}
            onKeyDown={onNodeKey(n)}
            onPointerEnter={n.kind === 'dong' ? () => onHoverDong(n.id) : undefined}
            onPointerLeave={n.kind === 'dong' ? () => onHoverDong(null) : undefined}
          >
            {n.kind === 'dong' ? (
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
                <circle r={p.r} fill={NODE_FILL.type} />
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
