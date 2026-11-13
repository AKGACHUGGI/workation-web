import Block from '@/features/explore/components/Skeleton'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { DONG_R } from '@/features/explore/forceLayout'
import { seedPosition } from '@/features/explore/sigunguGraph'
import { GRAPH_H, GRAPH_W, SIGUNGU_HEADER_H } from '@/features/explore/components/panel/panelLayout'

type Props = { ids: string[] }

const CHIP_W = ['w-15.5', 'w-18', 'w-27', 'w-23', 'w-27']

/**
 * ① 로딩 (Figma L2 429:9936). 원은 동 경계 파일의 동 수만큼, 위치는 실제 배치의 씨앗(seedPosition)과 같아
 * 핀 응답이 오면 그 자리에서 퍼진다. 선은 없다 (스펙 §9-1)
 */
export default function SigunguGraphSkeleton({ ids }: Props) {
  return (
    <div
      data-testid="graph-skeleton"
      aria-busy="true"
      className="flex flex-1 flex-col gap-3.5 pt-5"
    >
      <span className="sr-only">{EXPLORE_COPY.loadingSr}</span>
      <div className={`flex shrink-0 flex-col gap-1.5 ${SIGUNGU_HEADER_H}`}>
        <Block className="h-6 w-22.5" />
        <Block className="h-3 w-45" />
      </div>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        {CHIP_W.map((w, i) => (
          <Block key={i} shape="pill" className={`h-6.5 ${w}`} />
        ))}
      </div>
      <svg aria-hidden viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} className="h-100 w-full shrink-0">
        {ids.map((id) => {
          const p = seedPosition(id, GRAPH_W, GRAPH_H)
          return (
            <circle
              key={id}
              data-skeleton-node
              cx={p.x}
              cy={p.y}
              r={DONG_R}
              className="fill-explore-skeleton-map animate-skeleton-pulse"
            />
          )
        })}
      </svg>
      <Block className="h-2.5 w-75" />
    </div>
  )
}
