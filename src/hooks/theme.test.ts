import indexHtml from '../../index.html?raw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  THEME_STORAGE_KEY,
  applyTheme,
  initialTheme,
  readStoredTheme,
  storeTheme,
  systemTheme,
} from '@/hooks/theme'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('theme', () => {
  it('저장값은 light·dark 만 읽고 나머지는 null', () => {
    expect(readStoredTheme()).toBeNull()
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    expect(readStoredTheme()).toBe('dark')
    localStorage.setItem(THEME_STORAGE_KEY, 'purple')
    expect(readStoredTheme()).toBeNull()
  })
  it('localStorage 가 예외를 던져도 읽기·쓰기가 터지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readStoredTheme()).toBeNull()
    expect(() => storeTheme('dark')).not.toThrow()
  })
  it('시스템 설정: matchMedia 가 없으면 light', () => {
    expect(systemTheme()).toBe('light')
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    expect(systemTheme()).toBe('dark')
  })
  it('처음 테마는 저장값이 시스템 설정보다 우선', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    expect(initialTheme()).toBe('dark')
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    expect(initialTheme()).toBe('light')
  })
  it('applyTheme 은 html data-theme 를 바꾼다', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
  it('index.html 의 화면 그리기 전 스크립트가 같은 저장 키를 쓴다', () => {
    expect(indexHtml).toContain(`'${THEME_STORAGE_KEY}'`)
  })
})
