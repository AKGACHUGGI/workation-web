export const HEAT_METRICS = ['value', 'quiet', 'crowd', 'peer'] as const
export type HeatMetric = (typeof HEAT_METRICS)[number]

export const HEAT_METRIC_LABEL: Record<HeatMetric, string> = {
  value: '종합',
  quiet: '동네 조용함',
  crowd: '시기 여유',
  peer: '또래 밀도',
}
