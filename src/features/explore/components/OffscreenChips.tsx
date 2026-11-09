import { ArrowDownLeft } from 'lucide-react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { ProvinceGroup } from '@/features/explore/match'
import type { Bounds } from '@/features/explore/types'

type Props = { groups: ProvinceGroup[]; onPick: (bounds: Bounds) => void }

/** ① 화면 밖 해당 동 (왼쪽 아래). 누르면 그 도의 해당 동이 모두 보이게 이동 */
export default function OffscreenChips({ groups, onPick }: Props) {
  if (groups.length === 0) return null
  return (
    <div className="flex flex-col items-start gap-1.5">
      {groups.map((g) => (
        <button
          key={g.provinceId}
          type="button"
          onClick={() => onPick(g.bounds)}
          className="bg-bg-surface shadow-float text-caption-xs text-text-primary inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-bold"
        >
          <ArrowDownLeft size={12} aria-hidden />
          {EXPLORE_COPY.offscreen(g.name, g.count)}
        </button>
      ))}
    </div>
  )
}
