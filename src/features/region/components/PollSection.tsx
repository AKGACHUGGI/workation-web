import { Plus } from 'lucide-react'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import type { PollResponse } from '@/features/region/types'

type Props = {
  question: string
  /** 예: '연간 보기에서는 최신 달(12월) 기준' */
  caption?: string
  data?: PollResponse
  status: 'pending' | 'error' | 'success'
  onRetry: () => void
  /** '{n}명 참여 · 지표 검증에 반영돼요' 의 뒷부분 */
  participationLabel: string
}

/** 체감 투표 + 이달의 사진 (읽기). W-04 재사용 */
export default function PollSection({
  question,
  caption,
  data,
  status,
  onRetry,
  participationLabel,
}: Props) {
  const requireLogin = useRequireLogin()
  const vote = () => requireLogin(() => {})
  const yes = data && data.total > 0 ? Math.round((data.yes / data.total) * 100) : 0
  const no = data && data.total > 0 ? 100 - yes : 0
  return (
    <section className="grid grid-cols-2 gap-6">
      <div className="border-border-default rounded-2xl border p-6">
        <h2 className="text-heading-lg text-text-primary">{question}</h2>
        {caption && <p className="text-caption-xs text-text-tertiary mt-1">{caption}</p>}
        {status === 'pending' && (
          <div className="bg-bg-subtle mt-4 h-10 animate-pulse rounded-lg" />
        )}
        {status === 'error' && (
          <p className="text-body-sm text-text-secondary mt-4">
            불러오지 못했습니다{' '}
            <button type="button" onClick={onRetry} className="underline">
              다시 시도
            </button>
          </p>
        )}
        {status === 'success' && data && (
          <>
            <div className="bg-bg-surface-strong mt-4 flex h-3 overflow-hidden rounded-full">
              <div className="bg-signal-good" style={{ width: `${yes}%` }} />
              <div className="bg-signal-avoid" style={{ width: `${no}%` }} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={vote}
                className="bg-signal-good-bg text-signal-good text-body-sm rounded-lg px-4 py-2 font-medium"
              >
                그래요 {yes}%
              </button>
              <button
                type="button"
                onClick={vote}
                className="bg-signal-avoid-bg text-signal-avoid text-body-sm rounded-lg px-4 py-2 font-medium"
              >
                아니요 {no}%
              </button>
            </div>
            <p className="text-caption-xs text-text-tertiary mt-3">
              {data.total}명 참여 · {participationLabel}
            </p>
          </>
        )}
      </div>
      <div>
        <h2 className="text-heading-lg text-text-primary mb-3">이달의 사진</h2>
        <div className="grid grid-cols-4 gap-2">
          {(data?.photos ?? []).slice(0, 3).map((p) => (
            <img
              key={p.url}
              src={p.url}
              alt={`${p.author}의 사진`}
              className="bg-bg-subtle aspect-square w-full rounded-xl object-cover"
            />
          ))}
          <button
            type="button"
            onClick={() => requireLogin(() => {})}
            className="border-border-default text-caption-xs text-text-secondary flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed"
          >
            <Plus size={16} /> 이달의 사진 올리기
          </button>
        </div>
      </div>
    </section>
  )
}
