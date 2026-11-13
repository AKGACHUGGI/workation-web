import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDelayedLoading } from '@/features/explore/useDelayedLoading'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const setup = (loading: boolean) =>
  renderHook(({ loading }) => useDelayedLoading(loading), { initialProps: { loading } })

describe('useDelayedLoading', () => {
  it('0.2초 안에 끝나면 띄우지 않는다', () => {
    const { result, rerender } = setup(true)
    act(() => vi.advanceTimersByTime(150))
    rerender({ loading: false })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe(false)
  })
  it('0.2초가 지나면 띄운다', () => {
    const { result } = setup(true)
    act(() => vi.advanceTimersByTime(199))
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(true)
  })
  it('한 번 띄우면 최소 0.4초 유지', () => {
    const { result, rerender } = setup(true)
    act(() => vi.advanceTimersByTime(250)) // 200ms 에 표시
    rerender({ loading: false })
    act(() => vi.advanceTimersByTime(300)) // 표시 후 350ms
    expect(result.current).toBe(true)
    act(() => vi.advanceTimersByTime(50)) // 표시 후 400ms
    expect(result.current).toBe(false)
  })
  it('0.4초가 이미 지났으면 바로 내린다', () => {
    const { result, rerender } = setup(true)
    act(() => vi.advanceTimersByTime(800))
    rerender({ loading: false })
    act(() => vi.advanceTimersByTime(0))
    expect(result.current).toBe(false)
  })
})
