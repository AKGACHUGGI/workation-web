import type { MetricScores } from '@/features/metric/types'
import type { SeasonType } from '@/features/region/types'
import type { ReportPreset, ReportRankingItem } from '@/features/report/types'

/**
 * 시군구별 연간 원천값. 고성군(51820)은 분석 결과, 나머지는 **가상 값**(2차에 gen-mock.py 로 교체).
 * peak: 성수기 집중도 %, coef: 숙박 계수, scores: 연간 지표 백분위.
 * 12곳 peak 합 = 360 → 평균 30.
 * 가상 scores 는 고성군 진단 문장(51820.ts)의 순위와 맞춘다: 조용함 2위, 저녁 활기 11위, 또래 밀도 10위.
 */
export type SigunguBase = {
  name: string
  province: string
  peak: number
  coef: number
  scores: MetricScores
  seasonType: SeasonType
  /** 월별 방문 지수 (연중 최대 = 100). 없으면 seasonType 템플릿 사용 */
  months?: number[]
}

export const SIGUNGU_BASE: Record<string, SigunguBase> = {
  '51820': {
    name: '고성군',
    province: '강원특별자치도',
    peak: 35,
    coef: 0.98,
    scores: { quiet: 65, crowd: 45, peer: 35, overnight: 83, vibe: 20 },
    seasonType: 'second_half_rise',
    months: [53, 41, 41, 46, 60, 60, 80, 100, 52, 68, 52, 47],
  },
  '51830': {
    name: '양양군',
    province: '강원특별자치도',
    peak: 41,
    coef: 1.02,
    scores: { quiet: 80, crowd: 75, peer: 40, overnight: 92, vibe: 30 },
    seasonType: 'summer_beach',
  },
  '51210': {
    name: '속초시',
    province: '강원특별자치도',
    peak: 33,
    coef: 0.88,
    scores: { quiet: 55, crowd: 60, peer: 70, overnight: 58, vibe: 75 },
    seasonType: 'summer_beach',
  },
  '51150': {
    name: '강릉시',
    province: '강원특별자치도',
    peak: 32,
    coef: 0.85,
    scores: { quiet: 30, crowd: 20, peer: 65, overnight: 50, vibe: 70 },
    seasonType: 'summer_beach',
  },
  '51170': {
    name: '동해시',
    province: '강원특별자치도',
    peak: 30,
    coef: 0.6,
    scores: { quiet: 25, crowd: 35, peer: 45, overnight: 17, vibe: 40 },
    seasonType: 'summer_beach',
  },
  '52110': {
    name: '전주시',
    province: '전북특별자치도',
    peak: 23,
    coef: 0.48,
    scores: { quiet: 62, crowd: 85, peer: 90, overnight: 0, vibe: 95 },
    seasonType: 'spring_autumn',
  },
  '52140': {
    name: '정읍시',
    province: '전북특별자치도',
    peak: 25,
    coef: 0.52,
    scores: { quiet: 20, crowd: 65, peer: 38, overnight: 8, vibe: 25 },
    seasonType: 'spring_autumn',
  },
  '52800': {
    name: '부안군',
    province: '전북특별자치도',
    peak: 31,
    coef: 0.8,
    scores: { quiet: 40, crowd: 55, peer: 20, overnight: 42, vibe: 22 },
    seasonType: 'summer_beach',
  },
  '46150': {
    name: '순천시',
    province: '전라남도',
    peak: 26,
    coef: 0.62,
    scores: { quiet: 50, crowd: 70, peer: 55, overnight: 25, vibe: 50 },
    seasonType: 'spring_autumn',
  },
  '46770': {
    name: '고흥군',
    province: '전라남도',
    peak: 29,
    coef: 0.76,
    scores: { quiet: 15, crowd: 30, peer: 10, overnight: 33, vibe: 10 },
    seasonType: 'flat',
  },
  '50110': {
    name: '제주시',
    province: '제주특별자치도',
    peak: 27,
    coef: 0.92,
    scores: { quiet: 45, crowd: 50, peer: 85, overnight: 67, vibe: 90 },
    seasonType: 'flat',
  },
  '50130': {
    name: '서귀포시',
    province: '제주특별자치도',
    peak: 28,
    coef: 0.95,
    scores: { quiet: 60, crowd: 40, peer: 60, overnight: 75, vibe: 65 },
    seasonType: 'second_half_rise',
  },
}

/** 계절 유형별 월별 방문 지수 템플릿 (연중 최대 = 100) */
export const MONTH_TEMPLATE: Record<SeasonType, number[]> = {
  summer_beach: [40, 35, 38, 45, 55, 65, 90, 100, 60, 50, 42, 40],
  spring_autumn: [45, 50, 70, 100, 85, 60, 55, 58, 75, 95, 70, 48],
  second_half_rise: [53, 41, 41, 46, 60, 60, 80, 100, 52, 68, 52, 47],
  flat: [70, 68, 72, 75, 80, 78, 85, 100, 82, 80, 74, 72],
}

/** 프리셋별 연간 종합 순위표 (백엔드 계약: 월별 종합 점수 12개월 평균). quiet 는 스펙 §8, lively 는 가상 */
export const ANNUAL_RANKING: Record<ReportPreset, ReportRankingItem[]> = {
  quiet: [
    { id: '51830', name: '양양군', score: 57 },
    { id: '52110', name: '전주시', score: 56 },
    { id: '51210', name: '속초시', score: 54 },
    { id: '50110', name: '제주시', score: 51 },
    { id: '51820', name: '고성군', score: 48 },
    { id: '50130', name: '서귀포시', score: 48 },
    { id: '46150', name: '순천시', score: 47 },
    { id: '51150', name: '강릉시', score: 36 },
    { id: '52800', name: '부안군', score: 34 },
    { id: '51170', name: '동해시', score: 30 },
    { id: '52140', name: '정읍시', score: 27 },
    { id: '46770', name: '고흥군', score: 22 },
  ],
  lively: [
    { id: '52110', name: '전주시', score: 70 },
    { id: '50110', name: '제주시', score: 64 },
    { id: '50130', name: '서귀포시', score: 62 },
    { id: '51210', name: '속초시', score: 57 },
    { id: '51150', name: '강릉시', score: 55 },
    { id: '46150', name: '순천시', score: 55 },
    { id: '51820', name: '고성군', score: 47 },
    { id: '51170', name: '동해시', score: 45 },
    { id: '51830', name: '양양군', score: 43 },
    { id: '52800', name: '부안군', score: 41 },
    { id: '52140', name: '정읍시', score: 35 },
    { id: '46770', name: '고흥군', score: 17 },
  ],
}
