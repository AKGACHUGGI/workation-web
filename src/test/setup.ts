import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// 기본 달이 오늘 날짜를 따르므로 테스트는 오늘을 2025-12-15 로 고정한다 (기본 달 = 2025-12)
vi.mock('@/features/metric/month', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/metric/month')>()
  const today = () => new Date(2025, 11, 15)
  return { ...actual, today, defaultMonth: (date: Date = today()) => actual.defaultMonth(date) }
})

// vitest globals 를 끈 상태라 Testing Library 자동 cleanup 이 등록되지 않는다
afterEach(() => cleanup())

// Recharts 가 jsdom 에서 참조한다. 크기 계산은 고정 width/height 로 하므로 빈 구현이면 된다.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.assign(globalThis, { ResizeObserver: ResizeObserverStub })
}
