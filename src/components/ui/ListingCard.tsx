import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import GradeBadge from '@/components/ui/GradeBadge'
import PhotoThumb from '@/components/ui/PhotoThumb'
import { GRADE_FG } from '@/components/ui/gradeClass'
import type { Grade } from '@/features/metric/types'

type Props = {
  photoUrl: string
  title: string
  /** 종합 점수 0~100 */
  score: number
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

/** Figma ListingCard. 사진·배지·제목·점수·Meta1/2·칩 3개·하트. 본문 전체가 링크, 하트는 링크의 형제(<a> 안 <button> 금지) */
export default function ListingCard({
  photoUrl,
  title,
  score,
  scoreGrade,
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
      className={`bg-bg-surface relative overflow-hidden rounded-xl border transition-shadow ${
        highlighted
          ? 'border-border-strong shadow-float'
          : 'border-border-default hover:shadow-float'
      }`}
    >
      <Link to={href} className="block">
        <PhotoThumb photoUrl={photoUrl} alt={title} label={badge} className="rounded-b-none" />
        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-title-md text-text-primary">{title}</span>
            <span className={`text-number-2xl ${GRADE_FG[scoreGrade]}`}>{Math.round(score)}</span>
          </div>
          <span className="text-caption-xs text-text-secondary">{meta1}</span>
          <span className="text-caption-xs text-text-tertiary">{meta2}</span>
          <div className="mt-2 flex items-center gap-2">
            {chips.map((c) => (
              <span
                key={c.label}
                className="text-caption-xs text-text-secondary inline-flex items-center gap-1"
              >
                {c.label}
                <GradeBadge grade={c.grade} size="sm" />
              </span>
            ))}
          </div>
        </div>
      </Link>
      {/* 링크 밖 형제라 클릭해도 이동하지 않는다. 사진 오른쪽 위에 겹친다 */}
      <button
        type="button"
        aria-label="즐겨찾기"
        aria-pressed={favorite}
        onClick={onToggleFavorite}
        className="bg-bg-surface absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full"
      >
        <Heart
          size={16}
          aria-hidden
          className={favorite ? 'fill-accent-save text-accent-save' : 'text-text-secondary'}
        />
      </button>
    </div>
  )
}
