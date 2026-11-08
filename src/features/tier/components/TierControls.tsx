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
  // Figma 195:2244: 한 줄 — 왼쪽 탭 · 가운데 프리셋 칩 · 오른쪽 월(라벨 + 칩 몇 개가 보이는 가로 스크롤)
  // 월 칩은 스펙 §3-2 대로 연간+12개월 13개를 유지하고, 폭만 좁혀 선택 칩 주변이 보이게 한다
  return (
    <div className="flex items-center justify-between gap-6">
      <Segmented
        variant="surface"
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
          {PRESET_KEYS.map((key) => (
            <Chip key={key} size="md" selected={preset === key} onClick={() => onPresetChange(key)}>
              {PRESET_LABEL[key]}
            </Chip>
          ))}
        </div>
      )}
      <MonthChips value={month} onChange={onMonthChange} className="max-w-xs" />
    </div>
  )
}
