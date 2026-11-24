import { act, render } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import ScrollToTop from './ScrollToTop'

let scrollTo: ReturnType<typeof vi.fn>

beforeEach(() => {
  scrollTo = vi.fn()
  vi.stubGlobal('scrollTo', scrollTo)
})

afterEach(() => vi.unstubAllGlobals())

function setup(initial: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <>
            <ScrollToTop />
            <Outlet />
          </>
        ),
        children: [
          { index: true, element: <p>home</p> },
          { path: 'regions/:id', element: <p>region</p> },
        ],
      },
    ],
    { initialEntries: [initial] },
  )
  render(<RouterProvider router={router} />)
  scrollTo.mockClear()
  return router
}

test('다른 경로로 이동하면 맨 위로 올린다', async () => {
  const router = setup('/')
  await act(() => router.navigate('/regions/46150?month=2025-04'))
  expect(scrollTo).toHaveBeenCalledWith(0, 0)
})

test('같은 경로에서 쿼리만 바뀌면 스크롤을 그대로 둔다', async () => {
  const router = setup('/regions/46150?month=2025-04')
  await act(() => router.navigate('/regions/46150?month=2025-05'))
  expect(scrollTo).not.toHaveBeenCalled()
})

test('뒤로 가기에서는 스크롤을 건드리지 않는다', async () => {
  const router = setup('/')
  await act(() => router.navigate('/regions/46150'))
  scrollTo.mockClear()
  await act(() => router.navigate(-1))
  expect(scrollTo).not.toHaveBeenCalled()
})
