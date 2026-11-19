import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import useTheme from '@/hooks/useTheme'

/** 내비바 해/달 버튼 (다크모드 스펙 §4-3). 라이트면 달(다크로 전환), 다크면 해. 누른 뒤에만 아이콘이 돈다 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const [switched, setSwitched] = useState(false)
  const dark = theme === 'dark'
  const Icon = dark ? Sun : Moon
  return (
    <button
      type="button"
      aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      onClick={() => {
        setSwitched(true)
        toggle()
      }}
      className="text-text-primary hover:bg-bg-subtle flex size-10 items-center justify-center rounded-full"
    >
      <Icon
        key={theme}
        size={18}
        aria-hidden
        data-icon={dark ? 'sun' : 'moon'}
        className={switched ? 'animate-theme-icon' : undefined}
      />
    </button>
  )
}
