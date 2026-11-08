import { useRequireLogin } from '@/features/auth/useRequireLogin'

type Props = { placeholder: string }

/** 작성창. 클릭/포커스 시 로그인 필요. 로그인 상태 UI 는 W-07 이후 */
export default function TipComposer({ placeholder }: Props) {
  const requireLogin = useRequireLogin()
  const open = () => requireLogin(() => {})
  return (
    <button
      type="button"
      onClick={open}
      onFocus={open}
      className="border-border-default text-body-sm text-text-tertiary hover:border-border-strong w-full rounded-xl border px-4 py-3 text-left"
    >
      {placeholder}
    </button>
  )
}
