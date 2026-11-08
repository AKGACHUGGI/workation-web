import { describe, expect, it } from 'vitest'
import { parseHeatMetric, parseScope } from '@/features/heatmap/params'

describe('parseHeatMetric', () => {
  it('히트맵 칩 4개만 허용', () => {
    expect(parseHeatMetric('value')).toBe('value')
    expect(parseHeatMetric('peer')).toBe('peer')
    expect(parseHeatMetric('vibe')).toBeNull()
    expect(parseHeatMetric('overnight')).toBeNull()
    expect(parseHeatMetric(null)).toBeNull()
  })
})

describe('parseScope', () => {
  it('sigungu|dong', () => {
    expect(parseScope('dong')).toBe('dong')
    expect(parseScope('city')).toBeNull()
  })
})
