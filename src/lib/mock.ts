/** VITE_USE_MOCK=true 이면 features/*\/api.ts 가 src/mocks 데이터를 반환한다 */
export const isMock = import.meta.env.VITE_USE_MOCK === 'true'

/** mock 지연(ms). 로딩 화면을 눈으로 볼 때 VITE_MOCK_DELAY=2000 처럼 늘린다 */
const MOCK_DELAY = Number(import.meta.env.VITE_MOCK_DELAY) || 200

/** 네트워크 지연을 흉내 내며 mock 데이터를 반환한다 (기본 200ms) */
export function mockDelay<T>(data: T, ms = MOCK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}
