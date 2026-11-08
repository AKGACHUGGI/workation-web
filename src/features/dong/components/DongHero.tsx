import { Bookmark, ChevronRight, Share } from 'lucide-react'
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

const action =
  'text-body-sm text-text-primary hover:bg-bg-subtle inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium'

/** 브레드크럼 · 제목 · 메타+태그 · 공유/저장 · 사진 (Figma 251:3684·251:3692·251:3710) */
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
    <header className="flex flex-col gap-5">
      <nav aria-label="브레드크럼" className="text-body-sm flex items-center gap-1.5">
        <Link to={homeLink} className="text-text-secondary hover:text-text-primary">
          탐색
        </Link>
        <ChevronRight size={14} aria-hidden className="text-text-tertiary" />
        <Link to={sggLink} className="text-text-secondary hover:text-text-primary">
          {detail.sigungu.name}
        </Link>
        <ChevronRight size={14} aria-hidden className="text-text-tertiary" />
        <span className="text-text-primary">{detail.name}</span>
      </nav>
      <div className="flex items-end justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-heading-2xl text-text-primary">
            {detail.name}, {detail.sigungu.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body-sm text-text-secondary">
              {detail.province} · {monthLabel(month)} · {summary}
            </p>
            {/* Figma: 생활권 = brand 태그, 지형 태그 = 회색, 주된 활동 유형 = 회색 */}
            {detail.kind === 'living' ? (
              <Tag tone="brand">{DONG_KIND_LABEL[detail.kind]}</Tag>
            ) : (
              <Tag>{DONG_KIND_LABEL[detail.kind]}</Tag>
            )}
            {detail.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
            <Tag>{dominantLabel}</Tag>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={share} className={action}>
            <Share size={16} aria-hidden />
            <span className="underline">공유</span>
          </button>
          <button
            type="button"
            onClick={() => toggle('dongs', detail.id)}
            aria-pressed={saved}
            className={action}
          >
            <Bookmark
              size={16}
              aria-hidden
              className={saved ? 'fill-accent-save text-accent-save' : undefined}
            />
            <span className="underline">{saved ? '저장됨' : '저장'}</span>
          </button>
        </div>
      </div>
      <PhotoGallery photos={detail.photos} alt={`${detail.name} 사진`} />
    </header>
  )
}
