import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { AuthProvider } from '@/features/auth/types'

type Props = { provider: AuthProvider; onClick: () => void; loading: boolean; disabled?: boolean }

const STYLE: Record<AuthProvider, { label: string; icon: string; tone: string }> = {
  kakao: {
    label: '카카오로 시작하기',
    icon: '/brand/kakao.svg',
    tone: 'bg-brand-kakao text-brand-kakao-fg',
  },
  google: {
    label: 'Google로 시작하기',
    icon: '/brand/google.svg',
    tone: 'bg-bg-surface text-text-primary border border-brand-google-border',
  },
}

/** 제공자 버튼. 색은 각사 가이드 규정(브랜드 토큰), 심볼은 public/brand 의 공식 파일 */
export default function SocialLoginButton({ provider, onClick, loading, disabled = false }: Props) {
  const { label, icon, tone } = STYLE[provider]
  // 심볼 파일(public/brand)이 아직 없으면 깨진 이미지 대신 숨긴다
  const [iconFailed, setIconFailed] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`text-body-base disabled:opacity-dim relative flex h-13 w-full items-center justify-center gap-2 rounded-xl px-4 font-medium disabled:cursor-not-allowed ${tone}`}
    >
      {loading ? (
        <Loader2 aria-hidden="true" className="size-icon-brand animate-spin" />
      ) : iconFailed ? null : (
        <img
          src={icon}
          alt=""
          width={18}
          height={18}
          onError={() => setIconFailed(true)}
          className="size-icon-brand"
        />
      )}
      <span>{label}</span>
    </button>
  )
}
