import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fetchDong, fetchPins } from '@/features/explore/api'
import { exploreKeys } from '@/features/explore/queryKeys'
import { useDongQuery } from '@/features/explore/useDongQuery'
import { usePinsQuery } from '@/features/explore/usePinsQuery'
import { NotFoundError } from '@/lib/errors'

function wrapper() {
  const client = new QueryClient()
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, Wrapper }
}

describe('exploreKeys', () => {
  it('스펙 §6-3 키', () => {
    expect(exploreKeys.pins('51150')).toEqual(['explore', 'pins', '51150'])
    expect(exploreKeys.dong('5115025000')).toEqual(['explore', 'dong', '5115025000'])
  })
})

describe('fetch (mock)', () => {
  it('핀·동 상세를 돌려준다', async () => {
    expect((await fetchPins('51150')).dongs).toHaveLength(21)
    expect((await fetchDong('5115025000')).name).toBe('주문진읍')
  })
  it('없는 id 는 NotFoundError', async () => {
    await expect(fetchPins('99999')).rejects.toBeInstanceOf(NotFoundError)
    await expect(fetchDong('0000000000')).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('usePinsQuery / useDongQuery', () => {
  it('null 이면 요청하지 않는다', () => {
    const { Wrapper } = wrapper()
    const { result } = renderHook(() => usePinsQuery(null), { wrapper: Wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
  it('받은 값은 staleTime Infinity 로 캐시', async () => {
    const { client, Wrapper } = wrapper()
    const { result } = renderHook(() => useDongQuery('5115025000'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(
      client
        .getQueryCache()
        .find({ queryKey: exploreKeys.dong('5115025000') })
        ?.isStale(),
    ).toBe(false)
  })
  it('404 는 다시 시도하지 않는다', async () => {
    const { Wrapper } = wrapper()
    const { result } = renderHook(() => usePinsQuery('99999'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.failureCount).toBe(1)
    expect(result.current.error).toBeInstanceOf(NotFoundError)
  })
})
