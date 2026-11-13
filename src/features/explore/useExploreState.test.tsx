import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { exploreKeys } from '@/features/explore/queryKeys'
import { sanitizeExploreParams, useExploreState } from '@/features/explore/useExploreState'

const JUMUNJIN = '5115025000'
const NOHAK = '5121057000' // 속초시

const fix = (qs: string, check?: Parameters<typeof sanitizeExploreParams>[1]) =>
  sanitizeExploreParams(new URLSearchParams(qs), check)?.toString() ?? null

describe('sanitizeExploreParams', () => {
  it('정상 값이면 null', () => {
    expect(fix(`sgg=51150&dong=${JUMUNJIN}`, { dongIds: new Set([JUMUNJIN]) })).toBeNull()
    expect(fix('')).toBeNull()
  })
  it('sgg 없는 dong 은 지운다', () => {
    expect(fix(`dong=${JUMUNJIN}`)).toBe('')
  })
  it('없는 시군구면 sgg·dong 을 지운다', () => {
    expect(fix(`sgg=99999&dong=${JUMUNJIN}`, { sggMissing: true })).toBe('')
  })
  it('다른 시군구의 dong 은 dong 만 지운다', () => {
    expect(fix(`sgg=51150&dong=${NOHAK}`, { dongIds: new Set([JUMUNJIN]) })).toBe('sgg=51150')
  })
  it('핀을 받기 전에는 dong id 를 건드리지 않는다', () => {
    expect(fix(`sgg=51150&dong=0000000000`)).toBeNull()
  })
  it('빈 값은 없는 것으로 본다', () => {
    expect(fix('sgg=&dong=')).toBe('')
  })
})

function setup(route: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  const hook = renderHook(
    () => ({ s: useExploreState(), loc: useLocation(), navigate: useNavigate() }),
    { wrapper },
  )
  return { ...hook, client }
}

describe('useExploreState', () => {
  it('sgg 없는 dong 은 바로 지운다 (replace)', () => {
    const { result } = setup(`/explore?dong=${JUMUNJIN}`)
    expect(result.current.s.dong).toBeNull()
    expect(result.current.loc.search).toBe('')
  })
  it('없는 시군구 → 핀 404 뒤 sgg·dong 지움', async () => {
    const { result } = setup(`/explore?sgg=99999&dong=${JUMUNJIN}`)
    await waitFor(() => expect(result.current.loc.search).toBe(''))
    expect(result.current.s.sgg).toBeNull()
  })
  it('다른 시군구의 dong → 핀을 받은 뒤 dong 만 지움', async () => {
    const { result } = setup(`/explore?sgg=51150&dong=${NOHAK}`)
    await waitFor(() => expect(result.current.loc.search).toBe('?sgg=51150'))
    expect(result.current.s.dong).toBeNull()
  })
  it('정상 URL 은 그대로', async () => {
    const { result, client } = setup(`/explore?sgg=51150&dong=${JUMUNJIN}`)
    await waitFor(() =>
      expect(client.getQueryState(exploreKeys.pins('51150'))?.status).toBe('success'),
    )
    expect(result.current.s).toMatchObject({ sgg: '51150', dong: JUMUNJIN })
  })
  it('이동은 push: 뒤로 가기 = 한 단계 위', () => {
    const { result } = setup('/explore')
    act(() => result.current.s.openSigungu('51150'))
    act(() => result.current.s.openDong(JUMUNJIN))
    expect(result.current.loc.search).toBe(`?sgg=51150&dong=${JUMUNJIN}`)
    act(() => result.current.navigate(-1))
    expect(result.current.s).toMatchObject({ sgg: '51150', dong: null })
    act(() => result.current.navigate(-1))
    expect(result.current.s.sgg).toBeNull()
  })
  it('openSigungu 는 dong 을 지운다, backToSigungu 는 sgg 를 남긴다', () => {
    const { result } = setup(`/explore?sgg=51150&dong=${JUMUNJIN}`)
    act(() => result.current.s.backToSigungu())
    expect(result.current.loc.search).toBe('?sgg=51150')
    act(() => result.current.s.openDong(JUMUNJIN))
    act(() => result.current.s.openSigungu('51210'))
    expect(result.current.loc.search).toBe('?sgg=51210')
  })
  it('다른 시군구의 동 열기: openDong(id, sgg) 는 sgg 도 바꾼다', () => {
    const { result } = setup(`/explore?sgg=51150&dong=${JUMUNJIN}`)
    act(() => result.current.s.openDong(NOHAK, '51210'))
    expect(result.current.s).toMatchObject({ sgg: '51210', dong: NOHAK })
  })
  it('closeAll → ⓪', () => {
    const { result } = setup(`/explore?sgg=51150&dong=${JUMUNJIN}`)
    act(() => result.current.s.closeAll())
    expect(result.current.loc.search).toBe('')
  })
})
