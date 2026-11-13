import Block from '@/features/explore/components/Skeleton'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { DONG_R, SIGUNGU_R, dongSlot } from '@/features/explore/radialLayout'
import { GRAPH_H, GRAPH_W, SIGUNGU_HEADER_H } from '@/features/explore/components/panel/panelLayout'

type Props = { ids: string[] }

const SIZE = { w: GRAPH_W, h: GRAPH_H }

/**
 * ① 로딩 (Figma L2 429:9936, 스펙 2026-11-14 §6). 가운데 원 + 동 경계 파일의 동 수만큼 바깥 링에 회색 원.
 * 유형은 핀 응답이 와야 알 수 있어 그리지 않는다. 선 없음
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
      <Block className="h-4 w-62.5" />
      <svg aria-hidden viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} className="h-100 w-full shrink-0">
        <circle
          data-skeleton-center
          cx={GRAPH_W / 2}
          cy={GRAPH_H / 2}
          r={SIGUNGU_R}
          className="fill-explore-skeleton-map animate-skeleton-pulse"
        />
        {ids.map((id, i) => {
          const p = dongSlot(i, ids.length, 90, SIZE)
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
