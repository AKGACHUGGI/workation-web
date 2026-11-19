import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useTheme from '@/hooks/useTheme'
import { THEME_STORAGE_KEY } from '@/hooks/theme'

function Probe() {
  const { theme, toggle } = useTheme()
  return (
    <button type="button" onClick={toggle}>
      {theme}
    </button>
  )
}

/** 시스템 다크 설정 흉내. change(true) 로 바뀜 이벤트를 보낸다 */
function mockSystem(dark: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>()
  const mq = {
    matches: dark,
    addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => listeners.delete(fn),
  }
  vi.stubGlobal('matchMedia', () => mq)
  return {
    change(next: boolean) {
      mq.matches = next
      act(() => listeners.forEach((fn) => fn({ matches: next } as MediaQueryListEvent)))
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('useTheme', () => {
  it('저장값이 없으면 시스템 설정을 따르고 바뀌면 따라간다', () => {
    const system = mockSystem(true)
    render(<Probe />)
    expect(screen.getByRole('button')).toHaveTextContent('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    system.change(false)
    expect(screen.getByRole('button')).toHaveTextContent('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
  it('저장값이 있으면 시스템 설정 변경을 무시한다', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    const system = mockSystem(false)
    render(<Probe />)
    system.change(true)
    expect(screen.getByRole('button')).toHaveTextContent('light')
  })
  it('toggle 하면 html·저장값이 바뀌고 이후 시스템 변경을 무시한다', async () => {
    const system = mockSystem(false)
    render(<Probe />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    system.change(false)
    expect(screen.getByRole('button')).toHaveTextContent('dark')
  })
})
