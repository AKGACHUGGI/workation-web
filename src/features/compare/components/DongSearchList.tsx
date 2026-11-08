import { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import GradeBadge from '@/components/ui/GradeBadge'
import Segmented from '@/components/ui/Segmented'
import { metricGrade } from '@/features/metric/score'
import type { TierItem } from '@/features/tier/types'

type Props = {
  items: TierItem[]
  selectedIds: string[]
  onPick: (id: string) => void
}

const ALL = 'all'

/** 찾기 탭: 이름 검색 + 시군구 필터 + 동 목록(이름 · 시군구 · 동네 조용함 등급) */
export default function DongSearchList({ items, selectedIds, onPick }: Props) {
  const [query, setQuery] = useState('')
  const [sgg, setSgg] = useState<string>(ALL)

  const sigungus = useMemo(() => {
    const map = new Map<string, string>()
    for (const it of items) if (it.sigungu) map.set(it.sigungu.id, it.sigungu.name)
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim()
    return items
      .filter((it) => sgg === ALL || it.sigungu?.id === sgg)
      .filter((it) => q === '' || it.name.includes(q))
      .sort((a, b) => b.scores.quiet - a.scores.quiet)
  }, [items, query, sgg])

  return (
    <div className="flex flex-col gap-3">
      <label className="border-border-default flex items-center gap-2 rounded-lg border px-3">
        <Search size={16} aria-hidden className="text-text-tertiary" />
        <input
          type="search"
          role="searchbox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="동 이름 검색"
          className="text-body-sm text-text-primary h-10 w-full bg-transparent outline-none"
        />
      </label>
      <Segmented
        options={[{ value: ALL, label: '전체' }, ...sigungus]}
        value={sgg}
        onChange={setSgg}
        ariaLabel="시군구"
        size="sm"
        className="flex-wrap"
      />
      <ul
        role="listbox"
        aria-label="행정동 목록"
        className="flex max-h-80 flex-col overflow-y-auto"
      >
        {filtered.map((it) => {
          const picked = selectedIds.includes(it.id)
          return (
            <li
              key={it.id}
              role="option"
              aria-selected={picked}
              aria-disabled={picked || undefined}
              onClick={picked ? undefined : () => onPick(it.id)}
              className={`border-border-default flex items-center justify-between border-b px-2 py-3 ${picked ? 'text-text-tertiary' : 'hover:bg-bg-subtle cursor-pointer'}`}
            >
              <span className="flex items-center gap-2">
                {picked && <Check size={16} aria-hidden />}
                <span className="text-body-sm font-medium">{it.name}</span>
                <span className="text-caption-xs text-text-tertiary">{it.sigungu?.name}</span>
              </span>
              <GradeBadge grade={metricGrade(it.scores.quiet)} size="sm" />
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="text-body-sm text-text-tertiary py-6 text-center">검색 결과가 없습니다</li>
        )}
      </ul>
    </div>
  )
}
