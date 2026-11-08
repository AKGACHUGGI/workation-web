import { Bookmark, ChevronRight, Share } from 'lucide-react'
import { Link } from 'react-router-dom'
import Tag from '@/components/ui/Tag'
import BrandTag from '@/features/region/components/BrandTag'

type Props = {
  breadcrumb: { label: string; href?: string }[]
  title: string
  metaLine: string
  /** tone 'selected' 는 Figma brand 태그(프리셋 순위)로 그린다 */
  tags: { label: string; tone?: 'default' | 'selected' }[]
  onShare: () => void
  onSave: () => void
  saveLabel?: string
  /** 즐겨찾기에 있음 → 북마크 채움 + aria-pressed */
  saved?: boolean
}

const action =
  'text-body-sm text-text-primary hover:bg-bg-subtle flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium'

/** 브레드크럼 · 제목 · 메타 줄+태그 · 공유/저장 (Figma 246:2542·246:2550) */
export default function RegionHero({
  breadcrumb,
  title,
  metaLine,
  tags,
  onShare,
  onSave,
  saveLabel = '저장',
  saved = false,
}: Props) {
  return (
    <section className="flex flex-col gap-5">
      <nav aria-label="브레드크럼" className="text-body-sm flex items-center gap-1.5">
        {breadcrumb.map((b, i) => {
          const last = i === breadcrumb.length - 1
          return (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} aria-hidden className="text-text-tertiary" />}
              {b.href ? (
                <Link to={b.href} className="text-text-secondary hover:text-text-primary">
                  {b.label}
                </Link>
              ) : (
                <span className={last ? 'text-text-primary' : 'text-text-secondary'}>
                  {b.label}
                </span>
              )}
            </span>
          )
        })}
      </nav>
      <div className="flex items-end justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-heading-2xl text-text-primary">{title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body-sm text-text-secondary">{metaLine}</p>
            {tags.map((t) =>
              t.tone === 'selected' ? (
                <BrandTag key={t.label}>{t.label}</BrandTag>
              ) : (
                <Tag key={t.label}>{t.label}</Tag>
              ),
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onShare} className={action}>
            <Share size={16} aria-hidden />
            <span className="underline">공유</span>
          </button>
          <button type="button" onClick={onSave} aria-pressed={saved} className={action}>
            <Bookmark
              size={16}
              aria-hidden
              className={saved ? 'fill-accent-save text-accent-save' : undefined}
            />
            <span className="underline">{saveLabel}</span>
          </button>
        </div>
      </div>
    </section>
  )
}
