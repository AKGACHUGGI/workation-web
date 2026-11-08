import { beforeEach, describe, expect, it, vi } from 'vitest'
import { COMPARE_STORAGE_KEY, readStoredDongs, writeStoredDongs } from '@/features/compare/storage'

describe('compare storage', () => {
  beforeEach(() => localStorage.clear())

  it('없으면 빈 배열', () => {
    expect(readStoredDongs()).toEqual([])
  })
  it('쓰고 읽는다', () => {
    writeStoredDongs(['a', 'b'])
    expect(localStorage.getItem(COMPARE_STORAGE_KEY)).toBe('["a","b"]')
    expect(readStoredDongs()).toEqual(['a', 'b'])
  })
  it('깨진 JSON·배열 아님은 빈 배열', () => {
    localStorage.setItem(COMPARE_STORAGE_KEY, '{oops')
    expect(readStoredDongs()).toEqual([])
    localStorage.setItem(COMPARE_STORAGE_KEY, '{"a":1}')
    expect(readStoredDongs()).toEqual([])
    localStorage.setItem(COMPARE_STORAGE_KEY, '["a",1]')
    expect(readStoredDongs()).toEqual(['a'])
  })
  it('localStorage 가 던져도 죽지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota')
    })
    expect(() => writeStoredDongs(['a'])).not.toThrow()
  })
})
