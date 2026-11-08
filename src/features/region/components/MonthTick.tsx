type Props = {
  x?: number
  y?: number
  payload?: { value: number }
  selected: number | null
}

/** X축 월 라벨. 선택한 달은 굵게 (Recharts 가 x·y·payload 를 주입) */
export default function MonthTick({ x = 0, y = 0, payload, selected }: Props) {
  const m = payload?.value ?? 0
  const isSelected = m === selected
  return (
    <text
      x={x}
      y={y + 12}
      textAnchor="middle"
      fontSize={12}
      fontWeight={isSelected ? 700 : 400}
      fill={isSelected ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)'}
      data-selected={isSelected || undefined}
    >
      {m}월
    </text>
  )
}
