import { describe, expect, it } from 'vitest'
import { reconcileSlots } from '@/features/compare/slots'

describe('reconcileSlots', () => {
  it('처음에는 앞에서부터 채운다', () => {
    expect(reconcileSlots([null, null, null], ['a', 'b'])).toEqual(['a', 'b', null])
  })

  it('지운 동의 칸은 빈 칸으로 남고 다른 동은 제자리', () => {
    expect(reconcileSlots(['a', 'b', 'c'], ['b', 'c'])).toEqual([null, 'b', 'c'])
  })

  it('새 동은 가장 앞 빈 칸을 채운다', () => {
    expect(reconcileSlots([null, 'b', null], ['b', 'd'])).toEqual(['d', 'b', null])
  })

  it('목록이 통째로 바뀌면 다시 앞에서부터', () => {
    expect(reconcileSlots(['a', 'b', null], ['x'])).toEqual(['x', null, null])
  })
})
