import { useEffect, useRef, useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import Modal from '@/components/ui/Modal'
import { mockLogin } from '@/features/auth/api'
import SocialLoginButton from '@/features/auth/components/SocialLoginButton'
import { authKeys } from '@/features/auth/queryKeys'
import { buildReturnTo, startUrl } from '@/features/auth/startUrl'
import type { AuthProvider } from '@/features/auth/types'
import { isMock } from '@/lib/mock'
import { assignLocation } from '@/lib/navigation'

type Props = { open: boolean; onClose: () => void }

/** Figma 263:4425. 카카오·Google 버튼 → 백엔드 OAuth 시작 URL 로 이동 (mock 은 세션만 채움) */
export default function LoginModal({ open, onClose }: Props) {
  const queryClient = useQueryClient()
  const location = useLocation()
  const [loading, setLoading] = useState<AuthProvider | null>(null)
  const firstButton = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setLoading(null)
      return
    }
    firstButton.current?.querySelector('button')?.focus()
  }, [open])

  async function start(provider: AuthProvider) {
    setLoading(provider)
    if (isMock) {
      const me = await mockLogin(provider)
      queryClient.setQueryData(authKeys.me, me) // AuthProvider 가 온보딩 모달을 연다
      return
    }
    assignLocation(startUrl(provider, buildReturnTo(location.pathname, location.search)))
  }

  return (
    <Modal open={open} onClose={onClose} titleId="login-modal-title" width="sm">
      {/* Figma 263:4425: 패널 여백 32 — 공통 Modal 의 p-6(24)에 8 을 더한다 */}
      <div className="flex flex-col gap-6 p-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="bg-brand-primary text-text-inverse flex size-8 items-center justify-center rounded-lg"
            >
              <MapPin size={18} />
            </span>
            <span className="font-display text-display-logo text-text-primary">워케이션맵</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-text-secondary hover:text-text-primary rounded-md"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <h2 id="login-modal-title" className="text-heading-xl text-text-primary">
          당신의 장소를 찾으세요
        </h2>
        <div ref={firstButton} className="flex flex-col gap-2.5">
          <SocialLoginButton
            provider="kakao"
            onClick={() => start('kakao')}
            loading={loading === 'kakao'}
            disabled={loading !== null}
          />
          <SocialLoginButton
            provider="google"
            onClick={() => start('google')}
            loading={loading === 'google'}
            disabled={loading !== null}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-body-base text-text-primary h-10 self-center rounded-lg px-6 font-medium underline-offset-2 hover:underline"
        >
          로그인 없이 둘러보기
        </button>
      </div>
    </Modal>
  )
}
