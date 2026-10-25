const GRADES = [
  { grade: 'S', fg: 'text-grade-s-fg', bg: 'bg-grade-s-bg' },
  { grade: 'A', fg: 'text-grade-a-fg', bg: 'bg-grade-a-bg' },
  { grade: 'B', fg: 'text-grade-b-fg', bg: 'bg-grade-b-bg' },
  { grade: 'C', fg: 'text-grade-c-fg', bg: 'bg-grade-c-bg' },
]

/** W-01 홈. 아래는 토큰 적용 확인용 샘플이며 실제 화면 구현 시 교체합니다. */
export default function HomePage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <p className="font-display text-display-logo text-text-primary">워케이션맵</p>
      <h1 className="text-heading-2xl text-text-primary mt-2">디자인 토큰이 적용되었습니다</h1>
      <p className="text-body-base text-text-secondary mt-2">
        Figma 01 Foundations 의 Tokens 컬렉션과 동일한 값입니다. W-01 화면부터 구현을 시작하세요.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="bg-brand-primary text-body-sm text-text-inverse hover:bg-brand-hover rounded-lg px-5 py-3 font-medium"
        >
          Primary CTA
        </button>
        <span className="bg-selected-bg text-caption-segment text-selected-fg rounded-full px-4 py-2">
          선택된 칩
        </span>
        <span className="border-border-default text-caption-segment text-text-primary rounded-full border px-4 py-2">
          기본 칩
        </span>
        {GRADES.map(({ grade, fg, bg }) => (
          <span key={grade} className={`text-caption-badge rounded-md px-2 py-1 ${fg} ${bg}`}>
            {grade}
          </span>
        ))}
      </div>

      <div className="bg-bg-surface shadow-float mt-8 w-72 overflow-hidden rounded-xl">
        <div className="bg-bg-subtle aspect-[4/3]" />
        <div className="p-4">
          <p className="text-body-sm text-text-primary font-medium">고성 · 10월</p>
          <p className="text-caption-xs text-text-tertiary">조용함 · 또래 밀도 낮음</p>
          <p className="text-number-2xl text-text-primary mt-2">8.7</p>
        </div>
      </div>
    </section>
  )
}
