import { Camera, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toast/useToast'
import { usePhotoPicker } from '@/features/upload/usePhotoPicker'

export const PHOTO_MAX = 3
export const PHOTO_SUBMITTED = '사진을 받았어요 · 검수 후 게시돼요'

type Props = {
  open: boolean
  onClose: () => void
  /** 제목 아래 캡션 (예: '10월 · 사용자 제공 · 검수 후 게시') */
  caption?: string
}

/** 이달의 사진 올리기: 고르기 → 미리보기 → 검수 안내 → 제출. 업로드는 아직 없다(UI 만) */
export default function PhotoUploadModal({ open, onClose, caption }: Props) {
  const { show } = useToast()
  const {
    photos,
    open: pick,
    remove,
    clear,
    inputProps,
  } = usePhotoPicker({
    max: PHOTO_MAX,
    onReject: show,
  })

  const close = () => {
    clear()
    onClose()
  }

  const submit = () => {
    // TODO(R2): POST /api/uploads/presign → 각 사진 PUT → 받은 key 로 이달의 사진 등록 API 호출
    show(PHOTO_SUBMITTED)
    close()
  }

  return (
    <Modal open={open} onClose={close} titleId="photo-upload-title" width="sm">
      <div className="flex flex-col gap-4">
        <div>
          <h2 id="photo-upload-title" className="text-heading-lg text-text-primary">
            이달의 사진 올리기
          </h2>
          {caption && <p className="text-caption-xs text-text-tertiary mt-1">{caption}</p>}
        </div>
        <input {...inputProps} data-testid="photo-input" />
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <figure
              key={p.id}
              className="bg-bg-subtle relative aspect-square overflow-hidden rounded-lg"
            >
              <img src={p.previewUrl} alt={p.file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`${p.file.name} 빼기`}
                className="bg-scrim/50 text-text-on-photo absolute top-1 right-1 rounded-full p-1"
              >
                <X size={14} aria-hidden />
              </button>
            </figure>
          ))}
          {photos.length < PHOTO_MAX && (
            <button
              type="button"
              onClick={pick}
              className="bg-bg-subtle border-border-strong text-caption-segment text-text-secondary flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed"
            >
              <Camera size={20} aria-hidden /> 사진 고르기
            </button>
          )}
        </div>
        <p className="text-caption-xs text-text-tertiary">
          운영자 검수 후 게시돼요 · 최대 {PHOTO_MAX}장, 장당 10MB 이하
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="border-border-default text-body-sm text-text-primary rounded-lg border px-4 py-2"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={photos.length === 0}
            className="bg-brand-primary text-text-on-brand hover:bg-brand-hover text-body-sm disabled:opacity-dim rounded-lg px-4 py-2 font-medium"
          >
            제출
          </button>
        </div>
      </div>
    </Modal>
  )
}
