import { EXPLORE_COPY } from '@/features/explore/copy'
import { pinFacts, sharedFacts, typeDongs, typeNodeId } from '@/features/explore/sigunguGraph'
import { TYPE_NAMES } from '@/features/explore/types'
import type { PinDong } from '@/features/explore/types'
import type { GraphPick } from '@/features/explore/components/panel/SigunguGraph'

type Props = {
  pins: PinDong[]
  pick: GraphPick
  onOpenDong: (dongId: string) => void
}

const COMMON_MAX = 3
const CARD =
  'border-border-default bg-bg-surface flex shrink-0 flex-col gap-2 rounded-xl border p-3.5'

/**
 * ① 선택 카드 (Figma 434:9855, 스펙 2026-11-14 §5). 동: 대표 유형(없으면 "뚜렷한 유형 없음") · 핀 사실 ·
 * 공통 사실 많은 동 최대 3 · [동네 자세히 보기]. 유형: 그 유형 동 목록
 */
export default function SelectionCard({ pins, pick, onOpenDong }: Props) {
  if (pick.kind === 'type') {
    const type = TYPE_NAMES.find((t) => typeNodeId(t) === pick.id)
    const names = type ? typeDongs(pins, type).map((p) => p.name) : []
    if (!type || names.length === 0) return null
    return (
      <section aria-label={type} className={CARD}>
        <h3 className="text-title-md text-text-primary font-bold">
          {EXPLORE_COPY.cardTypeTitle(type, names.length)}
        </h3>
        <p className="text-caption-xs text-text-secondary">{names.join(' · ')}</p>
      </section>
    )
  }

  const pin = pins.find((p) => p.id === pick.id)
  if (!pin) return null
  const common = sharedFacts(pins, pin.id).slice(0, COMMON_MAX)
  return (
    <section aria-label={pin.name} className={CARD}>
      <div className="flex items-baseline gap-2">
        <h3 className="text-title-md text-text-primary font-bold">{pin.name}</h3>
        <span className="text-caption-xs text-text-secondary">
          {pin.topType && pin.topScore !== null
            ? `${pin.topType} ${pin.topScore}`
            : EXPLORE_COPY.noType}
        </span>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {pinFacts(pin).map((f) => (
          <li
            key={f}
            className="bg-bg-subtle text-explore-xs text-text-primary inline-flex items-center rounded-full px-2 py-0.75 font-medium"
          >
            {f}
          </li>
        ))}
      </ul>
      {common.length > 0 && (
        <p className="text-caption-xs flex gap-1.5">
          <span className="text-text-primary font-bold">
            {EXPLORE_COPY.cardCommon(common[0].common.length)}
          </span>
          <span className="text-text-secondary">{common.map((c) => c.name).join(' · ')}</span>
        </p>
      )}
      <button
        type="button"
        onClick={() => onOpenDong(pin.id)}
        className="bg-brand-primary text-text-inverse text-explore-sm w-full rounded-lg py-2.5 font-bold"
      >
        {EXPLORE_COPY.openDong}
      </button>
    </section>
  )
}
