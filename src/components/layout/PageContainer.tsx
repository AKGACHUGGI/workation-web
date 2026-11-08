import type { ReactNode } from 'react'

type Props = { children: ReactNode; className?: string }

/** 1440 가운데 정렬, 최소 폭 1128 (그보다 좁으면 가로 스크롤) */
export default function PageContainer({ children, className = '' }: Props) {
  return (
    <div className={`max-w-page min-w-desktop mx-auto w-full px-10 ${className}`}>{children}</div>
  )
}
