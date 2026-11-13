/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** 'true' 면 mock 데이터 사용 (src/mocks). 기본 미설정 = 실제 API */
  readonly VITE_USE_MOCK?: string
  /** mock 지연(ms), 기본 200 */
  readonly VITE_MOCK_DELAY?: string
  /** Google Maps JS API 키. 비어 있으면 MapPlaceholder */
  readonly VITE_GOOGLE_MAPS_KEY?: string
  /** AdvancedMarker 용 Map ID. 비어 있으면 DEMO_MAP_ID */
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string
}
