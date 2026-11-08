import { Plus } from 'lucide-react'
import { useToast } from '@/components/ui/toast/useToast'
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
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-heading-lg text-text-primary">내 사진 {data.items.length}장</h2>
        <span className="text-caption-xs text-text-tertiary">
          검수 완료 {approved} · 대기 {pending}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {data.items.map((p) => (
          <UserPhotoTile key={p.id} photo={p} />
        ))}
        <button
          type="button"
          onClick={() => show(ME_COPY.uploadSoon)}
          className="border-border-default text-body-sm text-text-secondary flex aspect-4/3 flex-col items-center justify-center gap-2 rounded-xl border border-dashed"
        >
          <Plus className="h-5 w-5" />
          이달의 사진 올리기
        </button>
      </div>
      {data.items.length === 0 && (
        <p className="text-body-sm text-text-secondary text-center">{ME_COPY.photosEmpty}</p>
      )}
    </section>
  )
}
