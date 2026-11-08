import { Camera, ThumbsDown, ThumbsUp } from 'lucide-react'
import FallbackImage from '@/components/ui/FallbackImage'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import DetailSection from '@/features/region/components/DetailSection'
import type { PollResponse } from '@/features/region/types'
import Avatar from '@/components/ui/Avatar'

type Props = {
  question: string
  /** 예: '연간 보기에서는 최신 달(12월) 기준' */
  caption?: string
  data?: PollResponse
  status: 'pending' | 'error' | 'success'
  onRetry: () => void
  /** '{n}명 참여 · 지표 검증에 반영돼요' 의 뒷부분 */
  participationLabel: string
  /** 섹션 제목·우측 캡션. 기본은 W-03 Figma('체감 투표 · 이달의 사진') */
  title?: string
  sectionCaption?: string
  /**
   * 이달의 사진 칸 위 캡션('10월 · 사용자 제공 · 검수 후 게시').
   * 없으면 사진 칸을 그리지 않고 투표 카드가 전체 폭을 쓴다 (W-04 Figma 251:3824)
   */
  photoCaption?: string
}

/** 체감 투표(Figma ReactionPoll 27:177) + 이달의 사진(UserPhotoTile·PhotoUploadTile). W-04 재사용 */
export default function PollSection({
  question,
  caption,
  data,
  status,
  onRetry,
  participationLabel,
  title = '체감 투표 · 이달의 사진',
  sectionCaption = '사용자 참여 · 지표 검증에 반영',
  photoCaption,
}: Props) {
  const requireLogin = useRequireLogin()
  const vote = () => requireLogin(() => {})
  const yes = data && data.total > 0 ? Math.round((data.yes / data.total) * 100) : 0
  const no = data && data.total > 0 ? 100 - yes : 0
  const showPhotos = photoCaption !== undefined
  return (
    <DetailSection title={title} caption={sectionCaption}>
      <div className="flex items-start gap-6">
        <div className="border-border-default bg-bg-surface flex min-w-0 flex-1 flex-col gap-3 rounded-xl border p-4">
          <div>
            <h3 className="text-body-sm text-text-primary font-bold">{question}</h3>
            {caption && <p className="text-caption-xs text-text-tertiary mt-1">{caption}</p>}
          </div>
          {status === 'pending' && <div className="bg-bg-subtle h-10 animate-pulse rounded-lg" />}
          {status === 'error' && (
            <p className="text-body-sm text-text-secondary">
              불러오지 못했습니다{' '}
              <button type="button" onClick={onRetry} className="underline">
                다시 시도
              </button>
            </p>
          )}
          {status === 'success' && data && (
            <>
              <div className="bg-bg-subtle h-2 overflow-hidden rounded-sm">
                <div className="bg-signal-good h-full rounded-sm" style={{ width: `${yes}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={vote}
                  className="bg-signal-good-bg text-signal-good text-body-sm flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-medium"
                >
                  <ThumbsUp size={16} aria-hidden /> 그래요 {yes}%
                </button>
                <button
                  type="button"
                  onClick={vote}
                  className="bg-bg-subtle text-text-secondary text-body-sm flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-medium"
                >
                  <ThumbsDown size={16} aria-hidden /> 아니요 {no}%
                </button>
              </div>
              <p className="text-caption-xs text-text-tertiary">
                {data.total}명 참여 · {participationLabel}
              </p>
            </>
          )}
        </div>
        {showPhotos && (
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-caption-xs text-text-tertiary">{photoCaption}</p>
            <div className="flex flex-wrap gap-2">
              {(data?.photos ?? []).slice(0, 3).map((p, i) => (
                <figure
                  key={`${p.url}-${i}`}
                  className="bg-bg-subtle relative flex h-22.5 w-30 items-end overflow-hidden rounded-lg p-1.5"
                >
                  <FallbackImage
                    src={p.url}
                    alt={`${p.author}의 사진`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    aria-hidden
                    className="to-scrim/50 absolute inset-0 bg-linear-to-b from-transparent"
                  />
                  <figcaption className="text-caption-segment text-text-inverse relative flex items-center gap-1">
                    <Avatar initial={p.author} size="sm" />@{p.author}
                  </figcaption>
                </figure>
              ))}
            </div>
            <button
              type="button"
              onClick={() => requireLogin(() => {})}
              className="bg-bg-subtle border-border-strong text-caption-segment text-text-secondary flex h-22.5 w-30 flex-col items-center justify-center gap-1 rounded-lg border border-dashed"
            >
              <Camera size={20} aria-hidden /> 이달의 사진 올리기
            </button>
          </div>
        )}
      </div>
    </DetailSection>
  )
}
