import { Bookmark, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import GradeBadge from '@/components/ui/GradeBadge'
import PhotoThumb from '@/components/ui/PhotoThumb'
import type { Grade } from '@/features/metric/types'

type Props = {
  photoUrl: string
  title: string
  /** 종합 점수 0~100 */
  score: number
  /** 호출부 호환용. Figma 는 점수를 잉크로 쓰므로 색에는 쓰지 않는다 */
  scoreGrade: Grade
  /** 상위 3개 배지 ('즐겨찾기 1위' 등) */
  badge?: string
  meta1: string
  meta2: string
  chips: { label: string; grade: Grade }[]
  favorite: boolean
  onToggleFavorite: () => void
  href: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  /** 지도 hover 연동 강조 */
  highlighted?: boolean
}

/**
 * Figma ListingCard 54:129. 4:3 사진(rounded-xl) + 좌상단 FloatBadge + 우상단 저장 원형 버튼 → 메타.
 * 카드 자체는 테두리·그림자 없음(hover·지도 강조 시 card-float). 제목 16 Medium, 점수 sparkles + 14 Bold 잉크,
 * 메타 14 보조색, 지표 칩 12 + GradeBadge sm.
 * 본문 전체가 링크, 저장 버튼은 링크의 형제(<a> 안 <button> 금지)
 */
export default function ListingCard({
  photoUrl,
  title,
  score,
  badge,
  meta1,
  meta2,
  chips,
  favorite,
  onToggleFavorite,
  href,
  onMouseEnter,
  onMouseLeave,
  highlighted = false,
}: Props) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative rounded-xl transition-shadow ${highlighted ? 'shadow-float' : 'hover:shadow-float'}`}
    >
      <Link to={href} className="flex flex-col gap-2.5">
        <PhotoThumb photoUrl={photoUrl} alt={title} label={badge} />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-title-md text-text-primary truncate">{title}</span>
            <span className="text-body-sm text-text-primary inline-flex shrink-0 items-center gap-1 font-bold">
              <Sparkles size={14} aria-hidden />
              {Math.round(score)}
            </span>
          </div>
          <span className="text-body-sm text-text-secondary">{meta1}</span>
          <span className="text-body-sm text-text-secondary">{meta2}</span>
          <div className="flex items-center gap-1.5">
            {chips.map((c) => (
              <span
                key={c.label}
                className="text-caption-xs text-text-secondary inline-flex items-center gap-1.5"
              >
                {c.label}
                <GradeBadge grade={c.grade} size="sm" />
              </span>
            ))}
          </div>
        </div>
      </Link>
      {/* 링크 밖 형제라 클릭해도 이동하지 않는다. 사진 오른쪽 위(안쪽 12px)에 겹친다 — Figma IconButtonCircle sm */}
      <button
        type="button"
        aria-label="즐겨찾기"
        aria-pressed={favorite}
        onClick={onToggleFavorite}
        className="bg-bg-surface absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full"
      >
        <Bookmark
          size={16}
          aria-hidden
          className={favorite ? 'fill-accent-save text-accent-save' : 'text-text-primary'}
        />
      </button>
    </div>
  )
}
