export const AUTH_PROVIDERS = ['kakao', 'google'] as const
export type AuthProvider = (typeof AUTH_PROVIDERS)[number]

export type Me = {
  id: string
  nickname: string
  initial: string // 아바타용 1글자
  provider: AuthProvider
  emailMasked: string // 'du***@kakao.com'
  needsOnboarding: boolean // 약관 미동의 또는 닉네임 미설정
  createdAt: string
}

export const PROVIDER_LABEL: Record<AuthProvider, string> = { kakao: '카카오', google: 'Google' }
