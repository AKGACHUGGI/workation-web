import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  initialTheme,
  readStoredTheme,
  storeTheme,
  watchSystemTheme,
} from '@/hooks/theme'
import type { Theme } from '@/hooks/theme'

/**
 * 다크모드 상태 (스펙 §4-2). 저장값이 없으면 시스템 설정을 실시간으로 따르고,
 * toggle 하면 저장해서 이후엔 저장값이 우선한다
 */
export default function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => applyTheme(theme), [theme])

  useEffect(
    () =>
      watchSystemTheme((next) => {
        if (!readStoredTheme()) setTheme(next)
      }),
    [],
  )

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    storeTheme(next)
    setTheme(next)
  }, [theme])

  return { theme, toggle }
}
