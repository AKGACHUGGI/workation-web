import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// vitest globals 를 끈 상태라 Testing Library 자동 cleanup 이 등록되지 않는다
afterEach(() => cleanup())
