import { useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import PhotoGalleryModal from '@/features/region/components/PhotoGalleryModal'
import type { RegionPhoto } from '@/features/region/types'
import FallbackImage from '@/components/ui/FallbackImage'

type Props = { photos: RegionPhoto[]; alt: string }

/**
 * Figma PhotoMosaic(54:192): 큰 사진 1 + 작은 사진 4(2×2), 높이 420 · 간격 8 · 바깥만 radius/xl 클리핑.
 * 우하단 "사진 모두 보기" 잉크 외곽선 버튼. W-04 재사용
 */
export default function PhotoGallery({ photos, alt }: Props) {
  const [open, setOpen] = useState(false)
  const [main, ...rest] = photos
  if (!main) return null
  return (
    <section className="relative flex h-105 gap-2 overflow-hidden rounded-xl">
      <FallbackImage
        src={main.url}
        alt={`${alt} 1`}
        className="bg-bg-subtle h-full min-w-0 flex-1 object-cover"
      />
      <div className="grid min-w-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
        {rest.slice(0, 4).map((p, i) => (
          <FallbackImage
            key={`${p.url}-${i}`}
            src={p.url}
            alt={`${alt} ${i + 2}`}
            className="bg-bg-subtle h-full w-full object-cover"
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-bg-surface text-body-sm text-text-primary border-text-primary absolute right-4 bottom-4 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium"
      >
        <LayoutGrid size={14} aria-hidden />
        사진 모두 보기 · {photos.length}장
      </button>
      <PhotoGalleryModal photos={photos} alt={alt} open={open} onClose={() => setOpen(false)} />
    </section>
  )
}
