import type { ReactNode, Ref } from 'react'

type Props = {
  title: string
  titleId: string
  children: ReactNode
  id?: string
  ref?: Ref<HTMLElement>
}

/**
 * 상세 페이지 사이드바 채팅 카드 (동·시군구 공용). 계획 카드와 같은 껍데기로 그 아래에 두고,
 * 스크롤하면 헤더 아래에 붙는다. 화면 높이를 넘지 않게 해 넘치면 대화 목록이 줄어 그 안에서 스크롤된다
 */
export default function AskCard({ title, titleId, children, id, ref }: Props) {
  return (
    <section
      id={id}
      ref={ref}
      aria-labelledby={titleId}
      className="border-border-default bg-bg-surface shadow-float sticky top-24 flex max-h-[calc(100dvh-8rem)] scroll-mt-24 flex-col gap-4 rounded-xl border p-6"
    >
      <h2 id={titleId} className="text-heading-lg text-text-primary">
        {title}
      </h2>
      {children}
    </section>
  )
}
