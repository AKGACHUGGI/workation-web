import { hashString } from '@/features/explore/hash'
import type { PinDong, TypeName } from '@/features/explore/types'

export type RelationKey = 'type' | 'coast' | 'life' | 'quiet' | 'evening'

/** ① 가운데 시군구 노드 id (방사형, 2026-11-14) */
export const SIGUNGU_NODE = 'sigungu'
/** ① 유형 노드 id */
export const typeNodeId = (t: TypeName) => `type:${t}`

/**
 * ① 관계 (스펙 §3-2 표). 순서 = 칩 줄 순서 = 사실 노드 순서. 이름은 사실 노드에 맞춘다.
 * toggle = 켜기·끄기 칩 (기본 꺼짐). 나머지는 항상 켜 두고 칩 줄 앞에 색 점과 이름만 보인다
 */
export const RELATIONS: { key: RelationKey; label: string; toggle: boolean }[] = [
  { key: 'type', label: '워케이션 유형', toggle: false },
  { key: 'coast', label: '바닷가', toggle: false },
  { key: 'life', label: '생활권/관광지', toggle: false },
  { key: 'quiet', label: '조용함 등급', toggle: true },
  { key: 'evening', label: '저녁 활기 등급', toggle: true },
]

export const DEFAULT_RELATIONS: ReadonlySet<RelationKey> = new Set(
  RELATIONS.filter((r) => !r.toggle).map((r) => r.key),
)

export type GraphNode = { id: string; kind: 'dong' | RelationKey; label: string; score?: number }
export type GraphLink = { source: string; target: string; rel: RelationKey }
export type SigunguGraphData = { nodes: GraphNode[]; links: GraphLink[] }

type Fact = { id: string; kind: RelationKey; label: string }

/** 핀 하나가 가진 사실 노드 (켜진 관계만) */
function factsOf(pin: PinDong, relsOn: ReadonlySet<RelationKey>): Fact[] {
  const facts: Fact[] = []
  if (relsOn.has('type') && pin.topType)
    facts.push({ id: `type:${pin.topType}`, kind: 'type', label: pin.topType })
  if (relsOn.has('coast') && pin.coastal)
    facts.push({ id: 'coast', kind: 'coast', label: '바닷가' })
  if (relsOn.has('life') && pin.life)
    facts.push({ id: `life:${pin.life}`, kind: 'life', label: pin.life })
  if (relsOn.has('quiet') && pin.grades.quiet)
    facts.push({
      id: `quiet:${pin.grades.quiet}`,
      kind: 'quiet',
      label: `조용함 ${pin.grades.quiet}`,
    })
  if (relsOn.has('evening') && pin.grades.evening)
    facts.push({
      id: `evening:${pin.grades.evening}`,
      kind: 'evening',
      label: `저녁 활기 ${pin.grades.evening}`,
    })
  return facts
}

const relOrder = (k: RelationKey) => RELATIONS.findIndex((r) => r.key === k)

/**
 * ① 시군구 지식그래프 (스펙 §7). 동 노드 + 켜진 관계의 사실 노드(이어진 동이 있는 것만)와 선.
 * 시군구 노드는 만들지 않는다 (모든 동이 같은 시군구라 정보가 없음)
 */
export function buildSigunguGraph(
  pins: PinDong[],
  relsOn: ReadonlySet<RelationKey>,
): SigunguGraphData {
  const dongNodes: GraphNode[] = pins.map((p) =>
    p.topScore === null
      ? { id: p.id, kind: 'dong', label: p.name }
      : { id: p.id, kind: 'dong', label: p.name, score: p.topScore },
  )
  const facts = new Map<string, Fact>()
  const links: GraphLink[] = []
  for (const p of pins) {
    for (const f of factsOf(p, relsOn)) {
      facts.set(f.id, f)
      links.push({ source: p.id, target: f.id, rel: f.kind })
    }
  }
  const factNodes: GraphNode[] = [...facts.values()]
    .sort((a, b) => relOrder(a.kind) - relOrder(b.kind) || a.label.localeCompare(b.label, 'ko'))
    .map((f) => ({ id: f.id, kind: f.kind, label: f.label }))
  return { nodes: [...dongNodes, ...factNodes], links }
}

/**
 * 선택 카드의 `공통 n: …` (스펙 §3-2). 그 동과 공통 사실이 많은 동 순, 같으면 이름 순, 0개 제외.
 * common 은 공통 사실 라벨 (그래프의 사실 노드 순)
 */
export function sharedFacts(
  graph: SigunguGraphData,
  dongId: string,
): { dongId: string; name: string; common: string[] }[] {
  const factsBy = new Map<string, Set<string>>()
  for (const l of graph.links) {
    const set = factsBy.get(l.source) ?? new Set<string>()
    set.add(l.target)
    factsBy.set(l.source, set)
  }
  const mine = factsBy.get(dongId) ?? new Set<string>()
  const factOrder = graph.nodes.filter((n) => n.kind !== 'dong')
  return graph.nodes
    .filter((n) => n.kind === 'dong' && n.id !== dongId)
    .map((n) => {
      const theirs = factsBy.get(n.id) ?? new Set<string>()
      const common = factOrder.filter((f) => mine.has(f.id) && theirs.has(f.id)).map((f) => f.label)
      return { dongId: n.id, name: n.label, common }
    })
    .filter((s) => s.common.length > 0)
    .sort((a, b) => b.common.length - a.common.length || a.name.localeCompare(b.name, 'ko'))
}

/** 사실 노드 클릭 → 그 사실을 가진 동 id (동 노드 순) */
export function factDongs(graph: SigunguGraphData, factId: string): string[] {
  const linked = new Set(graph.links.filter((l) => l.target === factId).map((l) => l.source))
  return graph.nodes.filter((n) => n.kind === 'dong' && linked.has(n.id)).map((n) => n.id)
}

/** d3-force 처음 위치. id 해시로 고정해 같은 데이터면 같은 모양으로 열린다 (스펙 §7) */
export function seedPosition(id: string, w: number, h: number): { x: number; y: number } {
  return {
    x: ((hashString(id) % 10000) / 10000) * w,
    y: ((hashString(`${id}:y`) % 10000) / 10000) * h,
  }
}
