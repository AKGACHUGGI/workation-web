import { describe, expect, it } from 'vitest'
import { parseMetrics, parsePreset, serializeMetrics } from '@/features/metric/params'

describe('parsePreset', () => {
  it('유효 값', () => {
    expect(parsePreset('quiet')).toBe('quiet')
    expect(parsePreset('lively')).toBe('lively')
    expect(parsePreset('custom')).toBe('custom')
  })
  it('무효 값은 null', () => {
    expect(parsePreset('party')).toBeNull()
    expect(parsePreset(null)).toBeNull()
  })
})

describe('parseMetrics', () => {
  it('중복 제거 + METRIC_KEYS 순서 정렬', () => {
    expect(parseMetrics('vibe,quiet,quiet')).toEqual(['quiet', 'vibe'])
    expect(parseMetrics('overnight,crowd,quiet')).toEqual(['quiet', 'crowd', 'overnight'])
  })
  it('모르는 키·빈 값·null 은 null', () => {
    expect(parseMetrics('quiet,foo')).toBeNull()
    expect(parseMetrics('')).toBeNull()
    expect(parseMetrics(null)).toBeNull()
  })
})

describe('serializeMetrics', () => {
  it('정렬·중복 제거해 직렬화', () => {
    expect(serializeMetrics(['vibe', 'quiet', 'quiet'])).toBe('quiet,vibe')
  })
})
