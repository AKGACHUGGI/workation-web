import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { RegionPhoto } from '@/features/region/types'

type Props = { photos: RegionPhoto[]; alt: string; open: boolean; onClose: () => void }

/** 사진 모두 보기. 네이티브 dialog(Esc·스크림 클릭 닫기) */
export default function PhotoGalleryModal({ photos, alt, open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-label={`${alt} 사진 전체`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="bg-bg-surface max-w-page backdrop:bg-scrim/50 m-auto w-full rounded-2xl p-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">사진 {photos.length}장</h2>
        <button type="button" aria-label="닫기" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((p, i) => (
          <img
            key={`${p.url}-${i}`}
            src={p.url}
            alt={`${alt} ${i + 1}`}
            className="bg-bg-subtle aspect-[4/3] w-full rounded-xl object-cover"
          />
        ))}
      </div>
    </dialog>
  )
}
