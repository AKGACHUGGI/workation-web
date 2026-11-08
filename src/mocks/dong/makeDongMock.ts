import { normalizeActivityMix } from '@/features/dong/activity'
import type { ActivityKey, DayGroup, DongDetailResponse, QuieterTwin } from '@/features/dong/types'
import { monthNumber } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import type { SeasonType } from '@/features/region/types'
import { GEOJIN_2025_10 } from '@/mocks/dong/geojin-2025-10'
import { DONG_MANUAL } from '@/mocks/dong/manual'

type Base = {
  stats: DongDetailResponse['stats']
  shape: Record<DayGroup, { peak: number; low: number; lowValue: number }>
  activity: Record<ActivityKey, number>
  seasonType: SeasonType
  twins: QuieterTwin[]
}

/** 10월 기준값. 거진읍은 고정 픽스처에서 가져온다. */
const BASE: Record<string, Base> = {
  '5182025300': {
    stats: GEOJIN_2025_10.stats,
    shape: {
      weekday: { peak: 11, low: 3, lowValue: 48 },
      weekend: { peak: 13, low: 3, lowValue: 47 },
    },
    activity: GEOJIN_2025_10.activityMix,
    seasonType: 'second_half_rise',
    twins: GEOJIN_2025_10.quieterTwins,
  },
  '5182033000': {
    stats: {
      dayInflow: 0.92,
      localLife: 58,
      peerShare: 43,
      eveningVibe: 0.22,
      eveningSurplus: 0.92,
    },
    shape: {
      weekday: { peak: 12, low: 4, lowValue: 40 },
      weekend: { peak: 14, low: 4, lowValue: 36 },
    },
    activity: { eveningDowntown: 18, weekendTourist: 45, weekdayWork: 17, dawnResidential: 20 },
    seasonType: 'summer_beach',
    twins: [
      {
        id: '4677036000',
        name: '봉래면',
        sigunguId: '46770',
        sigunguName: '고흥군',
        similarity: 0.71,
        visitorRatio: 0.52,
        photoUrl: '/mock-photos/46770.jpg',
      },
      {
        id: '5214036000',
        name: '산내면',
        sigunguId: '52140',
        sigunguName: '정읍시',
        similarity: 0.64,
        visitorRatio: 0.44,
        photoUrl: '/mock-photos/52140.jpg',
      },
    ],
  },
  '5182034000': {
    stats: {
      dayInflow: 0.74,
      localLife: 71,
      peerShare: 45,
      eveningVibe: 0.2,
      eveningSurplus: 0.88,
    },
    shape: {
      weekday: { peak: 11, low: 3, lowValue: 50 },
      weekend: { peak: 13, low: 4, lowValue: 45 },
    },
    activity: { eveningDowntown: 22, weekendTourist: 30, weekdayWork: 26, dawnResidential: 22 },
    seasonType: 'second_half_rise',
    twins: [
      {
        id: '5117057000',
        name: '삼화동',
        sigunguId: '51170',
        sigunguName: '동해시',
        similarity: 0.7,
        visitorRatio: 0.7,
        photoUrl: '/mock-photos/51170.jpg',
      },
    ],
  },
  '5121053500': {
    stats: {
      dayInflow: 1.32,
      localLife: 66,
      peerShare: 48,
      eveningVibe: 0.31,
      eveningSurplus: 1.1,
    },
    shape: {
      weekday: { peak: 13, low: 4, lowValue: 30 },
      weekend: { peak: 15, low: 4, lowValue: 28 },
    },
    activity: { eveningDowntown: 34, weekendTourist: 20, weekdayWork: 31, dawnResidential: 15 },
    seasonType: 'flat',
    twins: [],
    // localLife 66 → localLifeGrade B (≥70 A 고정 경계). W-05 비교 열 기대값도 "66 B"
  },
  '5011062000': {
    stats: {
      dayInflow: 1.85,
      localLife: 71,
      peerShare: 57,
      eveningVibe: 0.52,
      eveningSurplus: 1.42,
    },
    shape: {
      weekday: { peak: 19, low: 5, lowValue: 22 },
      weekend: { peak: 20, low: 5, lowValue: 20 },
    },
    activity: { eveningDowntown: 46, weekendTourist: 16, weekdayWork: 28, dawnResidential: 10 },
    seasonType: 'flat',
    twins: [
      {
        id: '5013061000',
        name: '중문동',
        sigunguId: '50130',
        sigunguName: '서귀포시',
        similarity: 0.62,
        visitorRatio: 0.58,
        photoUrl: '/mock-photos/50130.jpg',
      },
    ],
  },
  '5013061000': {
    stats: {
      dayInflow: 1.21,
      localLife: 44,
      peerShare: 51,
      eveningVibe: 0.27,
      eveningSurplus: 1.05,
    },
    shape: {
      weekday: { peak: 14, low: 4, lowValue: 35 },
      weekend: { peak: 14, low: 4, lowValue: 33 },
    },
    activity: { eveningDowntown: 24, weekendTourist: 48, weekdayWork: 14, dawnResidential: 14 },
    seasonType: 'summer_beach',
    twins: [
      {
        id: '5182033000',
        name: '죽왕면',
        sigunguId: '51820',
        sigunguName: '고성군',
        similarity: 0.66,
        visitorRatio: 0.3,
        photoUrl: '/mock-photos/51820.jpg',
      },
    ],
  },
  // 거진읍 유사 동네 3곳. 이미 "더 조용한" 쪽이라 유사 동네는 없다
  '4677036000': {
    stats: {
      dayInflow: 0.58,
      localLife: 62,
      peerShare: 31,
      eveningVibe: 0.09,
      eveningSurplus: 0.7,
    },
    shape: {
      weekday: { peak: 11, low: 3, lowValue: 52 },
      weekend: { peak: 12, low: 3, lowValue: 50 },
    },
    activity: { eveningDowntown: 12, weekendTourist: 30, weekdayWork: 26, dawnResidential: 32 },
    seasonType: 'summer_beach',
    twins: [],
  },
  '5117057000': {
    stats: {
      dayInflow: 0.71,
      localLife: 68,
      peerShare: 35,
      eveningVibe: 0.14,
      eveningSurplus: 0.8,
    },
    shape: {
      weekday: { peak: 10, low: 3, lowValue: 45 },
      weekend: { peak: 13, low: 4, lowValue: 40 },
    },
    activity: { eveningDowntown: 14, weekendTourist: 34, weekdayWork: 27, dawnResidential: 25 },
    seasonType: 'spring_autumn',
    twins: [],
  },
  '5214036000': {
    stats: {
      dayInflow: 0.52,
      localLife: 74,
      peerShare: 28,
      eveningVibe: 0.07,
      eveningSurplus: 0.65,
    },
    shape: {
      weekday: { peak: 10, low: 2, lowValue: 55 },
      weekend: { peak: 14, low: 3, lowValue: 50 },
    },
    activity: { eveningDowntown: 8, weekendTourist: 30, weekdayWork: 22, dawnResidential: 40 },
    seasonType: 'spring_autumn',
    twins: [],
  },
}

