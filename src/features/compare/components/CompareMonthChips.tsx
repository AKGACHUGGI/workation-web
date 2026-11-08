import Chip from '@/components/ui/Chip'
import { monthWindow } from '@/features/dong/monthWindow'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'

type Props = { value: MonthParam; onChange: (month: MonthParam) => void }

/**
 * Figma W-05 v2 251:4093. 라벨 "월" + 연간 + 선택 월 ±1 (W-04 곡선 섹션과 같은 창).
 * 13개 전부 그리는 공용 MonthChips 는 헤더 오른쪽에서 넘치므로 W-05 는 이 줄만 쓴다.
 */
export default function CompareMonthChips({ value, onChange }: Props) {
  const months: MonthParam[] = ['annual', ...monthWindow(value)]
  return (
    <div role="group" aria-label="월" className="flex shrink-0 items-center gap-2">
      <span className="text-body-sm text-text-secondary font-medium">월</span>
      {months.map((m) => (
        <Chip key={m} selected={m === value} onClick={() => onChange(m)}>
          {monthLabel(m)}
        </Chip>
      ))}
    </div>
  )
}
