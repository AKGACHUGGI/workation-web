import type { ReactNode } from 'react'
import { MapPin } from 'lucide-react'

type Props = { title?: string; children?: ReactNode; className?: string }

/**
 * 지도 키 없음·로드 실패 시 같은 크기의 회색 박스.
 * children 에 링크·버튼(W-01 히트맵 칩)이 올 수 있으므로 role="img" 가 아니라 이름 붙은 region 으로 둔다.
 */
export default function MapPlaceholder({
  title = '지도 키가 설정되지 않았습니다',
  children,
  className = '',
}: Props) {
  return (
    <section
      aria-label={title}
      className={`bg-bg-subtle border-border-default flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border p-6 text-center ${className}`}
    >
      <MapPin className="text-text-tertiary" size={24} aria-hidden />
      <span className="text-body-sm text-text-secondary font-medium">{title}</span>
      {children && <div className="text-caption-xs text-text-tertiary">{children}</div>}
    </section>
  )
}
