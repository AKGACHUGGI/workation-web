import { useToast } from '@/components/ui/toast/useToast'
import TipCard from '@/features/region/components/TipCard'
import MePanel from '@/features/me/components/MePanel'
import { ME_COPY } from '@/features/me/copy'
import { useDeleteMyTip, useMyTips } from '@/features/me/useMyTips'
import { useCarryLink } from '@/hooks/useCarryLink'

export default function MyTips() {
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage } = useMyTips()
  const del = useDeleteMyTip()
  const { show } = useToast()
  const regionBase = useCarryLink('/regions')
  const dongBase = useCarryLink('/dongs')

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

  const items = data.pages.flatMap((p) => p.items)
  const helpfulSum = data.pages[0]?.helpfulSum ?? 0

  return (
    <MePanel title={`내 팁 ${items.length}개`} aside={`도움돼요 합계 ${helpfulSum}`}>
      {items.length === 0 && (
        <p className="text-body-sm text-text-secondary py-8 text-center">{ME_COPY.tipsEmpty}</p>
      )}
      {items.map((tip) => (
        <TipCard
          key={tip.id}
          note={tip}
          targetLabel={tip.target.name}
          targetHref={
            tip.target.kind === 'region'
              ? regionBase.replace('/regions', `/regions/${tip.target.id}`)
              : dongBase.replace('/dongs', `/dongs/${tip.target.id}`)
          }
          trailing={
            <button
              type="button"
              onClick={() => {
                del.mutate(tip.id)
                // 스펙 §3-4·§8 과 다름: 되돌리기 액션 없음 (복구 API 계약 없음 — 아래 "스펙과의 차이")
                show(ME_COPY.tipDeleted, { durationMs: 5000 })
              }}
              className="text-caption-xs text-text-tertiary hover:text-signal-avoid"
            >
              삭제
            </button>
          }
        />
      ))}
      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          className="border-border-default text-body-sm rounded-lg border py-2"
        >
          더 보기
        </button>
      )}
    </MePanel>
  )
}
