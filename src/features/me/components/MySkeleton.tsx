export default function MySkeleton() {
  return (
    <div aria-busy="true" aria-label="불러오는 중" className="flex flex-col gap-6">
      <div className="bg-bg-subtle h-28 animate-pulse rounded-2xl" />
      <div className="bg-bg-subtle h-9 w-80 animate-pulse rounded-lg" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-bg-subtle h-64 animate-pulse rounded-xl" />
          <div className="bg-bg-subtle h-40 animate-pulse rounded-xl" />
        </div>
        <div className="bg-bg-subtle h-96 animate-pulse rounded-xl" />
      </div>
    </div>
  )
}
