import { METRIC_LABEL } from '@/features/metric/constants'
import { metricGrade } from '@/features/metric/score'
import { METRIC_KEYS } from '@/features/metric/types'
import type { MetricKey } from '@/features/metric/types'
import { formatMonths } from '@/features/region/format'
import { overnightCopy } from '@/features/region/copy'
import type { SeasonType } from '@/features/region/types'
import type { ReportPreset, ReportResponse } from '@/features/report/types'
import { ANNUAL_RANKING, MONTH_TEMPLATE, SIGUNGU_BASE } from '@/mocks/report/base'

const IDS = Object.keys(SIGUNGU_BASE)
const TOTAL = IDS.length

/** 값 내림차순 순위 (1부터). 동점은 같은 순위 */
function rankOf(id: string, pick: (sid: string) => number): number {
  const mine = pick(id)
  return IDS.filter((sid) => pick(sid) > mine).length + 1
}

/** 순위 → 0~100 백분위 (1위 92, 2위 83 … 12위 0) */
function percentile(rank: number): number {
  return Math.round((100 * (TOTAL - rank)) / TOTAL)
}

function topMonths(months: number[]): number[] {
  return months
    .map((crowd, i) => ({ month: i + 1, crowd }))
    .sort((a, b) => b.crowd - a.crowd || a.month - b.month)
    .slice(0, 3)
    .map((m) => m.month)
    .sort((a, b) => a - b)
}

function narrative(seasonType: SeasonType, months: number[]): string {
  const top = formatMonths(topMonths(months))
  const low = months
    .map((c, i) => ({ c, m: i + 1 }))
    .filter((x) => x.c <= 50)
    .map((x) => x.m)
  const lowCopy = low.length
    ? `${formatMonths(low)}은 연중 최대의 절반 이하로, 비수기 체류 지원에 적합합니다.`
    : '연중 방문이 고르게 분포해 특정 비수기가 뚜렷하지 않습니다.'
  const head: Record<SeasonType, string> = {
    summer_beach: `${top}에 방문이 집중되는 여름 해변형입니다.`,
    spring_autumn: `${top}에 방문이 몰리는 봄·가을형입니다.`,
    second_half_rise: `7·8월 여름 성수기 뒤 10월에 다시 오르는 하반기 상승형입니다.`,
    flat: `${top}이 높지만 연중 편차가 작은 연중 평탄형입니다.`,
  }
  return `${head[seasonType]} ${lowCopy}`
}

/** 규칙 기반 진단 문장 (백엔드 템플릿을 흉내 냄). 디자인 검수 대상 */
function diagnosis(
  name: string,
  ranks: ReportResponse['metricRanks'],
  coef: number,
  peak: number,
  avg: number,
) {
  const strong = METRIC_KEYS.reduce((b, k) => (ranks[k].rank < ranks[b].rank ? k : b))
  const weak = METRIC_KEYS.reduce((w, k) => (ranks[k].rank > ranks[w].rank ? k : w))
  return {
    strength: `${METRIC_LABEL[strong]} ${ranks[strong].rank}위로 12곳 중 상위권이며, 숙박 계수 ${coef.toFixed(2)}로 ${overnightCopy(coef)} 유형입니다.`,
    weakness: `${METRIC_LABEL[weak]}이 ${ranks[weak].rank}위로 가장 약하고, 성수기 집중도 ${peak}%는 12곳 평균 ${avg}%${peak >= avg ? '보다 높아 특정 달에 방문이 쏠립니다' : '보다 낮아 성수기 효과가 작습니다'}.`,
    suggestion: `${name}은 ${METRIC_LABEL[strong]} 강점을 내세운 비수기 체류형 워케이션 프로그램이 적합하며, ${METRIC_LABEL[weak]} 보완 시 연간 순위 상승 여지가 있습니다.`,
  }
}

export function makeReportMock(id: string, preset: ReportPreset): ReportResponse | null {
  const base = SIGUNGU_BASE[id]
  if (!base) return null
  const months = base.months ?? MONTH_TEMPLATE[base.seasonType]
  const average = Math.round(IDS.reduce((s, sid) => s + SIGUNGU_BASE[sid].peak, 0) / TOTAL)
  const overnightRank = rankOf(id, (sid) => SIGUNGU_BASE[sid].coef)
  const overnightScore = percentile(overnightRank)
  const ranking = ANNUAL_RANKING[preset]
  const metricRanks = Object.fromEntries(
    METRIC_KEYS.map((k: MetricKey) => [
      k,
      { rank: rankOf(id, (sid) => SIGUNGU_BASE[sid].scores[k]), score: base.scores[k] },
    ]),
  ) as ReportResponse['metricRanks']

  return {
    id,
    name: base.name,
    province: base.province,
    year: 2025,
    preset,
    peakConcentration: {
      value: base.peak,
      topMonths: topMonths(months),
      average,
      rank: rankOf(id, (sid) => SIGUNGU_BASE[sid].peak),
      total: TOTAL,
    },
    overnight: { coef: base.coef, score: overnightScore, grade: metricGrade(overnightScore) },
    ranking: { rank: ranking.findIndex((r) => r.id === id) + 1, total: TOTAL, items: ranking },
    metricRanks,
    months: months.map((crowd, i) => ({ month: i + 1, crowd })),
    seasonType: base.seasonType,
    seasonNarrative: narrative(base.seasonType, months),
    diagnosis: diagnosis(base.name, metricRanks, base.coef, base.peak, average),
    generatedAt: '2026-11-07T00:00:00Z',
  }
}
