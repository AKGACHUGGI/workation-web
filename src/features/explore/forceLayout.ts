import { useEffect, useMemo, useReducer } from 'react'
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force'
import type { Simulation, SimulationLinkDatum, SimulationNodeDatum } from 'd3-force'
import { seedPosition } from '@/features/explore/sigunguGraph'
import type { GraphNode, SigunguGraphData } from '@/features/explore/sigunguGraph'

/** 사실 노드 반지름 (Figma 434:9801 등 52×52) */
export const FACT_R = 26
/** 동 노드 아래 이름 칸 */
const LABEL_SPACE = 14
const TICKS = 300

/** 동 노드 반지름. 점수 비례 크기는 뜻이 잘 안 읽혀 모두 같게 둔다 (2026-11-13 사용자 결정) */
export const DONG_R = 9

/** 동: 고정 DONG_R. 사실: 고정 FACT_R */
export function nodeRadius(n: GraphNode): number {
  return n.kind === 'dong' ? DONG_R : FACT_R
}

export type LayoutNode = SimulationNodeDatum & { id: string; r: number; x: number; y: number }
export type Layout = {
  nodes: LayoutNode[]
  byId: Map<string, LayoutNode>
  sim: Simulation<LayoutNode, SimulationLinkDatum<LayoutNode>>
}

function clamp(nodes: LayoutNode[], w: number, h: number) {
  for (const n of nodes) {
    n.x = Math.min(w - n.r, Math.max(n.r, n.x))
    n.y = Math.min(h - n.r - LABEL_SPACE, Math.max(n.r, n.y))
  }
}

/**
 * 스펙 §7 힘 값: manyBody −260, link 80, collide 반지름+14, 가운데로 약하게(0.15 — 0.06 은 강릉 28노드 중 9개가 가장자리에 붙었다).
 * 처음 위치는 seedPosition(id) 이라 같은 데이터면 같은 모양. 300틱을 미리 돌려 열자마자 자리 잡힌 그림을 보여 준다
 */
export function createLayout(graph: SigunguGraphData, w: number, h: number): Layout {
  const nodes: LayoutNode[] = graph.nodes.map((n) => ({
    id: n.id,
    r: nodeRadius(n),
    ...seedPosition(n.id, w, h),
  }))
  // d3 가 링크 객체의 source/target 을 노드로 바꾸므로 복사본을 넘긴다
  const links: SimulationLinkDatum<LayoutNode>[] = graph.links.map((l) => ({
    source: l.source,
    target: l.target,
  }))
  const sim = forceSimulation(nodes)
    .force('charge', forceManyBody<LayoutNode>().strength(-260))
    .force(
      'link',
      forceLink<LayoutNode, SimulationLinkDatum<LayoutNode>>(links)
        .id((d) => d.id)
        .distance(80),
    )
    .force(
      'collide',
      forceCollide<LayoutNode>().radius((d) => d.r + 14),
    )
    .force('x', forceX<LayoutNode>(w / 2).strength(0.15))
    .force('y', forceY<LayoutNode>(h / 2).strength(0.15))
    .stop()
  for (let i = 0; i < TICKS; i++) {
    sim.tick()
    clamp(nodes, w, h)
  }
  return { nodes, byId: new Map(nodes.map((n) => [n.id, n])), sim }
}

/** 배치 + 끌기. 끄는 동안만 시뮬레이션을 다시 돌려 이웃이 따라오게 한다 */
export function useForceLayout(graph: SigunguGraphData, w: number, h: number) {
  const layout = useMemo(() => createLayout(graph, w, h), [graph, w, h])
  const [, redraw] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    layout.sim.on('tick', () => {
      clamp(layout.nodes, w, h)
      redraw()
    })
    return () => {
      layout.sim.on('tick', null).stop()
    }
  }, [layout, w, h])

  const drag = useMemo(
    () => ({
      start(id: string) {
        const n = layout.byId.get(id)
        if (!n) return
        n.fx = n.x
        n.fy = n.y
        layout.sim.alphaTarget(0.3).restart()
      },
      move(id: string, x: number, y: number) {
        const n = layout.byId.get(id)
        if (!n) return
        n.fx = x
        n.fy = y
      },
      end(id: string) {
        const n = layout.byId.get(id)
        if (!n) return
        n.fx = null
        n.fy = null
        layout.sim.alphaTarget(0)
      },
    }),
    [layout],
  )
  return { layout, drag }
}
