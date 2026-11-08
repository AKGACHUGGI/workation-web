import Chip from '@/components/ui/Chip'
import MonthChips from '@/components/ui/MonthChips'
import Segmented from '@/components/ui/Segmented'
import { PRESET_LABEL } from '@/features/metric/constants'
import type { MonthParam } from '@/features/metric/month'
import { PRESET_KEYS } from '@/features/metric/types'
import type { PresetKey } from '@/features/metric/types'
import type { TierTab } from '@/features/tier/types'

type Props = {
  tab: TierTab
  onTabChange: (tab: TierTab) => void
  preset: PresetKey
  onPresetChange: (preset: PresetKey) => void
  month: MonthParam
  onMonthChange: (month: MonthParam) => void
}

/** 조작 줄: 탭 · 프리셋(밸류 탭) · 월(가로 스크롤) */
export default function TierControls({
  tab,
  onTabChange,
  preset,
  onPresetChange,
  month,
  onMonthChange,
}: Props) {
  return (
    <div className="flex items-center gap-6">
      <Segmented
        ariaLabel="등급 기준"
        options={[
          { value: 'value', label: '워케이션 밸류' },
          { value: 'metric', label: '개별 지표' },
        ]}
        value={tab}
        onChange={onTabChange}
      />
      {tab === 'value' && (
        <div role="group" aria-label="프리셋" className="flex shrink-0 items-center gap-2">
          <span className="text-body-sm text-text-secondary">프리셋</span>
          {PRESET_KEYS.map((key) => (
            <Chip key={key} selected={preset === key} onClick={() => onPresetChange(key)}>
              {PRESET_LABEL[key]}
            </Chip>
          ))}
        </div>
      )}
      <MonthChips value={month} onChange={onMonthChange} className="flex-1" />
    </div>
  )
}
