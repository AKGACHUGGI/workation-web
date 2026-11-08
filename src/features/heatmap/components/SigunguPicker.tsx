import Chip from '@/components/ui/Chip'
import type { HeatEntry } from '@/features/heatmap/useHeatEntries'

type Props = {
  /** 시군구 12곳 (이름 · id) */
  regions: Pick<HeatEntry, 'id' | 'name'>[]
  selected: string | null
  onPick: (id: string) => void
}

const TITLE = '시군구 선택'
const PICK_HINT = '행정동을 보려면 시군구를 먼저 고르세요. 지도에서 눌러도 됩니다'

/**
 * 행정동 범위에서 어느 시군구를 볼지 고르는 칩 줄. 지도 위에 두어 "어디를 눌러야 하는지" 바로 보이게 한다.
 * 고른 뒤에도 남아 있어 다른 시군구로 바로 바꿀 수 있다.
 */
export default function SigunguPicker({ regions, selected, onPick }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <p className="text-body-sm text-text-primary font-medium">{TITLE}</p>
        {selected === null && <p className="text-caption-xs text-brand-primary">{PICK_HINT}</p>}
      </div>
      <div role="group" aria-label={TITLE} className="flex flex-wrap gap-1.5">
        {regions.map((r) => (
          <Chip
            key={r.id}
            selected={r.id === selected}
            onClick={() => onPick(r.id)}
            className="px-3"
          >
            {r.name}
          </Chip>
        ))}
      </div>
    </div>
  )
}
