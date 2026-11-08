import type { ReactNode } from 'react'

type Props = {
  title: ReactNode
  /** 제목 오른쪽 보조 문구(캡션) 또는 버튼 */
  aside?: ReactNode
  children: ReactNode
}

/** 마이페이지 섹션 패널 (Figma W-08 v2 Panel/*): 테두리 · rounded-xl · p-5 · 제목 heading/lg */
export default function MePanel({ title, aside, children }: Props) {
  return (
    <section className="border-border-default bg-bg-surface flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading-lg text-text-primary">{title}</h2>
        {typeof aside === 'string' ? (
          <span className="text-caption-xs text-text-tertiary">{aside}</span>
        ) : (
          aside
        )}
      </div>
      {children}
    </section>
  )
}
