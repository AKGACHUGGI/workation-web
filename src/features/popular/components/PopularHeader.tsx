import type { ReactNode } from 'react'
import Dropdown from '@/components/ui/Dropdown'
import { SORT_LABEL } from '@/features/popular/copy'
import { POPULAR_SORTS } from '@/features/popular/types'
import type { PopularSort } from '@/features/popular/types'

type Props = {
  count: number
  sort: PopularSort
  onSortChange: (s: PopularSort) => void
  /** 제목 아래 "AI가 이해한 조건" 줄 (검색했을 때만) */
  conditions?: ReactNode
}

/** "인기 지역 N곳" + 정렬 드롭다운. 분위기(프리셋)는 카테고리 아래 MoodRow 에서 고른다 */
export default function PopularHeader({ count, sort, onSortChange, conditions }: Props) {
  return (
    // Figma 274:4775: 제목 18 Bold + 아래 조건 줄 / 오른쪽 정렬
    <div className="flex items-center justify-between gap-6">
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="text-heading-lg text-text-primary">인기 지역 {count}곳</h2>
        {conditions}
      </div>
      <Dropdown
        ariaLabel="정렬"
        options={POPULAR_SORTS.map((s) => ({ value: s, label: SORT_LABEL[s] }))}
        value={sort}
        onChange={onSortChange}
      />
    </div>
  )
}
