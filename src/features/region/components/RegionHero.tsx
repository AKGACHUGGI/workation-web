import { Heart, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Tag from '@/components/ui/Tag'

type Props = {
  breadcrumb: { label: string; href?: string }[]
  title: string
  metaLine: string
  tags: { label: string; tone?: 'default' | 'selected' }[]
  onShare: () => void
  onSave: () => void
  saveLabel?: string
}

/** 브레드크럼 · 제목 · 메타 줄 · 태그 · 공유/저장 */
export default function RegionHero({
  breadcrumb,
  title,
  metaLine,
  tags,
  onShare,
  onSave,
  saveLabel = '저장',
}: Props) {
  return (
    <section className="flex flex-col gap-3">
      <nav
        aria-label="브레드크럼"
        className="text-caption-xs text-text-tertiary flex items-center gap-1"
      >
        {breadcrumb.map((b, i) => (
          <span key={b.label} className="flex items-center gap-1">
            {i > 0 && <span>›</span>}
            {b.href ? (
              <Link to={b.href} className="hover:text-text-primary">
                {b.label}
              </Link>
            ) : (
              <span>{b.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-start justify-between">
        <h1 className="text-display-3xl text-text-primary">{title}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            className="border-border-default text-body-sm text-text-primary hover:border-border-strong flex items-center gap-1 rounded-lg border px-3 py-2"
          >
            <Share2 size={16} /> 공유
          </button>
          <button
            type="button"
            onClick={onSave}
            className="border-border-default text-body-sm text-text-primary hover:border-border-strong flex items-center gap-1 rounded-lg border px-3 py-2"
          >
            <Heart size={16} /> {saveLabel}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-text-secondary">{metaLine}</p>
        <div className="flex items-center gap-2">
          {tags.map((t) => (
            <Tag key={t.label} tone={t.tone}>
              {t.label}
            </Tag>
          ))}
        </div>
      </div>
    </section>
  )
}
