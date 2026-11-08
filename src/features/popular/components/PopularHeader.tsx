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
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-xl text-text-primary">인기 지역 {count}곳</h2>
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
