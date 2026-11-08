/** 로딩 중 레이아웃 자리 유지 (ReportPage 와 같은 틀: 카드 3 · 막대 차트 + 순위 480 · 진단) */
export default function ReportSkeleton() {
  const box = 'bg-bg-surface-strong animate-pulse rounded-xl'
  return (
    <div aria-busy="true" aria-label="리포트 불러오는 중" className="flex flex-col gap-6">
      <div className="flex gap-4">
        <div className={`${box} h-36 flex-1`} />
        <div className={`${box} h-36 flex-1`} />
        <div className={`${box} h-36 flex-1`} />
      </div>
      <div className="flex gap-6">
        <div className={`${box} h-80 flex-1`} />
        <div className={`${box} h-80 w-120 shrink-0`} />
      </div>
      <div className={`${box} h-48`} />
    </div>
  )
}
