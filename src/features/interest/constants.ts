/** 반감기(일). 일주일 지나면 절반, 한 달이면 약 1/16 이라 "지금 관심" 이 드러난다 (설계 5-3) */
export const HALF_LIFE_DAYS = 7

/** 60일 지난 기록은 무게가 약 1/380 이라 버려도 결과가 같다 */
export const MAX_AGE_DAYS = 60

/** 한 건 약 300바이트, 300건이면 약 90KB 로 localStorage 한도(약 5MB) 안에서 여유 */
export const MAX_EVENTS = 300

/** 새로고침·뒤로 가기 반복을 한 번으로 친다 (설계 5-2) */
export const DEDUP_MS = 30 * 60 * 1000

/** 가산점 상한, 100점 척도 (설계 5-4) */
export const BOOST_CAP = 15

/** 세 갈래 비중. 취향(지표)을 가장 크게, 직접 본 곳은 그다음, 지형은 지표와 겹치는 신호라 가장 작게 */
export const MIX = { metric: 0.5, terrain: 0.2, place: 0.3 } as const

/** 조회는 검색보다 약한 의사 표시라 지표·지형 관심을 절반만 더한다 */
export const VIEW_SIGNAL = 0.5

/** 행정동 조회는 소속 시군구 관심으로 절반 친다 (설계 5-2) */
export const SIGUNGU_SHARE = 0.5

/** localStorage 키. 값은 { anonId: string; events: InterestEvent[] } */
export const STORAGE_KEY = 'workation.interest.v1'
