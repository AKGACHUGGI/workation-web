import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { act, renderHook, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import ToastProvider from '@/components/ui/toast/ToastProvider'
import { indexGraph } from '@/features/explore/indexGraph'
import {
  sanitizeExploreParams,
  toggleTagList,
  useExploreState,
} from '@/features/explore/useExploreState'
import { exploreGraphMock } from '@/mocks/explore/graph'

const index = indexGraph(exploreGraphMock)
const JUMUNJIN = '5115025000'
const cafeOf = (dongId: string) =>
  exploreGraphMock.places.find((p) => p.dongId === dongId && p.tag === 'cafe')!.id

const fix = (qs: string, withIndex = true) =>
  sanitizeExploreParams(new URLSearchParams(qs), withIndex ? index : undefined)?.toString() ?? null

describe('sanitizeExploreParams', () => {
  it('정상 값이면 null', () => {
    expect(fix(`tags=cafe,beach&match=all&dong=${JUMUNJIN}&place=${cafeOf(JUMUNJIN)}`)).toBeNull()
  })
  it('모르는 태그 id 는 빼고, 4개 이상이면 tags 를 지운다', () => {
    expect(fix('tags=cafe,food')).toBe('tags=cafe')
    expect(fix('tags=cafe,beach,park,surf')).toBe('')
  })
  it('match 는 any|all 만', () => {
    expect(fix('match=some')).toBe('')
  })
  it('dong 없는 place 는 지운다 (그래프 없이도)', () => {
    expect(fix('place=2800001', false)).toBe('')
  })
  it('없는 dong 은 place 와 함께 지우고, 다른 동의 place 는 place 만 지운다', () => {
    expect(fix('dong=0000000000&place=2800001')).toBe('')
    expect(fix(`dong=${JUMUNJIN}&place=${cafeOf('5115066500')}`)).toBe(`dong=${JUMUNJIN}`)
  })
  it('그래프 전에는 dong id 를 건드리지 않는다', () => {
    expect(fix('dong=0000000000', false)).toBeNull()
  })
})

describe('toggleTagList', () => {
  it('추가·제거, 4번째는 limit', () => {
    expect(toggleTagList([], 'cafe')).toEqual(['cafe'])
    expect(toggleTagList(['cafe', 'beach'], 'cafe')).toEqual(['beach'])
    expect(toggleTagList(['cafe', 'beach', 'park'], 'surf')).toBe('limit')
  })
})

function setup(route: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ToastProvider>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </ToastProvider>
  )
  return renderHook(() => ({ s: useExploreState(index), loc: useLocation() }), { wrapper })
}

describe('useExploreState', () => {
  it('URL 을 읽고, 보정된 값만 돌려준다', () => {
    const { result } = setup('/explore?tags=cafe,food&place=2800001')
    expect(result.current.s.tags).toEqual(['cafe'])
    expect(result.current.s.place).toBeNull()
    expect(result.current.loc.search).toBe('?tags=cafe')
  })
  it('태그 토글은 replace, 4번째는 토스트', () => {
    const { result } = setup('/explore?tags=cafe,beach,park')
    act(() => result.current.s.toggleTag('surf'))
    expect(screen.getByRole('status')).toHaveTextContent('태그는 3개까지 고를 수 있어요')
    act(() => result.current.s.toggleTag('park'))
    expect(result.current.s.tags).toEqual(['cafe', 'beach'])
  })
  it('동·장소 진입은 push, 닫으면 한 단계 위', () => {
    const { result } = setup('/explore?tags=cafe')
    act(() => result.current.s.openDong(JUMUNJIN))
    expect(result.current.s.dong).toBe(JUMUNJIN)
    act(() => result.current.s.openPlace(cafeOf(JUMUNJIN), JUMUNJIN))
    expect(result.current.s.place).toBe(cafeOf(JUMUNJIN))
    act(() => result.current.s.closePlace())
    expect([result.current.s.dong, result.current.s.place]).toEqual([JUMUNJIN, null])
    act(() => result.current.s.closeDong())
    expect(result.current.s.dong).toBeNull()
    expect(result.current.s.tags).toEqual(['cafe'])
  })
  it('다른 동의 장소를 열면 dong 도 바꾼다', () => {
    const { result } = setup(`/explore?dong=${JUMUNJIN}`)
    act(() => result.current.s.openPlace(cafeOf('5115066500'), '5115066500'))
    expect(result.current.s.dong).toBe('5115066500')
  })
  it('match: all 은 쓰고 any 는 지운다', () => {
    const { result } = setup('/explore?tags=cafe,beach')
    act(() => result.current.s.setMatch('all'))
    expect(result.current.s.match).toBe('all')
    act(() => result.current.s.setMatch('any'))
    expect(result.current.loc.search).not.toContain('match')
  })
})
