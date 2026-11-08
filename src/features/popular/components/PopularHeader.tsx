import type { ReactNode } from 'react'
import Dropdown from '@/components/ui/Dropdown'
import { PRESET_LABEL } from '@/features/metric/constants'
import { PRESET_KEYS } from '@/features/metric/types'
import type { MetricKey, PresetKey } from '@/features/metric/types'
import { SORT_LABEL } from '@/features/popular/copy'
import { POPULAR_SORTS } from '@/features/popular/types'
import type { PopularSort } from '@/features/popular/types'
import CustomMetricToggles from '@/features/tier/components/CustomMetricToggles'

type Props = {
  count: number
  sort: PopularSort
  onSortChange: (s: PopularSort) => void
  preset: PresetKey
  onPresetChange: (p: PresetKey) => void
  selected: MetricKey[]
  onSelectedChange: (keys: MetricKey[]) => void
  /** 제목 아래 "AI가 이해한 조건" 줄 (검색했을 때만) */
  conditions?: ReactNode
}

/** "인기 지역 N곳" + 프리셋·정렬 드롭다운 (+ 직접 설정 토글) */
export default function PopularHeader({
  count,
  sort,
  onSortChange,
  preset,
  onPresetChange,
  selected,
  onSelectedChange,
  conditions,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Figma 274:4775: 제목 18 Bold + 아래 조건 줄 / 오른쪽 프리셋·정렬 */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="text-heading-lg text-text-primary">인기 지역 {count}곳</h2>
          {conditions}
        </div>
        <div className="flex items-center gap-2">
          <Dropdown
            ariaLabel="프리셋"
            options={PRESET_KEYS.map((p) => ({ value: p, label: PRESET_LABEL[p] }))}
            value={preset}
            onChange={onPresetChange}
          />
          <Dropdown
            ariaLabel="정렬"
            options={POPULAR_SORTS.map((s) => ({ value: s, label: SORT_LABEL[s] }))}
            value={sort}
            onChange={onSortChange}
          />
        </div>
      </div>
      {preset === 'custom' && (
        <CustomMetricToggles selected={selected} onChange={onSelectedChange} />
      )}
    </div>
  )
}
