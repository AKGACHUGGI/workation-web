import { describe, expect, it } from 'vitest'
import {
  correctTierParams,
  parseMetricKey,
  parseScope,
  parseSgg,
  parseTab,
} from '@/features/tier/params'

describe('파서', () => {
  it('tab·scope·metric·sgg', () => {
    expect(parseTab('metric')).toBe('metric')
    expect(parseTab('foo')).toBeNull()
    expect(parseScope('dong')).toBe('dong')
    expect(parseScope('city')).toBeNull()
    expect(parseMetricKey('vibe')).toBe('vibe')
    expect(parseMetricKey('noise')).toBeNull()
    expect(parseSgg('all')).toBe('all')
    expect(parseSgg('51820')).toBe('51820')
    expect(parseSgg('5182')).toBeNull()
  })
})

describe('correctTierParams', () => {
  it('scope=dong & metric=overnight → metric=quiet', () => {
    const next = correctTierParams(new URLSearchParams('scope=dong&tab=metric&metric=overnight'))
    expect(next?.get('metric')).toBe('quiet')
    expect(next?.get('scope')).toBe('dong')
  })
  it('metrics 중복 제거·고정 순서 직렬화', () => {
    const next = correctTierParams(new URLSearchParams('preset=custom&metrics=vibe,quiet,quiet'))
    expect(next?.get('metrics')).toBe('quiet,vibe')
  })
  it('보정할 게 없으면 null', () => {
    expect(
      correctTierParams(new URLSearchParams('scope=dong&metric=quiet&metrics=quiet,vibe')),
    ).toBeNull()
    expect(correctTierParams(new URLSearchParams('metrics=foo'))).toBeNull()
  })
})
