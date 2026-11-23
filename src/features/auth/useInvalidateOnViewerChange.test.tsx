import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AgeGroup } from '@/features/auth/ageGroup'
import type { Me } from '@/features/auth/types'
import {
  isScoreQuery,
  useInvalidateOnViewerChange,
} from '@/features/auth/useInvalidateOnViewerChange'
import { DUI } from '@/mocks/auth/me'

function user(id: string, ageGroup: AgeGroup | null): Me {
  return { ...DUI, id, ageGroup, needsOnboarding: false }
}

function setup(initial: Me | null | undefined) {
  const client = new QueryClient()
  const spy = vi.spyOn(client, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const view = renderHook(
    ({ me }: { me: Me | null | undefined }) => useInvalidateOnViewerChange(me),
    {
      initialProps: { me: initial },
      wrapper,
    },
  )
  return { spy, rerender: (me: Me | null | undefined) => view.rerender({ me }) }
}

describe('useInvalidateOnViewerChange', () => {
  it('does nothing on first resolved value', () => {
    const { spy, rerender } = setup(undefined)
    rerender(null)
    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('does nothing on first load as logged-in user', () => {
    const { spy, rerender } = setup(undefined)
    rerender(user('u1', '30s'))
    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('invalidates when age group set', () => {
    const { spy, rerender } = setup(user('u1', null))
    rerender(user('u1', '30s'))
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('invalidates on logout', () => {
    const { spy, rerender } = setup(user('u1', '30s'))
    rerender(null)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('ignores loading in between', () => {
    const { spy, rerender } = setup(user('u1', '30s'))
    rerender(undefined)
    rerender(user('u1', '30s'))
    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('isScoreQuery whitelist', () => {
    const yes: unknown[][] = [
      ['tier', { month: '2025-10', scope: 'sigungu' }],
      ['popular', { month: '2025-10' }],
      ['region', '51820', { month: '2025-10' }],
      ['dong', '5182025300', { month: '2025-10' }],
      ['me', 'favorites', { month: '2025-10' }],
    ]
    const no: unknown[][] = [
      ['auth', 'me'],
      ['region', '51820', 'notes', { sort: 'helpful' }],
      ['dong', '5182025300', 'poll', { month: '2025-10' }],
      ['me', 'favorites', 'ids'],
      ['geo', '51820'],
      ['explore', 'chat', '5182025300'],
    ]
    for (const k of yes) expect(isScoreQuery(k)).toBe(true)
    for (const k of no) expect(isScoreQuery(k)).toBe(false)
  })
})
