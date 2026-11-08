import { describe, expect, it } from 'vitest'
import { parseSort, parseTerrain, serializeTerrain } from '@/features/popular/params'

describe('parseSort', () => {
  it('유효 값', () => {
    expect(parseSort('favorites')).toBe('favorites')
    expect(parseSort('views')).toBe('views')
    expect(parseSort('score')).toBe('score')
  })
  it('무효·null 은 null', () => {
    expect(parseSort('rating')).toBeNull()
    expect(parseSort(null)).toBeNull()
  })
})

describe('parseTerrain', () => {
  it('중복 제거 + 고정 순서', () => {
    expect(parseTerrain('city,coast,coast')).toEqual(['coast', 'city'])
  })
  it('빈 문자열은 빈 배열(유효)', () => {
    expect(parseTerrain('')).toEqual([])
  })
  it('모르는 값이 섞이면 null', () => {
    expect(parseTerrain('coast,sea')).toBeNull()
    expect(parseTerrain(null)).toBeNull()
  })
})

describe('serializeTerrain', () => {
  it('정렬해 직렬화', () => {
    expect(serializeTerrain(['city', 'mountain'])).toBe('mountain,city')
  })
})
