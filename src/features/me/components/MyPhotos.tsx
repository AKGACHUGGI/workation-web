import { Camera } from 'lucide-react'
import { useToast } from '@/components/ui/toast/useToast'
import MePanel from '@/features/me/components/MePanel'
import { ME_COPY } from '@/features/me/copy'
import UserPhotoTile from '@/features/me/components/UserPhotoTile'
import { useMyPhotos } from '@/features/me/useMyPhotos'

export default function MyPhotos() {
  const { data, isPending, isError, refetch } = useMyPhotos()
  const { show } = useToast()

  if (isPending) return <div className="bg-bg-subtle h-40 animate-pulse rounded-xl" />
  if (isError)
    return (
      <p className="text-body-sm text-text-secondary">
        불러오지 못했습니다 ·{' '}
        <button type="button" onClick={() => refetch()} className="underline">
          다시 시도
        </button>
      </p>
    )

  const approved = data.items.filter((p) => p.status === 'approved').length
  const pending = data.items.length - approved

  return (
    <MePanel
      title={`내 사진 ${data.items.length}장`}
      aside={`검수 완료 ${approved} · 대기 ${pending}`}
    >
      <div className="grid grid-cols-4 gap-2">
        {data.items.map((p) => (
          <UserPhotoTile key={p.id} photo={p} />
        ))}
        <button
          type="button"
          onClick={() => show(ME_COPY.uploadSoon)}
          className="bg-bg-subtle border-border-strong text-caption-xs text-text-secondary flex h-37.5 flex-col items-center justify-center gap-1 rounded-lg border border-dashed font-medium"
        >
          <Camera size={20} aria-hidden />
          이달의 사진 올리기
        </button>
      </div>
      {data.items.length === 0 && (
        <p className="text-body-sm text-text-secondary text-center">{ME_COPY.photosEmpty}</p>
      )}
    </MePanel>
  )
}
