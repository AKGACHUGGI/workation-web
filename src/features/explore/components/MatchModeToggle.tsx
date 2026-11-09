import Segmented from '@/components/ui/Segmented'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { MatchMode } from '@/features/explore/types'

type Props = {
  mode: MatchMode
  anyCount: number
  allCount: number
  onChange: (mode: MatchMode) => void
}

/** ① [하나라도 있는 동 N | 모두 있는 동 M]. 숫자는 지금 화면 안 동 수 */
export default function MatchModeToggle({ mode, anyCount, allCount, onChange }: Props) {
  return (
    <Segmented<MatchMode>
      ariaLabel={EXPLORE_COPY.matchModeLabel}
      size="sm"
      className="shadow-float"
      value={mode}
      onChange={onChange}
      options={[
        { value: 'any', label: EXPLORE_COPY.matchAny(anyCount) },
        { value: 'all', label: EXPLORE_COPY.matchAll(allCount) },
      ]}
    />
  )
}
