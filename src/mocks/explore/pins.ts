import { TAG_ORDER } from '@/features/explore/copy'
import { hashString } from '@/features/explore/hash'
import { TYPE_NAMES } from '@/features/explore/types'
import type { LatLng, LifeTag, PinDong, PinsResponse, TypeName } from '@/features/explore/types'
import { GRADES } from '@/features/metric/types'
import type { Grade } from '@/features/metric/types'
import { DONG_BASE, SIGUNGU_BASE } from '@/mocks/explore/base.generated'
import { TAG_TABLE } from '@/mocks/explore/table'

type Row = [
  topType: TypeName,
  topScore: number,
  coastal: boolean,
  life: LifeTag,
  quiet: Grade,
  evening: Grade,
]

/** 강릉시 21동 실측 (graph_data, 2026-11-13 Supabase 읽기 전용 확인) */
export const GANGNEUNG_PINS: Record<string, Row> = {
  '5115061500': ['로컬살이형', 90, false, '생활권', 'S', 'B'], // 강남동
  '5115034000': ['장기체류형', 61, true, '관광지', 'C', 'B'], // 강동면
  '5115066500': ['네트워킹형', 74, true, '관광지', 'C', 'A'], // 경포동
  '5115055000': ['로컬살이형', 85, false, '생활권', 'A', 'A'], // 교1동
  '5115056000': ['로컬살이형', 64, false, '생활권', 'B', 'B'], // 교2동
  '5115033000': ['장기체류형', 61, false, '관광지', 'B', 'B'], // 구정면
  '5115060000': ['로컬살이형', 97, false, '생활권', 'S', 'B'], // 내곡동
  '5115036000': ['장기체류형', 61, true, '관광지', 'C', 'B'], // 사천면
  '5115064500': ['로컬살이형', 96, true, '생활권', 'S', 'B'], // 성덕동
  '5115031000': ['장기체류형', 61, false, '관광지', 'B', 'C'], // 성산면
  '5115059000': ['몰입형', 63, true, '생활권', 'A', 'C'], // 송정동
  '5115037000': ['장기체류형', 61, true, '관광지', 'A', 'B'], // 연곡면
  '5115035000': ['장기체류형', 61, true, '관광지', 'B', 'B'], // 옥계면
  '5115054000': ['네트워킹형', 64, false, '관광지', 'C', 'B'], // 옥천동
  '5115032000': ['장기체류형', 61, false, '관광지', 'C', 'C'], // 왕산면
  '5115025000': ['장기체류형', 61, true, '생활권', 'B', 'A'], // 주문진읍
  '5115052000': ['네트워킹형', 71, false, '관광지', 'C', 'A'], // 중앙동
  '5115058000': ['네트워킹형', 64, true, '관광지', 'C', 'B'], // 초당동
  '5115057100': ['로컬살이형', 89, false, '생활권', 'S', 'B'], // 포남1동
  '5115057200': ['로컬살이형', 87, true, '생활권', 'A', 'B'], // 포남2동
  '5115051000': ['로컬살이형', 88, false, '생활권', 'A', 'B'], // 홍제동
}

function tagsOf(id: string): string[] {
  const row = TAG_TABLE[id] ?? {}
  return TAG_ORDER.filter((t) => t in row)
}

/** 실측이 없는 동: id 해시로 정한 시안용 값 */
function seedPin(id: string, name: string, center: LatLng, tags: string[]): PinDong {
  const h = hashString(id)
  return {
    id,
    name,
    center,
    tags,
    topType: TYPE_NAMES[h % 4],
    topScore: 40 + (h % 55),
    coastal: tags.includes('coast'),
    life: h % 3 === 0 ? '관광지' : '생활권',
    grades: { quiet: GRADES[(h >>> 3) % 4], evening: GRADES[(h >>> 6) % 4] },
  }
}

function toPin(id: string, name: string, center: LatLng): PinDong {
  const tags = tagsOf(id)
  const row = GANGNEUNG_PINS[id]
  if (!row) return seedPin(id, name, center, tags)
  const [topType, topScore, coastal, life, quiet, evening] = row
  return { id, name, center, tags, topType, topScore, coastal, life, grades: { quiet, evening } }
}

/** GET /api/explore/sigungu/{id}/pins mock. 없는 시군구는 null (api 가 NotFoundError) */
export function pinsMock(sigunguId: string): PinsResponse | null {
  const dongs = DONG_BASE.filter((d) => d.sigunguId === sigunguId)
  if (dongs.length === 0) return null
  return { sigunguId, dongs: dongs.map((d) => toPin(d.id, d.name, d.center)) }
}

let cache: Map<string, PinDong> | null = null

/** 12개 시군구 동 전부 (동 상세 mock 의 비슷한 동 고르기용) */
export function allPins(): Map<string, PinDong> {
  cache ??= new Map(
    SIGUNGU_BASE.flatMap((s) => pinsMock(s.id)?.dongs ?? []).map((p) => [p.id, p] as const),
  )
  return cache
}
