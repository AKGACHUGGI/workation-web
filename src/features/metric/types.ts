export const METRIC_KEYS = ['quiet', 'crowd', 'peer', 'overnight', 'vibe'] as const
export type MetricKey = (typeof METRIC_KEYS)[number]

export const GRADES = ['S', 'A', 'B', 'C'] as const
export type Grade = (typeof GRADES)[number]

export const PRESET_KEYS = ['quiet', 'lively', 'custom'] as const
export type PresetKey = (typeof PRESET_KEYS)[number]

/** 지표별 점수 0~100 (같은 month·scope 안의 백분위) */
export type MetricScores = Record<MetricKey, number>
/** 지표별 가중치 (0 이상) */
export type Weights = Record<MetricKey, number>
