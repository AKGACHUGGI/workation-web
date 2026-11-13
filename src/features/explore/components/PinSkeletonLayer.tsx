import { AdvancedMarker } from '@vis.gl/react-google-maps'
import type { PinSkeleton } from '@/features/explore/pinSkeletons'

/**
 * ① 핀 로딩 중 회색 알약 (Figma L2 429:9924, Explore/Skeleton/MapBlock). 이름 길이 대신 고정 폭.
 * 진짜 핀의 꼬리·앵커 높이(14px)만큼 띄워 알약 자리를 맞춘다
 */
export default function PinSkeletonLayer({ skeletons }: { skeletons: PinSkeleton[] }) {
  return (
    <>
      {skeletons.map((s) => (
        <AdvancedMarker key={s.id} position={s.position} clickable={false}>
          <span
            data-skeleton-pin
            aria-hidden
            className="bg-explore-skeleton-map skeleton-shine mb-3.5 block h-8.5 w-24 rounded-full"
          />
        </AdvancedMarker>
      ))}
    </>
  )
}
