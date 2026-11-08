import type { MonthParam } from '@/features/metric/month'
import type { MetricScores } from '@/features/metric/types'
import type { TierItem, TierResponse, TierScope } from '@/features/tier/types'
import { SIGUNGU } from '@/mocks/sigungu'
import { DONG_ITEMS_2025_10 } from '@/mocks/tier/dong-2025-10'
import { deriveMonth } from '@/mocks/tier/generate'
import { SIGUNGU_ITEMS_2025_10 } from '@/mocks/tier/sigungu-2025-10'

/** scripts/gen-mock.py 출력 한 줄 */
type GeneratedRow = { id: string; name: string; sggId?: string; scores: MetricScores }

/** 생성 파일이 없으면 빈 객체. Vite 가 빌드 시점에 해석한다 */
const GENERATED = import.meta.glob<GeneratedRow[]>('./generated/*.json', {
  eager: true,
  import: 'default',
})

function fromGenerated(rows: GeneratedRow[], scope: TierScope): TierItem[] {
  return rows.flatMap((r) => {
    const sgg = SIGUNGU.find((s) => s.id === (scope === 'dong' ? r.sggId : r.id))
    if (!sgg) return []
    return [
      {
        id: r.id,
        name: r.name,
        province: sgg.province,
        sigungu: scope === 'dong' ? { id: sgg.id, name: sgg.name } : undefined,
        photoUrl: sgg.photoUrl,
        terrain: sgg.terrain,
        scores: r.scores,
        inherited: scope === 'dong' ? ['overnight' as const] : [],
      },
    ]
  })
}

/** mock 응답. 10월은 항상 수작업 픽스처(테스트·E2E 기준값), 나머지는 생성 파일 → 없으면 deriveMonth */
export function getTierMock(month: MonthParam, scope: TierScope): TierResponse {
  const base = scope === 'sigungu' ? SIGUNGU_ITEMS_2025_10 : DONG_ITEMS_2025_10
  if (month === '2025-10') return { month, scope, items: base }
  const generated = GENERATED[`./generated/${scope}-${month}.json`]
  const items = generated ? fromGenerated(generated, scope) : deriveMonth(base, month)
  return { month, scope, items }
}
