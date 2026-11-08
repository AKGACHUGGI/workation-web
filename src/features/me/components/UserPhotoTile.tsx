import type { MyPhoto } from '@/features/me/types'
import { monthLabel } from '@/features/metric/month'

type Props = { photo: MyPhoto }

export default function UserPhotoTile({ photo }: Props) {
  const pending = photo.status === 'pending'
  return (
    <figure className="relative flex flex-col gap-1">
      <img
        src={photo.url}
        alt={`${photo.regionName} ${monthLabel(photo.month)} 사진`}
        className={`aspect-4/3 w-full rounded-xl object-cover ${pending ? 'opacity-dim' : ''}`}
      />
      {pending && (
        <span className="bg-bg-inverse text-caption-badge text-text-inverse absolute top-2 left-2 rounded-md px-2 py-1">
          검수 대기
        </span>
      )}
      <figcaption className="text-caption-xs text-text-secondary">
        {monthLabel(photo.month)} · {photo.regionName}
      </figcaption>
    </figure>
  )
}
