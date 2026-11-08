import {
  METRIC_DEFINITION,
  METRIC_LABEL,
  METRIC_SHORT_LABEL,
  PRESET_LABEL,
} from '@/features/metric/constants'
import type { Grade, MetricKey, PresetKey } from '@/features/metric/types'
import type { TierTab } from '@/features/tier/types'

export type TierCopyParams = {
  tab: TierTab
  preset: PresetKey
  metrics: MetricKey[]
  metric: MetricKey
}

export const TIER_RANGE: Record<Grade, string> = {
  S: '상위 25%',
  A: '상위 25~50%',
  B: '하위 25~50%',
  C: '하위 25%',
}

/** 개별 지표 S 등급 설명 (Figma 문구는 quiet. 나머지는 같은 형식, 디자인 검수 대상) */
const METRIC_TOP: Record<MetricKey, string> = {
  quiet: '동네 조용함 · 낮 유입 지수 낮음',
  crowd: '시기 여유 · 이 달 혼잡도 낮음',
  peer: '또래 밀도 · 20~40대 비중 높음',
  overnight: '숙박 성향 · 머무는 방문객 많음',
  vibe: '저녁 활기 · 저녁 유동 많음',
}

const METRIC_BOTTOM: Record<MetricKey, string> = {
  quiet: '낮에 사람이 몰리는 지역',
  crowd: '이 달 사람이 몰리는 지역',
  peer: '또래 비중이 낮은 지역',
  overnight: '당일 방문 위주 지역',
  vibe: '저녁이 한산한 지역',
}

/** 등급 패널 설명 (스펙 §6 TIER_COPY) */
export function tierDescription(p: TierCopyParams, grade: Grade): string {
  if (grade === 'A') return '평균 이상'
  if (grade === 'B') return '평균 이하'
  if (p.tab === 'metric') return grade === 'S' ? METRIC_TOP[p.metric] : METRIC_BOTTOM[p.metric]
  if (p.preset === 'custom') {
    const labels = p.metrics.map((k) => METRIC_SHORT_LABEL[k]).join(' · ')
    return grade === 'S' ? `직접 설정 종합 점수 (${labels})` : '선택한 조건과 거리 있음'
  }
  const label = PRESET_LABEL[p.preset]
  return grade === 'S' ? `${label} 프리셋 종합 점수` : `${label} 조건과 거리 있음`
}

const ABBR =
  '카드의 세부 등급은 조용 = 동네 조용함, 시기 = 시기 여유, 또래 = 또래 밀도, 숙박 = 숙박 성향, 활기 = 저녁 활기.'
const MASK = '마스킹 비율 30% 초과 행정동은 비공개.'
const group = (keys: MetricKey[]) => keys.map((k) => METRIC_LABEL[k]).join(' · ')

/** 하단 주석 (스펙 §3-6) */
export function tierFootnote(p: TierCopyParams): string {
  if (p.tab === 'metric') {
    return [
      '개별 지표 탭은 선택한 지표 하나의 백분위로 등급을 나눕니다.',
      `${METRIC_DEFINITION[p.metric]}.`,
      `동네 성격 그룹(${group(['quiet', 'peer', 'vibe'])})은 행정동 단위가 기본, 시기 · 체류 그룹(${group(['crowd', 'overnight'])})은 시군구 단위.`,
      MASK,
    ].join(' ')
  }
  if (p.preset === 'custom') {
    return [
      '직접 설정에서는 고른 지표만 같은 가중치로 평균해 등급을 나눕니다. 고르지 않은 지표의 세부 등급은 흐리게 표시.',
      ABBR,
      MASK,
    ].join(' ')
  }
  return [
    '등급은 선택한 프리셋의 종합 점수를 같은 단위 안에서 사분위로 나눈 것입니다.',
    ABBR,
    MASK,
  ].join(' ')
}
