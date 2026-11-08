import { MONTHS } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import type { PopularResponse } from '@/features/popular/types'
import { SIGUNGU } from '@/mocks/sigungu'
import { getTierMock } from '@/mocks/tier'
import { OCT_COUNTS } from '@/mocks/popular/counts'

/**
 * 인기 지역 mock. 점수는 tier mock(sigungu) 과 동일.
 * 10월은 스펙 §9 표, 다른 달은 월 인덱스에 따라 ±15% 안에서 결정적으로 흔든다 (순서가 달마다 조금 바뀌도록).
 */
export function getPopularMock(month: MonthParam): PopularResponse {
  const tier = getTierMock(month, 'sigungu')
  const mi = MONTHS.indexOf(month) // annual=0, 1월=1 … 12월=12
  const items = tier.items.map((t, i) => {
    const meta = SIGUNGU.find((s) => s.id === t.id)
    const base = OCT_COUNTS[t.id] ?? { favoriteCount: 100, viewCount: 1000 }
    const wobble = month === '2025-10' ? 1 : 1 + (((mi * 7 + i * 3) % 31) - 15) / 100
    return {
      id: t.id,
      name: t.name,
      province: t.province,
      photoUrl: t.photoUrl,
      tags: meta?.tags ?? [],
      terrain: t.terrain,
      scores: t.scores,
      favoriteCount: Math.round(base.favoriteCount * wobble),
      viewCount: Math.round(base.viewCount * wobble),
    }
  })
  return { month, asOf: '2025-12-31T00:00:00Z', items }
}
