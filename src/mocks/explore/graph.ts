import type {
  DongGrades,
  DongTag,
  ExploreDong,
  ExploreGraphResponse,
  ExplorePlace,
} from '@/features/explore/types'
import { GRADES } from '@/features/metric/types'
import { DONG_BASE, SIGUNGU_BASE } from '@/mocks/explore/base.generated'
import type { DongBase } from '@/mocks/explore/base.generated'
import {
  COAST_KM_OVERRIDE,
  GRADE_OVERRIDE,
  PLACE_NAMES,
  PLACE_NOUN,
  PROVINCES,
  SIMILAR_OVERRIDE,
  TAG_TABLE,
} from '@/mocks/explore/table'
import { EXPLORE_TAGS } from '@/mocks/explore/tags'

const round5 = (n: number) => Math.round(n * 1e5) / 1e5

/** 동 중심 주변에 황금각으로 흩뿌린다 (bbox 반폭의 12~30%) */
function spread(d: DongBase, i: number) {
  const [west, south, east, north] = d.bbox
  const angle = i * 2.39996
  const r = 0.12 + 0.06 * (i % 4)
  return {
    lat: round5(d.center.lat + Math.sin(angle) * r * (north - south)),
    lng: round5(d.center.lng + Math.cos(angle) * r * (east - west)),
  }
}

function grades(id: string): DongGrades | null {
  if (id in GRADE_OVERRIDE) return GRADE_OVERRIDE[id]
  const n = Number(id.slice(5, 8))
  return { quiet: GRADES[n % 4], peer: GRADES[(n + 1) % 4], evening: GRADES[(n + 2) % 4] }
}

function coastKm(id: string, hasCoast: boolean): number | null {
  if (!hasCoast) return null
  return COAST_KM_OVERRIDE[id] ?? Number((0.2 + (Number(id.slice(5, 8)) % 8) / 10).toFixed(1))
}

/** 태그를 가장 많이 공유하는 다른 동 상위 5 (덮어쓰기 우선) */
function similarOf(id: string, all: Map<string, Set<string>>): string[] {
  if (SIMILAR_OVERRIDE[id]) return SIMILAR_OVERRIDE[id]
  const mine = all.get(id)
  if (!mine || mine.size === 0) return []
  return [...all.entries()]
    .filter(([other]) => other !== id)
    .map(([other, tags]) => ({ other, shared: [...tags].filter((t) => mine.has(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || a.other.localeCompare(b.other))
    .slice(0, 5)
    .map((x) => x.other)
}

function build(): ExploreGraphResponse {
  const tagSets = new Map(
    Object.entries(TAG_TABLE).map(([id, row]) => [id, new Set(Object.keys(row))] as const),
  )
  const places: ExplorePlace[] = []
  const dongs: ExploreDong[] = DONG_BASE.map((base) => {
    const row = TAG_TABLE[base.id] ?? {}
    const tags: DongTag[] = EXPLORE_TAGS.filter((t) => t.id in row).map((t, ti) => {
      const v = row[t.id]
      if (v === true) return { tagId: t.id, placeCount: null }
      const names = PLACE_NAMES[`${base.id}:${t.id}`] ?? []
      for (let i = 0; i < v; i++) {
        const pos = spread(base, ti * 7 + i)
        places.push({
          id: '',
          name: names[i] ?? `${base.name} ${PLACE_NOUN[t.id]} ${i + 1}`,
          dongId: base.id,
          lat: pos.lat,
          lng: pos.lng,
          tag: t.id,
          image: null,
        })
      }
      return { tagId: t.id, placeCount: v }
    })
    return {
      id: base.id,
      name: base.name,
      sigunguId: base.sigunguId,
      center: base.center,
      bbox: base.bbox,
      grades: grades(base.id),
      tags,
      coastKm: coastKm(base.id, 'coast' in row),
      similar: similarOf(base.id, tagSets),
    }
  })
  // TourAPI contentid 처럼 7자리 숫자 문자열. 같은 길이라 문자열 순 = 생성 순
  places.forEach((p, i) => (p.id = String(2_800_001 + i)))
  return {
    syncedAt: '2026-11-09T00:00:00+09:00',
    tags: EXPLORE_TAGS,
    provinces: PROVINCES,
    sigungu: SIGUNGU_BASE,
    dongs,
    places,
  }
}

/** GET /api/explore/graph mock. 시안용 예시 값 — 백엔드 API 준비 후 실제 응답으로 교체 */
export const exploreGraphMock: ExploreGraphResponse = build()
