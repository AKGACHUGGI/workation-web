import { Heart, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Tag from '@/components/ui/Tag'
import { useToast } from '@/components/ui/toast/useToast'
import { DONG_COPY } from '@/features/dong/copy'
import type { DongDetailResponse } from '@/features/dong/types'
import { useFavorites } from '@/features/me/useFavorites'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import PhotoGallery from '@/features/region/components/PhotoGallery'
import { DONG_KIND_LABEL } from '@/features/region/copy'
import { useCarryLink } from '@/hooks/useCarryLink'

type Props = {
  detail: DongDetailResponse
  month: MonthParam
  /** buildDongSummary 결과 */
  summary: string
  /** ACTIVITY_LABEL[dominant] */
  dominantLabel: string
}

export default function DongHero({ detail, month, summary, dominantLabel }: Props) {
  const toast = useToast()
  const { isFavorite, toggle } = useFavorites()
  const saved = isFavorite('dongs', detail.id)
  const homeLink = useCarryLink('/')
  const sggLink = useCarryLink(`/regions/${detail.sigungu.id}`)

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast.show(DONG_COPY.linkCopied)
  }

  return (
    <header className="flex flex-col gap-4">
      <nav
        aria-label="브레드크럼"
        className="text-body-sm text-text-secondary flex items-center gap-2"
      >
        <Link to={homeLink} className="hover:text-text-primary">
          탐색
        </Link>
        <span aria-hidden>›</span>
        <Link to={sggLink} className="hover:text-text-primary">
          {detail.sigungu.name}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-text-primary">{detail.name}</span>
      </nav>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-display-3xl text-text-primary">
            {detail.name}, {detail.sigungu.name}
          </h1>
          <p className="text-body-sm text-text-secondary">
            {detail.province} · {monthLabel(month)} · {summary}
          </p>
          <div className="flex flex-wrap gap-2">
            <Tag>{DONG_KIND_LABEL[detail.kind]}</Tag>
            {detail.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
            <Tag tone="selected">{dominantLabel}</Tag>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={share}
            className="border-border-default text-body-sm text-text-primary hover:border-border-strong inline-flex items-center gap-1 rounded-lg border px-4 py-2"
          >
            <Share2 size={16} aria-hidden /> 공유
          </button>
          <button
            type="button"
            onClick={() => toggle('dongs', detail.id)}
            aria-pressed={saved}
            className="border-border-default text-body-sm text-text-primary hover:border-border-strong inline-flex items-center gap-1 rounded-lg border px-4 py-2"
          >
            <Heart
              size={16}
              aria-hidden
              className={saved ? 'fill-accent-save text-accent-save' : undefined}
            />{' '}
            {saved ? '저장됨' : '저장'}
          </button>
        </div>
      </div>
      <PhotoGallery photos={detail.photos} alt={`${detail.name} 사진`} />
    </header>
  )
}
