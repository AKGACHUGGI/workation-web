import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/features/tier/api', () => ({
  fetchTier: vi.fn(async (month: string, scope: string) => ({ month, scope, items: [] })),
}))

import { fetchTier } from '@/features/tier/api'
import { tierKeys } from '@/features/tier/queryKeys'
import { useTierQuery } from '@/features/tier/useTierQuery'

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('useTierQuery', () => {
  it('fetchTier(month, scope) 로 불러온다', async () => {
    const { result } = renderHook(() => useTierQuery('2025-10', 'dong'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTier).toHaveBeenCalledWith('2025-10', 'dong')
    expect(result.current.data).toEqual({ month: '2025-10', scope: 'dong', items: [] })
  })

  it('쿼리 키는 [tier, { month, scope }]', () => {
    expect(tierKeys.list({ month: '2025-10', scope: 'sigungu' })).toEqual([
      'tier',
      { month: '2025-10', scope: 'sigungu' },
    ])
  })
})
