type Props = {
  className?: string
  /** base: 패널(gray/100), map: 지도 위(gray/300 — 땅 색 위에서 보이게) */
  tone?: 'base' | 'map'
  /** box: radius/sm, pill: 칩·핀, circle: 노드·링, card: ② 칩(radius/lg), slot: ② 상세 칸(radius/xl) */
  shape?: 'box' | 'pill' | 'circle' | 'card' | 'slot'
}

const SHAPE = {
  box: 'rounded-sm',
  pill: 'rounded-full',
  circle: 'rounded-full',
  card: 'rounded-lg',
  slot: 'rounded-xl',
} as const

/** Figma Explore/Skeleton/Block 429:9357. 글자 없이 실제 요소와 같은 자리·크기로 둔다 (스펙 §9-1) */
export default function Block({ className = '', tone = 'base', shape = 'box' }: Props) {
  const bg = tone === 'map' ? 'bg-explore-skeleton-map' : 'bg-explore-skeleton-base'
  return (
    <div
      aria-hidden
      data-skeleton
      className={`${bg} skeleton-shine ${SHAPE[shape]} ${className}`}
    />
  )
}
