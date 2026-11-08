import type { MetricKey, PresetKey, Weights } from '@/features/metric/types'

/** 화면 라벨. 옛 라벨(비혼잡·한적함·야간 활동·장기체류 적합도)은 쓰지 않는다. */
export const METRIC_LABEL: Record<MetricKey, string> = {
  quiet: '동네 조용함',
  crowd: '시기 여유',
  peer: '또래 밀도',
  overnight: '숙박 성향',
  vibe: '저녁 활기',
}

export type MetricGroup = 'character' | 'timing'
export const METRIC_GROUP: Record<MetricKey, MetricGroup> = {
  quiet: 'character',
  peer: 'character',
  vibe: 'character',
  crowd: 'timing',
  overnight: 'timing',
}
export const METRIC_GROUP_LABEL: Record<MetricGroup, string> = {
  character: '동네 성격',
  timing: '시기 · 체류',
}

/** 프리셋 가중치 (순서 quiet·crowd·peer·overnight·vibe). custom 은 W-02 의 customWeights() 로 만든다. */
export const PRESET_WEIGHTS: Record<'quiet' | 'lively', Weights> = {
  quiet: { quiet: 3, crowd: 3, peer: 1, overnight: 1, vibe: 0 },
  lively: { quiet: 0, crowd: 1, peer: 3, overnight: 2, vibe: 3 },
}

/** 카드 세부 등급 칩용 짧은 라벨 */
export const METRIC_SHORT_LABEL: Record<MetricKey, string> = {
  quiet: '조용',
  crowd: '시기',
  peer: '또래',
  overnight: '숙박',
  vibe: '활기',
}

/** 하단 주석용 한 줄 정의 */
export const METRIC_DEFINITION: Record<MetricKey, string> = {
  quiet: '동네 조용함 = 평일 낮 체류 ÷ 새벽 체류, 낮을수록 조용',
  crowd: '시기 여유 = 이 달 혼잡도, 낮을수록 여유',
  peer: '또래 밀도 = 20~40대 방문 비중, 높을수록 또래가 많음',
  overnight: '숙박 성향 = 시군구 숙박 계수, 높을수록 머무는 방문객이 많음',
  vibe: '저녁 활기 = 평일 저녁 유동 ÷ 평일 저녁 체류, 높을수록 활기',
}

export const PRESET_LABEL: Record<PresetKey, string> = {
  quiet: '조용한 곳',
  lively: '활기 있는 한 달',
  custom: '직접 설정',
}
