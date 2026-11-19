export type Theme = 'light' | 'dark'

/** index.html 의 화면 그리기 전 스크립트와 같은 키 */
export const THEME_STORAGE_KEY = 'workation.theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** 저장값. 없거나 읽지 못하면(사생활 보호 모드 등) null */
export function readStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // 저장에 실패해도 지금 화면은 바뀐다
  }
}

export function systemTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light'
}

export function initialTheme(): Theme {
  return readStoredTheme() ?? systemTheme()
}

/** <html data-theme> 교체. 바뀌는 프레임 동안 전환을 꺼 색이 한 번에 바뀌게 한다 (스펙 §4-4) */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (root.dataset.theme === theme) return
  root.classList.add('theme-switching')
  root.dataset.theme = theme
  // 새 색이 그려진 다음 프레임에 전환을 되살린다
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')))
}

export function watchSystemTheme(onChange: (theme: Theme) => void): () => void {
  const mq = window.matchMedia?.(DARK_QUERY)
  if (!mq?.addEventListener) return () => {}
  const handler = (e: MediaQueryListEvent) => onChange(e.matches ? 'dark' : 'light')
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}
