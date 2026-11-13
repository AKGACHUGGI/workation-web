import { TAG_ORDER } from '@/features/explore/copy'
import { hashString } from '@/features/explore/hash'
import { TYPE_MIN, TYPE_NAMES } from '@/features/explore/types'
import type { LatLng, LifeTag, PinDong, PinsResponse, TypeName } from '@/features/explore/types'
import { GRADES } from '@/features/metric/types'
import type { Grade } from '@/features/metric/types'
import { DONG_BASE, SIGUNGU_BASE } from '@/mocks/explore/base.generated'
import { TAG_TABLE } from '@/mocks/explore/table'

type Row = [
  topType: TypeName | null,
  topScore: number | null,
  coastal: boolean,
  life: LifeTag,
  quiet: Grade,
  evening: Grade,
]

/** 강릉시 21동 실측 (2026-11-14 Supabase 읽기 전용, 유형 3개 · 기준 40. 유형 없음은 null) */
export const GANGNEUNG_PINS: Record<string, Row> = {
  '5115061500': ['로컬살이형', 90, false, '생활권', 'S', 'B'], // 강남동
  '5115034000': [null, null, true, '관광지', 'C', 'B'], // 강동면 (1위 32)
  '5115066500': ['네트워킹형', 74, true, '관광지', 'C', 'A'], // 경포동
  '5115055000': ['로컬살이형', 85, false, '생활권', 'A', 'A'], // 교1동
  '5115056000': ['로컬살이형', 64, false, '생활권', 'B', 'B'], // 교2동
  '5115033000': ['로컬살이형', 46, false, '관광지', 'B', 'B'], // 구정면
  '5115060000': ['로컬살이형', 97, false, '생활권', 'S', 'B'], // 내곡동
  '5115036000': [null, null, true, '관광지', 'C', 'B'], // 사천면 (1위 37)
  '5115064500': ['로컬살이형', 96, true, '생활권', 'S', 'B'], // 성덕동
  '5115031000': [null, null, false, '관광지', 'B', 'C'], // 성산면 (1위 38)
  '5115059000': ['몰입형', 63, true, '생활권', 'A', 'C'], // 송정동
  '5115037000': ['몰입형', 50, true, '관광지', 'A', 'B'], // 연곡면
  '5115035000': [null, null, true, '관광지', 'B', 'B'], // 옥계면 (1위 34)
  '5115054000': ['네트워킹형', 64, false, '관광지', 'C', 'B'], // 옥천동
  '5115032000': [null, null, false, '관광지', 'C', 'C'], // 왕산면 (1위 23)
  '5115025000': ['로컬살이형', 60, true, '생활권', 'B', 'A'], // 주문진읍
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

/** 실측이 없는 동: id 해시로 정한 시안용 값. 1위 20~94, 백엔드처럼 TYPE_MIN 미만이면 유형 없음 */
function seedPin(id: string, name: string, center: LatLng, tags: string[]): PinDong {
  const h = hashString(id)
  const best = 20 + (h % 75)
  const typed = best >= TYPE_MIN
  return {
    id,
    name,
    center,
    tags,
    topType: typed ? TYPE_NAMES[h % TYPE_NAMES.length] : null,
    topScore: typed ? best : null,
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
