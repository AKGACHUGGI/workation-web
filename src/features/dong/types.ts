import type { MonthParam } from '@/features/metric/month'
import type { DongKind, SeasonType } from '@/features/region/types'

export const ACTIVITY_KEYS = [
  'eveningDowntown',
  'weekendTourist',
  'weekdayWork',
  'dawnResidential',
] as const
export type ActivityKey = (typeof ACTIVITY_KEYS)[number]

export type DayGroup = 'weekday' | 'weekend'

export type QuieterTwin = {
  id: string
  name: string
  sigunguId: string
  sigunguName: string
  similarity: number // 0~1, 소수 2자리
  visitorRatio: number // 대상 방문객 ÷ 현재 방문객, 소수 2자리 (< 1)
  photoUrl: string
}

/** GET /api/dongs/{dongId}?month= — 백엔드와의 계약 (스펙 §5-2) */
export type DongDetailResponse = {
  id: string
  name: string // 거진읍
  sigungu: { id: string; name: string }
  province: string
  kind: DongKind
  tags: string[] // ['해안']
  photos: { url: string; credit?: string }[]
  landmarks: string[] // 수동
  accessNote: string // 수동
  month: MonthParam
  stats: {
    dayInflow: number // 평일 낮 체류 ÷ 새벽 체류
    localLife: number // (거주+근무) ÷ 전체 × 100, 정수
    peerShare: number // 20~40대 방문 비율 %, 정수
    eveningVibe: number // 평일 저녁 보행 ÷ 평일 저녁 체류, 소수 2자리
    eveningSurplus: number // 실제 ÷ 예측 저녁 보행, 소수 2자리
  }
  hourly: Record<DayGroup, number[]> // 길이 24, 0~100, 두 배열 중 최대 = 100
  peaks: Record<DayGroup, { peakHour: number; lowHour: number; lowValue: number }>
  activityMix: Record<ActivityKey, number> // 정수, 합 100
  seasonType: SeasonType
  quieterTwins: QuieterTwin[] // 최대 3, 유사도 내림차순
  bbox: [number, number, number, number] // [minLng, minLat, maxLng, maxLat]
  special?: 'special_facility'
}
