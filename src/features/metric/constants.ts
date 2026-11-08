import type { MetricKey, Weights } from '@/features/metric/types'

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
