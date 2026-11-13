import { GROUP_COLOR, TAG_GROUP, TAG_ICON, pinTags } from '@/features/explore/copy'
import type { PinDong } from '@/features/explore/types'

type Props = {
  pin: PinDong
  state: 'default' | 'hover' | 'selected'
  onHover: (id: string | null) => void
}

/** ① 행정동 이름 핀 (Figma dongPin 388:8962). 태그 아이콘 최대 2개 + 이름. hover·선택이면 진한 알약 */
export default function DongPin({ pin, state, onHover }: Props) {
  const dark = state !== 'default'
  const tags = pinTags(pin.tags)
  return (
    <span
      data-state={state}
      onMouseEnter={() => onHover(pin.id)}
      onMouseLeave={() => onHover(null)}
      className="flex cursor-pointer flex-col items-center"
    >
      <span
        className={`shadow-float flex items-center gap-1.5 rounded-full border py-1.25 pr-3 ${tags.length > 0 ? 'pl-1.25' : 'pl-3'} ${dark ? 'bg-bg-inverse border-bg-inverse text-text-inverse' : 'bg-bg-surface border-border-default text-text-primary'}`}
      >
        {tags.length > 0 && (
          <span className="flex">
            {tags.map((t, i) => {
              const Icon = TAG_ICON[t]
              return (
                <span
                  key={t}
                  data-tag={t}
                  aria-hidden
                  className={`flex size-6.5 items-center justify-center rounded-full border-2 border-white ${i > 0 ? '-ml-1.5' : ''}`}
                  style={{ background: GROUP_COLOR[TAG_GROUP[t]] }}
                >
                  <Icon size={14} className="text-text-inverse" />
                </span>
              )
            })}
          </span>
        )}
        <span className="text-caption-xs font-bold whitespace-nowrap">{pin.name}</span>
      </span>
      <span
        aria-hidden
        className={`-mt-1 size-2 rotate-45 ${dark ? 'bg-bg-inverse' : 'bg-bg-surface'}`}
      />
      <span
        aria-hidden
        className={`border-bg-surface mt-0.5 size-2 rounded-full border ${state === 'selected' ? 'bg-brand-primary' : 'bg-text-tertiary'}`}
      />
    </span>
  )
}
