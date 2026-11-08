/** 열 단위 로딩 스켈레톤 (CompareColumn 과 같은 틀: 헤더 · 곡선 · 지표 4장 세로 · 요약) */
export default function ColumnSkeleton() {
  return (
    <div
      data-testid="column-skeleton"
      className="border-border-default flex flex-col gap-4 rounded-xl border p-5"
    >
      <div className="bg-bg-subtle h-7 w-1/2 animate-pulse rounded-md" />
      <div className="bg-bg-subtle h-4 w-1/3 animate-pulse rounded-md" />
      <div className="bg-bg-subtle h-44 animate-pulse rounded-xl" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-bg-subtle h-24 animate-pulse rounded-xl" />
      ))}
      <div className="bg-bg-subtle h-11 animate-pulse rounded-lg" />
    </div>
  )
}
