/** 로딩 중 레이아웃 자리 유지 */
export default function ReportSkeleton() {
  const box = 'bg-bg-surface-strong animate-pulse rounded-xl'
  return (
    <div aria-busy="true" aria-label="리포트 불러오는 중" className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-6">
        <div className={`${box} h-36`} />
        <div className={`${box} h-36`} />
        <div className={`${box} h-36`} />
      </div>
      <div className="grid grid-cols-5 gap-6">
        <div className={`${box} col-span-3 h-80`} />
        <div className={`${box} col-span-2 h-80`} />
      </div>
      <div className={`${box} h-48`} />
    </div>
  )
}
