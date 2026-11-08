import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

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
