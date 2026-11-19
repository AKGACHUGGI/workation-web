import { describe, expect, it } from 'vitest'
import { formatPeople, stayAxisMax, stayTicks } from '@/features/compare/stayScale'

describe('stayScale', () => {
  it('최대값을 깔끔한 수로 올린다', () => {
    expect(stayAxisMax([4321, 900])).toBe(6000)
    expect(stayAxisMax([8000])).toBe(8000)
    expect(stayAxisMax([12500])).toBe(20000)
    expect(stayAxisMax([95])).toBe(100)
    expect(stayAxisMax([])).toBeNull()
  })

  it('눈금은 4등분', () => {
    expect(stayTicks(8000)).toEqual([0, 2000, 4000, 6000, 8000])
  })

  it('만 단위는 소수 한 자리', () => {
    expect(formatPeople(12345)).toBe('1.2만')
    expect(formatPeople(20000)).toBe('2만')
    expect(formatPeople(4500)).toBe('4,500')
  })
})
