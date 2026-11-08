import type { MyPhoto } from '@/features/me/types'
import { monthLabel } from '@/features/metric/month'
import FallbackImage from '@/components/ui/FallbackImage'

type Props = { photo: MyPhoto }

/** Figma UserPhotoTile: 사진 위 아래쪽 그라데이션 + 흰 글자 '{월} · {지역}' (높이 150) */
export default function UserPhotoTile({ photo }: Props) {
  const pending = photo.status === 'pending'
  return (
    <figure className="relative h-37.5 overflow-hidden rounded-lg">
      <FallbackImage
        src={photo.url}
        alt={`${photo.regionName} ${monthLabel(photo.month)} 사진`}
        className={`absolute inset-0 size-full object-cover ${pending ? 'opacity-dim' : ''}`}
      />
      <div
        aria-hidden="true"
        className="to-scrim/50 absolute inset-0 bg-linear-to-b from-transparent"
      />
      {pending && (
        <span className="bg-bg-inverse text-caption-badge text-text-inverse absolute top-1.5 left-1.5 rounded-md px-2 py-1">
          검수 대기
        </span>
      )}
      <figcaption className="text-caption-xs text-text-inverse absolute bottom-1.5 left-1.5 font-medium">
        {monthLabel(photo.month)} · {photo.regionName}
      </figcaption>
    </figure>
  )
}
