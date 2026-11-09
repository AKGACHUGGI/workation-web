import { EXPLORE_COPY, GROUP_META } from '@/features/explore/copy'
import type { ExploreTag } from '@/features/explore/types'

type Props = { mode: 'overview' | 'tags' | 'dong'; tags: ExploreTag[] }

/** 범례 + 데이터 한계 문구 (왼쪽 아래 카드) */
export default function MapLegend({ mode, tags }: Props) {
  const branch = tags.filter((t) => t.display === 'branch')
  return (
    <div className="bg-bg-surface shadow-float flex max-w-md flex-col gap-2 rounded-xl px-4 py-3">
      {mode === 'tags' && (
        <ul className="text-caption-xs text-text-primary flex flex-wrap items-center gap-x-4 gap-y-1">
          {tags.map((t) => (
            <li key={t.id} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ background: GROUP_META[t.group].color }}
              />
              {t.label}
            </li>
          ))}
          {tags.length > 1 && (
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="bg-selected-bg h-2.5 w-5 rounded-full" />
              {EXPLORE_COPY.legendAllBorder}
            </li>
          )}
        </ul>
      )}
      {mode === 'dong' && (
        <ul className="text-caption-xs text-text-primary flex flex-wrap items-center gap-x-4 gap-y-1">
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="border-text-primary bg-bg-surface h-2.5 w-4 rounded-sm border-2"
            />
            {EXPLORE_COPY.legendSelectedDong}
          </li>
          {branch.map((t) => (
            <li key={t.id} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-1 w-5 rounded-full"
                style={{ background: GROUP_META[t.group].color }}
              />
              {EXPLORE_COPY.legendBranch(t.label)}
            </li>
          ))}
        </ul>
      )}
      <p className="text-caption-xs text-text-tertiary">{EXPLORE_COPY.dataLimit}</p>
    </div>
  )
}
