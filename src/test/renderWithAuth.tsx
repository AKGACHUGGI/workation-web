import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, useLocation } from 'react-router-dom'
import ToastProvider from '@/components/ui/toast/ToastProvider'
import AuthProvider from '@/features/auth/AuthProvider'
import { authKeys } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'

/**
 * 테스트에서 현재 URL(path+search)을 읽기 위한 프로브.
 * <output> 은 암묵적 role="status" 라 토스트(role="status") 단언과 겹치므로 div 로 그린다.
 */
function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

type Options = { me: Me | null; route?: string }

/**
 * QueryClient · ToastProvider · MemoryRouter · AuthProvider 로 감싸서 렌더한다.
 * ['auth','me'] 를 미리 채워 fetchMe 가 호출되지 않게 한다(useAuth staleTime 5분).
 * 토스트는 mock 하지 않고 role="status" 로 단언한다.
 */
export default function renderWithAuth(ui: ReactElement, { me, route = '/' }: Options) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(authKeys.me, me)
  const result = render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>
            {ui}
            <LocationProbe />
          </AuthProvider>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
  return { client, ...result }
}
