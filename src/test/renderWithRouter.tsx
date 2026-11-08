import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import ToastProvider from '@/components/ui/toast/ToastProvider'
import AuthProvider from '@/features/auth/AuthProvider'
import { authKeys } from '@/features/auth/queryKeys'

/** 테스트에서 현재 URL(path+search)을 읽기 위한 프로브 */
function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

type Options = { route?: string; path?: string }

/**
 * MemoryRouter + QueryClient 로 감싸서 렌더한다.
 * route: 초기 URL (예: '/tier?month=2025-10'), path: 매칭할 라우트 패턴 (기본 '*')
 * 화면의 data-testid="location" 으로 현재 URL 을 검증할 수 있다.
 */
export default function renderWithRouter(
  ui: ReactElement,
  { route = '/', path = '*' }: Options = {},
) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  // 비로그인으로 시작. 쓰기 동작은 로그인 모달을 연다 (W-07)
  client.setQueryData(authKeys.me, null)
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>
            <Routes>
              <Route
                path={path}
                element={
                  <>
                    {ui}
                    <LocationProbe />
                  </>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}
