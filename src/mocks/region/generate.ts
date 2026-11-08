import type { MonthParam } from '@/features/metric/month'
import { monthNumber } from '@/features/metric/month'
import type { RegionDetailResponse, RegionDong } from '@/features/region/types'
import { SIGUNGU_MANUAL } from '@/mocks/region/manual'
import { getTierMock } from '@/mocks/tier'

/** 문자열 → 0~1 결정적 난수 (같은 id·month 는 항상 같은 값) */
function seeded(key: string): () => number {
  let h = 2166136261
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

const SEASON_BASE: Record<string, number[]> = {
  summer_beach: [40, 35, 40, 50, 60, 70, 95, 100, 60, 55, 45, 42],
  spring_autumn: [45, 48, 70, 95, 85, 60, 55, 60, 70, 100, 80, 50],
  second_half_rise: [53, 41, 41, 46, 60, 60, 80, 100, 52, 68, 52, 47],
  flat: [80, 78, 85, 90, 92, 88, 95, 100, 90, 92, 85, 82],
}

function topN(values: number[], n: number, dir: 'asc' | 'desc'): number[] {
  return values
    .map((v, i) => ({ v, m: i + 1 }))
    .sort((a, b) => (dir === 'asc' ? a.v - b.v : b.v - a.v))
    .slice(0, n)
    .map((x) => x.m)
    .sort((a, b) => a - b)
}

/**
 * 수작업 픽스처가 없는 시군구·월 조합용. scripts/gen-mock.py 가 실제 CSV 로 대체할 때까지 쓴다.
 * 월 간 일관성: stats 외 값(months·dongs 목록)은 month 와 무관하게 id 만으로 결정한다.
 * dongs 의 id·이름은 W-02 DONG_ITEMS_2025_10(시군구별 3~26개), quietScore 는 같은 달 W-02 행정동 mock 의 quiet.
 */
export function makeRegionMock(id: string, month: MonthParam): RegionDetailResponse {
  const m = SIGUNGU_MANUAL[id]
  const rnd = seeded(id)
  const base = SEASON_BASE[m.seasonType]
  const months = base.map((crowd, i) => ({
    month: i + 1,
    crowd: Math.min(100, Math.round(crowd + rnd() * 6 - 3)),
  }))
  const max = Math.max(...months.map((x) => x.crowd))
  const norm = months.map((x) => ({ month: x.month, crowd: Math.round((x.crowd / max) * 100) }))
  const n = monthNumber(month)
  const crowdIndex =
    n === null ? Math.round(norm.reduce((s, x) => s + x.crowd, 0) / 12) : norm[n - 1].crowd

  // 동 id·이름·quietScore 는 W-02 행정동 mock 과 같은 값을 쓴다 → 행 클릭 시 W-04 /dongs/:id 와 이어지고
  // 순위·점수가 W-02 행정동 탭과 일치한다. (같은 달 getTierMock 결과에서 이 시군구 소속만 고른다)
  const peakMonth = topN(
    norm.map((x) => x.crowd),
    1,
    'desc',
  )[0]
  const dongItems = getTierMock(month, 'dong').items.filter((it) => it.sigungu?.id === id)
  const dongs: RegionDong[] = dongItems.map((it, i) => ({
    id: it.id,
    name: it.name,
    kind: i % 2 === 0 ? 'living' : 'tourist',
    landmark: `${m.name} ${it.name} 중심지`,
    quietScore: it.scores.quiet,
    peakMonth,
    crowdOfPeak: n === null ? 100 : Math.max(20, Math.round(norm[n - 1].crowd - rnd() * 15)),
  }))

  return {
    id,
    name: m.name,
    province: m.province,
    tags: m.tags,
    seasonType: m.seasonType,
    photos: m.photos,
    month,
    stats: {
      crowdIndex,
      dayInflow: Number((0.6 + rnd() * 0.7).toFixed(2)),
      quietRank: 1 + Math.floor(rnd() * 12),
      peerShare: Math.round(30 + rnd() * 25),
      overnightCoef: Number((0.5 + rnd() * 0.5).toFixed(2)),
      weekendRatio: Number((0.85 + rnd() * 0.45).toFixed(2)),
    },
    months: norm,
    bestMonths: topN(
      norm.map((x) => x.crowd),
      2,
      'asc',
    ),
    avoidMonths: topN(
      norm.map((x) => x.crowd),
      2,
      'desc',
    ),
    peerOffpeakMonths: topN(
      norm.map((x) => x.crowd),
      2,
      'asc',
    ),
    dongs: [...dongs].sort((a, b) => b.quietScore - a.quietScore),
    excludedDongs: [],
    links: m.links,
  }
}
