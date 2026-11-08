/** 열 단위 로딩 스켈레톤 */
export default function ColumnSkeleton() {
  return (
    <div
      data-testid="column-skeleton"
      className="border-border-default flex flex-col gap-4 rounded-2xl border p-4"
    >
      <div className="bg-bg-subtle h-6 w-1/2 animate-pulse rounded-md" />
      <div className="bg-bg-subtle h-4 w-1/3 animate-pulse rounded-md" />
      <div className="bg-bg-subtle h-40 animate-pulse rounded-xl" />
      <div className="bg-bg-subtle h-4 animate-pulse rounded-md" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-subtle h-16 animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  )
}
