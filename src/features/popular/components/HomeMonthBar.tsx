import MonthChips from '@/components/ui/MonthChips'
import { useMonthParam } from '@/hooks/useQueryState'

/**
 * W-01 홈의 월 선택 줄. 인기 지역 카드와 지도 히트맵이 함께 이 달 기준으로 바뀐다.
 * 값은 URL month 하나에만 두므로 티어 · 상세 화면으로 넘어가도 같은 달이 이어진다.
 */
export default function HomeMonthBar() {
  const [month, setMonth] = useMonthParam()
  return (
    <div className="flex justify-center pt-5">
      <MonthChips value={month} onChange={setMonth} size="sm" />
    </div>
  )
}
