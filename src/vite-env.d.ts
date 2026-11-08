/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** 'true' 면 mock 데이터 사용 (src/mocks). 기본 미설정 = 실제 API */
  readonly VITE_USE_MOCK?: string
}
