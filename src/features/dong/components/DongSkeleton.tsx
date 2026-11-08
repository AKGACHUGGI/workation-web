/** 히어로·본문·사이드바 자리를 유지하는 로딩 스켈레톤 */
export default function DongSkeleton() {
  const block = 'bg-bg-subtle animate-pulse rounded-xl'
  return (
    <div aria-busy="true" aria-label="불러오는 중" className="flex flex-col gap-6">
      <div className={`${block} h-4 w-48`} />
      <div className={`${block} h-9 w-80`} />
      <div className={`${block} h-80 w-full`} />
      <div className="flex gap-8">
        <div className="flex flex-1 flex-col gap-6">
          <div className={`${block} h-48`} />
          <div className={`${block} h-72`} />
          <div className={`${block} h-32`} />
        </div>
        <div className={`${block} w-sidebar h-96 shrink-0`} />
      </div>
    </div>
  )
}
