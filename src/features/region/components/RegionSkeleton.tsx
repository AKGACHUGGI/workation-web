/** 히어로·사이드바 자리를 유지하는 스켈레톤 */
export default function RegionSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="불러오는 중">
      <div className="bg-bg-subtle h-4 w-48 animate-pulse rounded" />
      <div className="bg-bg-subtle h-10 w-80 animate-pulse rounded" />
      <div className="bg-bg-subtle aspect-[16/6] w-full animate-pulse rounded-xl" />
      <div className="flex gap-8">
        <div className="flex flex-1 flex-col gap-6">
          <div className="bg-bg-subtle h-40 animate-pulse rounded-2xl" />
          <div className="bg-bg-subtle h-32 animate-pulse rounded-2xl" />
          <div className="bg-bg-subtle h-56 animate-pulse rounded-2xl" />
        </div>
        <div className="bg-bg-subtle w-sidebar h-96 animate-pulse rounded-2xl" />
      </div>
    </div>
  )
}
