import { GRADES } from '@/features/metric/types'

/** 등급 섹션 4개 모양 로딩 */
export default function TierSkeleton() {
  return (
    <div aria-busy="true" aria-label="티어 불러오는 중" className="flex flex-col gap-4">
      {GRADES.map((g) => (
        <div key={g} className="bg-bg-subtle h-64 animate-pulse rounded-2xl" />
      ))}
    </div>
  )
}
