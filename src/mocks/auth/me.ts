import type { Me } from '@/features/auth/types'

/** Figma W-08 의 가짜 사용자. mockLogin 직후에는 needsOnboarding=true */
export const DUI: Me = {
  id: 'u_1',
  nickname: '두이',
  initial: '두',
  provider: 'kakao',
  emailMasked: 'du***@kakao.com',
  needsOnboarding: true,
  createdAt: '2025-03-14T00:00:00+09:00',
}
