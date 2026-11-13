import type { Grade } from '@/features/metric/types'

export type LatLng = { lat: number; lng: number }
/** google.maps.LatLngBoundsLiteral 과 같은 모양 */
export type Bounds = { west: number; south: number; east: number; north: number }
/** [west, south, east, north] */
export type BBox = [number, number, number, number]
/** mocks/explore/base.generated.ts (scripts/gen-explore-base.py) 가 쓴다 */
export type ExploreSigungu = { id: string; name: string; provinceId: string; center: LatLng | null }

export type DayGroup = 'weekday' | 'weekend'
export type TypeName = '몰입형' | '네트워킹형' | '로컬살이형'
/** 백엔드 동점 순서와 같다 (몰입형 → 로컬살이형). 장기체류형은 2026-11-14 삭제 */
export const TYPE_NAMES: readonly TypeName[] = ['몰입형', '네트워킹형', '로컬살이형']
/** 대표 유형 기준 = 백엔드 derive.TYPE_MIN. 1위가 이보다 낮으면 API 가 topType·topScore 를 null 로 준다 (mock 이 쓴다) */
export const TYPE_MIN = 40
export type LifeTag = '생활권' | '관광지'

/** GET /api/explore/sigungu/{id}/pins 의 동 하나 (스펙 §6-1) */
export type PinDong = {
  id: string
  name: string
  center: LatLng | null
  /** 관광공사 동 태그 id, 백엔드 순서. 핀 아이콘은 앞 2개 */
  tags: string[]
  /** 1위 점수가 TYPE_MIN 미만이면 topType · topScore 모두 null (뚜렷한 유형 없음) */
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
  /** 3개, 점수 높은 순. 대표 유형이 없는 동도 3개 */
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

/** POST /api/explore/dongs/{id}/ask 의 source (물어보기 스펙 §5). guide = 답할 수 없는 질문 안내 */
export type AskSource = 'llm' | 'mixed' | 'rule' | 'guide'
/** POST /api/explore/dongs/{id}/ask 응답 (물어보기 스펙 §5) */
export type AskResponse = {
  question: string
  answer: string[]
  intents: string[]
  source: AskSource
  /** 다음에 누를 예시 질문 3개 */
  examples: string[]
}
/** retry = 네트워크·503 등(다시 시도), limit = 429, invalid = 400 */
export type AskErrorKind = 'retry' | 'limit' | 'invalid'
export type AskTurn =
  | { id: string; question: string; status: 'pending' }
  | { id: string; question: string; status: 'done'; answer: string[]; source: AskSource }
  | { id: string; question: string; status: 'error'; kind: AskErrorKind }
/** 동 하나의 대화 기록. 화면이 떠 있는 동안만 QueryClient 에 남는다 */
export type AskThread = { turns: AskTurn[]; examples: string[] }
