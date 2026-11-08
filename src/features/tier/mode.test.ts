import { describe, expect, it } from 'vitest'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { toTierMode } from '@/features/tier/mode'

describe('toTierMode', () => {
  it('개별 지표 탭', () => {
    expect(toTierMode('metric', 'quiet', ['quiet'], 'vibe')).toEqual({
      tab: 'metric',
      metric: 'vibe',
    })
  })
  it('프리셋', () => {
    expect(toTierMode('value', 'lively', ['quiet'], 'quiet')).toEqual({
      tab: 'value',
      weights: PRESET_WEIGHTS.lively,
    })
  })
  it('직접 설정은 선택 지표 같은 가중치 + selected', () => {
    expect(toTierMode('value', 'custom', ['quiet', 'vibe'], 'quiet')).toEqual({
      tab: 'value',
      weights: { quiet: 1, crowd: 0, peer: 0, overnight: 0, vibe: 1 },
      selected: ['quiet', 'vibe'],
    })
  })
})
