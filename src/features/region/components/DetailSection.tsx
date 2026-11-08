import type { ReactNode } from 'react'

type Props = {
  title: ReactNode
  /** 제목 오른쪽 회색 캡션 (출처·정렬 기준) */
  caption?: ReactNode
  /** aria-labelledby 로 섹션 이름을 붙일 때 */
  titleId?: string
  children: ReactNode
  className?: string
}

/**
 * Figma W-03·W-04 본문 섹션 (§ 프레임). py 32 · 제목 18/28 Bold + 우측 12/16 캡션 · 내용 간격 16.
 * 섹션 사이 hairline 은 부모의 divide-y 가 그린다.
 */
export default function DetailSection({
  title,
  caption,
  titleId,
  children,
  className = '',
}: Props) {
  return (
    <section aria-labelledby={titleId} className={`flex flex-col gap-4 py-8 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 id={titleId} className="text-heading-lg text-text-primary">
          {title}
        </h2>
        {caption && (
          <span className="text-caption-xs text-text-tertiary text-right">{caption}</span>
        )}
      </div>
      {children}
    </section>
  )
}
