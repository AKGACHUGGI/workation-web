export default function PopularSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6" aria-busy="true" aria-label="인기 지역 불러오는 중">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="border-border-default overflow-hidden rounded-xl border">
          <div className="bg-bg-subtle aspect-[4/3] animate-pulse" />
          <div className="flex flex-col gap-2 p-4">
            <div className="bg-bg-subtle h-5 w-2/3 animate-pulse rounded-md" />
            <div className="bg-bg-subtle h-4 w-1/2 animate-pulse rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
