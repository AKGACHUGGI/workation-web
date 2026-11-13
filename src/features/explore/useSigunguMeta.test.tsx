import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSigunguMeta } from '@/features/explore/useSigunguMeta'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useSigunguMeta', () => {
  it('시군구 목록(tier mock)에서 이름·시도를 찾는다', async () => {
    const { result } = renderHook(() => useSigunguMeta('51150'), { wrapper })
    await waitFor(() =>
      expect(result.current).toEqual({ name: '강릉시', province: '강원특별자치도' }),
    )
  })
  it('sgg 가 없으면 null', () => {
    const { result } = renderHook(() => useSigunguMeta(null), { wrapper })
    expect(result.current).toBeNull()
  })
})
