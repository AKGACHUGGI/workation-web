import { Camera } from 'lucide-react'
import { useRequireLogin } from '@/features/auth/useRequireLogin'

type Props = { placeholder: string }

/**
 * 작성 입력 바 (Figma TipComposer 27:175): 회색 바 · '나' 아바타 · 안내 문구 · 카메라 · 등록.
 * 클릭/포커스 시 로그인 필요. 로그인 상태 UI 는 W-07 이후
 */
export default function TipComposer({ placeholder }: Props) {
  const requireLogin = useRequireLogin()
  const open = () => requireLogin(() => {})
  return (
    <button
      type="button"
      onClick={open}
      onFocus={open}
      className="bg-bg-subtle hover:bg-bg-surface-strong flex w-full items-center gap-3 rounded-xl py-2.5 pr-2.5 pl-4 text-left"
    >
      <span
        aria-hidden
        className="bg-brand-soft border-brand-soft-border text-text-brand text-caption-xs flex size-6 shrink-0 items-center justify-center rounded-full border font-bold"
      >
        나
      </span>
      <span className="text-body-sm text-text-tertiary flex-1">{placeholder}</span>
      <Camera size={20} aria-hidden className="text-text-secondary shrink-0" />
      <span
        aria-hidden
        className="bg-brand-primary text-body-sm text-text-inverse shrink-0 rounded-lg px-3 py-2 font-medium"
      >
        등록
      </span>
    </button>
  )
}