/** 월에 따른 작은 결정적 변동 (10월·연간 = 0). -3 ~ +3. 5 와 7 이 서로소라 1~12월이 고르게 퍼진다 */
function monthShift(month: MonthParam): number {
  const n = monthNumber(month)
  if (n === null || n === 10) return 0
  return ((n * 5) % 7) - 3
}

/** 코사인 모양의 24시간 곡선. peak = 100, low = lowValue */
function curve(peak: number, low: number, lowValue: number): number[] {
  const out: number[] = []
  for (let h = 0; h < 24; h++) {
    // low → peak 로 가는 거리(0~12)를 0~π 로 매핑
    const d = Math.min(Math.abs(h - peak), 24 - Math.abs(h - peak)) // 0(피크)~12
    const t = d / 12 // 0~1
    const v = lowValue + (100 - lowValue) * (0.5 + 0.5 * Math.cos(Math.PI * t))
    out.push(Math.round(v))
  }
  out[peak] = 100
  out[low] = Math.min(out[low], lowValue)
  return out
}

const round2 = (v: number) => Math.round(v * 100) / 100

export function makeDongMock(id: string, month: MonthParam): DongDetailResponse {
  if (id === '5182025300' && month === '2025-10') return GEOJIN_2025_10
  const m = DONG_MANUAL[id]
  const b = BASE[id]
  const s = monthShift(month)
  const weekday = curve(
    b.shape.weekday.peak,
    b.shape.weekday.low,
    Math.max(10, b.shape.weekday.lowValue + s),
  )
  const weekend = curve(
    b.shape.weekend.peak,
    b.shape.weekend.low,
    Math.max(10, b.shape.weekend.lowValue + s),
  )
  return {
    id,
    name: m.name,
    sigungu: m.sigungu,
    province: m.province,
    kind: m.kind,
    tags: m.tags,
    photos: Array.from({ length: 5 }, () => ({ url: m.photoUrl })),
    landmarks: m.landmarks,
    accessNote: m.accessNote,
    month,
    stats: {
      dayInflow: round2(b.stats.dayInflow + s * 0.02),
      localLife: b.stats.localLife,
      peerShare: Math.max(0, Math.min(100, b.stats.peerShare + s)),
      eveningVibe: round2(b.stats.eveningVibe + s * 0.01),
      eveningSurplus: round2(b.stats.eveningSurplus + s * 0.02),
    },
    hourly: { weekday, weekend },
    peaks: {
      weekday: {
        peakHour: b.shape.weekday.peak,
        lowHour: b.shape.weekday.low,
        lowValue: weekday[b.shape.weekday.low],
      },
      weekend: {
        peakHour: b.shape.weekend.peak,
        lowHour: b.shape.weekend.low,
        lowValue: weekend[b.shape.weekend.low],
      },
    },
    activityMix: normalizeActivityMix(b.activity),
    seasonType: b.seasonType,
    quieterTwins: b.twins,
    bbox: m.bbox,
  }
}
