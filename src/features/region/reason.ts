import type { Grade } from '@/features/metric/types'
import { formatMonths } from '@/features/region/format'

/** 2차에 LLM 문장으로 교체할 수 있도록 입력을 하나의 객체로 모은다 */
export type ReasonInput = {
  monthLabel: string // '10월' | '연간'
  presetLabel: string
  composite: number // 반올림된 종합 점수
  rank: number
  total: number
  grade: Grade
  overnightCoef: number
  dayInflow: number
  crowdIndex: number
  crowdGrade: Grade
  bestMonths: number[]
  peerOffpeakMonths: number[]
}

/** 규칙 기반 템플릿(MVP). 문장 4개 */
export function buildReason(i: ReasonInput): string[] {
  const coef = i.overnightCoef.toFixed(2)
  const inflow = i.dayInflow.toFixed(2)

  const s1 = `${i.monthLabel} ${i.presetLabel} 프리셋 종합 ${i.composite}점으로 ${i.total}곳 중 ${i.rank}위(${i.grade})입니다.`

  const s2 =
    i.overnightCoef >= 0.9
      ? `숙박 계수 ${coef}로 방문객 대부분이 밤에도 머무는 숙박형 지역이고,`
      : i.overnightCoef >= 0.7
        ? `숙박 계수 ${coef}로 숙박과 당일 방문이 섞여 있고,`
        : `숙박 계수 ${coef}로 당일 방문 비중이 큰 지역이고,`

  const s3 =
    i.dayInflow < 0.8
      ? `낮 유입 지수 ${inflow}로 근무 시간에 사람이 몰리지 않습니다.`
      : i.dayInflow <= 1.0
        ? `낮 유입 지수 ${inflow}로 낮 인구 변화가 크지 않습니다.`
        : `낮 유입 지수 ${inflow}로 낮에 사람이 몰리는 편입니다.`

  const s4 =
    i.crowdGrade === 'S' || i.crowdGrade === 'A'
      ? `${i.monthLabel}은 연중 최대의 ${i.crowdIndex}%로 한산한 편입니다.`
      : `다만 ${i.monthLabel} 혼잡은 연중 최대의 ${i.crowdIndex}%로 시기 여유는 ${i.crowdGrade}입니다. 더 한산한 때를 원하면 ${formatMonths(i.bestMonths)}, 또래가 많으면서 덜 붐비는 때는 ${formatMonths(i.peerOffpeakMonths)}입니다.`

  return [s1, s2, s3, s4]
}
