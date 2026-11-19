import { GRADES } from '@/features/metric/types'

/** 등급 섹션 4개 모양 로딩 (제목 줄 + 사진 카드 4개) */
export default function TierSkeleton() {
  return (
    <div aria-busy="true" aria-label="랭킹 불러오는 중" className="flex flex-col gap-12">
      {GRADES.map((g) => (
        <div key={g} className="flex flex-col gap-6">
          <div className="bg-bg-surface-strong h-7 w-40 animate-pulse rounded-lg" />
          <div className="grid grid-cols-4 gap-x-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="bg-bg-surface-strong aspect-4/3 animate-pulse rounded-xl" />
                <div className="bg-bg-surface-strong h-4 w-2/3 animate-pulse rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
