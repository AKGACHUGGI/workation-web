import { TYPE_NAMES } from '@/features/explore/types'
import type { PinDong, TypeName } from '@/features/explore/types'

/** ① 가운데 시군구 노드 id (방사형, 2026-11-14) */
export const SIGUNGU_NODE = 'sigungu'
/** ① 유형 노드 id */
export const typeNodeId = (t: TypeName) => `type:${t}`

export type GraphNode =
  | { id: string; kind: 'sigungu'; label: string }
  | { id: string; kind: 'type'; label: TypeName }
  | { id: string; kind: 'dong'; label: string; type: TypeName | null }
/** dashed = 시군구 ─ 대표 유형 없는 동 */
export type GraphLink = { source: string; target: string; dashed: boolean }
export type SigunguGraphData = { nodes: GraphNode[]; links: GraphLink[] }

/**
 * ① 방사형 지식그래프 (스펙 2026-11-14 §3). 노드 = 시군구 1 · 유형(이어진 동이 있는 것만) · 동.
 * 선 = 시군구─유형, 유형─동, 시군구─유형 없는 동(점선). 노드 순서 = 그리는 순서 = Tab 순서(유형 → 동)
 */
export function buildSigunguGraph(name: string, pins: PinDong[]): SigunguGraphData {
  const types = TYPE_NAMES.filter((t) => pins.some((p) => p.topType === t))
  const nodes: GraphNode[] = [
    { id: SIGUNGU_NODE, kind: 'sigungu', label: name },
    ...types.map((t): GraphNode => ({ id: typeNodeId(t), kind: 'type', label: t })),
    ...pins.map((p): GraphNode => ({
      id: p.id,
      kind: 'dong',
      label: p.name,
      type: p.topType,
    })),
  ]
  const links: GraphLink[] = [
    ...types.map((t) => ({ source: SIGUNGU_NODE, target: typeNodeId(t), dashed: false })),
    ...pins.map((p) =>
      p.topType
        ? { source: typeNodeId(p.topType), target: p.id, dashed: false }
        : { source: SIGUNGU_NODE, target: p.id, dashed: true },
    ),
  ]
  return { nodes, links }
}

/** 선택 카드 사실 칩과 공통 비교에 쓰는 핀 사실 (스펙 §5): 대표 유형 · 바닷가 · 생활권/관광지 · 조용함 · 저녁 활기 */
export function pinFacts(pin: PinDong): string[] {
  return [
    pin.topType,
    pin.coastal ? '바닷가' : null,
    pin.life,
    pin.grades.quiet && `조용함 ${pin.grades.quiet}`,
    pin.grades.evening && `저녁 활기 ${pin.grades.evening}`,
  ].filter((f): f is string => Boolean(f))
}

/**
 * 선택 카드의 `공통 n: …` (스펙 §5). 그 동과 핀 사실이 많이 겹치는 동 순, 같으면 이름 순, 0개 제외.
 * common 은 겹치는 사실 (pinFacts 순)
 */
export function sharedFacts(
  pins: PinDong[],
  dongId: string,
): { dongId: string; name: string; common: string[] }[] {
  const me = pins.find((p) => p.id === dongId)
  if (!me) return []
  const mine = pinFacts(me)
  return pins
    .filter((p) => p.id !== dongId)
    .map((p) => {
      const theirs = new Set(pinFacts(p))
      return { dongId: p.id, name: p.name, common: mine.filter((f) => theirs.has(f)) }
    })
    .filter((s) => s.common.length > 0)
    .sort((a, b) => b.common.length - a.common.length || a.name.localeCompare(b.name, 'ko'))
}

/** 유형 노드 클릭 → 그 유형이 대표인 동 (핀 순서) */
export function typeDongs(pins: PinDong[], type: TypeName): PinDong[] {
  return pins.filter((p) => p.topType === type)
}
