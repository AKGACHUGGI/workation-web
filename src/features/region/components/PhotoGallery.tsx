import { useState } from 'react'
import PhotoGalleryModal from '@/features/region/components/PhotoGalleryModal'
import type { RegionPhoto } from '@/features/region/types'

type Props = { photos: RegionPhoto[]; alt: string }

/** 큰 사진 1 + 작은 사진 4(2×2) + 사진 모두 보기. W-04 재사용 */
export default function PhotoGallery({ photos, alt }: Props) {
  const [open, setOpen] = useState(false)
  const [main, ...rest] = photos
  if (!main) return null
  return (
    <section className="relative grid grid-cols-2 gap-2">
      <img
        src={main.url}
        alt={`${alt} 1`}
        className="bg-bg-subtle aspect-[4/3] h-full w-full rounded-xl object-cover"
      />
      <div className="grid grid-cols-2 gap-2">
        {rest.slice(0, 4).map((p, i) => (
          <img
            key={`${p.url}-${i}`}
            src={p.url}
            alt={`${alt} ${i + 2}`}
            className="bg-bg-subtle aspect-[4/3] w-full rounded-xl object-cover"
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-bg-surface text-caption-segment text-text-primary border-border-default absolute right-4 bottom-4 rounded-lg border px-3 py-2"
      >
        사진 모두 보기 · {photos.length}장
      </button>
      <PhotoGalleryModal photos={photos} alt={alt} open={open} onClose={() => setOpen(false)} />
    </section>
  )
}
