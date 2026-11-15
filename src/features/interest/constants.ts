/** 반감기(일). 일주일 지나면 절반, 한 달이면 약 1/16 (근거: docs/superpowers/specs/2026-11-15-개인화-랭킹-가산점-근거.md) */
export const HALF_LIFE_DAYS = 7

/** 60일 지난 기록은 무게가 약 1/380 이라 버린다 (근거: docs/superpowers/specs/2026-11-15-개인화-랭킹-가산점-근거.md) */
export const MAX_AGE_DAYS = 60

/** 한 건 약 300바이트, 300건이면 약 90KB 로 localStorage 한도(약 5MB) 안에서 여유 */
export const MAX_EVENTS = 300

/** 새로고침·뒤로 가기 반복을 한 번으로 친다 (근거: docs/superpowers/specs/2026-11-15-개인화-랭킹-가산점-근거.md) */
export const DEDUP_MS = 30 * 60 * 1000

/** 가산점 상한, 100점 척도 (근거: docs/superpowers/specs/2026-11-15-개인화-랭킹-가산점-근거.md) */
export const BOOST_CAP = 15

/** 세 갈래 비중. 등급 변화가 직접 본 곳에서 나도록 장소를 가장 크게 둔다 (근거: docs/superpowers/specs/2026-11-15-개인화-랭킹-가산점-근거.md) */
export const MIX = { metric: 0.2, terrain: 0.1, place: 0.7 } as const

/** 장소 일치도 포화 분모: 1 - e^(-pw / PLACE_SAT). 조회 1건에 약 0.39 (근거: docs/superpowers/specs/2026-11-15-개인화-랭킹-가산점-근거.md) */
export const PLACE_SAT = 2

/** 조회는 검색보다 약한 의사 표시라 지표·지형 관심을 절반만 더한다 (근거: docs/superpowers/specs/2026-11-15-개인화-랭킹-가산점-근거.md) */
export const VIEW_SIGNAL = 0.5

/** 행정동 조회는 소속 시군구 관심으로 절반 친다 (근거: docs/superpowers/specs/2026-11-15-개인화-랭킹-가산점-근거.md) */
export const SIGUNGU_SHARE = 0.5

/** localStorage 키. 값은 { anonId: string; events: InterestEvent[] } */
export const STORAGE_KEY = 'workation.interest.v1'
