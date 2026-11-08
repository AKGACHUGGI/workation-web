import { METRIC_LABEL, PRESET_LABEL } from '@/features/metric/constants'
import { METRIC_KEYS } from '@/features/metric/types'
import type { MetricKey } from '@/features/metric/types'
import { overnightCopy, rankCopy } from '@/features/region/copy'
import { formatMonths } from '@/features/region/format'
import type { ReportPreset, ReportResponse } from '@/features/report/types'

type MetricRanks = ReportResponse['metricRanks']

export const PDF_FAIL_MESSAGE = 'PDF를 만들지 못했습니다. 잠시 후 다시 시도해 주세요'
export const REPORT_SOURCE_NOTE =
  '출처: LG U+ 유동인구·서비스인구 2025.1~12 (행정동 단위) · 원본 인구수는 표시하지 않고 지수·등급·상대순위만 제공 · 명세 F-10'
export const REPORT_DESCRIPTION =
  '시군구별 성수기 집중도, 숙박 성향, 대상 지역 대비 위치를 한 장으로 정리합니다. 2025년 연간 데이터 기준.'

export function reportFileName(name: string, year: number): string {
  return `${name}_진단리포트_${year}.pdf`
}

/** rank 가 가장 작은(좋은) 지표. 동점은 METRIC_KEYS 순서 */
export function strongestMetric(ranks: MetricRanks): MetricKey {
  return METRIC_KEYS.reduce((best, k) => (ranks[k].rank < ranks[best].rank ? k : best))
}

/** rank 가 가장 큰(나쁜) 지표. 동점은 METRIC_KEYS 순서 */
export function weakestMetric(ranks: MetricRanks): MetricKey {
  return METRIC_KEYS.reduce((worst, k) => (ranks[k].rank > ranks[worst].rank ? k : worst))
}

export function concentrationCopy(pc: ReportResponse['peakConcentration']): string {
  const dir = pc.value >= pc.average ? '높음' : '낮음'
  return `상위 3개월(${formatMonths(pc.topMonths)}) 방문인구 ÷ 연간 방문인구. ${pc.total}곳 평균 ${pc.average}%보다 집중도 ${dir} (${pc.rank}위)`
}

export function overnightSubtitle(coef: number): string {
  return `숙박 계수 ${coef.toFixed(2)} · 방문객 1명당 밤 체류 증가분 · 연간 기준. ${overnightCopy(coef)}`
}

export function positionCopy(preset: ReportPreset, ranks: MetricRanks): string {
  const strong = strongestMetric(ranks)
  const weak = weakestMetric(ranks)
  return `${PRESET_LABEL[preset]} 프리셋 연간 순위. ${METRIC_LABEL[strong]} ${ranks[strong].rank}위 · ${METRIC_LABEL[weak]} ${rankCopy(ranks[weak].score)}`
}

export function rankingCaption(preset: ReportPreset): string {
  return `종합 점수 · ${PRESET_LABEL[preset]} 프리셋 · 연간`
}
