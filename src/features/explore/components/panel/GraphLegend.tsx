import { EXPLORE_COPY } from '@/features/explore/copy'
import type { RelationKey } from '@/features/explore/sigunguGraph'
import { RELATION_BG } from '@/features/explore/components/panel/relationColor'

type Props = { on: ReadonlySet<RelationKey> }

/** ① 그래프 아래 범례 (Figma 434:9874). 켜진 관계의 사실 색만 */
export default function GraphLegend({ on }: Props) {
  const items: { key: string; label: string; dot: string }[] = [
    {
      key: 'dong',
      label: EXPLORE_COPY.legendDong,
      dot: 'bg-bg-surface border-brand-primary border-2',
    },
  ]
  if (on.has('type'))
    items.push({ key: 'type', label: EXPLORE_COPY.legendType, dot: RELATION_BG.type })
  if (on.has('coast'))
    items.push({ key: 'coast', label: EXPLORE_COPY.legendCoast, dot: RELATION_BG.coast })
  if (on.has('life'))
    items.push({ key: 'life', label: EXPLORE_COPY.legendLife, dot: RELATION_BG.life })
  if (on.has('quiet') || on.has('evening'))
    items.push({ key: 'grade', label: EXPLORE_COPY.legendGrade, dot: RELATION_BG.quiet })
  return (
    <ul className="flex shrink-0 flex-wrap items-center gap-3">
      {items.map((i) => (
        <li
          key={i.key}
          className="text-explore-xs text-text-secondary inline-flex items-center gap-1"
        >
          <span aria-hidden className={`size-2.25 rounded-full ${i.dot}`} />
          {i.label}
        </li>
      ))}
    </ul>
  )
}
