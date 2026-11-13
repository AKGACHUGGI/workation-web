import { EXPLORE_COPY } from '@/features/explore/copy'
import { factDongs, sharedFacts } from '@/features/explore/sigunguGraph'
import type { GraphNode, RelationKey, SigunguGraphData } from '@/features/explore/sigunguGraph'
import type { PinDong } from '@/features/explore/types'
import type { GraphPick } from '@/features/explore/components/panel/SigunguGraph'
import { RELATION_BG } from '@/features/explore/components/panel/relationColor'

type Props = {
  graph: SigunguGraphData
  pins: PinDong[]
  pick: GraphPick
  onOpenDong: (dongId: string) => void
}

const COMMON_MAX = 3
const CARD =
  'border-border-default bg-bg-surface flex shrink-0 flex-col gap-2 rounded-xl border p-3.5'

/** 이 노드와 선으로 이어진 노드 (링크 방향과 관계없이) */
function neighbors(graph: SigunguGraphData, id: string): GraphNode[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  return graph.links.flatMap((l) => {
    const other = l.source === id ? l.target : l.target === id ? l.source : null
    const node = other ? byId.get(other) : undefined
    return node ? [node] : []
  })
}

/** ① 선택 카드 (Figma 434:9855). 동: 이어진 사실 + 공통 사실 많은 동 최대 3 + [동네 자세히 보기]. 사실: 이어진 동 목록 (스펙 §3-2) */
export default function SelectionCard({ graph, pins, pick, onOpenDong }: Props) {
  const node = graph.nodes.find((n) => n.id === pick.id)
  if (!node) return null

  if (pick.kind === 'fact') {
    const ids = new Set(factDongs(graph, pick.id))
    const names = pins.filter((p) => ids.has(p.id)).map((p) => p.name)
    return (
      <section aria-label={node.label} className={CARD}>
        <h3 className="text-title-md text-text-primary font-bold">
          {EXPLORE_COPY.cardFactTitle(node.label, names.length)}
        </h3>
        <p className="text-caption-xs text-text-secondary">{names.join(' · ')}</p>
      </section>
    )
  }

  const pin = pins.find((p) => p.id === pick.id)
  const facts = neighbors(graph, pick.id)
  const common = sharedFacts(graph, pick.id).slice(0, COMMON_MAX)
  return (
    <section aria-label={node.label} className={CARD}>
      <div className="flex items-baseline gap-2">
        <h3 className="text-title-md text-text-primary font-bold">{node.label}</h3>
        {pin?.topType && pin.topScore !== null && (
          <span className="text-caption-xs text-text-secondary">{`${pin.topType} ${pin.topScore}`}</span>
        )}
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {facts.map((f) => (
          <li
            key={f.id}
            className="bg-bg-subtle text-explore-xs text-text-primary inline-flex items-center gap-1.25 rounded-full px-2 py-0.75 font-medium"
          >
            <span
              aria-hidden
              className={`size-2 rounded-full ${RELATION_BG[f.kind as RelationKey]}`}
            />
            {f.label}
          </li>
        ))}
      </ul>
      {common.length > 0 && (
        <p className="text-caption-xs flex gap-1.5">
          <span className="text-text-primary font-bold">
            {EXPLORE_COPY.cardCommon(common[0].common.length)}
          </span>
          <span className="text-text-secondary">{common.map((c) => c.name).join(' · ')}</span>
        </p>
      )}
      <button
        type="button"
        onClick={() => onOpenDong(pick.id)}
        className="bg-brand-primary text-text-inverse text-explore-sm w-full rounded-lg py-2.5 font-bold"
      >
        {EXPLORE_COPY.openDong}
      </button>
    </section>
  )
}
