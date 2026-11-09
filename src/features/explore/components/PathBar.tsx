import { Fragment } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { breadcrumbAt } from '@/features/explore/view'

type Level = 'province' | 'sigungu' | 'dong'
type Props = {
  crumbs: ReturnType<typeof breadcrumbAt>
  onPick: (level: Level, id: string) => void
}

/** 경로 바 (지도 중심 기준). 항목을 누르면 그 범위로 이동 */
export default function PathBar({ crumbs, onPick }: Props) {
  const items: { level: Level; id: string; name: string }[] = []
  if (crumbs.province)
    items.push({ level: 'province', id: crumbs.province.id, name: crumbs.province.name })
  if (crumbs.sigungu)
    items.push({ level: 'sigungu', id: crumbs.sigungu.id, name: crumbs.sigungu.name })
  if (crumbs.dong) items.push({ level: 'dong', id: crumbs.dong.id, name: crumbs.dong.name })
  return (
    <div className="flex items-center gap-4">
      <nav aria-label="경로" className="text-body-sm flex items-center gap-1">
        <MapPin className="text-text-secondary" size={16} aria-hidden />
        {items.map((item, i) => (
          <Fragment key={item.level}>
            {i > 0 && <ChevronRight className="text-text-tertiary" size={14} aria-hidden />}
            <button
              type="button"
              onClick={() => onPick(item.level, item.id)}
              className={
                i === items.length - 1
                  ? 'text-text-primary font-bold'
                  : 'text-text-secondary underline-offset-2 hover:underline'
              }
            >
              {item.name}
            </button>
          </Fragment>
        ))}
      </nav>
      <span className="text-caption-xs text-text-tertiary">{EXPLORE_COPY.pathCaption}</span>
    </div>
  )
}
