import { useId } from 'react'

/** lucide Share2 와 같은 도형: 위 원 → 가운데 원 → 아래 원 순으로 물이 흐른다 */
const NODES = [
  { cx: 18, cy: 5 },
  { cx: 6, cy: 12 },
  { cx: 18, cy: 19 },
]
/** 다음 원이 이어서 차오르기까지의 간격(ms). 원 하나가 차는 시간은 index.css --animate-share-fill */
const STEP_MS = 180

/**
 * 공유 아이콘. lit 이 켜지면 위 원부터 위→아래로 차례로 채워지고(물이 타고 흐르는 느낌),
 * 꺼지면 한 번에 빠진다. 동작 줄이기면 전환 없이 색만 바뀐다
 */
export default function ShareFlowIcon({ lit, size = 18 }: { lit: boolean; size?: number }) {
  // url(#…) 참조에 안전하게 영숫자만 남긴다
  const id = `share-flow-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <defs>
        {NODES.map((n, i) => (
          <clipPath key={i} id={`${id}-${i}`}>
            <circle cx={n.cx} cy={n.cy} r={3} />
          </clipPath>
        ))}
      </defs>
      {NODES.map((n, i) => (
        <rect
          key={i}
          x={n.cx - 3}
          y={n.cy - 3}
          width={6}
          height={6}
          fill="currentColor"
          stroke="none"
          clipPath={`url(#${id}-${i})`}
          // 차오름은 keyframes(반짝 모션이 아이콘을 다시 그려도 처음부터 재생), 빠짐은 transition
          className={`transition-transform duration-200 motion-reduce:transition-none ${lit ? 'motion-safe:animate-share-fill' : ''}`}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'top',
            transform: lit ? 'scaleY(1)' : 'scaleY(0)',
            animationDelay: `${i * STEP_MS}ms`,
          }}
        />
      ))}
      {NODES.map((n, i) => (
        <circle key={i} cx={n.cx} cy={n.cy} r={3} />
      ))}
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  )
}
