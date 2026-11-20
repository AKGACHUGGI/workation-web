import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toast/useToast'
import { meKeys } from '@/features/me/queryKeys'
import { uploadMonthPhotos } from '@/features/region/api'
import type { MonthPhotoTarget } from '@/features/region/types'
import { usePhotoPicker } from '@/features/upload/usePhotoPicker'

export const PHOTO_MAX = 3
export const PHOTO_SUBMITTED = '사진을 올렸어요'
export const PHOTO_FAILED = '사진을 올리지 못했어요. 형식(JPEG·PNG·WebP)과 크기를 확인해 주세요'

type Props = {
  open: boolean
  onClose: () => void
  /** 제목 아래 캡션 (예: '10월 · 사용자 제공') */
  caption?: string
  /** 올릴 곳 (지역·동 + 달). 그 달 투표의 사진 칸에 바로 보인다 */
  target: MonthPhotoTarget
}

/** 이달의 사진 올리기: 고르기 → 미리보기 → 제출. 올리면 바로 공개되고, 신고가 쌓이면 가려진다 */
export default function PhotoUploadModal({ open, onClose, caption, target }: Props) {
  const { show } = useToast()
  const queryClient = useQueryClient()
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

  const upload = useMutation({
    mutationFn: (files: File[]) => uploadMonthPhotos(target, files),
    onSuccess: () => {
      // 투표 응답의 photos 를 다시 받는다 (regionKeys.poll · dongKeys.poll 의 앞부분)
      const scope = target.kind === 'regions' ? 'region' : 'dong'
      queryClient.invalidateQueries({ queryKey: [scope, target.id, 'poll'] })
      queryClient.invalidateQueries({ queryKey: meKeys.photos })
      queryClient.invalidateQueries({ queryKey: meKeys.summary })
      show(PHOTO_SUBMITTED)
      close()
    },
    onError: () => show(PHOTO_FAILED),
  })

  const submit = () => upload.mutate(photos.map((p) => p.file))

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
          올리면 바로 게시돼요 · 최대 {PHOTO_MAX}장, 장당 10MB 이하
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
            disabled={photos.length === 0 || upload.isPending}
            className="bg-brand-primary text-text-on-brand hover:bg-brand-hover text-body-sm disabled:opacity-dim rounded-lg px-4 py-2 font-medium"
          >
            {upload.isPending ? '올리는 중…' : '제출'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
