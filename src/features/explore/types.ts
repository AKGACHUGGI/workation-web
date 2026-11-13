import type { Grade } from '@/features/metric/types'

export type LatLng = { lat: number; lng: number }
/** google.maps.LatLngBoundsLiteral 과 같은 모양 */
export type Bounds = { west: number; south: number; east: number; north: number }
/** [west, south, east, north] */
export type BBox = [number, number, number, number]
/** mocks/explore/base.generated.ts (scripts/gen-explore-base.py) 가 쓴다 */
export type ExploreSigungu = { id: string; name: string; provinceId: string; center: LatLng | null }

export type DayGroup = 'weekday' | 'weekend'
export type TypeName = '몰입형' | '네트워킹형' | '로컬살이형' | '장기체류형'
/** 백엔드 동점 순서와 같다 (몰입형 → 장기체류형) */
export const TYPE_NAMES: readonly TypeName[] = ['몰입형', '네트워킹형', '로컬살이형', '장기체류형']
export type LifeTag = '생활권' | '관광지'

/** GET /api/explore/sigungu/{id}/pins 의 동 하나 (스펙 §6-1) */
export type PinDong = {
  id: string
  name: string
  center: LatLng | null
  /** 관광공사 동 태그 id, 백엔드 순서. 핀 아이콘은 앞 2개 */
  tags: string[]
  topType: TypeName | null
  topScore: number | null
  coastal: boolean
  life: LifeTag | null
  grades: { quiet: Grade | null; evening: Grade | null }
}
export type PinsResponse = { sigunguId: string; dongs: PinDong[] }

export type GradeValue = { grade: Grade; score: number }
export type HourlyDay = {
  /** 0~23시 차량 이동 인구(명), 값 없는 시각은 null */
  driv: (number | null)[]
  peakHour: number | null
  quietHour: number | null
}
export type SimilarDong = {
  id: string
  name: string
  sigungu: string
  common: number
  /** 드문 공통 사실부터 최대 3개 */
  commonTop: string[]
  /** 상대 − 이 동 */
  diff: { quiet: number | null; peer: number | null; evening: number | null }
}

/** GET /api/explore/dongs/{id} (스펙 §6-2) */
export type DongDetail = {
  id: string
  name: string
  sigungu: { id: string; name: string }
  sido: string
  coastKm: number | null
  /** 4개, 점수 높은 순 */
  types: { name: TypeName; score: number; reason: string }[]
  grades: { quiet: GradeValue | null; peer: GradeValue | null; evening: GradeValue | null }
  hourly: Record<DayGroup, HourlyDay>
  /** raw = 1~12월 시군구 ease 원값, quiet = 원값 낮은 3개월(달 순) */
  months: { raw: (number | null)[]; quiet: number[]; basis: string }
  /** 0개 또는 3개 */
  briefing: string[]
  similar: SimilarDong[]
  syncedAt: string
}

/** ② 상세 칸 선택 */
export type DetailKind = 'hour' | 'month'
