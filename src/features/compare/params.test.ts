import { describe, expect, it } from 'vitest'
import { parseDongsParam } from '@/features/compare/params'

const valid = new Set(['a', 'b', 'c', 'd'])

describe('parseDongsParam', () => {
  it('순서 유지, 중복 제거', () => {
    expect(parseDongsParam('b,a,b', valid)).toEqual({ ids: ['b', 'a'], dropped: [] })
  })
  it('4개 이상이면 앞 3개', () => {
    expect(parseDongsParam('a,b,c,d', valid).ids).toEqual(['a', 'b', 'c'])
  })
  it('유효 목록에 없는 id 는 제거하고 dropped 에 담는다', () => {
    expect(parseDongsParam('a,x,b,y', valid)).toEqual({ ids: ['a', 'b'], dropped: ['x', 'y'] })
  })
  it('validIds 가 없으면(응답 전) 검증하지 않는다', () => {
    expect(parseDongsParam('a,x')).toEqual({ ids: ['a', 'x'], dropped: [] })
  })
  it('null·빈 문자열·빈 항목', () => {
    expect(parseDongsParam(null, valid)).toEqual({ ids: [], dropped: [] })
    expect(parseDongsParam('', valid)).toEqual({ ids: [], dropped: [] })
    expect(parseDongsParam(',a,,', valid)).toEqual({ ids: ['a'], dropped: [] })
  })
})
