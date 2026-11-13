import { describe, expect, it } from 'vitest'
import { hashString } from '@/features/explore/hash'

describe('hashString', () => {
  it('FNV-1a 32비트, 같은 문자열이면 같은 값', () => {
    expect(hashString('')).toBe(2166136261)
    expect(hashString('a')).toBe(0xe40c292c)
    expect(hashString('5115025000')).toBe(hashString('5115025000'))
    expect(hashString('5115025000')).not.toBe(hashString('5115037000'))
  })
})
