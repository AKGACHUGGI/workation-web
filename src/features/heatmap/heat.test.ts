import { describe, expect, it } from 'vitest'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { heatGrades, heatValue } from '@/features/heatmap/heat'
import type { TierItem } from '@/features/tier/types'

const item: TierItem = {
  id: '51830',
  name: '양양군',
  province: '강원특별자치도',
  photoUrl: '',
  terrain: ['coast'],
  scores: { quiet: 60, crowd: 40, peer: 30, overnight: 90, vibe: 20 },
  inherited: [],
}

describe('heatValue', () => {
  it('value 는 composite', () => {
    expect(heatValue(item, 'value', PRESET_WEIGHTS.quiet)).toBeCloseTo(52.5)
  })
  it('지표는 scores[metric]', () => {
    expect(heatValue(item, 'quiet', PRESET_WEIGHTS.quiet)).toBe(60)
    expect(heatValue(item, 'peer', PRESET_WEIGHTS.quiet)).toBe(30)
  })
})

describe('heatGrades', () => {
  it('사분위 등급', () => {
    expect(heatGrades([4, 3, 2, 1])).toEqual(['S', 'A', 'B', 'C'])
  })
})
