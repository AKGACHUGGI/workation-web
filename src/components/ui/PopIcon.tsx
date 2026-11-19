import type { ReactNode } from 'react'

/** 아이콘 둘레로 퍼지는 광채 8줄 (상하좌우 + 대각) */
const BURST_RAYS = [
  'M12 1v3',
  'M23 12h-3',
  'M12 23v-3',
  'M1 12h3',
  'M4 4l2 2',
  'M20 4l-2 2',
  'M20 20l-2-2',
  'M4 20l2-2',
]

/**
 * 아이콘 + 반짝 모션. pop 이 바뀔 때마다 다시 그려 움츠렸다 튕기고 광채가 퍼진다(0 이면 정지).
 * 동작 줄이기면 모션은 빼고 색만 바뀐다.
 */
export default function PopIcon({
  pop,
  className = '',
  children,
}: {
  pop: number
  /** 글자색 — 광채 줄도 이 색을 따른다 */
  className?: string
  children: ReactNode
}) {
  return (
    <span key={pop} className={`relative inline-flex ${className}`}>
      <span className={`inline-flex ${pop > 0 ? 'motion-safe:animate-icon-pop' : ''}`}>
        {children}
      </span>
      {pop > 0 && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden
          className="motion-safe:animate-icon-burst pointer-events-none absolute -inset-2 size-[calc(100%+1rem)] motion-reduce:hidden"
        >
          {BURST_RAYS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      )}
    </span>
  )
}
