import type { Grade, MetricKey } from '@/features/metric/types'
import type { SeasonType } from '@/features/region/types'

/** 이 화면은 custom 프리셋을 지원하지 않는다 */
export type ReportPreset = 'quiet' | 'lively'

export type ReportRankingItem = { id: string; name: string; score: number }

/** GET /api/reports/{sggId}?year=2025&preset=quiet */
export type ReportResponse = {
  id: string
  name: string
  province: string
  year: number
  preset: ReportPreset
  /** % 정수, 상위 3개월 방문인구 ÷ 연간 방문인구 */
  peakConcentration: {
    value: number
    topMonths: number[]
    average: number
    rank: number
    total: number
  }
  /** 연간 백분위 점수·등급 */
  overnight: { coef: number; score: number; grade: Grade }
  /** 프리셋 연간 종합(월별 점수 평균), 내림차순 */
  ranking: { rank: number; total: number; items: ReportRankingItem[] }
  /** 연간 지표별 순위·점수 (요약 카드 부제·진단 입력) */
  metricRanks: Record<MetricKey, { rank: number; score: number }>
  /** 12개, 연중 최대 = 100 */
  months: { month: number; crowd: number }[]
  seasonType: SeasonType
  seasonNarrative: string
  diagnosis: { strength: string; weakness: string; suggestion: string }
  generatedAt: string
}
