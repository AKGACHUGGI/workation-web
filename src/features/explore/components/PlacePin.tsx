import type { LucideIcon } from 'lucide-react'

type Props = { name: string; color: string; icon: LucideIcon; selected?: boolean; dimmed?: boolean }

/** ② 장소 핀 (Figma Explore/PlacePin). 선택되면 크게 + 이름 말풍선, ③ 에서 다른 핀은 흐리게 */
export default function PlacePin({
  name,
  color,
  icon: Icon,
  selected = false,
  dimmed = false,
}: Props) {
  return (
    <span
      data-selected={selected || undefined}
      className={`flex cursor-pointer flex-col items-center gap-0.5 ${dimmed ? 'opacity-faded' : ''}`}
    >
      {selected && (
        <span className="bg-bg-inverse text-text-inverse text-caption-xs shadow-float rounded-md px-2 py-1 font-bold">
          {name}
        </span>
      )}
      <span
        className={`text-text-inverse border-bg-surface shadow-float inline-flex items-center justify-center rounded-full border-2 ${selected ? 'size-9' : 'size-7'}`}
        style={{ background: color }}
      >
        <Icon size={selected ? 18 : 14} aria-hidden />
      </span>
      {!selected && (
        <span className="bg-bg-surface text-caption-xs text-text-primary rounded-sm px-1 font-medium">
          {name}
        </span>
      )}
    </span>
  )
}
