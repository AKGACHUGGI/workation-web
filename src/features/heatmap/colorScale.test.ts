import { describe, expect, it } from 'vitest'
import { HEAT_BG, colorScale } from '@/features/heatmap/colorScale'

describe('colorScale', () => {
  it('0~100 을 7단계로', () => {
    expect(colorScale(0)).toBe(100)
    expect(colorScale(14)).toBe(100)
    expect(colorScale(15)).toBe(200)
    expect(colorScale(50)).toBe(400)
    expect(colorScale(85)).toBe(600)
    expect(colorScale(86)).toBe(700)
    expect(colorScale(100)).toBe(700)
  })
  it('범위 밖은 양 끝으로', () => {
    expect(colorScale(-5)).toBe(100)
    expect(colorScale(140)).toBe(700)
  })
  it('단계마다 Tailwind 클래스가 있다', () => {
    expect(HEAT_BG[400]).toBe('bg-heat-400')
  })
})
