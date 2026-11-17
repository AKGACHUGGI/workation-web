import { useSearchParams } from 'react-router-dom'
import Chip from '@/components/ui/Chip'
import { PRESET_LABEL } from '@/features/metric/constants'
import { PRESET_KEYS } from '@/features/metric/types'
import type { PresetKey } from '@/features/metric/types'
import { useWeights } from '@/features/popular/useWeights'
import CustomMetricToggles from '@/features/tier/components/CustomMetricToggles'

/**
 * 카테고리로 거른 지역 안에서 분위기(프리셋) 고르기. 항상 하나가 선택돼 있다.
 * 고르면 정렬도 종합 점수순으로 바꿔 순서 변화가 바로 보이게 한다.
 */
export default function MoodRow() {
  const { preset, selected, setSelected } = useWeights()
  const [, setSearchParams] = useSearchParams()

  const choose = (p: PresetKey) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('preset', p)
      next.set('sort', 'score')
      return next
    })

  return (
    <div className="flex flex-col items-center gap-3 pt-4">
      <div role="group" aria-label="분위기" className="flex items-center gap-2">
        <span className="text-body-sm text-text-secondary mr-1">이 중에서 분위기</span>
        {PRESET_KEYS.map((p) => (
          <Chip key={p} size="md" selected={preset === p} onClick={() => choose(p)}>
            {PRESET_LABEL[p]}
          </Chip>
        ))}
      </div>
      {preset === 'custom' && <CustomMetricToggles selected={selected} onChange={setSelected} />}
    </div>
  )
}
